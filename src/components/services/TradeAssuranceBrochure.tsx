import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Download,
  ShieldCheck,
  Lock,
  Building2,
  CheckCircle2,
  FileText,
  Award,
  Loader2,
  Check,
  BookOpen,
  Scale,
  TrendingUp
} from 'lucide-react';
import { Currency } from '../../types';
import type { TradeAssuranceCertificateRecord } from './TradeAssuranceCertificateView';

export interface TradeAssuranceBrochureProps {
  selectedCertificate?: TradeAssuranceCertificateRecord | null;
  certificates?: TradeAssuranceCertificateRecord[];
  selectedCurrency?: Currency;
  formattedCoverageLimit?: string;
  /** Render mode: 'button' renders a standalone Download PDF button; 'full' renders the Features & Client Benefits showcase + Download PDF button */
  mode?: 'button' | 'full';
  /** Custom button label */
  buttonLabel?: string;
  /** Button visual variant */
  buttonVariant?: 'primary' | 'emerald' | 'amber' | 'outline';
  /** Optional additional className */
  className?: string;
}

const CORE_PLATFORM_FEATURES_AND_BENEFITS = [
  {
    feature: 'ACID Custodial Escrow Payment Protection',
    howItWorks:
      'Order funds are held in a segregated Custodial Escrow Vault until shipping, quality, and customs milestones are verified.',
    buyerBenefit:
      '100% capital safety — money is never released before cargo inspection and valid Bill of Lading.',
    supplierBenefit:
      'Eliminates buyer payment default — verified funds are locked in escrow before production begins.'
  },
  {
    feature: 'Full Assurance of Trade Heaven (Stuck-Payment Coverage)',
    howItWorks:
      'Dedicated Trade Heaven clearing desk intervenes if an international wire or settlement gets stuck or delayed.',
    buyerBenefit:
      'Losses from stuck payments or settlement mishaps are actively tried to be covered with Trade Heaven help.',
    supplierBenefit:
      'Guaranteed liquidity protection and priority bank mediation — Full Assurance is of Trade Heaven.'
  },
  {
    feature: 'Verified Global Supplier & Buyer Network',
    howItWorks:
      'Every member undergoes Corporate Registration, Tax/VAT/GST, DUNS, and beneficial ownership KYC screening.',
    buyerBenefit:
      'Source with confidence from genuine, pre-vetted manufacturers and exporters across 190+ countries.',
    supplierBenefit:
      'Receive high-intent RFQs from verified institutional importers and global procurement teams.'
  },
  {
    feature: 'Third-Party Factory & Pre-Shipment Inspection',
    howItWorks:
      'Integrated plant audits and batch sampling conducted with SGS, TÜV Rheinland, and Bureau Veritas.',
    buyerBenefit:
      'Prevents off-spec, defective, or short-shipped cargo before containers leave the port of origin.',
    supplierBenefit:
      'Proves manufacturing capacity and ISO quality compliance to win large-volume B2B contracts.'
  },
  {
    feature: 'Multi-Rail Global B2B Trade Settlement',
    howItWorks:
      'Supports SWIFT T/T Wire Escrow, Irrevocable Letters of Credit (MT700 DLC / SBLC), and multi-currency clearing.',
    buyerBenefit:
      'Flexible payment terms aligned with corporate treasury rules and Incoterms 2020 (FOB, CIF, DDP).',
    supplierBenefit:
      'Faster cross-border settlement with bank-grade documentation and zero chargeback exposure.'
  },
  {
    feature: 'End-to-End Logistics, Customs & Incoterms Support',
    howItWorks:
      '3-way matching of Proforma Invoice, Packing List, Certificate of Origin, and Export Customs Manifest.',
    buyerBenefit:
      'Predictable transit timelines, transparent freight tracking, and smooth destination customs clearance.',
    supplierBenefit:
      'Streamlined export documentation and automated milestone sign-off upon vessel loading.'
  }
];

