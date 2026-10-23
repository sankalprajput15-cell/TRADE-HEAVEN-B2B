export interface BankTransferResult {
  payoutId: string;
  status: "INITIATED" | "SETTLED";
}

export type WalletType = 'BUYER' | 'SUPPLIER' | 'PLATFORM_REVENUE';

export type LedgerTransactionType =
  | 'WALLET_TOPUP'
  | 'ORDER_LOCK_ESCROW'
  | 'ESCROW_RELEASE'
  | 'PLATFORM_FEE'
  | 'SUPPLIER_PAYOUT';

export interface WalletRecord {
  id: string;
  entity_id: string;
  entity_name: string;
  company_name: string;
  wallet_type: WalletType;
  available_balance: string; // Stored in paise (100 paise = ₹1.00) as string for BigInt safety
  locked_balance: string;    // Stored in paise as string for BigInt safety
  currency: string;
  country?: string;
  native_currency?: string;
  native_symbol?: string;
  updated_at: string;
}

export interface LedgerEntryRecord {
  id: string;
  reference_id: string;
  source_wallet_id: string | null;
  destination_wallet_id: string | null;
  amount: string; // Stored in paise
  transaction_type: LedgerTransactionType;
  notes: string;
  created_at: string;
}

export interface MediatedEscrowOrder {
  order_id: string;
  rfq_id?: string;
  product_title: string;
  buyer_id: string;
  buyer_name: string;
  supplier_id: string;
  supplier_name: string;
  total_amount_paise: number;
  platform_fee_paise: number;
  status: 'PENDING_LOCK' | 'LOCKED_IN_ESCROW' | 'SETTLED_TO_SUPPLIER';
  incoterm: string;
  created_at: string;
  settled_at?: string;
}

export interface BankPayoutRecord {
  payoutId: string;
  entityId: string;
  walletId: string;
  amountPaise: number;
  status: "INITIATED" | "SETTLED";
  beneficiary: {
    accountHolderName: string;
    accountNumber: string;
    ifscOrSwift: string;
    bankName: string;
    rail: 'IMPS' | 'NEFT' | 'RTGS' | 'ACH' | 'SWIFT';
  };
  createdAt: string;
}

export interface SqlTransactionLog {
  id: string;
  operation: string;
  isolationLevel: 'READ COMMITTED' | 'SERIALIZABLE';
  queries: string[];
  status: 'COMMITTED' | 'ROLLED_BACK';
  timestamp: string;
  error?: string;
}

export class TradeHeavenMediatorEngine {
  constructor(
    private readonly db: any, // Database pool client
    private readonly bankRails: any // Banking/Payment Partner Client
  ) {}

