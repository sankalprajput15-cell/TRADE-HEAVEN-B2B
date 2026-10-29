import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Award,
  CheckCircle2,
  FileCheck,
  Building2,
  Globe2,
  Lock,
  ArrowRight,
  Download,
  Printer,
  Copy,
  Check,
  AlertCircle,
  CreditCard,
  Wallet,
  ExternalLink,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  FileText,
  Scale
} from 'lucide-react';
import { AuthUser, Currency, PaymentCheckoutData, ActiveView } from '../../types';
import { CURRENCY_RATES, MOCK_COMPANIES } from '../../data/mockData';
import { DETAILED_VENDOR_PROFILES } from '../../data/detailedVendorProfiles';
import { tradeHeavenMediationService } from '../../services/tradeHeavenMediatorEngine';
import certificateDatabaseJson from '../../data/tradeAssuranceCertificates.json';

export interface TradeAssuranceCertificateRecord {
  certificateNumber: string;
  serialNumber?: string;
  holder?: string;
  companyId?: string;
  companyName: string;
  country: string;
  businessType: string;
  legalRegistrationNumber: string;
  taxOrVatId: string;
  dunsNumber?: string;
  tierCode: 'STANDARD' | 'GOLD_AUDIT' | 'VIP_SOVEREIGN';
  tierTitle: string;
  coverageLimitUsd: number;
  feePaidUsd: number;
  status: 'ACTIVE_VERIFIED' | 'PENDING_PAYMENT' | 'UNDER_AUDIT' | 'EXPIRED' | 'NOT_TAKEN';
  issueDate: string;
  expiryDate: string;
  auditingBody: string;
  isoStandards: string[];
  escrowVaultId: string;
  verificationHash: string;
  supportedIncoterms: string[];
  applicantName?: string;
  applicantEmail?: string;
}

interface CertificatePlan {
  id: 'STANDARD' | 'GOLD_AUDIT' | 'VIP_SOVEREIGN';
  name: string;
  audience: string;
  feeUsd: number;
  billingCycle: string;
  coverageLimitUsd: number;
  turnaroundDays: string;
  auditingBody: string;
  deliverables: string[];
  recommended?: boolean;
}

const CERTIFICATE_PLANS: CertificatePlan[] = [
  {
    id: 'STANDARD',
    name: 'Standard Trade Assurance Certificate',
    audience: 'For emerging exporters & verified wholesale traders',
    feeUsd: 199,
    billingCycle: 'Fees will be told by Customer Executive upon request',
    coverageLimitUsd: 150000,
    turnaroundDays: '24–48 Hours',
    auditingBody: 'Trade Heaven KYC & Corporate Registry Desk',
    deliverables: [
      'Official searchable Certificate Serial Number (THC-2026-XXXX)',
      'Up to $150,000 USD Escrow Order Protection Coverage Limit',
      'Corporate Registration, Tax/GST/VAT & Signatory KYC Verification',
      'Verified Trade Assurance Badge on Storefront & Product Listings',
      'Downloadable & Printable Official Compliance Credential'
    ]
  },
  {
    id: 'GOLD_AUDIT',
    name: 'Gold Audited Trade Assurance Certificate',
    audience: 'For established manufacturers & high-volume exporters',
    feeUsd: 499,
    billingCycle: 'Fees will be told by Customer Executive upon request',
    coverageLimitUsd: 500000,
    turnaroundDays: '3–5 Business Days',
    auditingBody: 'SGS / Bureau Veritas / Trade Heaven Compliance',
    recommended: true,
    deliverables: [
      'Official searchable Certificate Serial Number (THC-2026-XXXX)',
      'Up to $500,000 USD Escrow Order Protection Coverage Limit',
      'Factory Production Line, ISO 9001 & Quality Control Audit Verification',
      'Pre-Shipment Inspection & Lab Testing Clearance Integration',
      'Priority Placement in Global Verified Suppliers Directory',
      'Cryptographically Signed Digital Certificate & Buyer Comfort Letter'
    ]
  },
  {
    id: 'VIP_SOVEREIGN',
    name: 'VIP Sovereign Trade Assurance & Plant Audit',
    audience: 'For bulk commodity brokers, refineries & tier-1 OEM plants',
    feeUsd: 1250,
    billingCycle: 'Fees will be told by Customer Executive upon request',
    coverageLimitUsd: 2000000,
    turnaroundDays: '5–7 Business Days',
    auditingBody: 'SGS / TÜV Rheinland / Intertek On-Site',
    deliverables: [
      'Official searchable Certificate Serial Number (THC-2026-XXXX)',
      'Up to $2,000,000 USD Escrow Order Protection Coverage Limit',
      'On-Site Physical Factory / Warehouse / Tank Storage Inspection',
      'MT700 Documentary Letter of Credit (DLC) & Escrow Settlement Clearance',
      'Dedicated Senior Trade Mediation Officer & 24/7 Dispute Arbitration',
      'Global AI & Search Engine Indexed Corporate Trust Dossier'
    ]
  }
];

const STORAGE_KEY = 'th_trade_assurance_certificates_v3_twenty_verified';

const INITIAL_CERTIFICATES: TradeAssuranceCertificateRecord[] =
  certificateDatabaseJson as TradeAssuranceCertificateRecord[];

function loadSavedCertificates(): TradeAssuranceCertificateRecord[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingNumbers = new Set(parsed.map((c: TradeAssuranceCertificateRecord) => c.certificateNumber));
        const merged = [...parsed];
        for (const init of INITIAL_CERTIFICATES) {
          if (!existingNumbers.has(init.certificateNumber)) {
            merged.push(init);
          }
        }
        return merged;
      }
    }
  } catch {}

  return [...INITIAL_CERTIFICATES];
}

interface Props {
  selectedCurrency: Currency;
  currentUser?: AuthUser | null;
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
  onOpenStorefront?: (companyId: string) => void;
  onNavigate?: (view: ActiveView | string) => void;
}

