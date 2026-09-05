import React, { useState } from 'react';
import { RfqRequirement, AuthUser, Currency } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  X, 
  Send, 
  MessageSquare, 
  Mail, 
  Phone, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ArrowRight,
  Crown
} from 'lucide-react';

interface Props {
  rfq: RfqRequirement;
  currentUser?: AuthUser | null;
  selectedCurrency?: Currency;
  onClose: () => void;
  onOpenUpgradeModal?: () => void;
}

export const PitchBuyerModal: React.FC<Props> = ({
  rfq,
  currentUser,
  selectedCurrency = 'USD',
  onClose,
  onOpenUpgradeModal
}) => {
  const [pitchMessage, setPitchMessage] = useState(
    `Dear ${rfq.buyerName || rfq.buyerCompany || 'Procurement Team'},\n\nWe noticed your inquiry for "${rfq.productName}" (Target volume: ${rfq.targetQuantity} ${rfq.quantityUnit}). Our manufacturing facility is ready to supply this requirement with competitive pricing, ISO-certified quality inspection, and reliable delivery to ${rfq.destinationPort || 'your port'}.\n\nPlease let us know your required delivery timeline and packaging preferences.`
  );
  const [unitPrice, setUnitPrice] = useState<string>(rfq.targetPriceUsd ? String(rfq.targetPriceUsd * 0.95) : '100');
  const [supplierCompany, setSupplierCompany] = useState<string>(currentUser?.companyName || 'Verified Exporter Co.');
  const [supplierContact, setSupplierContact] = useState<string>(currentUser?.email || 'sales@exporter.com');
  const [isSent, setIsSent] = useState(false);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const handleSendPitch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSent(true);
    // Trigger notification or toast if available
    window.dispatchEvent(new CustomEvent('tradeheaven_notification', {
      detail: {
        title: 'Direct Pitch Delivered',
        message: `Your factory proposal for "${rfq.productName}" was sent to ${rfq.buyerCompany}.`,
        type: 'SUCCESS'
      }
    }));
  };

  const whatsappText = encodeURIComponent(
    `Hello ${rfq.buyerCompany}, we are pitching directly for your Trade Heaven Buy Lead: "${rfq.productName}" (${rfq.targetQuantity} ${rfq.quantityUnit}). Offered price: $${unitPrice}/unit. ${pitchMessage.slice(0, 180)}...`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-amber-50/50">
          <div className="space-y-1 pr-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-black uppercase tracking-wider border border-amber-300">
              <Zap className="w-3 h-3 text-amber-700" />
              <span>Free Daily Lead Pitch</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
              Pitch Directly to {rfq.buyerCompany}
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Spark an immediate direct conversation for "{rfq.productName}"
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Go4WorldBusiness Community Warning */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-950 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <span className="font-bold block">
                (Note: Free leads are unvetted community inquiries—deals &amp; buyer legitimacy are not guaranteed).
              </span>
              <p className="text-[11px] text-amber-900/90 font-normal">
                Always conduct due diligence and request Letters of Credit (L/C) or Trade Assurance escrow before dispatching containerized cargo.
              </p>
            </div>
          </div>

          {/* Unmasked Buyer Contact Info */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
              Direct Contact Details (Unlocked with Daily Free Credit)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Buyer Company</div>
                  <div className="font-bold text-slate-800 truncate">{rfq.buyerCompany}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Buyer Direct Email</div>
                  <div className="font-mono font-bold text-slate-800 truncate">
                    {rfq.buyerEmail || `${rfq.buyerCompany.toLowerCase().replace(/[^a-z0-9]/g, '')}@procurement.com`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400">Telephone / WhatsApp</div>
                  <div className="font-mono font-bold text-slate-800 truncate">
                    {rfq.buyerPhone || '+1 (555) 382-9901'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isSent ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-emerald-900">Direct Pitch Dispatched!</h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto leading-relaxed">
                Your direct factory proposal was routed to the procurement department of <strong>{rfq.buyerCompany}</strong>. You can also follow up via direct WhatsApp or email.
              </p>

              <div className="pt-3 flex flex-wrap justify-center gap-3">
                <a
                  href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Follow Up on WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendPitch} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Factory / Trading Name
                  </label>
                  <input
                    type="text"
                    required
                    value={supplierCompany}
                    onChange={(e) => setSupplierCompany(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Your Quoted Price ({curr.symbol} / {rfq.quantityUnit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Your Direct Proposal &amp; Terms
                </label>
                <textarea
                  rows={4}
                  required
                  value={pitchMessage}
                  onChange={(e) => setPitchMessage(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 outline-none leading-relaxed"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <a
                  href={`${OFFICIAL_WHATSAPP_DATA.url}&text=${whatsappText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Direct WhatsApp Pitch</span>
                </a>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Free Direct Pitch</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Upgrade Prompt Footer */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Crown className="w-3.5 h-3.5" />
                <span>🛡️ Want Serious, Ready-to-Buy Importers?</span>
              </div>
              <p className="text-[11px] text-slate-300 font-normal">
                Skip the risk and unlock pre-vetted global buyers, guaranteed RFQs, and secure trade protection.
              </p>
            </div>

            {onOpenUpgradeModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenUpgradeModal();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 transition-all cursor-pointer shadow-xs"
              >
                <span>Upgrade to Basic or Establishment Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