  /**
   * 1. TOP-UP: Buyer adds money to Trade Heaven wallet.
   * Triggered upon webhook confirmation from payment gateway/virtual account collection.
   */
  async creditBuyerDeposit(buyerId: string, amountPaise: number, gatewayTxId: string) {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN;");

      const walletRes = await client.query(
        `SELECT id FROM wallets WHERE entity_id = $1 AND wallet_type = 'BUYER' FOR UPDATE;`,
        [buyerId]
      );
      if (walletRes.rowCount === 0) throw new Error("Buyer wallet not found.");
      const walletId = walletRes.rows[0].id;

      // Credit available balance
      await client.query(
        `UPDATE wallets SET available_balance = available_balance + $1, updated_at = NOW() WHERE id = $2;`,
        [amountPaise, walletId]
      );

      // Record ledger
      await client.query(
        `INSERT INTO ledger_entries (reference_id, destination_wallet_id, amount, transaction_type, notes)
         VALUES ($1, $2, $3, 'WALLET_TOPUP', 'Deposit via Gateway');`,
        [gatewayTxId, walletId, amountPaise]
      );

      await client.query("COMMIT;");
    } catch (e) {
      await client.query("ROLLBACK;");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 2. HOLD IN MEDIATION (Order Placement):
   * Moves funds from Buyer's available balance into their locked escrow balance.
   */
  async lockOrderFundsInEscrow(buyerId: string, orderId: string, totalAmountPaise: number) {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN;");

      const walletRes = await client.query(
        `SELECT id, available_balance FROM wallets WHERE entity_id = $1 FOR UPDATE;`,
        [buyerId]
      );
      const wallet = walletRes.rows[0];
      if (!wallet) throw new Error("Wallet not found for entity: " + buyerId);

      if (BigInt(wallet.available_balance) < BigInt(totalAmountPaise)) {
        throw new Error("Insufficient available wallet funds to lock in escrow.");
      }

      // Move from available to locked
      await client.query(
        `UPDATE wallets 
         SET available_balance = available_balance - $1, 
             locked_balance = locked_balance + $1,
             updated_at = NOW()
         WHERE id = $2;`,
        [totalAmountPaise, wallet.id]
      );

      await client.query(
        `INSERT INTO ledger_entries (reference_id, source_wallet_id, amount, transaction_type, notes)
         VALUES ($1, $2, $3, 'ORDER_LOCK_ESCROW', 'Funds locked in Trade Heaven escrow');`,
        [orderId, wallet.id, totalAmountPaise]
      );

      await client.query("COMMIT;");
    } catch (e) {
      await client.query("ROLLBACK;");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 3. MEDIATED SETTLEMENT (Buyer Confirms / Goods Delivered):
   * Moves locked funds from Buyer, transfers platform commission to Trade Heaven, 
   * and settles the net amount into the Supplier's available balance.
   */
  async releaseEscrowToSupplier(params: {
    orderId: string;
    buyerId: string;
    supplierId: string;
    totalAmountPaise: number;
    platformFeePaise: number;
  }) {
    const { orderId, buyerId, supplierId, totalAmountPaise, platformFeePaise } = params;
    const netSupplierPayout = totalAmountPaise - platformFeePaise;

    const client = await this.db.connect();
    try {
      await client.query("BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;");

      // Lock all involved wallets
      const buyerW = (await client.query(`SELECT id, locked_balance FROM wallets WHERE entity_id = $1 FOR UPDATE;`, [buyerId])).rows[0];
      const supplierW = (await client.query(`SELECT id FROM wallets WHERE entity_id = $1 FOR UPDATE;`, [supplierId])).rows[0];
      const platformW = (await client.query(`SELECT id FROM wallets WHERE wallet_type = 'PLATFORM_REVENUE' FOR UPDATE;`)).rows[0];

      if (!buyerW) throw new Error("Buyer wallet not found.");
      if (!supplierW) throw new Error("Supplier wallet not found.");
      if (!platformW) throw new Error("Platform revenue wallet not found.");

      if (BigInt(buyerW.locked_balance) < BigInt(totalAmountPaise)) {
        throw new Error("Mismatch: Locked balance is less than settlement amount.");
      }

      // 1. Deduct full locked balance from Buyer
      await client.query(
        `UPDATE wallets SET locked_balance = locked_balance - $1 WHERE id = $2;`,
        [totalAmountPaise, buyerW.id]
      );

      // 2. Credit Net Amount to Supplier Wallet
      await client.query(
        `UPDATE wallets SET available_balance = available_balance + $1 WHERE id = $2;`,
        [netSupplierPayout, supplierW.id]
      );

      // 3. Credit Commission to Trade Heaven
      if (platformFeePaise > 0) {
        await client.query(
          `UPDATE wallets SET available_balance = available_balance + $1 WHERE id = $2;`,
          [platformFeePaise, platformW.id]
        );
      }

      // 4. Double-Entry Records
      await client.query(
        `INSERT INTO ledger_entries (reference_id, source_wallet_id, destination_wallet_id, amount, transaction_type, notes)
         VALUES 
         ($1, $2, $3, $4, 'ESCROW_RELEASE', 'Mediated payout to supplier'),
         ($1, $2, $5, $6, 'PLATFORM_FEE', 'Trade Heaven service fee');`,
        [orderId, buyerW.id, supplierW.id, netSupplierPayout, platformW.id, platformFeePaise]
      );

      await client.query("COMMIT;");
    } catch (e) {
      await client.query("ROLLBACK;");
      throw e;
    } finally {
      client.release();
    }
  }

  /**
   * 4. PAYOUT / WITHDRAWAL:
   * Supplier or Buyer withdraws their available balance out to their real bank account.
   */
  async requestBankPayout(entityId: string, amountPaise: number, destinationBankDetails: any): Promise<BankTransferResult> {
    const client = await this.db.connect();
    try {
      await client.query("BEGIN;");

      const walletRes = await client.query(
        `SELECT id, available_balance FROM wallets WHERE entity_id = $1 FOR UPDATE;`,
        [entityId]
      );
      const wallet = walletRes.rows[0];
      if (!wallet) throw new Error("Wallet not found for entity: " + entityId);

      if (BigInt(wallet.available_balance) < BigInt(amountPaise)) {
        throw new Error("Insufficient funds available for bank withdrawal.");
      }

      // Deduct immediately before external call
      await client.query(
        `UPDATE wallets SET available_balance = available_balance - $1 WHERE id = $2;`,
        [amountPaise, wallet.id]
      );

      // Trigger payout via connected banking API (IMPS/NEFT/ACH)
      const payoutResult: BankTransferResult = await this.bankRails.sendPayout({
        amount: amountPaise,
        beneficiary: destinationBankDetails,
      });

      await client.query(
        `INSERT INTO ledger_entries (reference_id, source_wallet_id, amount, transaction_type, notes)
         VALUES ($1, $2, $3, 'SUPPLIER_PAYOUT', 'Bank withdrawal transfer initiated');`,
        [payoutResult.payoutId, wallet.id, amountPaise]
      );

      await client.query("COMMIT;");
      return payoutResult;
    } catch (e) {
      await client.query("ROLLBACK;");
      throw e;
    } finally {
      client.release();
    }
  }
}

/**
 * ACID-Compliant In-Memory SQL Pool & Banking Partner Adapter
 * Supports running TradeHeavenMediatorEngine both on the backend and as a zero-latency fallback on the client.
 */
export class TradeHeavenBankRailsClient {
  private payouts: BankPayoutRecord[] = [];

  constructor(initialPayouts: BankPayoutRecord[] = []) {
    this.payouts = initialPayouts;
  }

  async sendPayout(params: { amount: number; beneficiary: any }): Promise<BankTransferResult> {
    const rail = params.beneficiary?.rail || 'IMPS';
    const payoutId = `PAYOUT-${rail}-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
    const status: "INITIATED" | "SETTLED" = rail === 'IMPS' ? 'SETTLED' : 'INITIATED';

    const record: BankPayoutRecord = {
      payoutId,
      entityId: params.beneficiary?.entityId || 'unknown',
      walletId: params.beneficiary?.walletId || 'unknown',
      amountPaise: Number(params.amount),
      status,
      beneficiary: {
        accountHolderName: params.beneficiary?.accountHolderName || 'Verified Corporate Beneficiary',
        accountNumber: params.beneficiary?.accountNumber || 'XXXX-XXXX-8821',
        ifscOrSwift: params.beneficiary?.ifscOrSwift || 'HDFC0000241',
        bankName: params.beneficiary?.bankName || 'HDFC Bank Corporate Treasury',
        rail
      },
      createdAt: new Date().toISOString()
    };

    this.payouts.unshift(record);
    return { payoutId, status };
  }

  getPayouts(): BankPayoutRecord[] {
    return this.payouts;
  }
}

export class TradeHeavenSqlPoolAdapter {
  private wallets: WalletRecord[];
  private ledgerEntries: LedgerEntryRecord[];
  private orders: MediatedEscrowOrder[];
  private sqlLogs: SqlTransactionLog[] = [];

  constructor() {
    this.wallets = [
      {
        id: 'wal-buyer-titan',
        entity_id: 'buyer-titan-01',
        entity_name: 'Marcus Vance',
        company_name: 'Titan Global Construction & Infrastructure LLC',
        wallet_type: 'BUYER',
        available_balance: '185000000', // ₹18,50,000.00 (185,000,000 paise)
        locked_balance: '92000000',     // ₹9,20,000.00 locked in active escrow
        currency: 'INR',
        country: 'United States',
        native_currency: 'USD',
        native_symbol: '$',
        updated_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString()
      },
      {
        id: 'wal-buyer-euro',
        entity_id: 'buyer-euro-02',
        entity_name: 'Elena Rostova',
        company_name: 'EuroMed Hospital Procurement GmbH',
        wallet_type: 'BUYER',
        available_balance: '340000000', // ₹34,00,000.00
        locked_balance: '64000000',     // ₹6,40,000.00 locked in escrow
        currency: 'INR',
        country: 'Germany',
        native_currency: 'EUR',
        native_symbol: '€',
        updated_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
      },
      {
        id: 'wal-buyer-girlsenberries',
        entity_id: 'buyer-girlsenberries-01',
        entity_name: 'Donald Sorkin',
        company_name: 'Girlsenberries',
        wallet_type: 'BUYER',
        available_balance: '2000000000000', // $20,000,000.00 USD
        locked_balance: '0',
        currency: 'USD',
        country: 'United States',
        native_currency: 'USD',
        native_symbol: '$',
        updated_at: new Date().toISOString()
      },
      {
        id: 'wal-buyer-apex',
        entity_id: 'buyer-apex-03',
        entity_name: 'Rajesh Sharma',
        company_name: 'Apex Agro & Industrial Imports Pvt Ltd',
        wallet_type: 'BUYER',
        available_balance: '125000000', // ₹12,50,000.00
        locked_balance: '0',
        currency: 'INR',
        country: 'India',
        native_currency: 'INR',
        native_symbol: '₹',
        updated_at: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
      },
      {
        id: 'wal-supp-melissa',
        entity_id: 'comp-melissa-mpcommodity',
        entity_name: 'Melissa Prezios',
        company_name: 'MP Commodity Brokers Australia Pty Ltd',
        wallet_type: 'SUPPLIER',
        available_balance: '248500000', // ₹24,85,000.00 available for bank payout
        locked_balance: '0',
        currency: 'INR',
        country: 'Australia',
        native_currency: 'AUD',
        native_symbol: 'A$',
        updated_at: new Date(Date.now() - 3600 * 1000 * 3).toISOString()
      },
      {
        id: 'wal-supp-shenzhen',
        entity_id: 'comp-shenzhen-solar',
        entity_name: 'Chen Wei',
        company_name: 'Shenzhen Lumina New Energy Tech Co., Ltd.',
        wallet_type: 'SUPPLIER',
        available_balance: '162000000', // ₹16,20,000.00
        locked_balance: '0',
        currency: 'INR',
        country: 'China',
        native_currency: 'CNY',
        native_symbol: '¥',
        updated_at: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
      },
      {
        id: 'wal-supp-bharat',
        entity_id: 'comp-bharat-steel',
        entity_name: 'Vikramaditya Singh',
        company_name: 'Bharat Precision Forgings & Alloys Ltd.',
        wallet_type: 'SUPPLIER',
        available_balance: '95000000',  // ₹9,50,000.00
        locked_balance: '0',
        currency: 'INR',
        country: 'India',
        native_currency: 'INR',
        native_symbol: '₹',
        updated_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
      },
      {
        id: 'wal-supp-zac',
        entity_id: 'comp-zac-importation-fadetech',
        entity_name: 'Zachary Aldin',
        company_name: 'IMPORTATION FADE-TECH (OTEC LTD)',
        wallet_type: 'SUPPLIER',
        available_balance: '0', // Funds reset to 0 USD
        locked_balance: '0',
        currency: 'USD',
        country: 'Australia',
        native_currency: 'AUD',
        native_symbol: 'A$',
        updated_at: new Date().toISOString()
      },
      {
        id: 'wal-platform-rev',
        entity_id: 'trade-heaven-treasury',
        entity_name: 'Trade Heaven Treasury',
        company_name: 'Trade Heaven Global Operations & Mediation Vault',
        wallet_type: 'PLATFORM_REVENUE',
        available_balance: '18450000',  // ₹1,84,500.00 accumulated platform commission
        locked_balance: '0',
        currency: 'INR',
        country: 'United Kingdom',
        native_currency: 'GBP',
        native_symbol: '£',
        updated_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString()
      }
    ];

    this.ledgerEntries = [
      {
        id: 'led-1001',
        reference_id: 'GW-RZP-9948102',
        source_wallet_id: null,
        destination_wallet_id: 'wal-buyer-titan',
        amount: '250000000',
        transaction_type: 'WALLET_TOPUP',
        notes: 'Deposit via Gateway',
        created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
      },
      {
        id: 'led-1002',
        reference_id: 'ORD-ESC-2026-8841',
        source_wallet_id: 'wal-buyer-titan',
        destination_wallet_id: null,
        amount: '92000000',
        transaction_type: 'ORDER_LOCK_ESCROW',
        notes: 'Funds locked in Trade Heaven escrow',
        created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
      },
      {
        id: 'led-1003',
        reference_id: 'ORD-ESC-2026-7710',
        source_wallet_id: 'wal-buyer-euro',
        destination_wallet_id: 'wal-supp-melissa',
        amount: '117000000',
        transaction_type: 'ESCROW_RELEASE',
        notes: 'Mediated payout to supplier',
        created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
      },
      {
        id: 'led-1004',
        reference_id: 'ORD-ESC-2026-7710',
        source_wallet_id: 'wal-buyer-euro',
        destination_wallet_id: 'wal-platform-rev',
        amount: '3000000',
        transaction_type: 'PLATFORM_FEE',
        notes: 'Trade Heaven service fee',
        created_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
      },
      {
        id: 'led-1005',
        reference_id: 'PAYOUT-IMPS-748291-402',
        source_wallet_id: 'wal-supp-shenzhen',
        destination_wallet_id: null,
        amount: '45000000',
        transaction_type: 'SUPPLIER_PAYOUT',
        notes: 'Bank withdrawal transfer initiated',
        created_at: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
      }
    ];

    this.orders = [
      {
        order_id: 'ORD-ESC-2026-8841',
        rfq_id: 'RFQ-2025-101',
        product_title: 'ICUMSA 45 Refined White Cane Sugar (Bulk 50kg PP Bags)',
        buyer_id: 'buyer-titan-01',
        buyer_name: 'Titan Global Construction & Infrastructure LLC',
        supplier_id: 'comp-melissa-mpcommodity',
        supplier_name: 'MP Commodity Brokers Australia Pty Ltd',
        total_amount_paise: 92000000, // ₹9,20,000.00
        platform_fee_paise: 2300000,  // 2.5% = ₹23,000.00
        status: 'LOCKED_IN_ESCROW',
        incoterm: 'CIF',
        created_at: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
      },
      {
        order_id: 'ORD-ESC-2026-8904',
        rfq_id: 'RFQ-2025-104',
        product_title: '550W Monocrystalline Bifacial Solar PV Modules (2 Containers)',
        buyer_id: 'buyer-euro-02',
        buyer_name: 'EuroMed Hospital Procurement GmbH',
        supplier_id: 'comp-shenzhen-solar',
        supplier_name: 'Shenzhen Lumina New Energy Tech Co., Ltd.',
        total_amount_paise: 64000000, // ₹6,40,000.00
        platform_fee_paise: 1600000,  // 2.5% = ₹16,000.00
        status: 'LOCKED_IN_ESCROW',
        incoterm: 'FOB',
        created_at: new Date(Date.now() - 3600 * 1000 * 8).toISOString()
      },
      {
        order_id: 'ORD-ESC-2026-9102',
        rfq_id: 'RFQ-2025-108',
        product_title: 'Hot-Dip Galvanized Structural Steel Coils S355JR (120 MT)',
        buyer_id: 'buyer-apex-03',
        buyer_name: 'Apex Agro & Industrial Imports Pvt Ltd',
        supplier_id: 'comp-bharat-steel',
        supplier_name: 'Bharat Precision Forgings & Alloys Ltd.',
        total_amount_paise: 55000000, // ₹5,50,000.00
        platform_fee_paise: 1375000,  // 2.5% = ₹13,750.00
        status: 'PENDING_LOCK',
        incoterm: 'EXW',
        created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
      },
      {
        order_id: 'ORD-ESC-2026-7710',
        rfq_id: 'RFQ-2025-092',
        product_title: 'Australian Premium Milling Wheat Bulk Cargo (SGS Certified)',
        buyer_id: 'buyer-euro-02',
        buyer_name: 'EuroMed Hospital Procurement GmbH',
        supplier_id: 'comp-melissa-mpcommodity',
        supplier_name: 'MP Commodity Brokers Australia Pty Ltd',
        total_amount_paise: 120000000, // ₹12,00,000.00
        platform_fee_paise: 3000000,   // ₹30,000.00
        status: 'SETTLED_TO_SUPPLIER',
        incoterm: 'CIF',
        created_at: new Date(Date.now() - 3600 * 1000 * 36).toISOString(),
        settled_at: new Date(Date.now() - 3600 * 1000 * 10).toISOString()
      }
    ];
  }

  getWallets(): WalletRecord[] {
    return this.wallets;
  }

  getLedgerEntries(): LedgerEntryRecord[] {
    return this.ledgerEntries;
  }

  getOrders(): MediatedEscrowOrder[] {
    return this.orders;
  }

  getSqlLogs(): SqlTransactionLog[] {
    return this.sqlLogs;
  }

  markOrderLocked(orderId: string, buyerId: string, totalAmountPaise: number, supplierId?: string, productTitle?: string) {
    const existing = this.orders.find(o => o.order_id === orderId);
    if (existing) {
      existing.status = 'LOCKED_IN_ESCROW';
      existing.total_amount_paise = totalAmountPaise;
    } else {
      const buyerW = this.wallets.find(w => w.entity_id === buyerId);
      const suppW = this.wallets.find(w => w.entity_id === (supplierId || 'comp-melissa-mpcommodity'));
      this.orders.unshift({
        order_id: orderId,
        product_title: productTitle || `B2B Commercial Contract (${orderId})`,
        buyer_id: buyerId,
        buyer_name: buyerW?.company_name || buyerId,
        supplier_id: suppW?.entity_id || 'comp-melissa-mpcommodity',
        supplier_name: suppW?.company_name || 'MP Commodity Brokers Australia Pty Ltd',
        total_amount_paise: totalAmountPaise,
        platform_fee_paise: Math.round(totalAmountPaise * 0.025),
        status: 'LOCKED_IN_ESCROW',
        incoterm: 'CIF',
        created_at: new Date().toISOString()
      });
    }
  }

  markOrderSettled(orderId: string) {
    const existing = this.orders.find(o => o.order_id === orderId);
    if (existing) {
      existing.status = 'SETTLED_TO_SUPPLIER';
      existing.settled_at = new Date().toISOString();
    }
  }

  createWallet(params: {
    entity_id: string;
    entity_name: string;
    company_name: string;
    wallet_type: WalletType;
    initial_balance_paise?: number;
  }): WalletRecord {
    const existing = this.wallets.find(w => w.entity_id === params.entity_id);
    if (existing) return existing;

    const newWallet: WalletRecord = {
      id: `wal-${params.wallet_type.toLowerCase()}-${Date.now().toString().slice(-5)}`,
      entity_id: params.entity_id,
      entity_name: params.entity_name,
      company_name: params.company_name,
      wallet_type: params.wallet_type,
      available_balance: String(params.initial_balance_paise || 0),
      locked_balance: '0',
      currency: 'INR',
      updated_at: new Date().toISOString()
    };
    this.wallets.push(newWallet);
    return newWallet;
  }

  async connect() {
    // Snapshot state at transaction start for ACID rollback support
    let walletsSnapshot: WalletRecord[] | null = null;
    let ledgerSnapshot: LedgerEntryRecord[] | null = null;
    let currentQueries: string[] = [];
    let currentIsolation: 'READ COMMITTED' | 'SERIALIZABLE' = 'READ COMMITTED';

    return {
      query: async (sqlText: string, params: any[] = []) => {
        const normalized = sqlText.replace(/\s+/g, ' ').trim();
        currentQueries.push(
          params.length > 0
            ? `${normalized} -- params: ${JSON.stringify(params)}`
            : normalized
        );

        // 1. Transaction Control
        if (normalized.toUpperCase().startsWith('BEGIN')) {
          walletsSnapshot = JSON.parse(JSON.stringify(this.wallets));
          ledgerSnapshot = JSON.parse(JSON.stringify(this.ledgerEntries));
          if (normalized.toUpperCase().includes('SERIALIZABLE')) {
            currentIsolation = 'SERIALIZABLE';
          }
          return { rowCount: 0, rows: [] };
        }

        if (normalized.toUpperCase().startsWith('COMMIT')) {
          this.sqlLogs.unshift({
            id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            operation: currentQueries.find(q => q.startsWith('INSERT INTO ledger_entries'))?.includes('WALLET_TOPUP')
              ? 'creditBuyerDeposit'
              : currentQueries.find(q => q.startsWith('INSERT INTO ledger_entries'))?.includes('ORDER_LOCK_ESCROW')
              ? 'lockOrderFundsInEscrow'
              : currentQueries.find(q => q.startsWith('INSERT INTO ledger_entries'))?.includes('ESCROW_RELEASE')
              ? 'releaseEscrowToSupplier'
              : 'requestBankPayout',
            isolationLevel: currentIsolation,
            queries: [...currentQueries],
            status: 'COMMITTED',
            timestamp: new Date().toISOString()
          });
          walletsSnapshot = null;
          ledgerSnapshot = null;
          return { rowCount: 0, rows: [] };
        }

        if (normalized.toUpperCase().startsWith('ROLLBACK')) {
          if (walletsSnapshot) this.wallets = walletsSnapshot;
          if (ledgerSnapshot) this.ledgerEntries = ledgerSnapshot;
          this.sqlLogs.unshift({
            id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            operation: 'TRANSACTION_ROLLBACK',
            isolationLevel: currentIsolation,
            queries: [...currentQueries],
            status: 'ROLLED_BACK',
            timestamp: new Date().toISOString()
          });
          walletsSnapshot = null;
          ledgerSnapshot = null;
          return { rowCount: 0, rows: [] };
        }

        // 2. SELECT queries on wallets
        if (normalized.startsWith("SELECT id FROM wallets WHERE entity_id = $1 AND wallet_type = 'BUYER' FOR UPDATE")) {
          const [entityId] = params;
          let rows = this.wallets.filter(w => w.entity_id === entityId);
          if (rows.length === 0 && entityId) {
            const created = this.createWallet({
              entity_id: entityId,
              entity_name: entityId,
              company_name: entityId,
              wallet_type: 'BUYER',
              initial_balance_paise: 0
            });
            rows = [created];
          }
          return { rowCount: rows.length, rows };
        }

        if (
          normalized.startsWith('SELECT id, available_balance FROM wallets WHERE entity_id = $1 FOR UPDATE') ||
          normalized.startsWith('SELECT id, locked_balance FROM wallets WHERE entity_id = $1 FOR UPDATE') ||
          normalized.startsWith('SELECT id FROM wallets WHERE entity_id = $1 FOR UPDATE')
        ) {
          const [entityId] = params;
          let rows = this.wallets.filter(w => w.entity_id === entityId);
          if (rows.length === 0 && entityId) {
            const isSupplier = String(entityId).startsWith('comp-') || String(entityId).toLowerCase().includes('supp');
            const created = this.createWallet({
              entity_id: entityId,
              entity_name: entityId,
              company_name: entityId,
              wallet_type: isSupplier ? 'SUPPLIER' : 'BUYER',
              initial_balance_paise: 0
            });
            rows = [created];
          }
          return { rowCount: rows.length, rows };
        }

        if (normalized.startsWith("SELECT id FROM wallets WHERE wallet_type = 'PLATFORM_REVENUE' FOR UPDATE")) {
          const rows = this.wallets.filter(w => w.wallet_type === 'PLATFORM_REVENUE');
          return { rowCount: rows.length, rows };
        }

        // 3. UPDATE queries on wallets
        if (normalized.startsWith('UPDATE wallets SET available_balance = available_balance + $1, updated_at = NOW() WHERE id = $2')) {
          const [amountPaise, walletId] = params;
          const wallet = this.wallets.find(w => w.id === walletId);
          if (!wallet) throw new Error(`Wallet ${walletId} not found.`);
          wallet.available_balance = (BigInt(wallet.available_balance) + BigInt(Math.round(Number(amountPaise)))).toString();
          wallet.updated_at = new Date().toISOString();
          return { rowCount: 1, rows: [wallet] };
        }

        if (
          normalized.includes('SET available_balance = available_balance - $1') &&
          normalized.includes('locked_balance = locked_balance + $1')
        ) {
          const [totalAmountPaise, walletId] = params;
          const wallet = this.wallets.find(w => w.id === walletId);
          if (!wallet) throw new Error(`Wallet ${walletId} not found.`);
          const delta = BigInt(Math.round(Number(totalAmountPaise)));
          wallet.available_balance = (BigInt(wallet.available_balance) - delta).toString();
          wallet.locked_balance = (BigInt(wallet.locked_balance) + delta).toString();
          wallet.updated_at = new Date().toISOString();
          return { rowCount: 1, rows: [wallet] };
        }

        if (normalized.startsWith('UPDATE wallets SET locked_balance = locked_balance - $1 WHERE id = $2')) {
          const [totalAmountPaise, walletId] = params;
          const wallet = this.wallets.find(w => w.id === walletId);
          if (!wallet) throw new Error(`Wallet ${walletId} not found.`);
          const delta = BigInt(Math.round(Number(totalAmountPaise)));
          wallet.locked_balance = (BigInt(wallet.locked_balance) - delta).toString();
          wallet.updated_at = new Date().toISOString();
          return { rowCount: 1, rows: [wallet] };
        }

        if (normalized.startsWith('UPDATE wallets SET available_balance = available_balance + $1 WHERE id = $2')) {
          const [amountPaise, walletId] = params;
          const wallet = this.wallets.find(w => w.id === walletId);
          if (!wallet) throw new Error(`Wallet ${walletId} not found.`);
          const delta = BigInt(Math.round(Number(amountPaise)));
          wallet.available_balance = (BigInt(wallet.available_balance) + delta).toString();
          wallet.updated_at = new Date().toISOString();
          return { rowCount: 1, rows: [wallet] };
        }

        if (normalized.startsWith('UPDATE wallets SET available_balance = available_balance - $1 WHERE id = $2')) {
          const [amountPaise, walletId] = params;
          const wallet = this.wallets.find(w => w.id === walletId);
          if (!wallet) throw new Error(`Wallet ${walletId} not found.`);
          const delta = BigInt(Math.round(Number(amountPaise)));
          wallet.available_balance = (BigInt(wallet.available_balance) - delta).toString();
          wallet.updated_at = new Date().toISOString();
          return { rowCount: 1, rows: [wallet] };
        }

        // 4. INSERT INTO ledger_entries
        if (normalized.startsWith('INSERT INTO ledger_entries')) {
          const now = new Date().toISOString();

          // Case A: WALLET_TOPUP
          if (normalized.includes("'WALLET_TOPUP'")) {
            const [referenceId, destinationWalletId, amount] = params;
            const entry: LedgerEntryRecord = {
              id: `led-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              reference_id: String(referenceId),
              source_wallet_id: null,
              destination_wallet_id: String(destinationWalletId),
              amount: String(Math.round(Number(amount))),
              transaction_type: 'WALLET_TOPUP',
              notes: 'Deposit via Gateway',
              created_at: now
            };
            this.ledgerEntries.unshift(entry);
            return { rowCount: 1, rows: [entry] };
          }

          // Case B: ORDER_LOCK_ESCROW
          if (normalized.includes("'ORDER_LOCK_ESCROW'")) {
            const [referenceId, sourceWalletId, amount] = params;
            const entry: LedgerEntryRecord = {
              id: `led-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              reference_id: String(referenceId),
              source_wallet_id: String(sourceWalletId),
              destination_wallet_id: null,
              amount: String(Math.round(Number(amount))),
              transaction_type: 'ORDER_LOCK_ESCROW',
              notes: 'Funds locked in Trade Heaven escrow',
              created_at: now
            };
            this.ledgerEntries.unshift(entry);
            return { rowCount: 1, rows: [entry] };
          }

          // Case C: Double-entry ESCROW_RELEASE + PLATFORM_FEE
          if (normalized.includes("'ESCROW_RELEASE'") && normalized.includes("'PLATFORM_FEE'")) {
            const [orderId, buyerWalletId, supplierWalletId, netSupplierPayout, platformWalletId, platformFeePaise] = params;
            const releaseEntry: LedgerEntryRecord = {
              id: `led-${Date.now()}-rel`,
              reference_id: String(orderId),
              source_wallet_id: String(buyerWalletId),
              destination_wallet_id: String(supplierWalletId),
              amount: String(Math.round(Number(netSupplierPayout))),
              transaction_type: 'ESCROW_RELEASE',
              notes: 'Mediated payout to supplier',
              created_at: now
            };
            const feeEntry: LedgerEntryRecord = {
              id: `led-${Date.now()}-fee`,
              reference_id: String(orderId),
              source_wallet_id: String(buyerWalletId),
              destination_wallet_id: String(platformWalletId),
              amount: String(Math.round(Number(platformFeePaise))),
              transaction_type: 'PLATFORM_FEE',
              notes: 'Trade Heaven service fee',
              created_at: now
            };
            this.ledgerEntries.unshift(feeEntry, releaseEntry);
            return { rowCount: 2, rows: [releaseEntry, feeEntry] };
          }

          // Case D: SUPPLIER_PAYOUT
          if (normalized.includes("'SUPPLIER_PAYOUT'")) {
            const [payoutId, sourceWalletId, amount] = params;
            const entry: LedgerEntryRecord = {
              id: `led-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
              reference_id: String(payoutId),
              source_wallet_id: String(sourceWalletId),
              destination_wallet_id: null,
              amount: String(Math.round(Number(amount))),
              transaction_type: 'SUPPLIER_PAYOUT',
              notes: 'Bank withdrawal transfer initiated',
              created_at: now
            };
            this.ledgerEntries.unshift(entry);
            return { rowCount: 1, rows: [entry] };
          }
        }