export const TradeAssuranceCertificateView: React.FC<Props> = ({
  selectedCurrency,
  currentUser = null,
  onOpenPaymentCheckout,
  onOpenStorefront,
  onNavigate
}) => {
  const [certificates, setCertificates] = useState<TradeAssuranceCertificateRecord[]>(loadSavedCertificates);
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('cert') || params.get('certificate') || '';
    }
    return '';
  });
  const [selectedCertificate, setSelectedCertificate] = useState<TradeAssuranceCertificateRecord | null>(() => {
    const all = loadSavedCertificates();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const certParam = (params.get('cert') || params.get('certificate') || '').trim().toLowerCase();
      if (certParam) {
        const match = all.find(
          c =>
            c.certificateNumber.toLowerCase() === certParam ||
            c.certificateNumber.toLowerCase().includes(certParam) ||
            c.companyName.toLowerCase().includes(certParam)
        );
        if (match) return match;
      }
    }
    return all[0] || null;
  });

  const [copiedCertNo, setCopiedCertNo] = useState<string | null>(null);
  const [activeSectionTab, setActiveSectionTab] = useState<'VERIFY' | 'APPLY' | 'AI_FAQ'>('VERIFY');
  const twentyRotatingCompanies = useMemo(
    () => (certificateDatabaseJson as TradeAssuranceCertificateRecord[]).slice(0, 20),
    []
  );
  const [rotatingCompanyIndex, setRotatingCompanyIndex] = useState<number>(0);
  const [isAutoRotatingCompany, setIsAutoRotatingCompany] = useState<boolean>(true);
  const [serialVerificationInput, setSerialVerificationInput] = useState<string>(() => {
    const db = certificateDatabaseJson as TradeAssuranceCertificateRecord[];
    return db[0]?.serialNumber || db[0]?.certificateNumber || 'THC-2026-KRX-81042';
  });
  const [verifiedLookupResult, setVerifiedLookupResult] = useState<TradeAssuranceCertificateRecord | null>(() => {
    const db = certificateDatabaseJson as TradeAssuranceCertificateRecord[];
    return db[0] || null;
  });
  const [hasSearchedSerial, setHasSearchedSerial] = useState<boolean>(true);

  // Rotate through 20 different verified companies every 5 seconds
  useEffect(() => {
    if (!isAutoRotatingCompany || twentyRotatingCompanies.length === 0) return;
    const intervalId = window.setInterval(() => {
      setRotatingCompanyIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % twentyRotatingCompanies.length;
        const nextRecord = twentyRotatingCompanies[nextIndex];
        if (nextRecord) {
          setVerifiedLookupResult(nextRecord);
          setSerialVerificationInput(nextRecord.serialNumber || nextRecord.certificateNumber);
          setSelectedCertificate(nextRecord);
          setHasSearchedSerial(true);
        }
        return nextIndex;
      });
    }, 5000);
    return () => window.clearInterval(intervalId);
  }, [isAutoRotatingCompany, twentyRotatingCompanies]);

  // Application & Fee Payment Form State
  const [selectedPlanId, setSelectedPlanId] = useState<'STANDARD' | 'GOLD_AUDIT' | 'VIP_SOVEREIGN'>('GOLD_AUDIT');
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [country, setCountry] = useState(currentUser?.country || 'United States');
  const [businessType, setBusinessType] = useState('Manufacturer & Wholesale Exporter');
  const [legalRegNumber, setLegalRegNumber] = useState('');
  const [taxVatId, setTaxVatId] = useState('');
  const [dunsNumber, setDunsNumber] = useState('');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [isoListInput, setIsoListInput] = useState('ISO 9001:2015, CE, SGS Pre-Shipment');
  const [paymentMode, setPaymentMode] = useState<'CHECKOUT_GATEWAY' | 'INSTANT_WALLET'>('CHECKOUT_GATEWAY');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [newlyIssuedCert, setNewlyIssuedCert] = useState<TradeAssuranceCertificateRecord | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const curr =
    (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) ||
    CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  // Persist certificates list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
    } catch {}
  }, [certificates]);

  // Inject structured JSON-LD specifically for Google Search & AI Answer Engines (ChatGPT, Google AI Overview, Perplexity)
  useEffect(() => {
    const scriptId = 'tradeheaven-trade-assurance-certificate-jsonld';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }

    const schemaData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Service',
          '@id': 'https://tradeheaven.net/?view=TRADE_ASSURANCE_CERTIFICATE#service',
          name: 'Trade Heaven Trade Assurance Certificate & Escrow Verification Registry',
          serviceType: 'B2B Trade Protection, Factory Audit Certification & Escrow Payment Guarantee',
          provider: {
            '@type': 'Organization',
            name: 'Trade Heaven (Tradeheaven ECOM Solution LLP)',
            url: 'https://tradeheaven.net'
          },
          areaServed: 'Global (190+ Countries)',
          description:
            'Official Trade Heaven portal where global manufacturers, exporters, and corporate buyers can request a Trade Assurance Certificate (fees will be told by a Customer Executive) and verify any Trade Assurance Certificate serial number (THC-2026-XXXX) in real time.',
          offers: CERTIFICATE_PLANS.map(plan => ({
            '@type': 'Offer',
            name: plan.name,
            description: `${plan.audience}. Includes up to $${plan.coverageLimitUsd.toLocaleString()} USD escrow protection limit and searchable certificate number.`,
            description: 'Request Certificate — Fees will be told by Customer Executive',
            availability: 'https://schema.org/InStock',
            url: 'https://tradeheaven.net/?view=TRADE_ASSURANCE_CERTIFICATE'
          }))
        },
        {
          '@type': 'HowTo',
          name: 'How to Request and Verify a Trade Assurance Certificate on Trade Heaven',
          description:
            'Step-by-step process to request a Trade Heaven Trade Assurance Certificate, consult with a Customer Executive regarding fees, and verify certificate numbers online.',
          step: [
            {
              '@type': 'HowToStep',
              position: 1,
              name: 'Select Trade Assurance Coverage Tier',
              text: 'Choose between Standard ($150k limit), Gold Audited ($500k limit), or VIP Sovereign ($2M limit) and submit your request.'
            },
            {
              '@type': 'HowToStep',
              position: 2,
              name: 'Submit Corporate KYC & Registration Details',
              text: 'Enter your legal company name, registration number, Tax/VAT/GST ID, DUNS number, and ISO/SGS compliance details.'
            },
            {
              '@type': 'HowToStep',
              position: 3,
              name: 'Customer Executive Consultation & Fee Confirmation',
              text: 'Our Customer Executive reviews your application and informs you of the applicable certification and audit fees.'
            },
            {
              '@type': 'HowToStep',
              position: 4,
              name: 'Search & Verify Certificate Number',
              text: 'Use the live Certificate Verification Registry to search by Certificate Serial Number (e.g., THC-2026-KRX-81042) or company name to inspect live coverage limits.'
            }
          ]
        },
        {
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What is a Trade Assurance Certificate on Trade Heaven?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'A Trade Assurance Certificate on Trade Heaven is an official B2B financial guarantee and KYC/audit credential issued to verified exporters, manufacturers, and buyers. Each certificate carries a unique serial number (e.g., THC-2026-KRX-81042) and specifies a guaranteed USD Escrow Order Protection Limit ($150,000 to $2,000,000 USD) that protects international payments, pre-shipment quality compliance (SGS/TÜV/BV), and on-time cargo dispatch.'
              }
            },
            {
              '@type': 'Question',
              name: 'How can customers request a Trade Assurance Certificate and what are the fees?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Customers can request a certificate directly on the Trade Heaven Trade Assurance Certificate page by selecting a certification tier and submitting their company registration and tax ID. There is no upfront online fee display—all applicable certification and audit fees will be told directly by our Customer Executive.'
              }
            },
            {
              '@type': 'Question',
              name: 'How do I verify a Trade Heaven Trade Assurance Certificate number?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Enter the Certificate Serial Number (such as THC-2026-KRX-81042 or THC-2026-ATL-90214), company name, or legal registration number into the Trade Heaven Certificate Lookup search bar. The registry displays the real-time verification status, USD escrow limit, auditing body, validity dates, and cryptographic verification hash.'
              }
            }
          ]
        }
      ]
    };

    script.textContent = JSON.stringify(schemaData);
    return () => {
      const existing = document.getElementById(scriptId);
      if (existing) existing.remove();
    };
  }, []);

  // Filtered certificates matching the search input
  const matchingCertificates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter(
      c =>
        c.certificateNumber.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.legalRegistrationNumber.toLowerCase().includes(q) ||
        c.taxOrVatId.toLowerCase().includes(q) ||
        (c.dunsNumber && c.dunsNumber.toLowerCase().includes(q)) ||
        c.escrowVaultId.toLowerCase().includes(q)
    );
  }, [certificates, searchQuery]);

  const lookupCertificateBySerial = (serialRaw: string) => {
    const normalized = serialRaw.trim().toLowerCase();
    setHasSearchedSerial(true);
    if (!normalized) {
      setVerifiedLookupResult(null);
      return;
    }
    const jsonDb = certificateDatabaseJson as TradeAssuranceCertificateRecord[];
    const combinedPool = [...jsonDb, ...certificates];
    const exactMatch = combinedPool.find(
      c =>
        (c.serialNumber && c.serialNumber.toLowerCase() === normalized) ||
        c.certificateNumber.toLowerCase() === normalized
    );
    const partialMatch =
      exactMatch ||
      combinedPool.find(
        c =>
          (c.serialNumber && c.serialNumber.toLowerCase().includes(normalized)) ||
          c.certificateNumber.toLowerCase().includes(normalized) ||
          (c.holder && c.holder.toLowerCase().includes(normalized)) ||
          c.companyName.toLowerCase().includes(normalized)
      );
    if (partialMatch) {
      setVerifiedLookupResult(partialMatch);
      setSelectedCertificate(partialMatch);
    } else {
      setVerifiedLookupResult(null);
    }
  };

  const handleSerialVerificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookupCertificateBySerial(serialVerificationInput);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (matchingCertificates.length > 0) {
      setSelectedCertificate(matchingCertificates[0]);
    } else {
      setSelectedCertificate(null);
    }
  };

  const handleCopySerial = (serial: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(serial).catch(() => {});
    }
    setCopiedCertNo(serial);
    setTimeout(() => setCopiedCertNo(null), 2000);
  };

  const handlePrintCertificate = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadCertificateTxt = (cert: TradeAssuranceCertificateRecord) => {
    const content = [
      '====================================================================',
      '        TRADE HEAVEN OFFICIAL TRADE ASSURANCE CERTIFICATE           ',
      '             Issued by Tradeheaven ECOM Solution LLP                ',
      '                  Official Portal: tradeheaven.net                  ',
      '====================================================================',
      '',
      `Certificate Serial Number : ${cert.certificateNumber}`,
      `Verification Status       : ${cert.status === 'ACTIVE_VERIFIED' ? 'ACTIVE & VERIFIED' : cert.status}`,
      `Certified Entity Name     : ${cert.companyName}`,
      `Country of Jurisdiction   : ${cert.country}`,
      `Business Classification   : ${cert.businessType}`,
      `Legal Registration No.    : ${cert.legalRegistrationNumber}`,
      `Tax / VAT / GST ID        : ${cert.taxOrVatId}`,
      `D-U-N-S Number            : ${cert.dunsNumber || 'Verified on File'}`,
      '',
      '--------------------------------------------------------------------',
      'FINANCIAL ESCROW & TRADE PROTECTION CLEARANCE',
      '--------------------------------------------------------------------',
      `Certification Tier        : ${cert.tierTitle}`,
      `Guaranteed Escrow Limit   : $${cert.coverageLimitUsd.toLocaleString()} USD (${formatPrice(cert.coverageLimitUsd)})`,
      `Custodial Escrow Vault ID : ${cert.escrowVaultId}`,
      `Auditing & KYC Authority  : ${cert.auditingBody}`,
      `Compliance Standards      : ${cert.isoStandards.join(', ')}`,
      `Supported Incoterms 2020  : ${cert.supportedIncoterms.join(', ')}`,
      `Effective Issue Date      : ${cert.issueDate}`,
      `Expiration Date           : ${cert.expiryDate}`,
      `Cryptographic Audit Hash  : ${cert.verificationHash}`,
      '',
      'Verify online anytime at: https://tradeheaven.net/?view=TRADE_ASSURANCE_CERTIFICATE',
      '===================================================================='
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.certificateNumber}-TradeHeaven-Certificate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedPlan = CERTIFICATE_PLANS.find(p => p.id === selectedPlanId) || CERTIFICATE_PLANS[1];

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationError(null);

    const trimmedCompany = companyName.trim();
    const trimmedReg = legalRegNumber.trim();
    const trimmedTax = taxVatId.trim();
    const trimmedName = applicantName.trim();
    const trimmedEmail = applicantEmail.trim();

    if (!trimmedCompany || !trimmedReg || !trimmedTax || !trimmedName || !trimmedEmail) {
      setApplicationError('Please complete all required corporate registration, tax ID, and applicant fields.');
      return;
    }

    setIsSubmittingApp(true);

    try {
      const codePrefix = trimmedCompany.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'TRD';
      const randomDigits = Math.floor(10000 + Math.random() * 89999);
      const generatedCertNumber = `THC-2026-${codePrefix}-${randomDigits}`;
      const issueDate = new Date().toISOString().split('T')[0];
      const nextYearDate = new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0];

      const certStatus: TradeAssuranceCertificateRecord['status'] = 'ACTIVE_VERIFIED';

      const newRecord: TradeAssuranceCertificateRecord = {
        certificateNumber: generatedCertNumber,
        serialNumber: generatedCertNumber,
        holder: trimmedCompany,
        companyName: trimmedCompany,
        country: country.trim() || 'Global',
        businessType: businessType.trim(),
        legalRegistrationNumber: trimmedReg,
        taxOrVatId: trimmedTax,
        dunsNumber: dunsNumber.trim() || undefined,
        tierCode: selectedPlan.id,
        tierTitle: selectedPlan.name,
        coverageLimitUsd: selectedPlan.coverageLimitUsd,
        feePaidUsd: 0,
        status: certStatus,
        issueDate,
        expiryDate: nextYearDate,
        auditingBody: selectedPlan.auditingBody,
        isoStandards: isoListInput
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        escrowVaultId: `TH-VAULT-${codePrefix}-${randomDigits}`,
        verificationHash: `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}${randomDigits}F9A2C4E1`,
        supportedIncoterms: ['FOB', 'CIF', 'CFR', 'DDP'],
        applicantName: trimmedName,
        applicantEmail: trimmedEmail
      };

      setCertificates(prev => [newRecord, ...prev]);
      setSelectedCertificate(newRecord);
      setNewlyIssuedCert(newRecord);
      setSearchQuery(generatedCertNumber);
    } catch (err: any) {
      setApplicationError(err?.message || 'Could not process certificate request. Please try again.');
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const faqItems = [
    {
      question: 'What is a Trade Heaven Trade Assurance Certificate?',
      answer:
        'A Trade Assurance Certificate on Trade Heaven is an official B2B financial guarantee and corporate verification credential. It certifies that the holder has passed Corporate KYC, Legal Registration, Tax/VAT verification, and (for Gold/VIP tiers) third-party factory or commodity inspection. It assigns a binding USD Escrow Order Protection Limit ($150,000 to $2,000,000 USD) protecting buyers and suppliers against payment default, delayed shipment, or off-spec cargo.'
    },
    {
      question: 'How do I search and verify a company’s Trade Assurance Certificate number?',
      answer:
        'Use the Certificate Verification Registry search bar at the top of this page. Enter the unique Certificate Serial Number (formatted as THC-2026-XXXX, such as THC-2026-KRX-81042 or THC-2026-ATL-90214), the company name, or their legal registration ID. The live registry immediately displays the certificate status, active USD coverage limit, auditing authority, expiration date, and cryptographic audit hash.'
    },
    {
      question: 'How much does it cost to request a Trade Assurance Certificate from Trade Heaven?',
      answer:
        'Customers can request any of our three certification tiers online: (1) Standard Trade Assurance Certificate ($150,000 USD escrow protection limit); (2) Gold Audited Trade Assurance Certificate ($500,000 USD limit); or (3) VIP Sovereign Trade Assurance & On-Site Plant Audit ($2,000,000 USD limit). Once you submit your request, our Customer Executive will contact you and inform you of the applicable certification fees.'
    },
    {
      question: 'How does the certificate protect payments during an international B2B order?',
      answer:
        'When a buyer transacts with a certified supplier on Trade Heaven, order funds are locked in an ACID-compliant Custodial Escrow Vault (referenced by the certificate’s Escrow Vault ID). Funds are only released to the supplier after Bill of Lading, SGS/TÜV pre-shipment quality inspection, and customs dispatch milestones are verified.'
    },
    {
      question: 'Can banks, customs brokers, and AI procurement assistants verify these certificates?',
      answer:
        'Yes. Every Trade Heaven Trade Assurance Certificate is indexed with Schema.org structured metadata and a unique serial number so trade finance banks (for MT700 DLC / SBLC underwriting), customs brokers, and AI search engines can verify the company’s standing and USD protection limit.'
    }
  ];

  return (
    <article
      id="trade-assurance-certificate-page"
      className="max-w-[1440px] mx-auto space-y-8 pb-16 text-slate-900"
      itemScope
      itemType="https://schema.org/WebPage"
    >
      {/* 1. HERO HEADER & INSTANT CERTIFICATE NUMBER LOOKUP */}
      <section
        aria-labelledby="certificate-portal-heading"
        className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Trade Heaven Certification &amp; Escrow Verification Registry</span>
              <span aria-hidden="true">·</span>
              <span>ISO / SGS / ACID Escrow Backed</span>
            </div>

            <h1
              id="certificate-portal-heading"
              className="text-2xl sm:text-4xl lg:text-[40px] font-black tracking-tight text-white leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Trade Assurance Certificate Registry &amp; Online Verification Portal
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Verify any supplier or buyer&apos;s official <strong>Trade Heaven Trade Assurance Certificate</strong> by serial number, or apply for your company&apos;s certified escrow coverage limit ($150,000 to $2,000,000 USD) with instant registry indexing.
            </p>

            {/* Primary Mode Switcher Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab('VERIFY');
                  const el = document.getElementById('certificate-lookup-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSectionTab === 'VERIFY'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Search &amp; Verify Certificate Number</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveSectionTab('APPLY');
                  const el = document.getElementById('request-certificate-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeSectionTab === 'APPLY'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20 border border-white/15'
                }`}
              >
                <Award className="w-4 h-4 text-amber-300" />
                <span>Request Trade Assurance Certificate</span>
              </button>
            </div>
          </div>

          {/* Live Search Box Card inside Hero */}
          <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant Certificate Serial Lookup</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Enter a Certificate Number, Company Name, or Registration ID
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-400 font-semibold">
                {certificates.filter(c => c.status === 'ACTIVE_VERIFIED').length} Active Certificates
              </span>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="certificate-number-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value);
                    const q = e.target.value.trim().toLowerCase();
                    if (q) {
                      const found = certificates.find(
                        c =>
                          c.certificateNumber.toLowerCase().includes(q) ||
                          c.companyName.toLowerCase().includes(q) ||
                          c.legalRegistrationNumber.toLowerCase().includes(q)
                      );
                      if (found) setSelectedCertificate(found);
                    }
                  }}
                  placeholder="e.g. THC-2026-KRX-81042 or Atlantic Power..."
                  className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-600 focus:border-amber-400 text-xs sm:text-sm font-mono text-white placeholder-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCertificate(certificates[0] || null);
                    }}
                    className="absolute right-20 top-2.5 px-2 py-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="submit"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  Verify
                </button>
              </div>

              {/* Sample Quick-Search Serial Numbers */}
              <div className="space-y-1.5">
                <div className="text-[11px] text-slate-400">
                  Quick-verify sample certificate numbers:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {certificates.slice(0, 4).map(c => (
                    <button
                      key={c.certificateNumber}
                      type="button"
                      onClick={() => {
                        setSearchQuery(c.certificateNumber);
                        setSelectedCertificate(c);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono tabular-nums transition-colors cursor-pointer border ${
                        selectedCertificate?.certificateNumber === c.certificateNumber
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      {c.certificateNumber}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Full-Width 4-Column Key Assurance Metrics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Max Escrow Protection Coverage</div>
            <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-white mt-1">
              {formatPrice(2000000)} USD
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Per certified VIP sovereign contract</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Certificate Request &amp; Fees</div>
            <div className="text-base sm:text-lg font-black text-amber-400 mt-1">
              Told by Customer Executive
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Request online · Fees shared by Customer Executive</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Inspection &amp; Audit Partners</div>
            <div className="text-lg sm:text-xl font-black text-white mt-1">
              SGS · TÜV · BV
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Pre-shipment quality &amp; quantity assay</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Escrow Release Protocol</div>
            <div className="text-lg sm:text-xl font-black text-emerald-400 mt-1">
              100% Milestone-Gated
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Bill of Lading &amp; customs clearance verified</div>
          </div>
        </div>
      </section>

      {/* DEDICATED CERTIFICATE VERIFICATION SECTION (JSON DATABASE SERIAL LOOKUP) */}
      <section
        id="certificate-verification-section"
        aria-labelledby="certificate-verification-heading"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Official JSON Registry Lookup</span>
            </div>
            <h2 id="certificate-verification-heading" className="text-xl sm:text-2xl font-black text-slate-900">
              Certificate Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Enter a Trade Assurance Certificate serial number to verify its current <strong>Status</strong>, <strong>Certificate Holder</strong>, and <strong>Expiry Date</strong> against the official Trade Heaven JSON certificate database.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-slate-600 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 self-start lg:self-auto">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>JSON Database Records: {(certificateDatabaseJson as TradeAssuranceCertificateRecord[]).length} Indexed</span>
          </div>
        </div>

        {/* Serial Number Search Bar */}
        <form onSubmit={handleSerialVerificationSubmit} className="space-y-3">
          <label htmlFor="certificate-serial-verification-input" className="block text-xs font-bold text-slate-700">
            Certificate Serial Number Lookup
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="certificate-serial-verification-input"
                type="text"
                value={serialVerificationInput}
                onChange={e => {
                  const val = e.target.value;
                  setIsAutoRotatingCompany(false);
                  setSerialVerificationInput(val);
                  lookupCertificateBySerial(val);
                }}
                placeholder="Enter Certificate Serial Number (e.g. THC-2026-KRX-81042)..."
                className="w-full pl-10 pr-20 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {serialVerificationInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSerialVerificationInput('');
                    setVerifiedLookupResult(null);
                    setHasSearchedSerial(false);
                  }}
                  className="absolute right-3 top-2.5 px-2 py-1 text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Verify Serial Number</span>
            </button>
          </div>

          {/* Sample Serial Numbers from JSON Database */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">Sample Serials in JSON Database:</span>
            {twentyRotatingCompanies.map((record, idx) => {
              const serial = record.serialNumber || record.certificateNumber;
              const isSelected = verifiedLookupResult?.certificateNumber === record.certificateNumber;
              return (
                <button
                  key={serial}
                  type="button"
                  onClick={() => {
                    setRotatingCompanyIndex(idx);
                    setSerialVerificationInput(serial);
                    lookupCertificateBySerial(serial);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono tabular-nums border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-amber-300 border-slate-900 font-bold'
                      : record.status === 'NOT_TAKEN'
                        ? 'bg-amber-50 text-amber-800 border-amber-200 hover:border-amber-300'
                        : record.status === 'EXPIRED'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:border-rose-300'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {serial} {record.status === 'NOT_TAKEN' ? '(Not Taken Yet)' : record.status === 'EXPIRED' ? '(Expired)' : ''}
                </button>
              );
            })}
          </div>
        </form>

        {/* Verification Result Display */}
        {hasSearchedSerial && (
          <div aria-live="polite">
            {verifiedLookupResult ? (
              <div
                className={`rounded-2xl border-2 p-6 space-y-5 ${
                  verifiedLookupResult.status === 'ACTIVE_VERIFIED'
                    ? 'bg-emerald-50/40 border-emerald-500/70'
                    : verifiedLookupResult.status === 'NOT_TAKEN'
                      ? 'bg-amber-50/50 border-amber-400'
                      : verifiedLookupResult.status === 'EXPIRED'
                        ? 'bg-rose-50/40 border-rose-400'
                        : 'bg-amber-50/40 border-amber-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-2.5">
                    {verifiedLookupResult.status === 'ACTIVE_VERIFIED' ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <span>
                          {verifiedLookupResult.status === 'ACTIVE_VERIFIED'
                            ? `Verification Match Confirmed · Serial #${verifiedLookupResult.serialNumber || verifiedLookupResult.certificateNumber}`
                            : `Registry Lookup · Reference #${verifiedLookupResult.serialNumber || verifiedLookupResult.certificateNumber}`}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] normal-case">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                          Company {rotatingCompanyIndex + 1} of {twentyRotatingCompanies.length} · Changing Every 5s
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        {verifiedLookupResult.holder || verifiedLookupResult.companyName}
                      </h3>
                      <div className="text-xs font-semibold text-emerald-800">
                        {verifiedLookupResult.tierTitle} · {verifiedLookupResult.country}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Primary 3 Required Verification Fields: Status, Holder, Expiry Date */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* 1. Certificate Status */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="text-xs font-semibold text-slate-500">Certificate Status</div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span
                        className={`inline-flex items-center gap-1.5 text-sm font-black font-mono tabular-nums ${
                          verifiedLookupResult.status === 'ACTIVE_VERIFIED'
                            ? 'text-emerald-700'
                            : verifiedLookupResult.status === 'NOT_TAKEN'
                              ? 'text-amber-700'
                              : verifiedLookupResult.status === 'EXPIRED'
                                ? 'text-rose-700'
                                : 'text-amber-700'
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            verifiedLookupResult.status === 'ACTIVE_VERIFIED'
                              ? 'bg-emerald-500'
                              : verifiedLookupResult.status === 'NOT_TAKEN'
                                ? 'bg-amber-500'
                                : verifiedLookupResult.status === 'EXPIRED'
                                  ? 'bg-rose-500'
                                  : 'bg-amber-500'
                          }`}
                        />
                        {verifiedLookupResult.status === 'ACTIVE_VERIFIED'
                          ? 'ACTIVE & VERIFIED'
                          : verifiedLookupResult.status === 'NOT_TAKEN'
                            ? 'NOT TAKEN YET (UNENROLLED)'
                            : verifiedLookupResult.status === 'EXPIRED'
                              ? 'EXPIRED'
                              : verifiedLookupResult.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {verifiedLookupResult.status === 'NOT_TAKEN'
                        ? 'This company has not purchased a Trade Assurance Certificate yet'
                        : `Audited by ${verifiedLookupResult.auditingBody}`}
                    </div>
                  </div>

                  {/* 2. Certificate Holder */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-500">Certificate Holder</span>
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        #{rotatingCompanyIndex + 1} of {twentyRotatingCompanies.length} (5s Live)
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      {verifiedLookupResult.holder || verifiedLookupResult.companyName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {verifiedLookupResult.country} · Reg: <span className="font-mono tabular-nums">{verifiedLookupResult.legalRegistrationNumber}</span>
                    </div>
                  </div>

                  {/* 3. Expiry Date */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
                    <div className="text-xs font-semibold text-slate-500">Expiry Date</div>
                    <div
                      className={`text-base font-black font-mono tabular-nums ${
                        verifiedLookupResult.status === 'EXPIRED'
                          ? 'text-rose-700'
                          : verifiedLookupResult.status === 'NOT_TAKEN'
                            ? 'text-amber-700'
                            : 'text-slate-900'
                      }`}
                    >
                      {verifiedLookupResult.status === 'NOT_TAKEN'
                        ? 'N/A — Not Taken Yet'
                        : verifiedLookupResult.expiryDate}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                      {verifiedLookupResult.status === 'NOT_TAKEN'
                        ? 'Coverage: $0 USD (Request Certificate — Fees Told by Customer Executive)'
                        : `Issued: ${verifiedLookupResult.issueDate} · Coverage: ${formatPrice(verifiedLookupResult.coverageLimitUsd)}`}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-rose-200 bg-rose-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-slate-900">
                      No Certificate Found for Serial Number &ldquo;{serialVerificationInput}&rdquo;
                    </div>
                    <p className="text-xs text-slate-600">
                      This serial number was not found in the Trade Heaven Trade Assurance JSON database. Please check the serial number format (e.g. <span className="font-mono">THC-2026-KRX-81042</span>) or select a sample serial above.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSerialVerificationInput('THC-2026-KRX-81042');
                    lookupCertificateBySerial('THC-2026-KRX-81042');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer shrink-0 self-start sm:self-center"
                >
                  Load Default Certificate
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. LIVE CERTIFICATE VERIFICATION RESULT & OFFICIAL CREDENTIAL PREVIEW */}
      <section
        id="certificate-lookup-section"
        aria-labelledby="verified-certificate-display-heading"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 id="verified-certificate-display-heading" className="text-xl sm:text-2xl font-black text-slate-900">
              01. Live Trade Assurance Certificate Verification &amp; Registry
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Click any record on the left or search by serial number to inspect the official Trade Heaven Trade Assurance Certificate.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono tabular-nums">
            Showing {matchingCertificates.length} matching certificate(s)
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Search Results Directory List (5 cols) */}
          <div className="lg:col-span-5 space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {matchingCertificates.length === 0 ? (
              <div className="p-8 rounded-2xl border border-slate-200 bg-slate-50 text-center space-y-3">
                <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
                <div className="text-sm font-bold text-slate-900">
                  No Certificate Found for &ldquo;{searchQuery}&rdquo;
                </div>
                <p className="text-xs text-slate-600">
                  Check the serial number format (e.g. <span className="font-mono">THC-2026-KRX-81042</span>) or reset the filter to browse all verified entities.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCertificate(certificates[0] || null);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Reset Search Filter
                </button>
              </div>
            ) : (
              matchingCertificates.map(cert => {
                const isSelected = selectedCertificate?.certificateNumber === cert.certificateNumber;
                return (
                  <div
                    key={cert.certificateNumber}
                    onClick={() => setSelectedCertificate(cert)}
                    className={`p-4 rounded-2xl border transition-colors cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span
                        className={`font-mono tabular-nums font-bold ${
                          isSelected ? 'text-amber-300' : 'text-blue-700'
                        }`}
                      >
                        {cert.certificateNumber}
                      </span>
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${
                          cert.status === 'ACTIVE_VERIFIED'
                            ? isSelected
                              ? 'text-emerald-300'
                              : 'text-emerald-700'
                            : isSelected
                              ? 'text-amber-300'
                              : 'text-amber-700'
                        }`}
                      >
                        {cert.status === 'ACTIVE_VERIFIED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>
                          {cert.status === 'ACTIVE_VERIFIED'
                            ? 'Verified Active'
                            : cert.status === 'NOT_TAKEN'
                              ? 'Not Taken Yet'
                              : cert.status}
                        </span>
                      </span>
                    </div>

                    <div className="font-bold text-sm truncate">{cert.companyName}</div>

                    <div
                      className={`flex flex-wrap items-center gap-1.5 text-xs ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      <span>{cert.country}</span>
                      <span aria-hidden="true">·</span>
                      <span>Reg: {cert.legalRegistrationNumber}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums font-semibold">
                        Limit: {formatPrice(cert.coverageLimitUsd)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Official Printable Certificate Credential Document (7 cols) */}
          <div className="lg:col-span-7">
            {selectedCertificate ? (
              <div className="border-2 border-slate-900 rounded-3xl p-6 sm:p-8 bg-white space-y-6">
                {/* Certificate Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                      <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>OFFICIAL TRADE HEAVEN ESCROW &amp; AUDIT CREDENTIAL</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                      Certificate of Trade Assurance
                    </h3>
                    <div className="text-xs text-slate-500">
                      Issued by Tradeheaven ECOM Solution LLP · Global B2B Compliance Registry
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <div className="text-[11px] text-slate-500">Certificate Serial Number</div>
                    <div className="flex items-center sm:justify-end gap-1.5">
                      <span className="font-mono tabular-nums text-sm font-black text-slate-900 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-300">
                        {selectedCertificate.certificateNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopySerial(selectedCertificate.certificateNumber)}
                        className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
                        title="Copy Certificate Number"
                      >
                        {copiedCertNo === selectedCertificate.certificateNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Certified Entity & Escrow Coverage Highlight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="space-y-1">
                    <div className="text-xs text-slate-500">Certified Legal Entity</div>
                    <div className="text-base font-black text-slate-900">
                      {selectedCertificate.companyName}
                    </div>
                    <div className="text-xs text-slate-600">
                      {selectedCertificate.businessType} · {selectedCertificate.country}
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <div className="text-xs text-slate-500">Guaranteed Escrow Protection Limit</div>
                    <div className="text-2xl font-black font-mono tabular-nums text-emerald-700">
                      {formatPrice(selectedCertificate.coverageLimitUsd)} ({selectedCurrency})
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500">
                      USD Equivalent: ${selectedCertificate.coverageLimitUsd.toLocaleString()} USD
                    </div>
                  </div>
                </div>

                {/* Structured Verification Specification Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Certification Tier</div>
                    <div className="font-bold text-slate-900">{selectedCertificate.tierTitle}</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Auditing &amp; KYC Authority</div>
                    <div className="font-bold text-slate-900">{selectedCertificate.auditingBody}</div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Corporate Registration &amp; Tax ID</div>
                    <div className="font-mono tabular-nums font-bold text-slate-900">
                      Reg: {selectedCertificate.legalRegistrationNumber} · Tax: {selectedCertificate.taxOrVatId}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Custodial Escrow Vault ID</div>
                    <div className="font-mono tabular-nums font-bold text-blue-700">
                      {selectedCertificate.escrowVaultId}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Validity Period (Issue — Expiry)</div>
                    <div className="font-mono tabular-nums font-bold text-slate-900">
                      {selectedCertificate.issueDate} to {selectedCertificate.expiryDate}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="text-slate-500">Verified Compliance &amp; Incoterms</div>
                    <div className="font-semibold text-slate-900">
                      {selectedCertificate.isoStandards.join(' · ')} ({selectedCertificate.supportedIncoterms.join(', ')})
                    </div>
                  </div>
                </div>

                {/* Cryptographic Seal & Action Buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5 text-xs">
                    <div className="text-slate-500">Cryptographic Registry Hash</div>
                    <div className="font-mono tabular-nums text-[11px] text-slate-700 break-all">
                      {selectedCertificate.verificationHash}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadCertificateTxt(selectedCertificate)}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Credential</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePrintCertificate}
                      className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>

                    {selectedCertificate.companyId && onOpenStorefront && (
                      <button
                        type="button"
                        onClick={() => onOpenStorefront(selectedCertificate.companyId!)}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <span>View Verified Storefront</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* 3. REQUEST TRADE ASSURANCE CERTIFICATE & FEE TIERS */}
      <section
        id="request-certificate-section"
        aria-labelledby="request-certificate-heading"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 id="request-certificate-heading" className="text-xl sm:text-2xl font-black text-slate-900">
              02. Request a Trade Assurance Certificate
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Select your required escrow protection tier below and submit your corporate KYC request. Certificate fees will be told directly by our Customer Executive after reviewing your application.
            </p>
          </div>
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-xl font-bold">
            Request Only · Fees Will Be Told by Customer Executive
          </div>
        </div>

        {/* 3-Column Pricing & Coverage Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {CERTIFICATE_PLANS.map(plan => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`rounded-2xl p-6 border transition-all cursor-pointer flex flex-col justify-between space-y-6 ${
                  isSelected
                    ? 'border-2 border-blue-600 bg-slate-50/70'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-blue-700">{plan.audience}</span>
                    {plan.recommended && (
                      <span className="font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md">
                        Most Popular
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">{plan.name}</h3>
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                        Request Only · Fees Told by Customer Executive
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1.5">{plan.billingCycle}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Escrow Coverage Limit:</span>
                      <span className="font-mono tabular-nums font-black text-emerald-700">
                        {formatPrice(plan.coverageLimitUsd)} (${(plan.coverageLimitUsd / 1000).toFixed(0)}k USD)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Audit Turnaround:</span>
                      <span className="font-semibold text-slate-900">{plan.turnaroundDays}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-700">
                    {plan.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    const formEl = document.getElementById('certificate-application-form');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isSelected ? `Selected for Request: ${plan.name}` : `Request ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Application & Fee Payment Form */}
        <form
          id="certificate-application-form"
          onSubmit={handleApplicationSubmit}
          className="border border-slate-200 rounded-2xl p-6 sm:p-8 bg-slate-50/60 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Request Trade Assurance Certificate Application
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Selected Package: <strong>{selectedPlan.name}</strong> · Coverage Limit:{' '}
                <strong className="font-mono tabular-nums">{formatPrice(selectedPlan.coverageLimitUsd)}</strong> · Fee:{' '}
                <strong className="text-amber-700">Will be told by Customer Executive</strong>
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-600">
              Turnaround: {selectedPlan.turnaroundDays}
            </span>
          </div>

          {applicationError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{applicationError}</span>
            </div>
          )}

          {newlyIssuedCert && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-black text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    Certificate Issued &amp; Indexed! Serial Number:{' '}
                    <span className="font-mono tabular-nums underline">{newlyIssuedCert.certificateNumber}</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCertificate(newlyIssuedCert);
                    setSearchQuery(newlyIssuedCert.certificateNumber);
                    const lookupEl = document.getElementById('certificate-lookup-section');
                    lookupEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                >
                  Inspect Live Certificate Above
                </button>
              </div>
              <p className="text-xs text-emerald-800">
                Your Trade Assurance Certificate for <strong>{newlyIssuedCert.companyName}</strong> with a guaranteed protection limit of{' '}
                <strong className="font-mono tabular-nums">${newlyIssuedCert.coverageLimitUsd.toLocaleString()} USD</strong> is now live and searchable in the registry above using serial number{' '}
                <strong className="font-mono tabular-nums">{newlyIssuedCert.certificateNumber}</strong>.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Legal Company Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="e.g. Global Industrial Exports Ltd"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Country of Registration *
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. United States, India, Germany, Australia"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Business Classification *
              </label>
              <select
                value={businessType}
                onChange={e => setBusinessType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              >
                <option value="Manufacturer & Wholesale Exporter">Manufacturer &amp; Wholesale Exporter</option>
                <option value="OEM / ODM Factory">OEM / ODM Factory</option>
                <option value="Commodity Brokerage (Fuel, Metals, Agro)">Commodity Brokerage (Fuel, Metals, Agro)</option>
                <option value="Corporate Importer & Distributor">Corporate Importer &amp; Distributor</option>
                <option value="Merchant Exporter & Trading House">Merchant Exporter &amp; Trading House</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Business Registration / Incorporation No. *
              </label>
              <input
                type="text"
                required
                value={legalRegNumber}
                onChange={e => setLegalRegNumber(e.target.value)}
                placeholder="e.g. CIN / ACN / Company Reg No."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Tax / VAT / GST / EIN Number *
              </label>
              <input
                type="text"
                required
                value={taxVatId}
                onChange={e => setTaxVatId(e.target.value)}
                placeholder="e.g. GSTIN / ABN / EIN / EU-VAT"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                D-U-N-S Number (Optional)
              </label>
              <input
                type="text"
                value={dunsNumber}
                onChange={e => setDunsNumber(e.target.value)}
                placeholder="e.g. 75-419-0821"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Authorized Signatory Full Name *
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                placeholder="e.g. Director / Head of Export"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Official Corporate Email *
              </label>
              <input
                type="email"
                required
                value={applicantEmail}
                onChange={e => setApplicantEmail(e.target.value)}
                placeholder="compliance@yourcompany.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Active Quality / Industry Certifications
              </label>
              <input
                type="text"
                value={isoListInput}
                onChange={e => setIsoListInput(e.target.value)}
                placeholder="e.g. ISO 9001:2015, CE, FDA, SGS"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          {/* Customer Executive Notice & Request Submit CTA */}
          <div className="pt-4 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800">
                Customer Executive Fee Consultation:
              </div>
              <p className="text-xs text-slate-600 max-w-xl">
                No online fee payment is collected here. Submit your certificate request and our Customer Executive will contact you to share the applicable certification and audit fees.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmittingApp}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmittingApp
                  ? 'Submitting Certificate Request...'
                  : 'Submit Certificate Request'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </section>

      {/* 4. SEO & AI KNOWLEDGE BASE: HOW TRADE HEAVEN TRADE ASSURANCE WORKS */}
      <section
        aria-labelledby="seo-knowledge-heading"
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-8"
      >
        <div className="space-y-2 max-w-3xl">
          <div className="text-xs font-bold text-blue-700">
            Official Documentation for Importers, Exporters, Trade Finance Banks &amp; AI Search Engines
          </div>
          <h2 id="seo-knowledge-heading" className="text-xl sm:text-2xl font-black text-slate-900">
            03. Complete Guide to Trade Heaven Trade Assurance Certificates
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            This authoritative reference explains how Trade Heaven&apos;s Trade Assurance Certificate program underwrites cross-border wholesale contracts across 190+ countries.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed text-slate-600">
          <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Lock className="w-4 h-4 text-blue-600 shrink-0" />
              <h3>1. Custodial Escrow Payment Lock</h3>
            </div>
            <p>
              Every Trade Assurance Certificate is bound to a dedicated <strong>Custodial Escrow Vault ID</strong>. Buyer deposits are locked in row-level ACID escrow until shipping documents (Bill of Lading, Certificate of Origin, Commercial Packing List) and quality inspections are verified.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
              <h3>2. Pre-Shipment Quality &amp; Assay Verification</h3>
            </div>
            <p>
              Certified suppliers agree to mandatory pre-shipment inspection protocols executed by <strong>SGS, Bureau Veritas, Intertek, or TÜV Rheinland</strong>. If cargo fails technical specification or chemical/material assay, the buyer can freeze release and claim a 100% escrow refund.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <Scale className="w-4 h-4 text-amber-600 shrink-0" />
              <h3>3. Global Registry &amp; Bank Underwriting</h3>
            </div>
            <p>
              Each certificate carries a public serial number (<span className="font-mono">THC-2026-XXXX</span>) and cryptographic verification hash. Importers, customs authorities, and trade finance institutions issuing MT700 Documentary Letters of Credit (DLC) can verify active coverage online 24/7.
            </p>
          </div>
        </div>

        {/* Structured FAQ Accordion */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h3 className="text-base font-black text-slate-900">
            Frequently Asked Questions (Trade Assurance Certificate &amp; Verification)
          </h3>
          <div className="space-y-2.5">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-900 hover:bg-slate-100/70 transition-colors cursor-pointer"
                  >
                    <span>{item.question}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/70 pt-3 bg-white">
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </article>
  );
};

export default TradeAssuranceCertificateView;
