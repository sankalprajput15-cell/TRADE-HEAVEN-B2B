import React from 'react';
import { 
  ShieldCheck, 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Clock, 
  DollarSign,
  ArrowRight,
  Sparkles,
  Lock,
  Mail,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onOpenContactModal?: () => void;
}

export const RefundPolicyView: React.FC<Props> = ({ onOpenContactModal }) => {
  return (
    <div id="refund-policy-root" className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-9 lg:p-12 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Global Commercial Escrow &amp; Dispute Mediation Standard</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Trade Heaven Return &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Comprehensive terms governing capital protection, pre-shipment SGS inspection triggers, escrow release conditions, and 30-day dispute resolution under ICC arbitration rules.
        </p>
      </div>

      {/* Main Legal Content Articles */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 space-y-8 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed">
        
        {/* Article 1 */}
        <section className="space-y-2.5">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            1. Trade Assurance Escrow Guarantee
          </h2>
          <p className="text-slate-600 font-medium">
            All commercial transactions conducted on Trade Heaven with the <strong>Trade Assurance Escrow</strong> badge hold 100% of buyer deposit funds in segregated client escrow vaults (governed under Swiss FINMA / EU PSD2 compliance). Funds are never disbursed directly to suppliers prior to milestone fulfillment.
          </p>
        </section>

        {/* Article 2: Refund Eligibility */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            2. Conditions for Full Refund Release
          </h2>
          <div className="space-y-2 text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">A. Shipment Delay Exceeding Agreed Lead Time:</strong> If the manufacturer fails to dispatch cargo within 14 calendar days beyond the contractual Bill of Lading (B/L) deadline specified in the Proforma Invoice without mutual force-majeure extension.
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">B. Failure of Pre-Shipment Inspection (PSI):</strong> If third-party inspection (SGS, Bureau Veritas, TÜV) confirms the goods do not conform to contractual technical drawings, material grades, or tolerance specifications.
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">C. Counterfeit or Non-Certified Materials:</strong> Production batches discovered with non-authentic CE/UL/RoHS markings or substandard alloy compositions.
              </div>
            </div>
          </div>
        </section>

        {/* Article 3: Dispute Mediation Timeline */}
        <section className="space-y-2.5 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            3. 30-Day Mediation &amp; ICC Arbitration
          </h2>
          <p className="text-slate-600 font-medium">
            Either party may file a formal trade dispute ticket within 30 calendar days of cargo arrival at the destination discharge port. Trade Heaven Senior Arbitrators will review laboratory test sheets, photographs, and customs entry documents within 5 business days.
          </p>
        </section>

        {/* Contact Strip */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Submit Formal Dispute or Claim
          </h3>
          <p className="text-xs text-slate-300">
            For urgent mediation or claim submissions, reach out directly to our escrow compliance officers:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-mono text-blue-300">help@tradeheaven.net</span>
            <span>•</span>
            <span className="font-mono text-emerald-300">+91 8532934479 (Official Desk)</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {onOpenContactModal && (
              <button
                onClick={onOpenContactModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Open Help Desk Ticket
              </button>
            )}
            <a
              href={OFFICIAL_WHATSAPP_DATA.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Contact Escalation on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