        return { rowCount: 0, rows: [] };
      },
      release: () => {
        // Release pool client back to pool
      }
    };
  }
}

// Singleton client-side engine instance (synced with backend /api/v1/mediation/* when available)
const localPool = new TradeHeavenSqlPoolAdapter();
const localBankRails = new TradeHeavenBankRailsClient([
  {
    payoutId: 'PAYOUT-IMPS-748291-402',
    entityId: 'comp-shenzhen-solar',
    walletId: 'wal-supp-shenzhen',
    amountPaise: 45000000,
    status: 'SETTLED',
    beneficiary: {
      accountHolderName: 'Shenzhen Lumina New Energy Tech Co., Ltd.',
      accountNumber: '8829-0019-4482-1102',
      ifscOrSwift: 'HSBCHKHHHKH',
      bankName: 'HSBC Corporate Trade Banking',
      rail: 'SWIFT'
    },
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString()
  }
]);
const localMediatorEngine = new TradeHeavenMediatorEngine(localPool, localBankRails);

export interface MediationSystemState {
  wallets: WalletRecord[];
  ledgerEntries: LedgerEntryRecord[];
  orders: MediatedEscrowOrder[];
  payouts: BankPayoutRecord[];
  sqlLogs: SqlTransactionLog[];
}

const notifyMediationStateUpdated = (state: MediationSystemState): MediationSystemState => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tradeheaven_mediation_updated', { detail: state }));
  }
  return state;
};

