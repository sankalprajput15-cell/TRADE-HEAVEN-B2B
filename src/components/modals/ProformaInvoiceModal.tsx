import React from 'react';
import { NegotiationThread, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Building, 
  FileText, 
  Calendar, 
  Globe, 
  CheckCircle2, 
  Lock,
  Package,
  Truck,
  DollarSign,
  BadgeCheck
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
  const curr = CURRENCY_RATES.find(c => c.code === selectedCurrency) || CURRENCY_RATES[0];
  
  const unitPriceUsd = thread.agreedPriceUsd || thread.currentPriceUsd || 100;
  const quantity = thread.agreedQuantity || thread.orderQuantity || 100;
  const totalUsd = unitPriceUsd * quantity;
  const depositUsd = totalUsd * 0.30;
  const balanceUsd = totalUsd * 0.70;

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const piNumber = `PI-TH-${thread.id.replace(/[^0-9]/g, '').slice(0, 4) || '8891'}-2026`;
  const issueDate = new Date().toISOString().split('T')[0];
  const expiryDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col relative text-slate-900">
        
        {/* Top Control Bar */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                Official Proforma Invoice (P/I)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  Verified Contract
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">Ref: {piNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Proforma Invoice"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / Save PDF</span>
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
        <div className="p-6 sm:p-10 space-y-8 print:p-0 print:space-y-6">
          
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-lg shadow-sm">
                  TH
                </div>
                <div>
                  <div className="text-lg font-black tracking-tight text-slate-900">
                    Trade<span className="text-blue-600">Heaven</span> Global
                  </div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    Swiss Escrow-Backed Trade Facilitation Desk
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-500 space-y-0.5">
                <p>Bahnhofstrasse 45, 8001 Zurich, Switzerland</p>
                <p>Registration: CHE-419.802.115 • VAT ID: CHE-419.802.115 MWST</p>
                <p>Custodial Partner: FINMA-Regulated Swiss Escrow Depository</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="inline-block px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black uppercase tracking-wider">
                PROFORMA INVOICE
              </div>
              <div className="text-xs font-mono font-bold text-slate-800 pt-1">
                Invoice No: <span className="text-blue-600">{piNumber}</span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                Date: {issueDate}
              </div>
              <div className="text-xs text-amber-700 font-mono">
                Valid Until: {expiryDate} (14 Days)
              </div>
            </div>
          </div>

          {/* Parties: Buyer & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 rounded-2xl p-5 border border-slate-200">
            {/* Manufacturer / Seller */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                MANUFACTURER / BENEFICIARY
              </span>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Building className="w-4 h-4 text-blue-600 shrink-0" />
                {thread.supplierCompany || 'Verified Manufacturer Ltd.'}
              </h4>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>Contact Person: <strong>{thread.supplierName || 'Elena Zhao (Sales Director)'}</strong></p>
                <p>Status: <span className="text-emerald-700 font-bold">Verified Gold Manufacturer</span></p>
                <p>Audited Entity ID: {thread.supplierId || 'SUPP-VERIFIED-99'}</p>
                <p>Export License: CN-EX-99820-2026</p>
              </div>
            </div>

            {/* Buyer / Importer */}
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                BUYER / APPLICANT
              </span>
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                {thread.buyerCompany || 'Global Procurement Corp'}
              </h4>
              <div className="text-xs text-slate-600 space-y-0.5">
                <p>Contact Person: <strong>{thread.buyerName || 'Marcus Vance (Procurement)'}</strong></p>
                <p>Country / Region: <strong>{thread.destinationPort || 'Global Destination'}</strong></p>
                <p>Buyer ID: {thread.buyerId || 'BUYER-VERIFIED-44'}</p>
                <p>Payment Term: 30% Trade Protection Advance + 70% B/L</p>
              </div>
            </div>
          </div>

          {/* Itemized Order Specifications */}
          <div className="space-y-3">
            <div className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-600" />
              Order Specifications &amp; Commercial Terms
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Item Description &amp; Specifications</th>
                    <th className="p-3 text-center">Incoterm</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="bg-white">
                    <td className="p-3 font-mono text-slate-400">01</td>
                    <td className="p-3 font-bold text-slate-900">
                      <div>{thread.productTitle}</div>
                      <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                        Destination: {thread.destinationPort || 'Hamburg Port'} • Lead Time: 25-30 Days • Standard Export Pallet Packaging
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-blue-600">
                      {thread.agreedIncoterm || thread.currentIncoterm || 'CIF'}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      {quantity.toLocaleString()} Units
                    </td>
                    <td className="p-3 text-right font-mono text-slate-800">
                      {formatPrice(unitPriceUsd)}
                    </td>
                    <td className="p-3 text-right font-mono font-black text-slate-900">
                      {formatPrice(totalUsd)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Breakdown & Milestone Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Payment Milestones */}
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 space-y-3">
              <div className="text-xs font-black text-blue-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                Custodial Swiss Escrow Payment Schedule
              </div>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-200">
                  <div>
                    <span className="font-bold text-slate-900">Milestone 1 (30% Deposit):</span>
                    <p className="text-[10px] text-slate-500">Locked in Swiss Escrow before production kickoff</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">{formatPrice(depositUsd)}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-blue-200">
                  <div>
                    <span className="font-bold text-slate-900">Milestone 2 (70% Balance):</span>
                    <p className="text-[10px] text-slate-500">Released upon Verified Bill of Lading (B/L) &amp; SGS Inspection</p>
                  </div>
                  <span className="font-mono font-bold text-slate-700">{formatPrice(balanceUsd)}</span>
                </div>
              </div>
            </div>

            {/* Total Summary */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Total Settlement Value
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {formatPrice(totalUsd)}
              </div>
              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal Net:</span>
                  <span className="font-mono text-white">{formatPrice(totalUsd)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trade Protection Custody Fee:</span>
                  <span className="font-mono text-emerald-400">0.00 (Included)</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                  <span>Initial Deposit Due:</span>
                  <span className="font-mono text-emerald-400">{formatPrice(depositUsd)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Legal & Trade Assurance Guarantee */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 space-y-1">
              <p className="font-bold">TradeHeaven 100% Capital &amp; Quality Protection Guarantee</p>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                By completing the deposit via TradeHeaven Escrow, your funds remain secure in a neutral Swiss depository until quality inspection criteria and delivery milestones are verified by accredited third-party surveyors (SGS / TÜV).
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
                  Elena Zhao (Authorized Signatory)
                </span>
              </div>
              <p className="text-[10px] text-slate-500">Digital Seal Hash: SHA256-TH-{Date.now()}-VERIFIED</p>
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
            <span>Ready to activate production with trade protection escrow deposit.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Close Window
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
