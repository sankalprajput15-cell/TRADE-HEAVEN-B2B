import React from 'react';
import { jsPDF } from 'jspdf';
import {
  Award,
  Landmark,
  Clock,
  FileDown,
  Building2,
  Lock
} from 'lucide-react';
import { AuthUser, Currency, ActiveView, PaymentCheckoutData } from '../../types';
import { OFFICIAL_SWIFT_BANK_DETAILS } from '../../constants/swiftBankDetails';
import { drawTradeHeavenBrandLogo } from '../common/ExportToPDF';
import { B2BTrustCertificatePillarsSection } from './B2BTrustCertificatePillarsSection';

interface B2BTrustCertificatePageProps {
  selectedCurrency?: Currency;
  currentUser?: AuthUser | null;
  onNavigate?: (view: ActiveView | string) => void;
  onOpenPaymentCheckout?: (data: PaymentCheckoutData) => void;
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

function drawExecutivePdfHeader(
  doc: jsPDF,
  kicker: string,
  title: string,
  subtitle: string,
  badgeTop: string,
  badgeMain: string,
  badgeSub: string
) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const nowStr = new Date().toISOString().split('T')[0];

  // Deep Navy Header Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageW, 34, 'F');

  // Dual Accent Bottom Rule (Gold + Emerald)
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 34, pageW * 0.65, 1.4, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(pageW * 0.65, 34, pageW * 0.35, 1.4, 'F');

  // Official Geometric Vector TH Brand Crest
  drawTradeHeavenBrandLogo(doc, margin, 6.2, {
    boxSize: 15.2,
    theme: 'dark',
    showWordmark: false
  });

  // Title & Subtitle Block
  const textX = margin + 18.8;
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.1);
  doc.text(kicker, textX, 9.8);

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.8);
  doc.text(title, textX, 16.4);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.text(subtitle, textX, 21.8);

  // Bottom Metadata Bar inside Header
  doc.setTextColor(110, 231, 183);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.1);
  doc.text(
    `TRADE HEAVEN OFFICIAL REGISTRY   |   Issued: ${nowStr}   |   Portal: https://tradeheaven.net/?view=B2B_TRUST_CERTIFICATE`,
    margin,
    30.2
  );

  // Right Executive Summary Pill Box
  const pillW = 45;
  const pillX = pageW - margin - pillW;
  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.roundedRect(pillX, 6.2, pillW, 18, 2, 2, 'FD');

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text(badgeTop, pillX + pillW / 2, 10.3, { align: 'center' });

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.2);
  doc.text(badgeMain, pillX + pillW / 2, 16.3, { align: 'center' });

  doc.setTextColor(110, 231, 183);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.text(badgeSub, pillX + pillW / 2, 21.4, { align: 'center' });
}

function drawExecutivePdfFooter(doc: jsPDF, leftText: string, rightText: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageH - 11.5, pageW, 11.5, 'F');
  doc.setFillColor(245, 158, 11);
  doc.rect(0, pageH - 12.1, pageW, 0.6, 'F');

  drawTradeHeavenBrandLogo(doc, margin, pageH - 9.4, {
    boxSize: 6.8,
    theme: 'dark',
    showWordmark: false
  });

  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(leftText, margin + 8.8, pageH - 4.6);

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.text(rightText, pageW - margin, pageH - 4.6, { align: 'right' });
}