export const tradeHeavenMediationService = {
  async getState(): Promise<MediationSystemState> {
    try {
      const res = await fetch('/api/v1/mediation/state');
      if (res.ok) {
        const data = await res.json();
        if (data && data.wallets) return data;
      }
    } catch {
      // Fallback to local engine
    }
    return {
      wallets: [...localPool.getWallets()],
      ledgerEntries: [...localPool.getLedgerEntries()],
      orders: [...localPool.getOrders()],
      payouts: [...localBankRails.getPayouts()],
      sqlLogs: [...localPool.getSqlLogs()]
    };
  },

  async creditBuyerDeposit(buyerId: string, amountPaise: number, gatewayTxId: string): Promise<MediationSystemState> {
    try {
      const res = await fetch('/api/v1/mediation/topup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, amountPaise, gatewayTxId })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.state) return notifyMediationStateUpdated(data.state);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error) throw new Error(errData.error);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch')) throw err;
    }

    await localMediatorEngine.creditBuyerDeposit(buyerId, amountPaise, gatewayTxId);
    const updatedState = await this.getState();
    return notifyMediationStateUpdated(updatedState);
  },

  async lockOrderFundsInEscrow(
    buyerId: string,
    orderId: string,
    totalAmountPaise: number,
    supplierId?: string,
    productTitle?: string
  ): Promise<MediationSystemState> {
    try {
      const res = await fetch('/api/v1/mediation/lock-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerId, orderId, totalAmountPaise, supplierId, productTitle })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.state) return notifyMediationStateUpdated(data.state);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error) throw new Error(errData.error);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch')) throw err;
    }

    await localMediatorEngine.lockOrderFundsInEscrow(buyerId, orderId, totalAmountPaise);
    localPool.markOrderLocked(orderId, buyerId, totalAmountPaise, supplierId, productTitle);
    const updatedState = await this.getState();
    return notifyMediationStateUpdated(updatedState);
  },

  async releaseEscrowToSupplier(params: {
    orderId: string;
    buyerId: string;
    supplierId: string;
    totalAmountPaise: number;
    platformFeePaise: number;
  }): Promise<MediationSystemState> {
    try {
      const res = await fetch('/api/v1/mediation/release-escrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.state) return notifyMediationStateUpdated(data.state);
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error) throw new Error(errData.error);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch')) throw err;
    }

    await localMediatorEngine.releaseEscrowToSupplier(params);
    localPool.markOrderSettled(params.orderId);
    const updatedState = await this.getState();
    return notifyMediationStateUpdated(updatedState);
  },

  async requestBankPayout(
    entityId: string,
    amountPaise: number,
    destinationBankDetails: any
  ): Promise<{ payoutResult: BankTransferResult; state: MediationSystemState }> {
    try {
      const res = await fetch('/api/v1/mediation/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, amountPaise, destinationBankDetails })
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.state && data?.payoutResult) {
          notifyMediationStateUpdated(data.state);
          return data;
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        if (errData?.error) throw new Error(errData.error);
      }
    } catch (err: any) {
      if (err?.message && !err.message.includes('fetch')) throw err;
    }

    const payoutResult = await localMediatorEngine.requestBankPayout(
      entityId,
      amountPaise,
      destinationBankDetails
    );
    const state = await this.getState();
    notifyMediationStateUpdated(state);
    return { payoutResult, state };
  }
};