const ESCROW_SECURITY_FEATURES_DATA = [
  {
    code: 'ESC-01',
    feature: 'Segregated Custodial Escrow Lock',
    mechanism:
      'Buyer order funds are locked in a dedicated custodial escrow account prior to manufacturing or cargo dispatch.',
    clientBenefit:
      'Protects 100% of buyer principal while giving suppliers verified proof of funds before production.'
  },
  {
    code: 'ESC-02',
    feature: 'Milestone-Gated Settlement Release',
    mechanism:
      'Escrow funds are disbursed only after verified Bill of Lading (B/L), commercial invoice, and pre-shipment quality approval.',
    clientBenefit:
      'Eliminates premature wire risk for buyers and guarantees prompt, automatic payout for suppliers once shipped.'
  },
  {
    code: 'ESC-03',
    feature: 'Multi-Rail B2B Treasury Support',
    mechanism:
      'Supports SWIFT Wire Escrow, Irrevocable Letter of Credit (MT700 DLC / SBLC), and multi-currency B2B clearing.',
    clientBenefit:
      'Allows clients in 190+ countries to transact seamlessly in their preferred trade finance format.'
  },
  {
    code: 'ESC-04',
    feature: 'Stuck-Payment & Mishap Loss Coverage',
    mechanism:
      'In case of any mishap like a payment stuck in clearing where Supplier or Buyer has Trade Assurance, losses are tried to be covered with the help of Trade Heaven.',
    clientBenefit:
      'Full Assurance is of Trade Heaven — clients are protected against intermediary bank holds and settlement disruptions.'
  }
];

const FACTORY_AUDIT_VERIFICATION_DATA = [
  {
    code: 'AUD-01',
    stage: 'On-Site Factory & Production Line Audit',
    authority: 'SGS / TÜV Rheinland / Bureau Veritas',
    scope:
      'Physical verification of plant machinery, production capacity, raw material warehousing, and ISO quality systems.',
    clientBenefit:
      'Clients avoid middlemen Fraud and partner only with verified, capable factories.'
  },
  {
    code: 'AUD-02',
    stage: 'Corporate Legal & Tax/VAT/GST KYC',
    authority: 'Trade Heaven Compliance Desk',
    scope:
      'Validation of Certificate of Incorporation, national Tax/VAT/GST registration, and authorized corporate signatories.',
    clientBenefit:
      'Ensures every B2B contract is signed with a legally registered, accountable corporate entity.'
  },
  {
    code: 'AUD-03',
    stage: 'Pre-Shipment Quality & Quantity Assay',
    authority: 'Accredited Third-Party Inspectors',
    scope:
      'Random batch sampling (AQL 1.5/2.5), lab specification testing, and container loading supervision at port.',
    clientBenefit:
      'Clients receive exact product specifications and quantities ordered — zero costly surprises upon arrival.'
  },
  {
    code: 'AUD-04',
    stage: 'International Regulatory & Safety Compliance',
    authority: 'ISO / CE / FDA / RoHS Certifiers',
    scope:
      'Verification of export compliance certificates, safety declarations, and destination customs admissibility.',
    clientBenefit:
      'Prevents customs seizures, import fines, and regulatory delays at destination ports.'
  }
];

const CLIENT_PROTECTION_GUARANTEES_DATA = [
  {
    code: 'BPG-01',
    guarantee: 'Up to $2,000,000 USD Order Protection',
    scope:
      'Covers non-shipment, counterparty default, or breach of contracted Proforma Invoice terms across Standard ($150k), Gold ($500k), and VIP ($2M) tiers.',
    clientBenefit:
      'Gives both buyers and suppliers institutional-grade financial security on high-value global orders.'
  },
  {
    code: 'BPG-02',
    guarantee: '100% Product Quality & Spec Guarantee',
    scope:
      'Triggered if inspected or delivered cargo deviates from contracted chemical, mechanical, or dimensional specifications.',
    clientBenefit:
      'Immediate escrow freeze, replacement dispatch, or full refund protection for the client.'
  },
  {
    code: 'BPG-03',
    guarantee: 'On-Time Shipment & Incoterms Enforcement',
    scope:
      'Enforces agreed dispatch schedules and Incoterms 2020 (FOB, CIF, CFR, DDP, EXW) with verified shipping manifests.',
    clientBenefit:
      'Protects client supply chains against unexcused manufacturing or vessel loading delays.'
  },
  {
    code: 'BPG-04',
    guarantee: 'Full Assurance of Trade Heaven Mishap Coverage',
    scope:
      'If a payment is stuck or a settlement mishap occurs while Buyer or Supplier holds Trade Assurance, losses are actively tried to be covered with the help of Trade Heaven.',
    clientBenefit:
      'Complete peace of mind — Full Assurance is of Trade Heaven for both suppliers and buyers.'
  }
];

function triggerSafeBrochureDownload(doc: jsPDF, fileName: string) {
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch {
    doc.save(fileName);
  }
}

