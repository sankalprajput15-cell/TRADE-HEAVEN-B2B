import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  Lock,
  Scale,
  CheckCircle2,
  Building2,
  Star,
  FileCheck,
  ArrowUpRight
} from 'lucide-react';

interface CredentialCriterion {
  id: 'ISO_QUALITY' | 'SOC2_SECURITY' | 'GST_LEGAL' | 'INDEPENDENT_AUDIT' | 'PEER_SATISFACTION';
  number: string;
  pillarTitle: string;
  standardsSubtitle: string;
  summary: string;
  whatItProves: string;
  auditingAuthority: string;
  requiredDocuments: string[];
  verificationCriteria: string[];
  procurementImpact: string;
}

const TRUST_PILLARS: CredentialCriterion[] = [
  {
    id: 'ISO_QUALITY',
    number: '01.',
    pillarTitle: 'Verified Quality & Management',
    standardsSubtitle: 'ISO 9001:2015 · Six Sigma · IATF 16949 · GMP',
    summary:
      'Confirms that the manufacturer or exporter follows repeatable, documented, and audited quality management systems rather than ad-hoc production.',
    whatItProves:
      'Demonstrates standardized raw-material inspection, calibrated manufacturing lines, non-conformance corrective workflows, and batch-level traceability prior to container sealing.',
    auditingAuthority: 'SGS · Bureau Veritas · TÜV Rheinland · ISO Accredited Registrars',
    requiredDocuments: [
      'Valid ISO 9001:2015 Quality Management System Certificate with IAF accreditation seal',
      'Standard Operating Procedures (SOP) & In-Line Quality Control (IQC / IPQC / OQC) logs',
      'Six Sigma Defect Rate & Batch Calibration Records',
      'Pre-Shipment Inspection (PSI) & Mill Test / Lab Assay Reports (AQL 1.5 / 2.5)'
    ],
    verificationCriteria: [
      'Direct registry cross-check of the ISO certificate serial number against the issuing registrar database',
      'Verification that the scope of certification matches the specific physical commodities listed on Trade Heaven',
      'Confirmation of active annual surveillance audit standing with zero unresolved major non-conformities'
    ],
    procurementImpact: 'Eliminates off-spec cargo risk and satisfies enterprise QA/QC vendor onboarding mandates.'
  },
  {
    id: 'SOC2_SECURITY',
    number: '02.',
    pillarTitle: 'Security & Data Protection',
    standardsSubtitle: 'SOC 2 Type I & II · ISO/IEC 27001 · ACID Escrow Controls',
    summary:
      'Proves that an independent security auditor tested and confirmed strict information security, trade document confidentiality, and financial escrow controls.',
    whatItProves:
      'Guarantees that sensitive Proforma Invoices, Letters of Credit (MT700), customs manifests, and corporate banking coordinates are protected against tampering, leakage, or wire-redirect fraud.',
    auditingAuthority: 'AICPA Accredited SOC 2 Auditors · ISO 27001 Certifying Bodies · Trade Heaven Security Desk',
    requiredDocuments: [
      'SOC 2 Type II Attestation Report covering Security, Availability, and Confidentiality Trust Services Criteria',
      'ISO/IEC 27001 Information Security Management System (ISMS) Statement of Applicability',
      'Row-Locked Custodial Escrow Ledger & TLS 1.3 / AES-256 Encryption Verification',
      'Verified Corporate Beneficiary Bank Account Comfort Letter (matching legal entity name)'
    ],
    verificationCriteria: [
      'Continuous penetration testing and cryptographic hash verification on all issued Trade Assurance Certificates',
      'Multi-factor signatory verification before any supplier IBAN/SWIFT settlement coordinate can be registered',
      'Strict anti-circumvention and role-based access control (RBAC) protecting buyer RFQ specifications'
    ],
    procurementImpact: 'Protects enterprise buyers from invoice manipulation, man-in-the-middle wire fraud, and IP leakage.'
  },
  {
    id: 'GST_LEGAL',
    number: '03.',
    pillarTitle: 'Legal & Regulatory Compliance',
    standardsSubtitle: 'Country-Specific Sovereign Govt. Docs · GST/IEC (India) · EIN/VAT/EORI/ABN (Global)',
    summary:
      'Verifies official government-issued tax, customs, and corporate registration documents specific to the company’s country of incorporation (GST applies only in India; equivalent sovereign documents are verified globally).',
    whatItProves:
      'Confirms through the sovereign government registry of that specific country that the entity is legally incorporated, tax-compliant, and authorized for cross-border trade—whether via GSTIN & DGFT IEC in India, IRS EIN in the USA, VAT & EORI in the EU/UK, ABN in Australia, TRN in the UAE, or USCC in China.',
    auditingAuthority: 'National Sovereign Tax & Corporate Registries · MCA/GSTN (India) · IRS/SEC (USA) · EU VIES/Companies House · Dun & Bradstreet (D-U-N-S)',
    requiredDocuments: [
      'India Entities Only: Goods and Services Tax (GST REG-06) Certificate, MCA CIN/LLPIN & DGFT Importer-Exporter Code (IEC)',
      'USA / Canada / Americas: IRS Employer Identification Number (EIN), State Articles of Incorporation, or BN/CNPJ',
      'UK / European Union: National VAT Registration, Customs EORI Number & Companies House / Commercial Register Extract',
      'Middle East / APAC / Global: UAE FTA Tax Registration (TRN) & Trade License, Australia ABN/ACN, China USCC, or equivalent sovereign government license'
    ],
    verificationCriteria: [
      'Direct lookup against the official government registry of the company’s specific country (GST is checked strictly for Indian companies; national equivalents are checked outside India)',
      'Cross-matching of the exact legal entity name across the country-specific government tax certificate, customs export license, and receiving corporate bank account',
      'Physical registered street address and signatory KYC verification to eliminate unregistered shell intermediaries'
    ],
    procurementImpact: 'Ensures full sovereign tax compliance, customs clearance eligibility, and legally enforceable cross-border contracts in over 190 jurisdictions.'
  },
  {
    id: 'INDEPENDENT_AUDIT',
    number: '04.',
    pillarTitle: 'Operational Integrity & Independence',
    standardsSubtitle: 'Third-Party Evaluator Proof · On-Site Plant & Warehouse Assay',
    summary:
      'Replaces self-written marketing claims ("we are committed to quality") with objective, third-party evaluator proof that reduces buyer risk and accelerates procurement.',
    whatItProves:
      'Provides an unbiased audit dossier compiled by independent inspectors who physically verify factory machinery, raw material inventory, headcount, and export loading bays.',
    auditingAuthority: 'SGS · Intertek · Bureau Veritas · Trade Heaven Sovereign Audit Division',
    requiredDocuments: [
      'On-Site Factory & Warehouse Physical Audit Report with timestamped geo-tagged photography',
      'Production Capacity & Machinery Asset Schedule verified by third-party field engineers',
      'Past 12-Month Customs Bill of Lading (B/L) & Shipping Export History Verification',
      'Cryptographically Signed Trade Assurance Certificate (Serial Format: THC-2026-XXXX)'
    ],
    verificationCriteria: [
      'Unannounced or scheduled physical plant inspection conducted independent of supplier self-declarations',
      'Direct verification of warehouse stock levels and loading dock operations prior to Escrow milestone release',
      'Publicly searchable Certificate Serial Number enabling instant due-diligence by buyer compliance teams'
    ],
    procurementImpact: 'Cuts enterprise vendor onboarding and compliance review cycles from weeks down to minutes.'
  },
  {
    id: 'PEER_SATISFACTION',
    number: '05.',
    pillarTitle: 'Performance & Customer Satisfaction',
    standardsSubtitle: 'Verified Buyer Reviews · G2 & Google Trust Signals · Fulfillment Score',
    summary:
      'Validates real-world B2B execution through peer validation, verified transaction reviews, on-time shipment metrics, and zero-dispute escrow settlement history.',
    whatItProves:
      'Shows how the supplier or trade partner actually performs under live container contracts—measuring responsiveness, packaging accuracy, and post-shipment support.',
    auditingAuthority: 'Trade Heaven Verified Escrow Ledger · Google Business Reviews · Verified Buyer Directory',
    requiredDocuments: [
      'Authenticated Post-Settlement Buyer Reviews linked to completed Escrow / Bill of Lading transactions',
      'Verified On-Time Container Dispatch & Customs Clearance Fulfillment Rate (>96% threshold)',
      'External Reputation Signals (Google Business Profile Rating, G2 / Industry Directory Standing)',
      'Dispute Resolution & Trade Heaven Mediation Compliance Record'
    ],
    verificationCriteria: [
      'Reviews are restricted to authenticated buyers with verified order history or documented RFQ engagements',
      'Automated tracking of supplier response SLA, contract fulfillment accuracy, and claim-free shipment streaks',
      'Continuous synchronization with public trust signals to maintain active Gold or VIP Sovereign badge standing'
    ],
    procurementImpact: 'Gives procurement teams peer-backed confidence based on proven historical delivery performance.'
  }
];

