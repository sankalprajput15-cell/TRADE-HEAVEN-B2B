import React from 'react';
import { NegotiationThread, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { generateCommercialInvoicePDF } from '../common/ExportToPDF';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building,
  FileText,
  Globe,
  CheckCircle2,
  Lock,
  Package,
  DollarSign,
  BadgeCheck,
  Layers
} from 'lucide-react';

interface Props {
  thread: NegotiationThread;
  selectedCurrency: Currency;
  onClose: () => void;
  onProceedToEscrow?: (thread: NegotiationThread) => void;
}

export const ProformaInvoiceModal: React.FC<Props> = ({
  thread,
  selectedCurrency,
  onClose,
  onProceedToEscrow
}) => {
  const curr =
    CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];

  const unitPriceUsd = thread.agreedPriceUsd || thread.currentPriceUsd || 100;
  const quantity = thread.agreedQuantity || thread.orderQuantity || 100;
  const totalUsd = unitPriceUsd * quantity;
  const depositUsd = totalUsd * 0.3;
  const balanceUsd = totalUsd * 0.7;

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatUsd = (usd: number) =>
    `$${usd.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} USD`;

  const piNumber = `PI-TH-${thread.id.replace(/[^0-9]/g, '').slice(0, 4) || '8891'}-2026`;
  const issueDate = new Date().toISOString().split('T')[0];
  const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];
  const incoterm = thread.agreedIncoterm || thread.currentIncoterm || 'CIF';
  const destinationPort = thread.destinationPort || 'Hamburg Port';
  const skuCode = `HS-8479.89 / TH-${thread.id.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase() || '8891'}`;

  const handleDownloadPdfInvoice = () => {
    generateCommercialInvoicePDF({
      receiptId: piNumber,
      orderId: piNumber,
      issuedAt: issueDate,
      validUntil: expiryDate,
      title: thread.productTitle || 'Wholesale Industrial Export Contract',
      description: `Destination: ${destinationPort} • Incoterm: ${incoterm} (Incoterms 2020) • SGS / TÜV Pre-Shipment Inspection & ISO 9001 Batch Traceability`,
      type: 'PROFORMA_INVOICE',
      amountUsd: totalUsd,
      convertedAmountFormatted: `${formatPrice(totalUsd)} (${curr.code})`,
      currency: curr.code,
      billingName: thread.buyerName || 'Authorized Procurement Officer',
      companyName: thread.buyerCompany || 'Global Procurement Corp',
      supplierCompany: thread.supplierCompany || 'Verified Gold Manufacturer Ltd.',
      supplierContact: thread.supplierName || 'Elena Zhao (Export Director)',
      destinationPort,
      incoterm: `${incoterm} (Incoterms 2020)`,
      paymentMethod: '30% Custodial Escrow Advance + 70% Verified B/L',
      wireTxRef: piNumber,
      status: 'PROFORMA ACTIVE',
      notes: 'Segregated Technical Specs (Part A) & Confidential Commercial Pricing (Part B). Protected by Trade Heaven Custodial Escrow.',
      items: [
        {
          itemNo: '01',
          skuOrHsCode: skuCode,
          productName: thread.productTitle || 'Commercial Wholesale Export Goods',
          technicalSpecs:
            'ISO 9001 Quality Management certified; SGS / TÜV AQL 1.5 Pre-Shipment Assay; Certificate of Origin & Export Customs Declaration included.',
          packagingSpecs: `Export-Sea-Worthy Palletized Crating • Destination: ${destinationPort}`,
          incoterm: `${incoterm} (2020)`,
          leadTime: '21 – 28 Days',
          quantity,
          unit: 'Units',
          unitPriceUsd,
          taxOrFeeUsd: 0,
          lineTotalUsd: totalUsd
        }
      ]
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative text-slate-900">
        {/* Top Control Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 text-amber-400">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Official Proforma Invoice (P/I)
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Segregated Specs &amp; Pricing
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">Ref: {piNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadPdfInvoice}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download Official Branded PDF Invoice"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF Invoice</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Proforma Invoice"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Body */}
        <div className="p-6 sm:p-10 space-y-7 print:p-0 print:space-y-6">
          {/* Executive Brand Identity Header & Official Logo */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border-b-4 border-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-3.5">
              {/* Official TH Vector Monogram Crest */}
              <div className="w-13 h-13 rounded-xl bg-white text-slate-950 border-2 border-amber-400 flex flex-col items-center justify-center shrink-0 shadow-md">
                <span className="font-black text-lg tracking-tighter leading-none">TH</span>
                <span className="text-[7px] font-black tracking-widest px-1 py-0.5 bg-amber-400 text-slate-950 rounded-xs mt-0.5">
                  VERIFIED
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    TRADE HEAVEN
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Official Registry
                  </span>
                </div>
                <div className="text-[11px] text-amber-400 uppercase tracking-widest font-bold">
                  Global B2B Marketplace &amp; Custodial Escrow Clearing Desk
                </div>
                <div className="text-xs text-slate-300">
                  Tradeheaven ECOM Solution LLP • www.tradeheaven.net • help@tradeheaven.net
                </div>
              </div>
            </div>

            <div className="sm:text-right bg-slate-800/90 border border-amber-500/40 rounded-xl p-3.5 space-y-1 shrink-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                COMMERCIAL PROFORMA INVOICE
              </div>
              <div className="text-sm font-mono font-black text-white">{piNumber}</div>
              <div className="text-[11px] text-slate-300 font-mono">
                Issued: {issueDate} • Valid: {expiryDate}
              </div>
            </div>
          </div>

          {/* Parties: Supplier & Buyer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Manufacturer / Seller */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 border-l-4 border-l-emerald-600 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">
                ISSUING MANUFACTURER / BENEFICIARY
              </span>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600 shrink-0" />
                {thread.supplierCompany || 'Verified Manufacturer Ltd.'}
              </h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Authorized Signatory: <strong>{thread.supplierName || 'Elena Zhao (Export Director)'}</strong>
                </p>
                <p>
                  Verification Tier: <span className="text-emerald-700 font-bold">ISO 9001 &amp; SGS Audited Supplier</span>
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  Entity Ref: {thread.supplierId || 'SUPP-VERIFIED-99'} • Treasury: TRADEHEAVEN ECOM SOLUTION LLP
                </p>
              </div>
            </div>

            {/* Buyer / Importer */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 border-l-4 border-l-blue-600 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                BUYER / CONSIGNEE &amp; BILLED ENTITY
              </span>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                {thread.buyerCompany || 'Global Procurement Corp'}
              </h4>
              <div className="text-xs text-slate-600 space-y-1">
                <p>
                  Attention: <strong>{thread.buyerName || 'Marcus Vance (Procurement Officer)'}</strong>
                </p>
                <p>
                  Destination Port: <strong>{destinationPort}</strong> • Incoterm: <strong>{incoterm} (2020)</strong>
                </p>
                <p className="font-mono text-[11px] text-slate-500">
                  Buyer Ref: {thread.buyerId || 'BUYER-VERIFIED-44'} • Settlement: 30% Escrow / 70% B/L
                </p>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* PART A: NON-SENSITIVE PRODUCT & TECHNICAL SPECIFICATIONS TABLE        */}
          {/* ===================================================================== */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-800 text-white px-4 py-2.5 rounded-xl">
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-400" />
                <span>Part A · Non-Sensitive Product, Technical &amp; Logistics Specifications</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                Public / Warehouse &amp; Customs Copy — No Pricing Disclosed
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">Item</th>
                    <th className="p-3 w-36">SKU / HS Code</th>
                    <th className="p-3">Product Name &amp; Technical Specifications</th>
                    <th className="p-3">Packaging &amp; Inspection</th>
                    <th className="p-3 text-center">Incoterm</th>
                    <th className="p-3 text-right">Order Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-3 text-center font-mono font-bold text-slate-600">01</td>
                    <td className="p-3 font-mono text-[11px] font-bold text-slate-700">{skuCode}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{thread.productTitle}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        ISO 9001 Quality Management certified • Lead Time: 21–28 Days • Port of Discharge: {destinationPort}
                      </div>
                    </td>
                    <td className="p-3 text-[11px] text-slate-600">
                      <div className="font-semibold text-slate-800">Export Sea-Worthy Pallet</div>
                      <div>SGS / TÜV AQL 1.5 Assay &amp; Certificate of Origin</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                        {incoterm}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">
                      {quantity.toLocaleString()} Units
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SEGREGATION BOUNDARY */}
          <div className="relative py-1 flex items-center justify-center">
            <div className="w-full border-t border-dashed border-amber-400" />
            <span className="absolute px-3 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900">
              Confidential Financial Boundary · Price-Sensitive Valuation Below
            </span>
          </div>

          {/* ===================================================================== */}
          {/* PART B: PRICE-SENSITIVE COMMERCIAL PRICING & ESCROW SETTLEMENT        */}
          {/* ===================================================================== */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-xl">
              <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2 text-amber-400">
                <DollarSign className="w-4 h-4" />
                <span>Part B · Price-Sensitive Commercial Valuation &amp; Settlement Schedule</span>
              </div>
              <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                Confidential · Authorized Treasury &amp; Finance Only
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3 w-12 text-center">Item</th>
                    <th className="p-3">Billable Product / Contract Line Item</th>
                    <th className="p-3 text-right">Billable Qty</th>
                    <th className="p-3 text-right">Unit Price ({curr.code})</th>
                    <th className="p-3 text-right">Escrow / Custody Fee</th>
                    <th className="p-3 text-right">Extended Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="bg-white">
                    <td className="p-3 text-center font-mono font-bold text-slate-600">01</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{thread.productTitle}</div>
                      <div className="text-[11px] font-mono text-slate-500 font-normal">
                        USD Base Rate: {formatUsd(unitPriceUsd)} / Unit
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {quantity.toLocaleString()} Units
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {formatPrice(unitPriceUsd)}
                    </td>
                    <td className="p-3 text-right font-mono text-emerald-700 font-semibold">
                      $0.00 (Included)
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900 bg-amber-50/60">
                      <div>{formatPrice(totalUsd)}</div>
                      <div className="text-[10px] text-slate-500 font-normal">{formatUsd(totalUsd)}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Milestone Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Payment Milestones */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-blue-600" />
                  Custodial Escrow Payment Schedule &amp; Bank Coordinates
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-200">
                    <div>
                      <span className="font-bold text-slate-900">Milestone 1 (30% Deposit):</span>
                      <p className="text-[10px] text-slate-500">Locked in Custodial Escrow prior to production kickoff</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-700">{formatPrice(depositUsd)}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-200">
                    <div>
                      <span className="font-bold text-slate-900">Milestone 2 (70% Balance):</span>
                      <p className="text-[10px] text-slate-500">Released upon Verified Bill of Lading (B/L) &amp; SGS Assay</p>
                    </div>
                    <span className="font-mono font-bold text-slate-700">{formatPrice(balanceUsd)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200/70 text-[11px] font-mono text-slate-600">
                Beneficiary: <strong>TRADEHEAVEN ECOM SOLUTION LLP</strong> • IBAN: GB81TCCL04140453340868 • SWIFT: TCCLGB3L
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Total Confidential Settlement Value
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mt-1">
                  {formatPrice(totalUsd)}
                </div>
                <div className="text-xs font-mono text-slate-400">{formatUsd(totalUsd)}</div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Subtotal Net:</span>
                  <span className="font-mono text-white">{formatPrice(totalUsd)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trade Protection Custody &amp; SGS Audit:</span>
                  <span className="font-mono text-emerald-400">$0.00 (Included)</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1.5 border-t border-slate-800">
                  <span>Initial 30% Escrow Deposit Due:</span>
                  <span className="font-mono text-emerald-400">{formatPrice(depositUsd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Trade Assurance Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-bold">Trade Heaven 100% Capital &amp; Quality Protection Guarantee</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                By completing settlement via Trade Heaven Custodial Escrow, funds remain protected until non-sensitive technical specifications (Part A) and shipping milestones are verified by accredited surveyors (SGS / TÜV Rheinland).
              </p>
            </div>
          </div>

          {/* Signatures & Seals */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400">
                ISSUED BY MANUFACTURER
              </span>
              <div className="h-16 border-b border-dashed border-slate-300 flex items-center justify-center">
                <span className="font-serif italic text-sm text-blue-900 font-bold">
                  {thread.supplierName || 'Elena Zhao'} (Authorized Signatory)
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                Digital Seal: SHA256-TH-{piNumber}-VERIFIED
              </p>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400">
                ACCEPTED BY BUYER
              </span>
              <div className="h-16 border-b border-dashed border-slate-300 flex items-center justify-center">
                <span className="font-serif italic text-sm text-slate-700">
                  {thread.buyerName || 'Authorized Procurement Officer'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Counter-signature verified upon escrow funding</p>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="sticky bottom-0 z-10 bg-slate-50 border-t border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600 flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-emerald-600" />
            <span>Download the segregated PDF invoice or lock your 30% escrow deposit to start production.</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadPdfInvoice}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Export Segregated PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            {onProceedToEscrow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onProceedToEscrow(thread);
                }}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lock Deposit ({formatPrice(depositUsd)})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