function renderFeaturesPageContent(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  drawExecutivePdfHeader(
    doc,
    'TRADE HEAVEN OFFICIAL B2B TRUST CERTIFICATE — FEATURES & BENEFITS',
    'Independent B2B Trust Certificate — Features & Benefits',
    'Third-Party Audited Quality (ISO 9001), Security (SOC 2) & Country-Specific Government Verification',
    'VERIFICATION SCOPE',
    '5 Core Pillars',
    '190+ Countries Checked'
  );

  let y = 39;

  // 4-Metric Executive Highlight Bar
  const metricGap = 3;
  const metricW = (contentW - metricGap * 3) / 4;
  const metrics = [
    { label: 'AUDIT ARCHITECTURE', value: '5 Core Pillars', sub: 'Independent 3rd-Party Proof', accent: [37, 99, 235] as [number, number, number] },
    { label: 'QUALITY & SECURITY', value: 'ISO 9001 & SOC 2', sub: 'Audited QC & Data Controls', accent: [16, 185, 129] as [number, number, number] },
    { label: 'LEGAL JURISDICTION', value: '190+ Countries', sub: 'Home Govt. Docs Checked', accent: [245, 158, 11] as [number, number, number] },
    { label: 'CREDENTIAL SERIAL', value: 'THC-TRUST-2026', sub: 'Live Registry Searchable', accent: [99, 102, 241] as [number, number, number] }
  ];

  metrics.forEach((m, idx) => {
    const mx = margin + idx * (metricW + metricGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(mx, y, metricW, 15, 1.8, 1.8, 'FD');

    doc.setFillColor(m.accent[0], m.accent[1], m.accent[2]);
    doc.rect(mx, y + 2, 1.5, 11, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(m.label, mx + 4, y + 4.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(m.value, mx + 4, y + 9.8);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.6);
    doc.text(m.sub, mx + 4, y + 13.5);
  });

  y += 18.5;

  // Executive Overview Box with Left Accent Strip
  const introText =
    'Unlike self-written website marketing claims ("we are committed to quality"), a Trade Heaven B2B Trust Certificate (Serial: THC-TRUST-2026-XXXX) provides objective third-party evaluator proof that a company\'s quality management systems, data security controls, country-specific government legal registration, physical operations, and buyer fulfillment history have been independently verified.';
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  const introLines = doc.splitTextToSize(introText, contentW - 10);
  const introBoxH = 8.5 + introLines.length * 3.5 + 2.5;

  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(148, 163, 184);
  doc.roundedRect(margin, y, contentW, introBoxH, 1.8, 1.8, 'FD');
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y + 2, 2, introBoxH - 4, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text('What a Trade Heaven B2B Trust Certificate Shows & Proves', margin + 5, y + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(51, 65, 85);
  doc.text(introLines, margin + 5, y + 10);

  y += introBoxH + 4.5;

  // Section 1: The 5 Core Independent Verification Pillars
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 18, 5, 1, 1, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SECTION 01', margin + 9, y + 3.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('The 5 Core Independent Verification Pillars', margin + 21, y + 3.8);
  y += 7;

  const pillars = [
    {
      num: '01',
      title: 'Verified Quality & Management Systems',
      tag: 'ISO 9001:2015 · SIX SIGMA · SGS/TUV',
      body: 'Confirms repeatable, documented quality control processes, calibrated production lines, IQC/IPQC/OQC inspection logs, and AQL 1.5/2.5 pre-shipment assay readiness.'
    },
    {
      num: '02',
      title: 'Information Security & Trade Data Protection',
      tag: 'SOC 2 TYPE I/II · ISO/IEC 27001',
      body: 'Proves independent auditors tested and confirmed safe information security, encrypted Proforma Invoices & L/C documents, and verified corporate bank account controls.'
    },
    {
      num: '03',
      title: 'Country-Specific Legal & Sovereign Government Compliance',
      tag: 'INDIA GST/IEC · GLOBAL EIN/VAT/EORI',
      body: 'Because GST applies ONLY in India, Trade Heaven checks the official government documents of the company\'s specific country: GSTIN & DGFT IEC in India; IRS EIN & State Incorporation in USA; VAT & EORI in UK/EU; ABN in Australia; FTA TRN & Trade License in UAE; or 18-digit USCC in China.'
    },
    {
      num: '04',
      title: 'Operational Integrity & Third-Party Evaluator Proof',
      tag: 'ON-SITE PLANT & WAREHOUSE ASSAY',
      body: 'Acts as objective evaluator proof verifying physical factory/warehouse premises, production capacity, and past 12-month customs Bill of Lading export history.'
    },
    {
      num: '05',
      title: 'Performance & Verified Buyer Satisfaction',
      tag: 'VERIFIED B/L · G2 & BUYER SIGNALS',
      body: 'Validates real-world B2B contract execution through authenticated post-settlement buyer reviews, on-time container dispatch rates (>96%), and zero-dispute escrow history.'
    }
  ];

  for (const p of pillars) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.7);
    const bodyLines = doc.splitTextToSize(p.body, contentW - 18);
    const boxH = Math.max(14, 7 + bodyLines.length * 3.4 + 2.2);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, boxH, 1.5, 1.5, 'FD');

    // Number badge
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 2.5, y + 2.5, 8.5, 8.5, 1.2, 1.2, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    doc.text(p.num, margin + 6.75, y + 7.9, { align: 'center' });

    // Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.6);
    doc.text(p.title, margin + 13.5, y + 5.3);

    // Right Standard Tag Pill
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    const tagW = doc.getTextWidth(p.tag) * 0.75 + 6;
    doc.roundedRect(pageW - margin - tagW - 2.5, y + 1.8, tagW, 4.6, 1, 1, 'FD');
    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6);
    doc.text(p.tag, pageW - margin - 2.5 - tagW / 2, y + 4.8, { align: 'center' });

    // Body
    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.7);
    doc.text(bodyLines, margin + 13.5, y + 9.4);

    y += boxH + 2.2;
  }

  y += 2;

  // Section 2: Commercial Features & Benefits for Suppliers & Buyers
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 18, 5, 1, 1, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SECTION 02', margin + 9, y + 3.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Key Commercial Features & Benefits for Suppliers and Buyers', margin + 21, y + 3.8);
  y += 7;

  const colW = (contentW - 4) / 2;
  const supBenefits = [
    '• Live searchable Trust Certificate serial (THC-TRUST-2026-XXXX) on company profile.',
    '• Accelerates enterprise buyer procurement and KYC onboarding from weeks to minutes.',
    '• Priority top-tier placement across Trade Heaven directory & global RFQ matching.',
    '• High-resolution QR-verifiable PDF certificate for Proforma Invoices & tenders.',
    '• Full eligibility for Trade Heaven ACID Escrow & Direct-Loss Assurance coverage.'
  ];
  const buyBenefits = [
    '• Eliminates shell intermediaries by matching legal entity & corporate bank account.',
    '• Confirms country-specific sovereign government tax and export license standing.',
    '• Verifies ISO 9001 quality control and SOC 2 / ISO 27001 data security compliance.',
    '• Provides objective third-party audit proof before wiring container deposits.',
    '• Instant online serial verification on the official Trade Heaven Compliance Registry.'
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  const supWrapped = supBenefits.map(item => doc.splitTextToSize(item, colW - 7));
  const buyWrapped = buyBenefits.map(item => doc.splitTextToSize(item, colW - 7));

  const supTotalLines = supWrapped.reduce((acc, l) => acc + l.length, 0);
  const buyTotalLines = buyWrapped.reduce((acc, l) => acc + l.length, 0);
  const maxLines = Math.max(supTotalLines, buyTotalLines);
  const benefitBoxH = 11.5 + maxLines * 3.4 + supBenefits.length * 1.3 + 2.5;

  // Left Card: Suppliers
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.roundedRect(margin, y, colW, benefitBoxH, 1.8, 1.8, 'FD');

  doc.setFillColor(6, 95, 70);
  doc.roundedRect(margin, y, colW, 7, 1.8, 1.8, 'F');
  doc.rect(margin, y + 4, colW, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('For Verified Suppliers & Exporters', margin + 3.5, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(20, 83, 45);
  let sy = y + 11.2;
  for (const lines of supWrapped) {
    doc.text(lines, margin + 3.5, sy);
    sy += lines.length * 3.4 + 1.3;
  }

  // Right Card: Buyers
  const rightX = margin + colW + 4;
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(rightX, y, colW, benefitBoxH, 1.8, 1.8, 'FD');

  doc.setFillColor(30, 58, 138);
  doc.roundedRect(rightX, y, colW, 7, 1.8, 1.8, 'F');
  doc.rect(rightX, y + 4, colW, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text('For Global Buyers & Procurement Teams', rightX + 3.5, y + 4.8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.6);
  doc.setTextColor(30, 64, 175);
  let by = y + 11.2;
  for (const lines of buyWrapped) {
    doc.text(lines, rightX + 3.5, by);
    by += lines.length * 3.4 + 1.3;
  }

  drawExecutivePdfFooter(
    doc,
    'Trade Heaven (Tradeheaven ECOM Solution LLP)  |  Official B2B Trust Certificate Registry: www.tradeheaven.net',
    'Features & Benefits Brochure'
  );
}

function renderHowToApplyPageContent(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;

  drawExecutivePdfHeader(
    doc,
    'OFFICIAL CORPORATE BANK REMITTANCE & EMAIL APPLICATION PROTOCOL',
    'How to Apply & Pay the $1,950 USD Fee (7-Day Process)',
    'Strictly Remitted from Applying Company Corporate Bank Account  |  Application Desk: help@tradeheaven.net',
    'OFFICIAL AUDIT FEE',
    '$1,950.00 USD',
    '7-Day Complete Process'
  );

  let y = 39;

  // 3-Column KPI Strip
  const kpiGap = 3.5;
  const kpiW = (contentW - kpiGap * 2) / 3;
  const kpis = [
    {
      label: 'CERTIFICATION & AUDIT FEE',
      value: '$1,950.00 USD',
      sub: 'Paid via Applying Company Bank Account',
      accent: [245, 158, 11] as [number, number, number]
    },
    {
      label: 'COMPLETE PROCESS TIME',
      value: '7 Calendar Days',
      sub: 'End-to-End Audit & Certificate Issuance',
      accent: [16, 185, 129] as [number, number, number]
    },
    {
      label: 'OFFICIAL APPLICATION DESK',
      value: 'help@tradeheaven.net',
      sub: 'CC: compliance@tradeheaven.net',
      accent: [37, 99, 235] as [number, number, number]
    }
  ];

  kpis.forEach((k, idx) => {
    const kx = margin + idx * (kpiW + kpiGap);
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(kx, y, kpiW, 14.5, 1.8, 1.8, 'FD');

    doc.setFillColor(k.accent[0], k.accent[1], k.accent[2]);
    doc.rect(kx, y + 2, 1.6, 10.5, 'F');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.2);
    doc.text(k.label, kx + 4, y + 4.3);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.4);
    doc.text(k.value, kx + 4, y + 9.4);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text(k.sub, kx + 4, y + 13.1);
  });

  y += 18;

  // Mandatory Corporate Bank Account Compliance Callout
  const ruleItems = [
    '1. Official Certification & Audit Fee ($1,950.00 USD): Covers the complete 5-pillar third-party evaluation, country-specific sovereign government registry check, and 12-month B2B Trust Certificate issuance.',
    '2. Mandatory Corporate Bank Account Rule: The $1,950.00 USD wire MUST originate strictly from a corporate bank account registered in the exact legal name of the applying company. Personal or third-party wires are rejected.'
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.7);
  const wrappedRules = ruleItems.map(r => doc.splitTextToSize(r, contentW - 10));
  const ruleLinesCount = wrappedRules.reduce((acc, l) => acc + l.length, 0);
  const ruleBoxH = 8.5 + ruleLinesCount * 3.4 + 3.2;

  doc.setFillColor(255, 251, 235);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentW, ruleBoxH, 1.8, 1.8, 'FD');
  doc.setFillColor(217, 119, 6);
  doc.rect(margin, y + 2, 2.2, ruleBoxH - 4, 'F');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.2);
  doc.text(
    'MANDATORY COMPLIANCE RULE: $1,950.00 USD FEE MUST BE PAID FROM APPLYING COMPANY BANK ACCOUNT',
    margin + 5,
    y + 5.4
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.7);
  doc.setTextColor(120, 53, 15);
  let ry = y + 9.6;
  for (const lines of wrappedRules) {
    doc.text(lines, margin + 5, ry);
    ry += lines.length * 3.4 + 1.2;
  }

  y += ruleBoxH + 4.5;

  // STEP 1: Remit $1,950.00 USD to Trade Heaven Corporate Bank Account
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 16, 5, 1, 1, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('STEP 01', margin + 8, y + 3.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.text('Remit $1,950.00 USD to Trade Heaven Official Corporate Bank Account', margin + 19, y + 3.8);
  y += 6.5;

  const cleanBankAddress = OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress.includes(
    OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry
  )
    ? OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress
    : `${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryAddress}, ${OFFICIAL_SWIFT_BANK_DETAILS.beneficiaryBankCountry}`;

  const bankRows: [string, string][] = [
    ['Beneficiary Account Name', OFFICIAL_SWIFT_BANK_DETAILS.accountHolderName],
    ['Certification Fee Amount', '$1,950.00 USD (Strictly from Applying Company Corporate Bank Account)'],
    ['Payment Method', 'SWIFT MT103 International Corporate Wire / SEPA Corporate Transfer'],
    ['IBAN / Account Number', OFFICIAL_SWIFT_BANK_DETAILS.iban],
    ['BIC / SWIFT Code', OFFICIAL_SWIFT_BANK_DETAILS.bicSwift],
    ['Receiving Bank Name', OFFICIAL_SWIFT_BANK_DETAILS.bankName],
    ['Beneficiary Bank Address', cleanBankAddress],
    ['Mandatory Wire Remark', 'DO NOT CONVERT TO GBP - B2B TRUST CERT [Your Legal Company Name]']
  ];

  const labelColW = 52;
  const valColW = contentW - labelColW;
  const headerH = 6.2;

  // Pre-calculate wrapped lines for every row so nothing ever overflows
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  const preparedRows = bankRows.map(([label, val]) => {
    const wrappedVal = doc.splitTextToSize(String(val), valColW - 7);
    const rH = Math.max(5.8, wrappedVal.length * 3.5 + 2.3);
    return { label, wrappedVal, rH };
  });

  const totalRowsH = preparedRows.reduce((acc, r) => acc + r.rH, 0);
  const totalTableH = headerH + totalRowsH;

  // Outer table container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentW, totalTableH, 1.8, 1.8, 'FD');

  // Table Header Bar
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentW, headerH, 1.8, 1.8, 'F');
  doc.rect(margin, y + 3, contentW, headerH - 3, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('BANKING PARAMETER', margin + 4, y + 4.2);
  doc.text('OFFICIAL WIRE COORDINATE (SWIFT MT103)', margin + labelColW + 4, y + 4.2);

  let rowCursorY = y + headerH;
  preparedRows.forEach((row, idx) => {
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin + 0.5, rowCursorY, contentW - 1, row.rH, 'F');
    }
    if (idx > 0) {
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(margin, rowCursorY, margin + contentW, rowCursorY);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.setTextColor(71, 85, 105);
    doc.text(row.label, margin + 4, rowCursorY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.8);
    if (row.label === 'Certification Fee Amount') {
      doc.setTextColor(180, 83, 9);
    } else if (row.label === 'IBAN / Account Number' || row.label === 'BIC / SWIFT Code') {
      doc.setTextColor(30, 64, 175);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text(row.wrappedVal, margin + labelColW + 4, rowCursorY + 4);

    rowCursorY += row.rH;
  });

  // Vertical divider line between label and value columns
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.line(margin + labelColW, y + headerH, margin + labelColW, y + totalTableH);

  y += totalTableH + 5;

  // STEP 2: Submit Your Application & Wire Proof to Trade Heaven Official Emails
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 16, 5, 1, 1, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('STEP 02', margin + 8, y + 3.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.text('Apply on Trade Heaven Official Emails with Required Compliance Dossier', margin + 19, y + 3.8);
  y += 6.5;

  // Official Email Coordinates Banner
  const emailBarH = 12.5;
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, y, contentW, emailBarH, 1.8, 1.8, 'F');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.8);
  doc.text(
    'To:  help@tradeheaven.net     |     CC (Compliance Desk):  compliance@tradeheaven.net',
    margin + 4,
    y + 4.8
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text(
    'Subject Line:  B2B Trust Certificate Application - [Your Legal Company Name] - $1,950 USD Wire Attached',
    margin + 4,
    y + 9.8
  );

  y += emailBarH + 2.8;

  // 2x2 Grid of Required Dossier Attachments
  const cardGap = 3.5;
  const cardW = (contentW - cardGap) / 2;
  const dossierCards = [
    {
      num: '01',
      title: '$1,950 USD Corporate Wire Receipt',
      desc: 'Attach the official SWIFT MT103 / Wire Transfer slip showing the $1,950.00 USD fee remitted from your applying company\'s corporate bank account.'
    },
    {
      num: '02',
      title: 'Country-Specific Government Document',
      desc: 'India: GST Certificate (GSTIN) & DGFT IEC. Outside India: Home-country government registration (USA EIN, UK/EU VAT & EORI, ABN, UAE TRN, China USCC).'
    },
    {
      num: '03',
      title: 'Quality & Data Security Credentials',
      desc: 'Attach ISO 9001 / Six Sigma quality control certificates, SOC 2 / ISO 27001 security records (or internal QC SOPs), and pre-shipment assay logs.'
    },
    {
      num: '04',
      title: 'Bank Ownership & Signatory KYC',
      desc: 'Attach a voided corporate check or bank comfort letter confirming company bank account ownership, plus authorized signatory contact details.'
    }
  ];

  for (let rowIdx = 0; rowIdx < 2; rowIdx++) {
    const c1 = dossierCards[rowIdx * 2];
    const c2 = dossierCards[rowIdx * 2 + 1];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.3);
    const lines1 = doc.splitTextToSize(c1.desc, cardW - 14);
    const lines2 = doc.splitTextToSize(c2.desc, cardW - 14);
    const maxCardLines = Math.max(lines1.length, lines2.length);
    const cardH = 6.8 + maxCardLines * 3.3 + 2.2;

    [
      { card: c1, lines: lines1, cx: margin },
      { card: c2, lines: lines2, cx: margin + cardW + cardGap }
    ].forEach(({ card, lines, cx }) => {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.roundedRect(cx, y, cardW, cardH, 1.5, 1.5, 'FD');

      doc.setFillColor(15, 23, 42);
      doc.roundedRect(cx + 2.2, y + 2.2, 7.5, 7.5, 1, 1, 'F');
      doc.setTextColor(251, 191, 36);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.text(card.num, cx + 5.95, y + 7.1, { align: 'center' });

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(card.title, cx + 11.5, y + 5.1);

      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.3);
      doc.text(lines, cx + 11.5, y + 9);
    });

    y += cardH + 2.5;
  }

  y += 2.5;

  // STEP 3: 7-Day Complete Verification, Audit & Certificate Issuance Schedule (4-Column Horizontal Cards)
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, 16, 5, 1, 1, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('STEP 03', margin + 8, y + 3.5, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.8);
  doc.text('7-Day Complete Verification, Audit & Certificate Issuance Schedule', margin + 19, y + 3.8);
  y += 6.5;

  const stepGap = 3;
  const stepW = (contentW - stepGap * 3) / 4;
  const timelineSteps = [
    {
      days: 'DAYS 1 – 2',
      title: 'Bank & Sovereign Govt. Check',
      desc: 'Verify $1,950 USD corporate wire & check country-specific government documents (GST/IEC in India; EIN, VAT, EORI, ABN, TRN, USCC globally).'
    },
    {
      days: 'DAYS 3 – 4',
      title: 'Quality & Security Audit',
      desc: 'Inspect ISO 9001 quality management SOPs, batch inspection logs, and SOC 2 / ISO 27001 trade data & banking security controls.'
    },
    {
      days: 'DAYS 5 – 6',
      title: 'Evaluator & Buyer Review',
      desc: 'Third-party review of physical factory/warehouse capability, past 12-month Bill of Lading export records, and buyer satisfaction.'
    },
    {
      days: 'DAY 7',
      title: 'Certificate & Seal Issuance',
      desc: 'Signed B2B Trust Certificate PDF (THC-TRUST-2026-XXXX) is issued via email and indexed live on the Trade Heaven Registry.'
    }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.1);
  const wrappedSteps = timelineSteps.map(s => ({
    ...s,
    lines: doc.splitTextToSize(s.desc, stepW - 5)
  }));
  const maxStepLines = Math.max(...wrappedSteps.map(s => s.lines.length));
  const stepCardH = 12 + maxStepLines * 3.2 + 2.5;

  wrappedSteps.forEach((step, idx) => {
    const sx = margin + idx * (stepW + stepGap);
    const isFinal = idx === 3;

    doc.setFillColor(isFinal ? 240 : 248, isFinal ? 253 : 250, isFinal ? 244 : 252);
    doc.setDrawColor(isFinal ? 16 : 203, isFinal ? 185 : 213, isFinal ? 129 : 225);
    doc.setLineWidth(0.3);
    doc.roundedRect(sx, y, stepW, stepCardH, 1.5, 1.5, 'FD');

    // Top Header Band inside Milestone Card
    doc.setFillColor(15, 23, 42);
    doc.roundedRect(sx, y, stepW, 5.8, 1.5, 1.5, 'F');
    doc.rect(sx, y + 3, stepW, 2.8, 'F');
    doc.setTextColor(isFinal ? 110 : 251, isFinal ? 231 : 191, isFinal ? 183 : 36);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(step.days, sx + stepW / 2, y + 4.1, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.6);
    doc.text(step.title, sx + 2.5, y + 10);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.1);
    doc.text(step.lines, sx + 2.5, y + 13.8);
  });

  drawExecutivePdfFooter(
    doc,
    'Apply via Email: help@tradeheaven.net (CC: compliance@tradeheaven.net)  |  Fee: $1,950.00 USD  |  7-Day Turnaround',
    'How to Apply & Fee Guide'
  );
}

export function generateB2BTrustCertificateBrochurePDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  renderFeaturesPageContent(doc);
  doc.addPage();
  renderHowToApplyPageContent(doc);

  triggerPdfDownload(doc, 'TradeHeaven-B2B-Trust-Certificate-Official-Brochure.pdf');
}

export function generateB2BTrustCertificateFeaturesPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  renderFeaturesPageContent(doc);
  triggerPdfDownload(doc, 'TradeHeaven-B2B-Trust-Certificate-Features-and-Benefits.pdf');
}

export function generateB2BTrustCertificateHowToApplyPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  renderHowToApplyPageContent(doc);
  triggerPdfDownload(doc, 'TradeHeaven-B2B-Trust-Certificate-How-To-Apply-Guide.pdf');
}

export const B2BTrustCertificatePage: React.FC<B2BTrustCertificatePageProps> = ({
  onNavigate
}) => {
  return (
    <article
      id="b2b-trust-certificate-dedicated-page"
      className="max-w-[1440px] mx-auto space-y-10 pb-16 text-slate-900"
    >
      {/* 2. THE 5 CORE PILLARS OF THE B2B TRUST CERTIFICATE (INCLUDING COUNTRY-SPECIFIC GOVT. DOCS) */}
      <B2BTrustCertificatePillarsSection
        onVerifyClick={() => {
          if (onNavigate) {
            onNavigate('TRADE_ASSURANCE_CERTIFICATE');
          }
        }}
        onApplyClick={() => {
          const el = document.getElementById('official-brochure-download-section');
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
              Once your applying company remits the certification fee from its corporate bank account and submits the compliance dossier via email, our third-party evaluation desk completes the entire audit in <strong>7 days</strong>.
            </p>
          </div>
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
                We verify that the corporate wire originated strictly from the applying company&apos;s own corporate bank account, and cross-check the company&apos;s official government documents of its specific country (GST/IEC in India; EIN, VAT/EORI, ABN, TRN, or USCC outside India).
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

      {/* 5. SINGLE OFFICIAL BROCHURE DOWNLOAD SECTION (ONE FOR FEATURES, ONE FOR HOW TO APPLY) */}
      <section
        id="official-brochure-download-section"
        className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 lg:p-12 space-y-6 shadow-2xs"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-1.5 max-w-3xl">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Official Executive PDF Dossiers (A4 Printable)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Official Brochures: Features &amp; Benefits and How to Apply
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Download the official PDF guides below—one explaining the verification features &amp; benefits, and one detailing how to apply and remit the certification fee via your company bank account.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => generateB2BTrustCertificateFeaturesPDF()}
              className="px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <FileDown className="w-4 h-4 text-amber-400" />
              <span>Download Features &amp; Benefits PDF</span>
            </button>

            <button
              type="button"
              onClick={() => generateB2BTrustCertificateHowToApplyPDF()}
              className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-md"
            >
              <FileDown className="w-4 h-4" />
              <span>Download How to Apply PDF</span>
            </button>
          </div>
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
              How to Pay the Certification Fee via Company Bank Account
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Contains the complete certification fee schedule, SWIFT / IBAN wire coordinates for <strong>TRADEHEAVEN ECOM SOLUTION LLP</strong>, the mandatory corporate bank account matching rule, and instructions for attaching your SWIFT MT103 slip.
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
