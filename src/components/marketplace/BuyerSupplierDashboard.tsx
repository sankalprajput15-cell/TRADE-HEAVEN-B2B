import React, { useState } from 'react';
import { UserRole, Currency, EscrowTransaction, RfqRequirement, Product } from '../../types';
import { CURRENCY_RATES, MOCK_ESCROWS, MOCK_RFQS, MOCK_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Building, 
  Layers, 
  Download,
  ExternalLink,
  MessageCircle,
  CreditCard,
  PlusCircle
} from 'lucide-react';

interface Props {
  currentUserRole: UserRole;
  selectedCurrency: Currency;
  rfqs?: RfqRequirement[];
  onOpenCreateRfq: () => void;
  onOpenStorefront: (companyId: string) => void;
}

export const BuyerSupplierDashboard: React.FC<Props> = ({
  currentUserRole,
  selectedCurrency,
  rfqs = MOCK_RFQS,
  onOpenCreateRfq,
  onOpenStorefront
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'trade protection' | 'RFQS' | 'ORDERS'>('OVERVIEW');
  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div id="buyer-supplier-dashboard" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Enterprise B2B Trade &amp; trade protection Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentUserRole === 'SUPPLIER' ? 'Manufacturer & Exporter Console' : 'Global Procurement & Sourcing Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Track live Swiss trade protection milestones, active RFQ bids, factory production progress, and commercial Proforma Invoices (P/I).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New RFQ</span>
          </button>
          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-2xs"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Trade Desk WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total trade protection Value</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatPrice(349000)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Capital Guaranteed
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active RFQ Inquiries</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            18 Tenders
          </div>
          <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> 6 pending factory quotes
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verified Orders In-Transit</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            4 Shipments
          </div>
          <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SGS Pre-Shipment Passed
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>KYC Compliance Status</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            Level 3 (Verified)
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Audit ID: TH-CORP-98421
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Active trade protection Contracts ({MOCK_ESCROWS.length})
        </button>
        <button
          onClick={() => setActiveTab('RFQS')}
          className={`pb-3 cursor-pointer ${
            activeTab === 'RFQS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          My RFQ Sourcing Requirements ({MOCK_RFQS.length})
        </button>
      </div>

      {/* Tab Content: Escrows */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ESCROWS.map(tp => (
              <div
                key={tp.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {tp.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{tp.incoterm} • {tp.portOfDestination}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {tp.productTitle}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {tp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500">Total Contract Value:</span>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {formatPrice(tp.totalAmountUsd)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500">Trade Protection Deposit (Held):</span>
                    <div className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                      {formatPrice(tp.depositAmountUsd)}
                    </div>
                  </div>
                </div>

                {/* Milestones Stepper */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Release Milestones
                  </div>
                  <div className="space-y-1.5">
                    {tp.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          m.status === 'RELEASED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : m.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            m.status === 'RELEASED' ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                          <span className="font-semibold text-xs">{m.title} ({m.percentage}%)</span>
                        </div>
                        <span className="font-mono font-bold text-xs">{formatPrice(m.amountUsd)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Supplier: <strong>{tp.supplierCompany}</strong></span>
                  <button className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                    <span>View Proforma P/I</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: RFQs */}
      {activeTab === 'RFQS' && (
        <div className="space-y-3">
          {(rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS).map(rfq => (
            <div
              key={rfq.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {rfq.id}
                  </span>
                  <span className="text-xs text-blue-600 font-bold">{rfq.category}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{rfq.destinationPort}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  {rfq.productName}
                </h4>
                <div className="text-xs text-slate-600">
                  Volume Target: <strong>{rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}</strong> • Incoterm: <strong>{rfq.preferredIncoterm}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {rfq.quotesCount} Factory Bids
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
