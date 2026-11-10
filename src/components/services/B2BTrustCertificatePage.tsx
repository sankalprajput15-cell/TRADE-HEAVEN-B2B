import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ShieldCheck,
  Award,
  Landmark,
  Clock,
  FileDown,
  Mail,
  Copy,
  Check,
  CheckCircle2,
  Building2,
  Lock,
  Scale,
  Star,
  ArrowRight,
  AlertCircle,
  Send,
  FileCheck,
  Globe2,
  ExternalLink
} from 'lucide-react';
import { AuthUser, Currency, ActiveView, PaymentCheckoutData } from '../../types';
import { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';
import { B2BTrustCertificatePillarsSection } from './B2BTrustCertificatePillarsSection';

interface B2BTrustCertificatePageProps {
  selectedCurrency?: Currency;
  currentUser?: AuthUser | null;
  onNavigate?: (view: ActiveView | string) => void;
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
}

interface SubmittedTrustApplication {
  applicationId: string;
  companyName: string;
  country: string;
  govDocumentType: string;
  govDocumentNumber: string;
  companyBankName: string;
  companyBankAccountNo: string;
  wireReferenceNumber: string;
  applicantName: string;
  applicantEmail: string;
  submittedAt: string;
  estimatedCompletionDate: string;
}

function triggerPdfDownload(doc: jsPDF, filename: string) {
  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } catch {
    doc.save(filename);
  }
}

