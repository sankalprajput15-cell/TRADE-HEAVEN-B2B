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
          <span>Investigation-Based Dispute &amp; Refund Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Trade Heaven Return &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          Official policy governing membership services, platform subscriptions, dispute mediation, and investigation-based refund authorizations under Tradeheaven ECOM Solution LLP.
        </p>
      </div>

      {/* Main Legal Content Articles */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-9 space-y-8 shadow-sm text-slate-800 text-xs sm:text-sm leading-relaxed">
        
        {/* Article 1: Core Policy Statement */}
        <section className="space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            1. Investigation-Based Refund Authorization
          </h2>
          <p className="text-slate-600 font-medium">
            Trade Heaven operates under a strict <strong>investigation-based refund policy</strong>. Refunds are not automatic and are only available when formally approved by Trade Heaven following a comprehensive internal review and investigation.
          </p>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-amber-950">
            <div className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Mandatory Compliance Review &amp; Service Continuity Clause</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-amber-900">
              Upon receiving any formal refund request, Trade Heaven’s compliance and operations team initiates an in-depth audit of the account, matchmaking records, technical provisioning, and services rendered. 
            </p>
            <p className="text-xs sm:text-sm leading-relaxed font-semibold text-amber-950">
              If, after thorough investigation, a refund request is rejected by Trade Heaven, <u>no refund will be issued</u>. In such cases, there is an uninterrupted continuation of services for the full contracted duration, as Trade Heaven has already incurred significant operational, technological, and matchmaking costs in provisioning and delivering the services.
            </p>
          </div>
        </section>

        {/* Article 2: Non-Refundable Operational Investments */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-indigo-600" />
            2. Recognition of Incurred Service Costs
          </h2>
          <p className="text-slate-600">
            By activating a membership or service package on Trade Heaven, the user acknowledges and agrees that:
          </p>
          <div className="space-y-2.5 text-slate-600">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">A. Immediate Resource Allocation:</strong> Trade Heaven immediately expends administrative, engineering, and business matchmaking labor upon account onboarding, business directory indexing, catalog publication, and seller verification.
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">B. Rejection Outcome &amp; Service Fulfillment:</strong> Where an investigation finds that Trade Heaven has provided platform access, exposure, tools, or matchmaking capabilities in accordance with the subscribed plan, the claim will be rejected and active services will continue without interruption.
              </div>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">C. Approved Claims:</strong> In rare cases where an investigation conclusively demonstrates an unrectified technical failure or service non-delivery on the part of Trade Heaven, a refund or credit may be approved at the sole discretion of Trade Heaven management.
              </div>
            </div>
          </div>
        </section>

        {/* Article 3: Commercial Trade Protection Deposits */}
        <section className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            3. Commercial Trade Protection Deposit Release Conditions
          </h2>
          <p className="text-slate-600">
            For physical merchandise transactions secured with Trade Protection Certificates, buyer escrow deposits are held safely in segregated client trade vaults and released or refunded under specific contractual milestones:
          </p>
          <div className="space-y-2 text-slate-600">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">A. Verified Shipment Non-Performance:</strong> If the verified supplier fails to dispatch cargo within contractual lead times without mutual extension and verified force-majeure documentation.
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 font-bold">B. Failure of Certified Pre-Shipment Inspection (PSI):</strong> If third-party accredited inspectors (SGS, Bureau Veritas, TÜV) issue non-conforming quality and specification findings prior to dispatch.
              </div>
            </div>
          </div>
        </section>

        {/* Article 4: Investigation Filing Procedure */}
        <section className="space-y-2.5 pt-4 border-t border-slate-100">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            4. Claim Submission &amp; Audit Timeline
          </h2>
          <p className="text-slate-600 font-medium">
            To request an investigation, users must submit a formal dispute ticket including account details, billing receipts, and specific grounds for review. Trade Heaven’s compliance desk reviews all documentation within 7 to 14 business days before issuing a final determination.
          </p>
        </section>

        {/* Contact Strip */}
        <div className="p-6 bg-slate-900 text-white rounded-2xl space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-blue-400" />
            Submit Formal Investigation Request or Claim
          </h3>
          <p className="text-xs text-slate-300">
            For formal claim submissions or compliance inquiries, reach out directly to Trade Heaven’s legal and operations desk:
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-mono text-blue-300">help@tradeheaven.net</span>
            <span>•</span>
            <span className="font-mono text-emerald-300">+91 8532934479 (Compliance Desk)</span>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            {onOpenContactModal && (
              <button
                onClick={onOpenContactModal}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Open Compliance Ticket
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
