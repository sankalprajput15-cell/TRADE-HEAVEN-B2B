import React from 'react';
import { 
  X, 
  Crown, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Mail, 
  Phone, 
  Building2, 
  ArrowRight, 
  Globe2, 
  Lock, 
  TrendingUp, 
  FileCheck, 
  Sparkles,
  Award,
  DollarSign
} from 'lucide-react';
import { RfqRequirement, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';

interface Props {
  rfq: RfqRequirement | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToPremiumServices: () => void;
  selectedCurrency?: Currency;
}

export const LeadAccessValueModal: React.FC<Props> = ({
  rfq,
  isOpen,
  onClose,
  onProceedToPremiumServices,
  selectedCurrency = 'USD'
}) => {
  if (!isOpen) return null;

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd?: number) => {
    if (!usd) return 'Market Quote';
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const estimatedTotalValue = rfq && rfq.targetPriceUsd && rfq.targetQuantity 
    ? rfq.targetPriceUsd * rfq.targetQuantity 
    : 0;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lead-access-modal-title"
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full my-auto border border-amber-300 shadow-2xl overflow-hidden flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 p-5 sm:p-6 text-white border-b border-amber-500/30">
          <div className="absolute right-4 top-4">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 pr-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
              <Crown className="w-3.5 h-3.5 fill-slate-950" />
              <span>Trade Heaven Premium Services • Lead Access Value</span>
            </div>

            <h2 id="lead-access-modal-title" className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Why Upgrade to Full Lead Access?
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Free members can only view limited preview summaries. Upgrading to Premium Services grants instant, direct access to verified international procurement directors and golden advance tenders.
            </p>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Specific Contextual Lead Preview (If Triggered from a Specific Tender) */}
          {rfq && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded-md">
                  Target Tender Context • #{rfq.id}
                </span>
                <span className="text-[10px] font-black text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" />
                  <span>Direct Contact Locked for Free Members</span>
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-200/80 border border-amber-300 flex items-center justify-center shrink-0 text-amber-900">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-black text-sm text-slate-900 line-clamp-1">
                    {rfq.productName}
                  </h4>
                  <div className="text-xs text-slate-600 flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="font-bold text-slate-800">{rfq.buyerCompany}</span>
                    <span>•</span>
                    <span className="text-blue-700 font-semibold">{rfq.buyerCountry}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-emerald-700">
                      Target: {rfq.targetQuantity?.toLocaleString()} {rfq.quantityUnit} @ {formatPrice(rfq.targetPriceUsd)} {rfq.preferredIncoterm}
                    </span>
                  </div>
                </div>
              </div>

              {estimatedTotalValue > 0 && (
                <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs font-semibold text-slate-800">
                  <span>Estimated Total Order Value:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {formatPrice(estimatedTotalValue)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Core Value Pillars of Lead Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Full Lead Access Capabilities Unlocked with Premium Services</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Feature 1 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="font-black text-slate-900 text-sm">Unmasked Direct Contacts</div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Instant visibility to corporate procurement emails, mobile phone numbers, verified WhatsApp channels, and executive dossiers.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="font-black text-slate-900 text-sm">100% Advance Golden Leads</div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Priority allocation on high-value corporate tenders with 100% upfront wire or verified irrevocable L/C settlement terms.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="font-black text-slate-900 text-sm">D&amp;B Audited Importers</div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Every tender features pre-audited enterprise credentials, annual import volume, and Trade Assurance escrow protection.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-amber-400 transition-colors space-y-1.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <div className="font-black text-slate-900 text-sm">Unlimited Quotation Bids</div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Submit unlimited factory quotations across all industries. Your proposals are pinned to the top of the buyer's procurement inbox.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Comparison Box */}
          <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-3">
            <div className="flex items-center justify-between text-xs font-bold border-b border-slate-800 pb-2">
              <span className="text-slate-400">Free Member Account</span>
              <span className="text-amber-400 font-black">Premium Services &amp; Plans</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Buyer Contacts</span>
                <span className="text-slate-400">Masked (•••••••)</span>
                <span className="text-emerald-400 font-bold">100% Unmasked &amp; Direct</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Daily Inquiries</span>
                <span className="text-slate-400">1 Unvetted Community Lead</span>
                <span className="text-emerald-400 font-bold">Unlimited Verified Tenders</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Golden Advance Tenders</span>
                <span className="text-rose-400 font-bold">Restricted</span>
                <span className="text-amber-300 font-bold">VIP Priority Allocation</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-[11px]">
                <span className="text-slate-400">Storefront Exposure</span>
                <span className="text-slate-400">Standard Directory</span>
                <span className="text-emerald-400 font-bold">Top Verified Manufacturer Rank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Navigation CTA */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Continue with Free Browsing
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onProceedToPremiumServices();
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95 animate-scale-pulse"
          >
            <Crown className="w-4 h-4 fill-slate-950" />
            <span>Proceed to Premium Services &amp; Plans</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