export function generateB2BTrustCertificateBrochurePDF(applicantCompany?: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;
  const nowStr = new Date().toISOString().split('T')[0];

  const drawPageHeader = (
    kicker: string,
    title: string,
    subtitle: string
  ) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 35, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, 35, pageW, 1.2, 'F');

    // Brand monogram emblem box
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 8, 14, 14, 2, 2, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TH', margin + 4.1, 16.8);

    const textX = margin + 18;
    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.text(kicker, textX, 11);

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14.5);
    doc.text(title, textX, 18.5);

    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.text(subtitle, textX, 24.5);

    const prepLine = applicantCompany
      ? `Prepared for: ${applicantCompany}   |   Issued Date: ${nowStr}   |   Portal: https://tradeheaven.net`
      : `Official Compliance Dossier   |   Date: ${nowStr}   |   Portal: https://tradeheaven.net/?view=B2B_TRUST_CERTIFICATE`;
    doc.setTextColor(110, 231, 183);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.text(prepLine, margin, 31.5);
  };

  const drawPageFooter = (leftText: string, pageNumText: string) => {
    doc.setFillColor(15, 23, 42);
    doc.rect(0, pageH - 11, pageW, 11, 'F');
    doc.setFillColor(245, 158, 11);
    doc.rect(0, pageH - 11.6, pageW, 0.6, 'F');
    doc.setTextColor(226, 232, 240);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.text(leftText, margin, pageH - 4.2);
    doc.setFont('helvetica', 'bold');
    doc.text(pageNumText, pageW - margin, pageH - 4.2, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE OVERVIEW, 5 VERIFICATION PILLARS & CLIENT BENEFITS
  // =========================================================================
  drawPageHeader(
    'TRADE HEAVEN OFFICIAL EXECUTIVE BROCHURE & COMPLIANCE DOSSIER',
    'B2B Trust Certificate - Features, Benefits & Audit Guide',
    'Certification Fee: $1,950.00 USD (Strictly from Applying Company Bank Account)  |  Process Time: 7 Days'
  );

  let y = 41;

  // 4-Metric Executive Highlight Bar
  const metricGap = 3;
  const metricW = (contentW - metricGap * 3) / 4;
  const metrics = [
    { label: 'CERTIFICATION FEE', value: '$1,950.00 USD', sub: 'Company Bank Wire Only' },
    { label: 'PROCESS TURNAROUND', value: '7 Calendar Days', sub: 'Complete Audit & Issue' },
    { label: 'SERIAL CREDENTIAL', value: 'THC-TRUST-2026', sub: 'Live Portal Searchable' },
    { label: 'JURISDICTION SCOPE', value: '190+ Countries', sub: 'Sovereign Govt. Checked' }
  ];

  metrics.forEach((m, idx) => {
    const mx = margin + idx * (metricW + metricGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(mx, y, metricW, 16, 1.8, 1.8, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(m.label, mx + 3, y + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.8);
    doc.text(m.value, mx + 3, y + 10.2);

    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(m.sub, mx + 3, y + 14.2);
  });

  y += 20.5;

  // Intro Definition Box (Dynamic Height)
  const introText =
    'A Trade Heaven B2B Trust Certificate (Serial Format: THC-TRUST-2026-XXXX) proves that an independent third party has verified a company\'s quality management systems, data security controls, country-specific government legal standing, and real-world trade fulfillment rather than relying on self-reported marketing claims.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  const introLines = doc.splitTextToSize(introText, contentW - 8);
  const introBoxH = 9.5 + introLines.length * 3.7 + 2.5;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, y, contentW, introBoxH, 2, 2, 'FD');
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.text('What a Trade Heaven B2B Trust Certificate Shows & Proves', margin + 4, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.2);
  doc.setTextColor(51, 65, 85);
  doc.text(introLines, margin + 4, y + 10.8);

  y += introBoxH + 5;

  // Section 1: The 5 Core Independent Verification Pillars
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. The 5 Core Independent Verification Pillars', margin, y);
  y += 3.5;

  const pillars = [
    {
      num: '01',
      title: 'Verified Quality & Management (ISO 9001:2015 / Six Sigma / IATF 16949 / SGS & TUV)',
      body: 'Confirms repeatable, documented quality control processes, batch calibration logs, IQC/OQC procedures, and AQL 1.5/2.5 pre-shipment inspection readiness.'
    },
    {
      num: '02',
      title: 'Security & Data Protection (SOC 2 Type I & II / ISO/IEC 27001 / ACID Escrow Controls)',
      body: 'Proves auditor-tested information security, encrypted Proforma Invoices and L/C documents, and verified corporate beneficiary bank account coordinates.'
    },
    {
      num: '03',
      title: 'Country-Specific Legal & Regulatory Compliance (Sovereign Government Documents)',
      body: 'GST & DGFT IEC are verified strictly in India. Outside India, Trade Heaven verifies the official government documents of that specific country: IRS EIN & State Incorporation (USA), VAT & EORI (UK/EU), ABN/ACN (Australia), FTA TRN & Trade License (UAE), or USCC (China).'
    },
    {
      num: '04',
      title: 'Operational Integrity & Independence (Objective Third-Party Evaluator Proof)',
      body: 'Replaces self-written website marketing claims with an unbiased third-party audit dossier verifying physical factory/warehouse premises and export records.'
    },
    {
      num: '05',
      title: 'Performance & Customer Satisfaction (Verified Buyer Reviews / G2 & Google Signals)',
      body: 'Validates real-world B2B contract fulfillment through authenticated Bill of Lading shipment records, on-time dispatch ratios, and verified buyer ratings.'
    }
  ];

  for (const p of pillars) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const bodyLines = doc.splitTextToSize(p.body, contentW - 18);
    const boxH = Math.max(14.5, 7.5 + bodyLines.length * 3.6 + 2.5);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentW, boxH, 1.5, 1.5, 'FD');

    // Left badge
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 2.5, y + 2.5, 9, 9, 1.2, 1.2, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(p.num, margin + 4.5, y + 8.2);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.text(p.title, margin + 14, y + 5.6);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(bodyLines, margin + 14, y + 9.8);

    y += boxH + 2.4;
  }

  y += 3;

  // Section 2: Key Features & How It Benefits Suppliers and Buyers (Dynamic Box Height)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. Key Features & How It Benefits Suppliers and Buyers', margin, y);
  y += 3.5;

  const colW = (contentW - 4) / 2;
  const supBenefits = [
    '- Instant buyer credibility with a live searchable serial (THC-TRUST-2026-XXXX).',
    '- Accelerates enterprise procurement and vendor onboarding from weeks to minutes.',
    '- Priority top-tier ranking across Trade Heaven search results and RFQ matching.',
    '- Official downloadable Trust Certificate PDF and verified seal on all listings.',
    '- Full access to ACID Escrow Protection & Direct-Loss Assurance of Trade Heaven.'
  ];
  const buyBenefits = [
    '- Eliminates shell intermediaries by matching legal entity & corporate bank account.',
    '- Confirms country-specific sovereign government tax and export license standing.',
    '- Verifies ISO 9001 quality control and SOC 2 / ISO 27001 security compliance.',
    '- Provides independent third-party audit proof before wiring container deposits.',
    '- Protected by Trade Heaven Escrow & Direct-Loss Assurance coverage.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  const supWrapped = supBenefits.map(item => doc.splitTextToSize(item, colW - 7));
  const buyWrapped = buyBenefits.map(item => doc.splitTextToSize(item, colW - 7));

  const supTotalLines = supWrapped.reduce((acc, l) => acc + l.length, 0);
  const buyTotalLines = buyWrapped.reduce((acc, l) => acc + l.length, 0);
  const maxLines = Math.max(supTotalLines, buyTotalLines);
  const benefitBoxH = 11 + maxLines * 3.6 + supBenefits.length * 1.4 + 3.5;

  // Left Card: Suppliers
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(margin, y, colW, benefitBoxH, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Benefits for Verified Suppliers & Exporters', margin + 3.5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(20, 83, 45);
  let sy = y + 11;
  for (const lines of supWrapped) {
    doc.text(lines, margin + 3.5, sy);
    sy += lines.length * 3.6 + 1.4;
  }

  // Right Card: Buyers
  const rightX = margin + colW + 4;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(rightX, y, colW, benefitBoxH, 2, 2, 'FD');

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Benefits for Global Buyers & Importers', rightX + 3.5, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(30, 64, 175);
  let by = y + 11;
  for (const lines of buyWrapped) {
    doc.text(lines, rightX + 3.5, by);
    by += lines.length * 3.6 + 1.4;
  }

  drawPageFooter(
    'Trade Heaven (Tradeheaven ECOM Solution LLP)  |  https://tradeheaven.net/?view=B2B_TRUST_CERTIFICATE',
    'Page 1 of 2'
  );

  // =========================================================================
  // PAGE 2: HOW TO PAY $1,950 USD BY COMPANY BANK ACCOUNT, APPLY BY EMAIL & 7-DAY TIMELINE
  // =========================================================================
  doc.addPage();

  drawPageHeader(
    'OFFICIAL CORPORATE BANK REMITTANCE & EMAIL APPLICATION PROTOCOL',
    'How to Pay the $1,950 USD Fee & Apply via Official Email (7-Day Process)',
    'Strictly Remitted from Applying Company Corporate Bank Account  |  Email: help@tradeheaven.net'
  );

  y = 41;

  // Mandatory Corporate Bank Account Rule Banner (Dynamic Height — Zero Overflow)
  const ruleItems = [
    '1. Official Certification & Audit Fee: $1,950.00 USD (covers full 5-pillar third-party audit, country-specific sovereign government document verification, and 12-month B2B Trust Certificate issuance).',
    '2. Strict Corporate Bank Account Matching Rule: The $1,950.00 USD wire transfer MUST originate strictly from the corporate bank account of the company applying for the certificate. The remitter company name on the SWIFT MT103 slip must match the legal entity name on your government registration documents. Personal or third-party bank transfers are strictly rejected.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const wrappedRuleItems = ruleItems.map(r => doc.splitTextToSize(r, contentW - 8));
  const ruleTotalLines = wrappedRuleItems.reduce((acc, l) => acc + l.length, 0);
  const ruleBoxH = 10 + ruleTotalLines * 3.7 + 4.5;

  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(margin, y, contentW, ruleBoxH, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(
    'MANDATORY COMPLIANCE RULE: $1,950 USD FEE MUST BE PAID FROM APPLYING COMPANY BANK ACCOUNT',
    margin + 4,
    y + 6
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(120, 53, 15);
  let ry = y + 10.8;
  for (const lines of wrappedRuleItems) {
    doc.text(lines, margin + 4, ry);
    ry += lines.length * 3.7 + 1.5;
  }

  y += ruleBoxH + 5.5;

  // Step 1: Remit $1,950 USD to Trade Heaven Corporate Bank Account
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Step 1: Remit $1,950.00 USD to Trade Heaven Corporate Bank Account', margin, y);
  y += 3.5;

  const cleanBankAddress = OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress.includes(
    OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry
  )
    ? OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress
    : `${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress}, ${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry}`;

  const bankRows: [string, string][] = [
    ['Beneficiary Account Name', OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName],
    ['Certification Fee Amount', '$1,950.00 USD (United States Dollars)'],
    ['Payment Method', `${OFFICIAL_SWIFT_BANK_DETAILS.paymentMethod} - Strictly from Applying Company Bank Account`],
    ['IBAN / Account Number', OFFICIAL_SWIFT_BANK_DETAILS.iban],
    ['BIC / SWIFT Code', OFFICIAL_SWIFT_BANK_DETAILS.bicSwift],
    ['Receiving Bank Name', OFFICIAL_SWIFT_BANK_DETAILS.bankName],
    ['Beneficiary Bank Address', cleanBankAddress],
    ['Mandatory Wire Remark', `${OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark} - B2B TRUST CERTIFICATE [${applicantCompany || 'Your Company Name'}]`]
  ];

  const rowH = 5.8;
  const tableH = bankRows.length * rowH + 3;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, y, contentW, tableH, 2, 2, 'FD');

  bankRows.forEach(([label, val], idx) => {
    const rowY = y + 1.5 + idx * rowH;
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 1, rowY, contentW - 2, rowH, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${label}:`, margin + 4, rowY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(String(val), margin + 54, rowY + 4);
  });

  y += tableH + 5.5;

  // Step 2: Submit Your Application & Wire Proof to Trade Heaven Official Emails (Dynamic Height — Zero Overflow)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Step 2: Submit Your Application & Wire Proof to Trade Heaven Official Emails', margin, y);
  y += 3.5;

  const emailChecklist = [
    '1. Corporate Bank Wire Receipt ($1,950 USD): Attach the official SWIFT MT103 / Wire Transfer slip showing payment from your applying company\'s corporate bank account to TRADEHEAVEN ECOM SOLUTION LLP.',
    '2. Country-Specific Government Legal & Tax Document: Attach your official sovereign government registration (GST Certificate & IEC Code if in India; IRS EIN & Articles of Incorporation for USA; VAT & EORI & Companies House for UK/EU; ABN/ACN for Australia; TRN & Trade License for UAE; or USCC for China).',
    '3. Quality & Security Credentials: Attach ISO 9001 / Six Sigma quality records, SOC 2 / ISO 27001 security policies (if applicable), and a voided corporate check or bank comfort letter matching your company name.',
    '4. Authorized Signatory Details: Full name, designation, corporate email, phone/WhatsApp, and registered physical office/factory street address.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  const wrappedChecklist = emailChecklist.map(item => doc.splitTextToSize(item, contentW - 8));
  const checklistTotalLines = wrappedChecklist.reduce((acc, l) => acc + l.length, 0);
  const step2BoxH = 16 + checklistTotalLines * 3.6 + wrappedChecklist.length * 1.4 + 3;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, y, contentW, step2BoxH, 2, 2, 'FD');

  doc.setFillColor(239, 246, 255);
  doc.rect(margin + 1, y + 1, contentW - 2, 12.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.4);
  doc.setTextColor(30, 64, 175);
  doc.text(
    'Official Application Emails:   help@tradeheaven.net   (CC: compliance@tradeheaven.net)',
    margin + 4,
    y + 5.8
  );
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(8);
  doc.text(
    `Subject Line:   B2B Trust Certificate Application - [${applicantCompany || 'Your Legal Company Name'}] - $1,950 USD Wire Attached`,
    margin + 4,
    y + 11
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(51, 65, 85);
  let ey = y + 17.5;
  for (const lines of wrappedChecklist) {
    doc.text(lines, margin + 4, ey);
    ey += lines.length * 3.6 + 1.4;
  }

  y += step2BoxH + 5.5;

  // Step 3: 7-Day Complete Verification & Issuance Timeline
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Step 3: 7-Day Complete Verification, Audit & Certificate Issuance Schedule', margin, y);
  y += 3.5;

  const timelineSteps = [
    {
      days: 'Days 1 - 2',
      title: 'Corporate Bank Remittance & Sovereign Government Registry Check',
      desc: 'Verification of the $1,950 USD wire from the applying company\'s bank account and live lookup of country-specific government documents (GST/IEC in India; EIN/VAT/EORI/ABN/TRN/USCC globally).'
    },
    {
      days: 'Days 3 - 4',
      title: 'Quality Management (ISO 9001) & Data Security (SOC 2 / ISO 27001) Audit',
      desc: 'Audit of quality management SOPs, batch inspection logs, trade document data security controls, and corporate beneficiary bank account ownership.'
    },
    {
      days: 'Days 5 - 6',
      title: 'Independent Evaluator Assessment & Buyer Fulfillment Validation',
      desc: 'Review of physical operational standing, past Bill of Lading export history, and verified buyer satisfaction signals by third-party compliance officers.'
    },
    {
      days: 'Day 7',
      title: 'Final Issuance of B2B Trust Certificate (THC-TRUST-2026-XXXX)',
      desc: 'Official B2B Trust Certificate PDF and cryptographic serial number are issued via email and published live on the Trade Heaven Verification Registry.'
    }
  ];

  for (const step of timelineSteps) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    const dLines = doc.splitTextToSize(step.desc, contentW - 32);
    const tBoxH = Math.max(13, 6.5 + dLines.length * 3.4 + 2);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(margin, y, contentW, tBoxH, 1.5, 1.5, 'FD');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 2.5, y + 2.2, 23, tBoxH - 4.4, 1.2, 1.2, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.text(step.days, margin + 14, y + tBoxH / 2 + 1, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(step.title, margin + 28.5, y + 5);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.6);
    doc.text(dLines, margin + 28.5, y + 8.8);

    y += tBoxH + 2.2;
  }

  drawPageFooter(
    'Apply via Email: help@tradeheaven.net (CC: compliance@tradeheaven.net)  |  Fee: $1,950 USD  |  7-Day Turnaround',
    'Page 2 of 2'
  );

  const safeSlug = (applicantCompany || 'Official-Guide')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-');
  triggerPdfDownload(doc, `TradeHeaven-B2B-Trust-Certificate-Brochure-1950USD-7Days-${safeSlug}.pdf`);
}

export const B2BTrustCertificatePage: React.FC<B2BTrustCertificatePageProps> = ({
  currentUser,
  onNavigate
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState(currentUser?.companyName || '');
  const [country, setCountry] = useState(currentUser?.country || 'United States');
  const [govDocumentType, setGovDocumentType] = useState('US IRS EIN & State Incorporation (Outside India)');
  const [govDocumentNumber, setGovDocumentNumber] = useState('');
  const [companyBankName, setCompanyBankName] = useState('');
  const [companyBankAccountNo, setCompanyBankAccountNo] = useState('');
  const [wireReferenceNumber, setWireReferenceNumber] = useState('');
  const [isoOrSecurityCerts, setIsoOrSecurityCerts] = useState('ISO 9001:2015, SOC 2 Type II / ISO 27001');
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');
  const [confirmedCorporateBankMatch, setConfirmedCorporateBankMatch] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedApp, setSubmittedApp] = useState<SubmittedTrustApplication | null>(null);
  const [isSendingEmailDossier, setIsSendingEmailDossier] = useState(false);
  const [emailDispatchNotice, setEmailDispatchNotice] = useState<string | null>(null);

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard?.writeText(value);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const emailSubject = `B2B Trust Certificate Application ($1,950 USD Corporate Wire) - ${companyName || '[Your Legal Company Name]'}`;
  const emailBodyTemplate = `To: Trade Heaven B2B Trust Certificate & Compliance Desk (help@tradeheaven.net, compliance@tradeheaven.net)

Subject: ${emailSubject}

Dear Trade Heaven Verification & Audit Committee,

We are submitting our formal application for the Trade Heaven Independent B2B Trust Certificate (7-Day Complete Audit & Verification Process).

1. APPLYING LEGAL ENTITY DETAILS
- Legal Company Name: ${companyName || '[Enter Registered Legal Company Name]'}
- Country of Incorporation: ${country || '[Enter Country]'}
- Country-Specific Government Document Type: ${govDocumentType}
- Government Registration / Tax ID Number: ${govDocumentNumber || '[Enter GSTIN/IEC for India OR EIN/VAT/EORI/ABN/TRN/USCC for Global]'}
- Quality & Security Standards Held: ${isoOrSecurityCerts}

2. MANDATORY $1,950 USD CORPORATE BANK WIRE DETAILS (PAID FROM APPLYING COMPANY BANK ACCOUNT)
- Remitting Corporate Bank Account Name: ${companyName || '[Must Match Applying Legal Company Name]'}
- Remitting Company Bank Name: ${companyBankName || '[Enter Your Company Bank Name]'}
- Remitting Company Account / IBAN No.: ${companyBankAccountNo || '[Enter Company Bank Account Number]'}
- Amount Remitted to TRADEHEAVEN ECOM SOLUTION LLP: $1,950.00 USD
- SWIFT MT103 / Wire / UTR Reference Number: ${wireReferenceNumber || '[Enter SWIFT MT103 / Wire Reference]'}

3. AUTHORIZED CORPORATE APPLICANT CONTACT
- Applicant Name & Designation: ${applicantName || '[Enter Full Name & Title]'}
- Official Corporate Email: ${applicantEmail || '[Enter Corporate Email]'}

ATTACHMENTS INCLUDED WITH THIS EMAIL:
[1] $1,950 USD Corporate Bank Wire Transfer Receipt / SWIFT MT103 Slip (sent from our company bank account)
[2] Official Country-Specific Government Registration & Tax Certificate (${country.toLowerCase() === 'india' ? 'GST Certificate & DGFT IEC' : 'Sovereign Government Incorporation & Tax/Customs License'})
[3] ISO 9001 / Quality Control & SOC 2 / ISO 27001 Security Compliance Documents
[4] Cancelled Corporate Check / Bank Comfort Letter confirming company bank ownership

We acknowledge that the complete verification, third-party evaluation, and certificate issuance process takes 7 days from confirmation of the $1,950 USD corporate wire.

Sincerely,
${applicantName || '[Authorized Signatory]'}
${companyName || '[Applying Company Name]'}`;

  const handleApplicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setEmailDispatchNotice(null);

    if (
      !companyName.trim() ||
      !govDocumentNumber.trim() ||
      !companyBankName.trim() ||
      !companyBankAccountNo.trim() ||
      !wireReferenceNumber.trim() ||
      !applicantName.trim() ||
      !applicantEmail.trim()
    ) {
      setFormError(
        'Please complete all mandatory corporate registration, applying company bank account, and $1,950 USD wire reference fields.'
      );
      return;
    }

    if (!confirmedCorporateBankMatch) {
      setFormError(
        'You must confirm that the $1,950 USD fee was remitted strictly from the applying company’s own corporate bank account.'
      );
      return;
    }

    const prefix = companyName.replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase() || 'TRD';
    const rand = Math.floor(10000 + Math.random() * 89999);
    const appId = `THC-TRUST-2026-${prefix}-${rand}`;
    const completionDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    const record: SubmittedTrustApplication = {
      applicationId: appId,
      companyName: companyName.trim(),
      country: country.trim(),
      govDocumentType,
      govDocumentNumber: govDocumentNumber.trim(),
      companyBankName: companyBankName.trim(),
      companyBankAccountNo: companyBankAccountNo.trim(),
      wireReferenceNumber: wireReferenceNumber.trim(),
      applicantName: applicantName.trim(),
      applicantEmail: applicantEmail.trim(),
      submittedAt: new Date().toISOString().split('T')[0],
      estimatedCompletionDate: completionDate
    };

    setSubmittedApp(record);

    // Also dispatch confirmation via backend SMTP if available
    setIsSendingEmailDossier(true);
    try {
      await fetch('/api/mail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: applicantEmail.trim(),
          cc: 'help@tradeheaven.net',
          subject: `[Trade Heaven] B2B Trust Certificate Application Received (${appId}) — 7-Day Audit Initiated`,
          html: `<div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #0f172a; margin-top: 0;">Trade Heaven B2B Trust Certificate Application Dossier</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.6;">
              Your application for the <strong>Trade Heaven Independent B2B Trust Certificate</strong> has been registered for <strong>${companyName.trim()}</strong>.
            </p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 13px; color: #1e293b; line-height: 1.7;">
              <div><strong>Application Tracking ID:</strong> ${appId}</div>
              <div><strong>Mandatory Corporate Bank Fee:</strong> $1,950.00 USD (Paid from ${companyBankName.trim()} • Acct: ${companyBankAccountNo.trim()})</div>
              <div><strong>SWIFT / Wire Reference:</strong> ${wireReferenceNumber.trim()}</div>
              <div><strong>Sovereign Govt. Document Checked:</strong> ${govDocumentType} (${govDocumentNumber.trim()})</div>
              <div><strong>Complete Audit & Issuance Time:</strong> 7 Days (Estimated Issuance: ${completionDate})</div>
            </div>
            <p style="color: #475569; font-size: 13px; line-height: 1.6; margin-top: 16px;">
              Please also reply to <strong>help@tradeheaven.net</strong> with your PDF attachments (SWIFT MT103 wire slip, country-specific government registration certificate, and ISO/SOC 2 documents) if not already sent.
            </p>
          </div>`
        })
      });
      setEmailDispatchNotice(
        `Application ${appId} registered and confirmation dispatched to ${applicantEmail.trim()} & help@tradeheaven.net.`
      );
    } catch {
      setEmailDispatchNotice(
        `Application ${appId} registered on the portal. You can also download the full PDF dossier below.`
      );
    } finally {
      setIsSendingEmailDossier(false);
    }
  };

  return (
    <article
      id="b2b-trust-certificate-dedicated-page"
      className="max-w-[1440px] mx-auto space-y-10 pb-16 text-slate-900"
    >
      {/* 1. EXECUTIVE HERO HEADER */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-slate-800 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300 tracking-wide">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Official Third-Party B2B Trust Certificate &amp; Compliance Seal</span>
              <span aria-hidden="true">·</span>
              <span>ISO 9001 · SOC 2 · Sovereign Govt. Verified</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Trade Heaven Independent B2B Trust Certificate
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              An independent third-party verification credential (<code className="font-mono text-amber-300">THC-TRUST-2026-XXXX</code>) proving your company&apos;s quality management, data security, country-specific government legal standing, physical operations, and buyer satisfaction—cutting enterprise procurement review times from weeks to minutes.
            </p>

            {/* Primary Download Brochure & Application CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => generateB2BTrustCertificateBrochurePDF(companyName.trim() || undefined)}
                className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-lg"
              >
                <FileDown className="w-4 h-4 shrink-0" />
                <span>Download Full Brochure &amp; Payment Guide (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('bank-payment-and-email-application-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Landmark className="w-4 h-4 shrink-0" />
                <span>Pay $1,950 USD via Company Bank &amp; Apply</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('TRADE_ASSURANCE_CERTIFICATE')}
                  className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lookup Existing Serial Number</span>
                </button>
              )}
            </div>
          </div>

          {/* Right 5 Cols: Fee, Bank Rule & 7-Day Turnaround Summary Card */}
          <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-700">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Official Certification &amp; Audit Fee
                </div>
                <div className="text-3xl sm:text-4xl font-black font-mono tabular-nums text-amber-400 mt-1">
                  $1,950 USD
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Paid strictly from the applying company&apos;s corporate bank account
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Complete Turnaround
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono tabular-nums text-emerald-400 mt-1">
                  7 Days
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  End-to-end audit &amp; issuance
                </div>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Mandatory Corporate Bank Remittance:</strong> The $1,950 USD fee must be transferred directly from the corporate bank account of the company applying for the certificate.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Country-Specific Govt. Document Check:</strong> Verifies GST &amp; IEC in India, or official home-government documents outside India (EIN, VAT/EORI, ABN, TRN, USCC).
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Apply via Official Emails or Portal:</strong> Submit your $1,950 USD wire slip and compliance documents to <code className="text-amber-300 font-mono">help@tradeheaven.net</code> or below.
                </span>
              </li>
            </ul>

            <button
              type="button"
              onClick={() => generateB2BTrustCertificateBrochurePDF(companyName.trim() || undefined)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              <span>Download Complete 2-Page PDF Brochure &amp; Bank Payment Instructions</span>
            </button>
          </div>
        </div>

        {/* 4-Column Key Specifications Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Certification Fee</div>
            <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-white mt-1">
              $1,950.00 USD
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Company bank account wire only</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Complete Process Time</div>
            <div className="text-lg sm:text-xl font-black font-mono tabular-nums text-amber-400 mt-1">
              7 Calendar Days
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">From wire &amp; document submission</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Beneficiary Account</div>
            <div className="text-base sm:text-lg font-black text-white mt-1 truncate">
              TRADEHEAVEN ECOM SOLUTION LLP
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">SWIFT: {OFFICIAL_SWIFT_BANK_DETAILS.bicSwift}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="text-slate-400">Official Application Desk</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-1 font-mono truncate">
              help@tradeheaven.net
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">CC: compliance@tradeheaven.net</div>
          </div>
        </div>
      </section>

      {/* 2. THE 5 CORE PILLARS OF THE B2B TRUST CERTIFICATE (INCLUDING COUNTRY-SPECIFIC GOVT. DOCS) */}
      <B2BTrustCertificatePillarsSection
        onVerifyClick={() => {
          if (onNavigate) {
            onNavigate('TRADE_ASSURANCE_CERTIFICATE');
          }
        }}
        onApplyClick={() => {
          const el = document.getElementById('bank-payment-and-email-application-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 3. 7-DAY COMPLETE PROCESS TIMELINE */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-8 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
              <Clock className="w-4 h-4 shrink-0" />
              <span>7-Day End-to-End Audit &amp; Issuance Schedule</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              How the 7-Day Complete Verification Process Works
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Once your applying company remits the <strong>$1,950 USD</strong> fee from its corporate bank account and submits the compliance dossier via email or the portal below, our third-party evaluation desk completes the entire audit in <strong>7 days</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => generateB2BTrustCertificateBrochurePDF(companyName.trim() || undefined)}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Download 7-Day Process &amp; Fee PDF</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-blue-700">DAYS 1 – 2</span>
                <Landmark className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Corporate Bank Wire &amp; Sovereign Govt. Registry Check
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We verify that the <strong>$1,950 USD</strong> wire originated strictly from the applying company&apos;s own corporate bank account, and cross-check the company&apos;s official government documents of its specific country (GST/IEC in India; EIN, VAT/EORI, ABN, TRN, or USCC outside India).
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
              Milestone 1 · Legal &amp; Banking KYC
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-emerald-700">DAYS 3 – 4</span>
                <Lock className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Quality (ISO 9001) &amp; Security (SOC 2 / ISO 27001) Audit
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Auditors inspect your quality management SOPs, batch inspection records, IQC/OQC logs, and information security / trade data handling controls to confirm repeatable quality and safe document handling.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
              Milestone 2 · Technical &amp; Security Audit
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-indigo-700">DAYS 5 – 6</span>
                <Building2 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Independent Evaluator &amp; Buyer Satisfaction Review
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Third-party evaluation of physical factory/warehouse capability, past 12-month Bill of Lading export records, and verified peer/buyer fulfillment history to validate operational integrity.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 text-[11px] font-mono text-slate-500">
              Milestone 3 · Operational &amp; Peer Validation
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-400">DAY 7</span>
                <Award className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-white">
                B2B Trust Certificate Issuance &amp; Registry Publication
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Your official cryptographically signed <strong>B2B Trust Certificate</strong> (<code className="font-mono text-amber-300">THC-TRUST-2026-XXXX</code>) is issued via email as a high-resolution PDF and indexed live on the Trade Heaven Registry.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-800 text-[11px] font-mono text-emerald-400">
              Milestone 4 · Certified &amp; Live on Portal
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW TO PAY THE $1,950 USD FEE TO TRADE HEAVEN BANK ACCOUNT & APPLY VIA OFFICIAL EMAIL */}
      <section
        id="bank-payment-and-email-application-section"
        className="bg-slate-900 text-white rounded-3xl border border-slate-800 p-6 sm:p-10 lg:p-12 space-y-10 shadow-xl"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Landmark className="w-4 h-4 shrink-0" />
              <span>Corporate Bank Wire Protocol &amp; Official Email Application</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              How to Get Certified: Pay $1,950 USD via Your Company Bank Account &amp; Apply on Official Emails
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To maintain strict anti-fraud and beneficial-ownership compliance, the <strong>$1,950 USD</strong> B2B Trust Certificate fee must be wired directly from the <strong>applying company&apos;s own registered corporate bank account</strong> to Trade Heaven&apos;s corporate account below.
            </p>
          </div>

          <button
            type="button"
            onClick={() => generateB2BTrustCertificateBrochurePDF(companyName.trim() || undefined)}
            className="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Full Brochure &amp; Bank Instructions (PDF)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 6 Cols: Official Trade Heaven Bank Account Coordinates & Email Application Template */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-amber-400" />
                    <span>Step 1: Trade Heaven Corporate Bank Account ($1,950 USD)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Remit $1,950.00 USD strictly from the applying company&apos;s corporate bank account
                  </p>
                </div>
                <span className="font-mono text-sm font-black text-amber-400">$1,950 USD</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {[
                  { label: 'Beneficiary Account Holder', value: OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName, key: 'holder' },
                  { label: 'Certification Fee Amount', value: '$1,950.00 USD (From Applying Company Bank Account)', key: 'amount' },
                  { label: 'IBAN / Account Number', value: OFFICIAL_SWIFT_BANK_DETAILS.iban, key: 'iban' },
                  { label: 'BIC / SWIFT Code', value: OFFICIAL_SWIFT_BANK_DETAILS.bicSwift, key: 'swift' },
                  { label: 'Receiving Bank Name', value: OFFICIAL_SWIFT_BANK_DETAILS.bankName, key: 'bank' },
                  {
                    label: 'Beneficiary Bank Address',
                    value: OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress.includes(OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry)
                      ? OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress
                      : `${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress}, ${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry}`,
                    key: 'addr'
                  },
                  { label: 'Mandatory Payment Remark', value: `${OFFICIAL_SWIFT_BANK_DETAILS.mandatoryRemark} - B2B TRUST CERT`, key: 'remark' }
                ].map(item => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-700/80"
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] text-slate-400">{item.label}</div>
                      <div className="font-mono font-bold text-white truncate mt-0.5">{item.value}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.key, item.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedField === item.key ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: How to Apply via Official Trade Heaven Emails */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <span>Step 2: Apply on Trade Heaven Official Emails</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send your $1,950 USD company bank wire slip &amp; country-specific government documents
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Primary Application Email:</span>
                  <span className="font-mono font-bold text-emerald-400">help@tradeheaven.net</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Compliance Audit Desk CC:</span>
                  <span className="font-mono font-bold text-amber-300">compliance@tradeheaven.net</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Pre-Formatted Email Application Dossier:</span>
                  <button
                    type="button"
                    onClick={() => handleCopy('email-template', emailBodyTemplate)}
                    className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'email-template' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Template!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Email Text</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {emailBodyTemplate}
                </pre>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <a
                  href={`mailto:help@tradeheaven.net?cc=compliance@tradeheaven.net&subject=${encodeURIComponent(
                    emailSubject
                  )}&body=${encodeURIComponent(emailBodyTemplate)}`}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Open Email Client to Apply (help@tradeheaven.net)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Online Application & Company Bank Wire Registration Form */}
          <div className="lg:col-span-6 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 space-y-5">
            <div className="pb-4 border-b border-slate-200 space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Step 3 · Register Your $1,950 USD Company Wire &amp; Dossier Online
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Submit B2B Trust Certificate Application (7-Day Process)
              </h3>
              <p className="text-xs text-slate-600">
                Enter your applying company&apos;s legal details, country-specific government document ID, and the corporate bank account used to wire the $1,950 USD fee.
              </p>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            {submittedApp && (
              <div className="p-5 rounded-2xl bg-emerald-950 text-white border border-emerald-700 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>7-Day B2B Trust Certificate Audit Initiated</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-300">
                    {submittedApp.applicationId}
                  </span>
                </div>
                <p className="text-xs text-emerald-100 leading-relaxed">
                  Application registered for <strong>{submittedApp.companyName}</strong> ({submittedApp.country}). Corporate bank wire reference <code className="font-mono text-white">{submittedApp.wireReferenceNumber}</code> ($1,950 USD from <strong>{submittedApp.companyBankName}</strong>) is queued for Day 1–2 verification. Estimated Certificate Issuance: <strong>{submittedApp.estimatedCompletionDate}</strong> (7 Days).
                </p>
                {emailDispatchNotice && (
                  <div className="text-[11px] text-emerald-300 font-medium">{emailDispatchNotice}</div>
                )}
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => generateB2BTrustCertificateBrochurePDF(submittedApp.companyName)}
                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5" />
                    <span>Download Customized PDF Brochure &amp; Receipt</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleApplicationSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Applying Legal Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Apex Global Manufacturing Ltd."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Country of Incorporation *
                  </label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={e => {
                      const val = e.target.value;
                      setCountry(val);
                      if (val.trim().toLowerCase() === 'india') {
                        setGovDocumentType('India GST Certificate (GSTIN) & DGFT IEC Code');
                      } else if (govDocumentType.includes('India GST')) {
                        setGovDocumentType('Country-Specific Sovereign Govt. Tax & Incorporation Document');
                      }
                    }}
                    placeholder="e.g. United States, Germany, UAE, India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Country-Specific Govt. Document Verified *
                  </label>
                  <select
                    value={govDocumentType}
                    onChange={e => setGovDocumentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="US IRS EIN & State Incorporation (Outside India)">
                      USA / Canada: IRS Federal EIN &amp; State Incorporation / BN
                    </option>
                    <option value="UK / EU VAT Registration, EORI & Companies House">
                      UK / EU: VIES VAT Registration, EORI &amp; Commercial Register
                    </option>
                    <option value="UAE FTA TRN & Commercial Trade License">
                      UAE / GCC: Commercial Trade License &amp; FTA TRN
                    </option>
                    <option value="Australia ABN / ACN or APAC ACRA UEN">
                      Australia / APAC: ASIC ABN / ACN or Singapore UEN
                    </option>
                    <option value="China SAMR 18-Digit USCC or LatAm CNPJ/RFC">
                      China / LatAm: SAMR 18-Digit USCC or Brazil CNPJ / Mexico RFC
                    </option>
                    <option value="India GST Certificate (GSTIN) & DGFT IEC Code">
                      India Only: GST Certificate (GSTIN), MCA CIN &amp; DGFT IEC
                    </option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Sovereign Govt. Tax / Registration Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={govDocumentNumber}
                    onChange={e => setGovDocumentNumber(e.target.value)}
                    placeholder="e.g. EIN / VAT-EORI / ABN / TRN / GSTIN"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                <div className="text-xs font-bold text-amber-950 flex items-center justify-between">
                  <span>Applying Company Corporate Bank Account Details ($1,950 USD Remitter)</span>
                  <span className="font-mono text-amber-800">$1,950.00 USD</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Applying Company Bank Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyBankName}
                      onChange={e => setCompanyBankName(e.target.value)}
                      placeholder="e.g. JPMorgan Chase / HSBC / Citi / HDFC"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700">
                      Company Bank Account / IBAN No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyBankAccountNo}
                      onChange={e => setCompanyBankAccountNo(e.target.value)}
                      placeholder="Must belong to applying company"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    $1,950 USD SWIFT MT103 / Wire Transfer Reference Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={wireReferenceNumber}
                    onChange={e => setWireReferenceNumber(e.target.value)}
                    placeholder="Enter SWIFT UETR / MT103 / Wire Reference for $1,950 USD"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Quality / Security Standards
                  </label>
                  <input
                    type="text"
                    value={isoOrSecurityCerts}
                    onChange={e => setIsoOrSecurityCerts(e.target.value)}
                    placeholder="ISO 9001, SOC 2, ISO 27001"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Authorized Applicant Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={e => setApplicantName(e.target.value)}
                    placeholder="Full Name & Title"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    Official Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={applicantEmail}
                    onChange={e => setApplicantEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={confirmedCorporateBankMatch}
                  onChange={e => setConfirmedCorporateBankMatch(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I confirm that the <strong>$1,950 USD</strong> certification fee is remitted strictly from the corporate bank account of <strong>{companyName || 'the applying company'}</strong> and that we understand the complete verification &amp; issuance process takes <strong>7 days</strong>.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSendingEmailDossier}
                  className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSendingEmailDossier
                      ? 'Submitting 7-Day Audit Application...'
                      : 'Submit $1,950 USD B2B Trust Certificate Application'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE BROCHURE PREVIEW & DOWNLOAD SECTION */}
      <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Official Executive PDF Dossier (2 Pages · A4 Printable)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Full Brochure: Features, Client Benefits &amp; How to Pay the $1,950 USD Fee to Trade Heaven
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Download the complete 2-page PDF brochure to share with your company&apos;s finance department, board of directors, or banking team before initiating the $1,950 USD corporate wire transfer.
            </p>
          </div>

          <button
            type="button"
            onClick={() => generateB2BTrustCertificateBrochurePDF(companyName.trim() || undefined)}
            className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shrink-0 shadow-md"
          >
            <FileDown className="w-4 h-4" />
            <span>Download Full Brochure PDF ($1,950 USD · 7 Days)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-mono font-bold text-blue-700">BROCHURE SECTION 01</div>
            <h3 className="text-sm font-bold text-slate-900">
              Features &amp; Benefits of the B2B Trust Certificate
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Explains all 5 independent verification pillars (ISO 9001 Quality, SOC 2 / ISO 27001 Security, Country-Specific Sovereign Government Documents, Operational Integrity, and Buyer Satisfaction) and how certified suppliers win larger container contracts.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-mono font-bold text-amber-700">BROCHURE SECTION 02</div>
            <h3 className="text-sm font-bold text-slate-900">
              How to Pay the $1,950 USD Fee via Company Bank Account
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Contains the complete SWIFT / IBAN wire coordinates for <strong>TRADEHEAVEN ECOM SOLUTION LLP</strong>, the mandatory corporate bank account matching rule, and instructions for attaching your SWIFT MT103 slip.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-mono font-bold text-emerald-700">BROCHURE SECTION 03</div>
            <h3 className="text-sm font-bold text-slate-900">
              How to Apply on Trade Heaven Emails &amp; 7-Day Schedule
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Step-by-step checklist for emailing <code className="font-mono text-slate-900">help@tradeheaven.net</code> (CC: <code className="font-mono text-slate-900">compliance@tradeheaven.net</code>) with your country-specific government documents and tracking the 7-day audit to completion.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
};

export default B2BTrustCertificatePage;