interface B2BTrustCertificatePillarsSectionProps {
  onVerifyClick?: () => void;
  onApplyClick?: () => void;
}

export const B2BTrustCertificatePillarsSection: React.FC<B2BTrustCertificatePillarsSectionProps> = ({
  onVerifyClick,
  onApplyClick
}) => {
  const [activePillarId, setActivePillarId] = useState<CredentialCriterion['id']>('ISO_QUALITY');

  const activePillar = TRUST_PILLARS.find(p => p.id === activePillarId) || TRUST_PILLARS[0];

  const getPillarIcon = (id: CredentialCriterion['id']) => {
    switch (id) {
      case 'ISO_QUALITY':
        return <Award className="w-5 h-5 text-blue-600 shrink-0" />;
      case 'SOC2_SECURITY':
        return <Lock className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'GST_LEGAL':
        return <Scale className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'INDEPENDENT_AUDIT':
        return <Building2 className="w-5 h-5 text-indigo-600 shrink-0" />;
      case 'PEER_SATISFACTION':
        return <Star className="w-5 h-5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <section
      aria-labelledby="b2b-trust-certificate-framework-heading"
      className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-10 shadow-2xs"
    >
      {/* Editorial Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-200">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 tracking-wide">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Independent Third-Party B2B Trust Certificate Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Objective Evaluator Proof</span>
          </div>
          <h2
            id="b2b-trust-certificate-framework-heading"
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight"
          >
            What a Trade Heaven B2B Trust Certificate Shows &amp; Proves
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Unlike self-reported marketing claims, a Trade Heaven Trust Certificate (<code className="font-mono text-xs text-slate-800">THC-2026-XXXX</code>) certifies that an independent third party has verified a company&apos;s quality systems, data security, legal tax standing, physical operations, and real-world buyer satisfaction.
          </p>
        </div>

        {(onVerifyClick || onApplyClick) && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onVerifyClick && (
              <button
                type="button"
                onClick={onVerifyClick}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify a Certificate Serial</span>
              </button>
            )}
            {onApplyClick && (
              <button
                type="button"
                onClick={onApplyClick}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Apply for Trust Certificate</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 5 Core Trust Pillars Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {TRUST_PILLARS.map(pillar => {
          const isSelected = pillar.id === activePillarId;
          return (
            <button
              key={pillar.id}
              type="button"
              onClick={() => setActivePillarId(pillar.id)}
              className={`text-left p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-slate-50/80 hover:bg-slate-100/80 text-slate-900 border-slate-200'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-mono text-xs font-bold ${
                      isSelected ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {pillar.number}
                  </span>
                  {getPillarIcon(pillar.id)}
                </div>
                <h3
                  className={`text-sm font-bold leading-snug ${
                    isSelected ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {pillar.pillarTitle}
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isSelected ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {pillar.summary}
                </p>
              </div>

              <div
                className={`pt-3 border-t text-[11px] font-mono ${
                  isSelected
                    ? 'border-slate-800 text-emerald-300'
                    : 'border-slate-200/80 text-slate-500'
                }`}
              >
                {pillar.standardsSubtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Deep-Dive Audit Criteria Inspector for Selected Pillar */}
      <div className="rounded-2xl bg-slate-50 border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-mono font-bold text-blue-700">{activePillar.number}</span>
              <span>Audit &amp; Compliance Breakdown</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-700 font-semibold">{activePillar.standardsSubtitle}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">
              {activePillar.pillarTitle} — Specific Verification Criteria
            </h3>
          </div>
          <div className="text-xs text-slate-600">
            <span className="text-slate-400">Auditing Authority: </span>
            <strong className="text-slate-900 font-semibold">{activePillar.auditingAuthority}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Cols: What It Proves & Procurement Impact */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-xl bg-white border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                What This Credential Proves
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {activePillar.whatItProves}
              </p>
            </div>

            <div className="p-5 rounded-xl bg-emerald-950 text-white border border-emerald-800 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Buyer &amp; Procurement Impact
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
                {activePillar.procurementImpact}
              </p>
            </div>
          </div>

          {/* Center 4 Cols: Required Compliance Documents */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Mandatory Documents Inspected
            </div>
            <ul className="space-y-2.5">
              {activePillar.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right 4 Cols: Third-Party Verification Protocol */}
          <div className="lg:col-span-4 p-5 rounded-xl bg-white border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Independent Evaluator Protocol
            </div>
            <ul className="space-y-2.5">
              {activePillar.verificationCriteria.map((crit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Country-Specific Government Document Verification Matrix (Always visible on Legal & Regulatory Compliance tab, or summarized) */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Jurisdiction-Specific Sovereign Government Document Verification (How We Verify Outside &amp; Inside India)
            </div>
            <span className="text-xs text-slate-500">
              GST is applicable strictly in India · International suppliers are audited against their home government&apos;s statutory registries
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">India</div>
              <div className="text-slate-600 leading-snug">
                GST Certificate (GSTIN), MCA CIN / LLPIN &amp; DGFT Importer-Exporter Code (IEC)
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">United States &amp; Canada</div>
              <div className="text-slate-600 leading-snug">
                IRS Federal EIN (W-9 / CP 575), State Articles of Incorporation / Good Standing &amp; CRA BN
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">UK &amp; European Union</div>
              <div className="text-slate-600 leading-snug">
                VIES VAT Registration, Customs EORI Number &amp; Companies House / Handelsregister Extract
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">UAE &amp; GCC</div>
              <div className="text-slate-600 leading-snug">
                DED / Free Zone Commercial Trade License, FTA Tax Registration Number (TRN) &amp; Chamber Certificate
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">Australia &amp; APAC</div>
              <div className="text-slate-600 leading-snug">
                ASIC Australian Business Number (ABN / ACN), Singapore ACRA UEN, or Japan Corporate Number
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">China &amp; LatAm</div>
              <div className="text-slate-600 leading-snug">
                SAMR 18-Digit Unified Social Credit Code (USCC), Customs Record, Brazil CNPJ, or Mexico RFC
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison: Self-Reported Claims vs. Trade Heaven Third-Party Trust Certificate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Unverified Supplier Marketing Copy
          </div>
          <h4 className="text-base font-bold text-slate-800">
            Relying on Self-Reported Website Claims
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
            <li>• Generic statements like &ldquo;We are committed to high quality and fast delivery&rdquo; with no audit trail</li>
            <li>• Unverified PDF scans or expired certificates that cannot be cross-checked online</li>
            <li>• High risk of shell intermediaries, mismatched bank accounts, or off-spec shipments</li>
            <li>• Slows down enterprise procurement due to weeks of manual legal and tax due diligence</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Trade Heaven Verified Trust Certificate (THC-2026-XXXX)
          </div>
          <h4 className="text-base font-bold text-white">
            Independent Third-Party Audited Credential
          </h4>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li>• Live searchable serial number verifying ISO 9001, SOC 2 / ISO 27001, and country-specific government tax &amp; legal standing (GST/IEC in India; EIN, VAT/EORI, ABN, TRN, or USCC globally)</li>
            <li>• On-site factory and pre-shipment assay conducted by SGS, Bureau Veritas, or TÜV Rheinland</li>
            <li>• Binding Escrow Protection backed by ACID Escrow Vaults</li>
            <li>• Instant comfort letter &amp; cryptographic hash for fast-track vendor procurement approval</li>
          </ul>
        </div>
      </div>
    </section>
  );
};