/**
 * Generates and downloads a clean, dedicated 2-page A4 PDF brochure containing ONLY
 * the Features of Trade Heaven and How It Benefits Clients (Buyers & Suppliers).
 */
export function generateMultiPageTradeAssuranceBrochurePDF(_options?: {
  selectedCertificate?: TradeAssuranceCertificateRecord | null;
  certificates?: TradeAssuranceCertificateRecord[];
  selectedCurrency?: Currency;
  formattedCoverageLimit?: string;
}): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPages = 2;

  const drawPageHeader = (pageNumber: number, subtitle: string) => {
    doc.setFillColor(15, 23, 42); // Slate-900
    doc.rect(0, 0, pageWidth, 24, 'F');
    doc.setFillColor(16, 185, 129); // Emerald-500 accent bar
    doc.rect(0, 24, pageWidth, 1.5, 'F');

    doc.setTextColor(251, 191, 36); // Amber-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      'TRADE HEAVEN  |  OFFICIAL CLIENT BENEFITS & PLATFORM FEATURES GUIDE',
      14,
      9.5
    );

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 17.5);

    doc.setTextColor(167, 243, 208);
    doc.setFontSize(8);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 14, 17.5, { align: 'right' });
  };

  const drawPageFooter = (pageNumber: number) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageHeight - 14, pageWidth, 14, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(
      'Tradeheaven ECOM Solution LLP  |  https://tradeheaven.org  |  Full Assurance of Trade Heaven',
      14,
      pageHeight - 8
    );
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(
      `Features of Trade Heaven & How It Benefits Clients (Buyers & Suppliers)   |   Page ${pageNumber}/${totalPages}`,
      14,
      pageHeight - 3.8
    );
  };

  // =========================================================================
  // PAGE 1: FEATURES OF TRADE HEAVEN & HOW IT BENEFITS CLIENTS
  // =========================================================================
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 46, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 46, pageWidth, 2, 'F');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'OFFICIAL B2B CLIENT GUIDE  •  FEATURES OF TRADE HEAVEN & CLIENT BENEFITS',
    14,
    12
  );

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text('Features of Trade Heaven & How It Benefits Clients', 14, 22);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.text(
    'How Trade Heaven empowers global Buyers, Importers, Suppliers, and Exporters with secure B2B trade.',
    14,
    29.5
  );

  doc.setFillColor(6, 78, 59);
  doc.roundedRect(14, 33.5, pageWidth - 28, 9.5, 2, 2, 'F');
  doc.setTextColor(167, 243, 208);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(
    'FULL ASSURANCE OF TRADE HEAVEN: In case of any stuck payment or mishap, losses are actively tried to be covered with Trade Heaven help.',
    18,
    39.5
  );

  let currentY = 54;

  // SECTION 1: CORE FEATURES OF TRADE HEAVEN & HOW THEY BENEFIT CLIENTS
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(14, currentY, pageWidth - 28, 8.5, 1.5, 1.5, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. CORE FEATURES OF TRADE HEAVEN & HOW THEY BENEFIT CLIENTS', 18, currentY + 5.8);

  currentY += 11;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    styles: {
      fontSize: 7.4,
      cellPadding: 2.6,
      textColor: [15, 23, 42],
      valign: 'middle',
      lineColor: [203, 213, 225],
      lineWidth: 0.2
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold', textColor: [15, 23, 42] },
      1: { cellWidth: 48 },
      2: { cellWidth: 48, textColor: [6, 95, 70] },
      3: { cellWidth: 48, textColor: [30, 64, 175] }
    },
    head: [
      [
        'Trade Heaven Feature',
        'How the Feature Works',
        'How It Benefits Buyers / Importers',
        'How It Benefits Suppliers / Exporters'
      ]
    ],
    body: CORE_PLATFORM_FEATURES_AND_BENEFITS.map(row => [
      row.feature,
      row.howItWorks,
      row.buyerBenefit,
      row.supplierBenefit
    ])
  });

  currentY = (doc as any).lastAutoTable.finalY + 7;

  // SECTION 2: ESCROW SECURITY FEATURES & CLIENT BENEFITS
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(14, currentY, pageWidth - 28, 8.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('2. ESCROW PAYMENT SECURITY FEATURES & CLIENT PROTECTION', 18, currentY + 5.8);

  currentY += 11;

  autoTable(doc, {
    startY: currentY,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [251, 191, 36],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    styles: {
      fontSize: 7.4,
      cellPadding: 2.6,
      textColor: [15, 23, 42],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', textColor: [5, 150, 105] },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 62 },
      3: { cellWidth: 62, fontStyle: 'bold' }
    },
    head: [['Code', 'Escrow Feature', 'Operational Mechanism', 'Direct Client Benefit']],
    body: ESCROW_SECURITY_FEATURES_DATA.map(row => [
      row.code,
      row.feature,
      row.mechanism,
      row.clientBenefit
    ])
  });

  drawPageFooter(1);

  // =========================================================================
  // PAGE 2: FACTORY AUDIT VERIFICATION & CLIENT PROTECTION GUARANTEES
  // =========================================================================
  doc.addPage();
  drawPageHeader(
    2,
    'Factory Audit Verification & Client Protection Guarantees'
  );

  let p2Y = 31;

  // SECTION 3: FACTORY AUDIT & QUALITY VERIFICATION BENEFITS
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(14, p2Y, pageWidth - 28, 8.5, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('3. FACTORY AUDIT & QUALITY VERIFICATION FEATURES', 18, p2Y + 5.8);

  p2Y += 11;

  autoTable(doc, {
    startY: p2Y,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: [15, 23, 42],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', textColor: [30, 64, 175] },
      1: { cellWidth: 38, fontStyle: 'bold' },
      2: { cellWidth: 34, fontStyle: 'bold' },
      3: { cellWidth: 48 },
      4: { cellWidth: 46, fontStyle: 'bold' }
    },
    head: [['Code', 'Verification Stage', 'Inspection Partner', 'Audit Scope', 'How It Benefits Clients']],
    body: FACTORY_AUDIT_VERIFICATION_DATA.map(row => [
      row.code,
      row.stage,
      row.authority,
      row.scope,
      row.clientBenefit
    ])
  });

  p2Y = (doc as any).lastAutoTable.finalY + 7;

  // SECTION 4: CLIENT PROTECTION GUARANTEES
  doc.setFillColor(6, 78, 59);
  doc.roundedRect(14, p2Y, pageWidth - 28, 8.5, 1.5, 1.5, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('4. BUYER & SUPPLIER PROTECTION GUARANTEES', 18, p2Y + 5.8);

  p2Y += 11;

  autoTable(doc, {
    startY: p2Y,
    margin: { left: 14, right: 14 },
    theme: 'striped',
    headStyles: {
      fillColor: [6, 78, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.8,
      textColor: [15, 23, 42],
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold', textColor: [5, 150, 105] },
      1: { cellWidth: 44, fontStyle: 'bold' },
      2: { cellWidth: 62 },
      3: { cellWidth: 60, fontStyle: 'bold' }
    },
    head: [['Code', 'Protection Guarantee', 'Coverage Scope', 'How It Benefits Clients']],
    body: CLIENT_PROTECTION_GUARANTEES_DATA.map(row => [
      row.code,
      row.guarantee,
      row.scope,
      row.clientBenefit
    ])
  });

  p2Y = (doc as any).lastAutoTable.finalY + 7;

  // SECTION 5: PROTECTION TIERS SUMMARY
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('5. TRADE HEAVEN PROTECTION TIERS FOR CLIENTS:', 14, p2Y);

  autoTable(doc, {
    startY: p2Y + 2.5,
    margin: { left: 14, right: 14 },
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [251, 191, 36],
      fontStyle: 'bold',
      fontSize: 7.5
    },
    styles: {
      fontSize: 7.3,
      cellPadding: 2.4,
      textColor: [30, 41, 59]
    },
    head: [
      [
        'Protection Tier',
        'Escrow Coverage Limit',
        'Verification & Audit Scope',
        'Key Client Benefit'
      ]
    ],
    body: [
      [
        'Standard Trade Assurance',
        '$150,000 USD',
        'Corporate KYC & Tax/VAT Verification',
        'Ideal for regular cross-border orders with full custodial escrow protection'
      ],
      [
        'Gold Audited Trade Assurance',
        '$500,000 USD',
        'SGS / TÜV Rheinland / Corporate Audit',
        'Priority escrow clearing, pre-shipment assay & stuck-payment protection'
      ],
      [
        'VIP Sovereign Trade Assurance',
        '$2,000,000 USD',
        'On-Site Plant Audit (SGS / BV / TÜV)',
        'Maximum institutional coverage for bulk commodities & industrial machinery'
      ]
    ]
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;
  if (finalY < pageHeight - 36) {
    doc.setFillColor(236, 253, 245);
    doc.setDrawColor(16, 185, 129);
    doc.roundedRect(14, finalY, pageWidth - 28, 20, 2, 2, 'FD');

    doc.setTextColor(6, 95, 70);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(
      'FULL ASSURANCE OF TRADE HEAVEN — MISHAP & STUCK PAYMENT LOSS COVERAGE GUARANTEE',
      18,
      finalY + 6.5
    );

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const guaranteeNote = doc.splitTextToSize(
      'In case of any mishap such as a payment stuck in intermediary clearing or settlement disruption where the Supplier or Buyer holds active Trade Assurance, losses are actively tried to be covered with the direct help of Trade Heaven, and Full Assurance is of Trade Heaven.',
      pageWidth - 36
    );
    doc.text(guaranteeNote, 18, finalY + 11.5);
  }

  drawPageFooter(2);

  const fileName = 'TradeHeaven-Features-and-Client-Benefits.pdf';
  triggerSafeBrochureDownload(doc, fileName);
  return fileName;
}

export const TradeAssuranceBrochure: React.FC<TradeAssuranceBrochureProps> = ({
  mode = 'full',
  buttonLabel = 'Download Features & Client Benefits PDF',
  buttonVariant = 'emerald',
  className = ''
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [activePillarTab, setActivePillarTab] = useState<'FEATURES' | 'ESCROW' | 'AUDIT' | 'BUYER'>('FEATURES');

  const handleDownloadBrochure = () => {
    if (isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      generateMultiPageTradeAssuranceBrochurePDF();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const buttonStyles: Record<NonNullable<TradeAssuranceBrochureProps['buttonVariant']>, string> = {
    emerald:
      'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500/40 shadow-sm',
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 shadow-sm',
    amber:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-300 shadow-sm',
    outline:
      'bg-white hover:bg-slate-50 text-slate-900 border border-slate-300'
  };

  if (mode === 'button') {
    return (
      <button
        type="button"
        onClick={handleDownloadBrochure}
        disabled={isGeneratingPdf}
        className={`px-4 py-2.5 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 ${buttonStyles[buttonVariant]} ${className}`}
        title="Download PDF of Features of Trade Heaven & How It Benefits Clients"
      >
        {isGeneratingPdf ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>Generating PDF...</span>
          </>
        ) : downloadSuccess ? (
          <>
            <Check className="w-4 h-4 shrink-0" />
            <span>PDF Downloaded!</span>
          </>
        ) : (
          <>
            <Download className="w-4 h-4 shrink-0" />
            <span>{buttonLabel}</span>
          </>
        )}
      </button>
    );
  }

  return (
    <section
      aria-labelledby="multi-page-brochure-heading"
      className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 lg:p-10 space-y-6 text-slate-900 ${className}`}
    >
      {/* Top Header & Download PDF CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-emerald-700">
            <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Official Client Benefits &amp; Features PDF Brochure</span>
          </div>
          <h2
            id="multi-page-brochure-heading"
            className="text-xl sm:text-2xl font-black text-slate-900"
          >
            Features of Trade Heaven &amp; How It Benefits Clients (PDF)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl">
            Download the clean, dedicated PDF brochure outlining the core features of Trade Heaven and how it benefits both <strong>Buyers/Importers</strong> and <strong>Suppliers/Exporters</strong> through Custodial Escrow Security, SGS/TÜV Factory Audits, and Full Assurance of Trade Heaven mishap coverage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleDownloadBrochure}
            disabled={isGeneratingPdf}
            className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-black inline-flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap ${buttonStyles[buttonVariant]}`}
          >
            {isGeneratingPdf ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Generating Features PDF...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 shrink-0" />
                <span>Features PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 shrink-0" />
                <span>Download Features &amp; Client Benefits PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive Feature & Client Benefit Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => setActivePillarTab('FEATURES')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activePillarTab === 'FEATURES'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Core Features &amp; Client Benefits</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillarTab('ESCROW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activePillarTab === 'ESCROW'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Escrow Security Benefits</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillarTab('AUDIT')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activePillarTab === 'AUDIT'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-blue-500" />
            <span>Factory Audit Benefits</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePillarTab('BUYER')}
            className={`px-4 py-2 rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              activePillarTab === 'BUYER'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-amber-500" />
            <span>Protection Guarantees</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>PDF contains only Trade Heaven features &amp; client benefits</span>
        </div>
      </div>

      {/* 3 Core Client Benefit Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div
          onClick={() => setActivePillarTab('ESCROW')}
          className={`p-5 rounded-2xl border transition-colors cursor-pointer space-y-3 ${
            activePillarTab === 'ESCROW'
              ? 'border-emerald-600 bg-emerald-50/30'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-emerald-700">100% Capital Security</span>
            <Lock className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Escrow Security Features</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Segregated custodial escrow locks buyer funds prior to production and releases settlement to suppliers immediately upon verified Bill of Lading and inspection clearance.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
            {ESCROW_SECURITY_FEATURES_DATA.slice(0, 3).map(item => (
              <li key={item.code} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{item.feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          onClick={() => setActivePillarTab('AUDIT')}
          className={`p-5 rounded-2xl border transition-colors cursor-pointer space-y-3 ${
            activePillarTab === 'AUDIT'
              ? 'border-blue-600 bg-blue-50/30'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-blue-700">Verified Counterparties</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Factory Audit Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            On-site plant and production line audits by <strong>SGS, TÜV Rheinland, and Bureau Veritas</strong>, Corporate Tax/VAT KYC, and AQL pre-shipment batch inspection.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
            {FACTORY_AUDIT_VERIFICATION_DATA.slice(0, 3).map(item => (
              <li key={item.code} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>{item.stage}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          onClick={() => setActivePillarTab('BUYER')}
          className={`p-5 rounded-2xl border transition-colors cursor-pointer space-y-3 ${
            activePillarTab === 'BUYER'
              ? 'border-amber-500 bg-amber-50/40'
              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-amber-800">Full Assurance of Trade Heaven</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-base font-black text-slate-900">Client Protection Guarantees</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Up to <strong>$2,000,000 USD</strong> order protection, 100% pre-shipment quality guarantee, and active stuck-payment loss recovery under Full Assurance of Trade Heaven.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
            {CLIENT_PROTECTION_GUARANTEES_DATA.slice(0, 3).map(item => (
              <li key={item.code} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{item.guarantee}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preview Table of Active Section */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden">
        {activePillarTab === 'FEATURES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-3 px-4 font-bold">Trade Heaven Feature</th>
                  <th className="py-3 px-4 font-bold">How It Works</th>
                  <th className="py-3 px-4 font-bold">Benefit for Buyers / Importers</th>
                  <th className="py-3 px-4 font-bold">Benefit for Suppliers / Exporters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {CORE_PLATFORM_FEATURES_AND_BENEFITS.map(row => (
                  <tr key={row.feature} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{row.feature}</td>
                    <td className="py-3 px-4 text-slate-600">{row.howItWorks}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{row.buyerBenefit}</td>
                    <td className="py-3 px-4 font-semibold text-blue-800">{row.supplierBenefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activePillarTab === 'ESCROW' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-3 px-4 font-bold">Code</th>
                  <th className="py-3 px-4 font-bold">Escrow Security Feature</th>
                  <th className="py-3 px-4 font-bold">Operational Mechanism</th>
                  <th className="py-3 px-4 font-bold">How It Benefits Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ESCROW_SECURITY_FEATURES_DATA.map(row => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700 whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.feature}</td>
                    <td className="py-3 px-4 text-slate-600">{row.mechanism}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.clientBenefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activePillarTab === 'AUDIT' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-3 px-4 font-bold">Code</th>
                  <th className="py-3 px-4 font-bold">Factory Audit Verification Stage</th>
                  <th className="py-3 px-4 font-bold">Auditing Authority</th>
                  <th className="py-3 px-4 font-bold">Audit Scope</th>
                  <th className="py-3 px-4 font-bold">How It Benefits Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {FACTORY_AUDIT_VERIFICATION_DATA.map(row => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700 whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.stage}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.authority}</td>
                    <td className="py-3 px-4 text-slate-600">{row.scope}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.clientBenefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activePillarTab === 'BUYER' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="py-3 px-4 font-bold">Code</th>
                  <th className="py-3 px-4 font-bold">Client Protection Guarantee</th>
                  <th className="py-3 px-4 font-bold">Coverage Scope</th>
                  <th className="py-3 px-4 font-bold">How It Benefits Clients</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {CLIENT_PROTECTION_GUARANTEES_DATA.map(row => (
                  <tr key={row.code} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-700 whitespace-nowrap">
                      {row.code}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{row.guarantee}</td>
                    <td className="py-3 px-4 text-slate-600">{row.scope}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.clientBenefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default TradeAssuranceBrochure;
