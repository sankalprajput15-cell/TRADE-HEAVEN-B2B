import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { FileDown, Check, Loader2 } from 'lucide-react';
import { PaymentCheckoutData, Currency } from '../../types';
import type { TradeAssuranceCertificateRecord } from '../services/TradeAssuranceCertificateView';

function triggerSafePdfDownload(doc: jsPDF, filename: string) {
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

export interface PaymentReceiptPdfData {
  receiptId?: string;
  orderId?: string;
  issuedAt?: string;
  title: string;
  description?: string;
  type?: string;
  amountUsd: number;
  convertedAmountFormatted?: string;
  currency?: Currency | string;
  billingName?: string;
  companyName?: string;
  clientEmail?: string;
  clientPhone?: string;
  paymentMethod?: string;
  wireTxRef?: string;
  status?: 'PAID' | 'PENDING' | 'ESCROW_LOCKED' | string;
  notes?: string;
}

export interface ExportToPDFProps {
  mode: 'CERTIFICATE' | 'PAYMENT_RECEIPT' | 'BROCHURE';
  certificateData?: TradeAssuranceCertificateRecord | null;
  receiptData?: PaymentReceiptPdfData | null;
  checkoutData?: PaymentCheckoutData | null;
  selectedCurrency?: Currency | string;
  formattedCoverageLimit?: string;
  buttonLabel?: string;
  variant?: 'primary' | 'secondary' | 'emerald' | 'outline';
  className?: string;
  openPrintDialog?: boolean;
  recipientRole?: 'SUPPLIER' | 'BUYER' | 'BOTH';
  recipientCompany?: string;
}

export const generateCertificatePDF = (
  cert: TradeAssuranceCertificateRecord,
  options?: {
    selectedCurrency?: string;
    formattedCoverageLimit?: string;
    openPrintDialog?: boolean;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const centerX = pageWidth / 2;

  const serialNo = cert.certificateNumber || cert.serialNumber || 'THC-2026-VERIFIED';
  const holderName = cert.holder || cert.companyName || 'Verified Corporate Entity';
  const usdFormatted = `USD $${(Number(cert.coverageLimitUsd) || 1100000).toLocaleString()}.00`;
  const primaryLimitDisplay = options?.formattedCoverageLimit
    ? `${usdFormatted}  (${options.formattedCoverageLimit} ${options.selectedCurrency || 'USD'})`
    : `${usdFormatted}   (VERIFIED CUSTODIAL INDEMNITY LIMIT)`;

  const drawClassicSovereignFrame = (pageNum: number) => {
    doc.setFillColor(252, 249, 242);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setDrawColor(18, 32, 56);
    doc.setLineWidth(1.3);
    doc.rect(8.5, 8.5, pageWidth - 17, pageHeight - 17);

    doc.setDrawColor(180, 138, 62);
    doc.setLineWidth(0.65);
    doc.rect(10.8, 10.8, pageWidth - 21.6, pageHeight - 21.6);

    doc.setDrawColor(18, 32, 56);
    doc.setLineWidth(0.25);
    doc.rect(12.3, 12.3, pageWidth - 24.6, pageHeight - 24.6);

    const corners = [
      { x: 12.3, y: 12.3, dx: 1, dy: 1 },
      { x: pageWidth - 12.3, y: 12.3, dx: -1, dy: 1 },
      { x: 12.3, y: pageHeight - 12.3, dx: 1, dy: -1 },
      { x: pageWidth - 12.3, y: pageHeight - 12.3, dx: -1, dy: -1 }
    ];
    corners.forEach(c => {
      doc.setDrawColor(180, 138, 62);
      doc.setLineWidth(0.45);
      doc.rect(
        c.dx > 0 ? c.x + 0.8 : c.x - 4.8,
        c.dy > 0 ? c.y + 0.8 : c.y - 4.8,
        4,
        4
      );
      doc.setFillColor(180, 138, 62);
      doc.circle(c.x + c.dx * 2.8, c.y + c.dy * 2.8, 0.7, 'F');
    });

    doc.setTextColor(140, 102, 34);
    doc.setFont('times', 'bold');
    doc.setFontSize(7.5);
    doc.text(
      'TRADEHEAVEN ECOM SOLUTION LLP   •   LONDON   •   SINGAPORE   •   SYDNEY   •   NEW DELHI',
      centerX,
      18.5,
      { align: 'center' }
    );

    doc.setDrawColor(180, 138, 62);
    doc.setLineWidth(0.4);
    doc.line(34, 24.5, centerX - 9, 24.5);
    doc.line(centerX + 9, 24.5, pageWidth - 34, 24.5);
    doc.setLineWidth(0.2);
    doc.line(44, 25.7, centerX - 9, 25.7);
    doc.line(centerX + 9, 25.7, pageWidth - 44, 25.7);

    doc.setFillColor(18, 32, 56);
    doc.setDrawColor(180, 138, 62);
    doc.setLineWidth(0.5);
    doc.circle(centerX, 24.8, 4.6, 'FD');
    doc.setDrawColor(234, 198, 118);
    doc.setLineWidth(0.25);
    doc.circle(centerX, 24.8, 3.6, 'D');
    doc.setTextColor(246, 216, 140);
    doc.setFont('times', 'bold');
    doc.setFontSize(6.5);
    doc.text('TH', centerX, 25.6, { align: 'center' });

    if (pageNum === 1) {
      doc.setTextColor(55, 65, 81);
      doc.setFont('times', 'normal');
      doc.setFontSize(7.8);
      doc.text(
        'GLOBAL CUSTODIAL ESCROW, COMMODITY BROKERAGE & LOSS-ONLY INDEMNITY REGISTRY',
        centerX,
        33,
        { align: 'center' }
      );
    }
  };

  // =========================================================================
  // PAGE 1: CLASSIC SOVEREIGN CERTIFICATE OF TRADE ASSURANCE
  // =========================================================================
  drawClassicSovereignFrame(1);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(21);
  doc.text('CERTIFICATE OF TRADE ASSURANCE', centerX, 41.5, { align: 'center' });

  doc.setTextColor(146, 98, 24);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(11.5);
  doc.text('& Direct Actual-Loss-Only Insurance Indenture', centerX, 47.5, { align: 'center' });

  // Credential Ribbon Bar
  doc.setFillColor(245, 239, 224);
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.45);
  doc.rect(margin, 51, contentWidth, 9.5, 'FD');
  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.2);
  doc.rect(margin + 0.7, 51.7, contentWidth - 1.4, 8.1, 'D');

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.2);
  doc.text(`SERIAL NO: ${serialNo}`, margin + 3.5, 57);

  doc.setTextColor(14, 92, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(8);
  const statusText =
    cert.status === 'ACTIVE_VERIFIED'
      ? '•  OFFICIAL VERIFIED CREDENTIAL  •'
      : `•  STATUS: ${cert.status}  •`;
  doc.text(statusText, centerX, 57, { align: 'center' });

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.2);
  doc.text(`VAULT ID: ${cert.escrowVaultId || 'TH-VAULT-VERIFIED'}`, pageWidth - margin - 3.5, 57, {
    align: 'right'
  });

  // Formal Proclamation
  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.text(
    'This Official Instrument of Sovereign Assurance Witnesseth and Certifies That',
    centerX,
    67,
    { align: 'center' }
  );

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(17.5);
  doc.text(cert.companyName.substring(0, 52), centerX, 75, { align: 'center' });

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.45);
  doc.line(38, 77.5, pageWidth - 38, 77.5);

  doc.setTextColor(30, 41, 59);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(9.8);
  doc.text(`Authorized Holder / Principal Signatory: ${holderName}`, centerX, 83, {
    align: 'center'
  });

  doc.setTextColor(60, 70, 85);
  doc.setFont('times', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    `Jurisdiction: ${cert.country}   |   Corporate Registration: ${cert.legalRegistrationNumber}   |   Tax/GST: ${cert.taxOrVatId}`,
    centerX,
    88.2,
    { align: 'center' }
  );

  doc.setTextColor(55, 65, 81);
  doc.setFont('times', 'italic');
  doc.setFontSize(8.6);
  doc.text(
    'is duly admitted to the Trade Heaven Custodial Escrow & Loss-Only Indemnity Registry for:',
    centerX,
    93.5,
    { align: 'center' }
  );

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.2);
  doc.text(cert.businessType.substring(0, 76), centerX, 98.5, { align: 'center' });

  // Sovereign Indemnity Sum Plaque
  const plaqueY = 102;
  doc.setFillColor(246, 240, 225);
  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.6);
  doc.rect(margin, plaqueY, contentWidth, 18.5, 'FD');
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.3);
  doc.rect(margin + 1, plaqueY + 1, contentWidth - 2, 16.5, 'D');

  doc.setTextColor(140, 102, 34);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.6);
  doc.text(
    'MAXIMUM GUARANTEED CUSTODIAL ESCROW & ACTUAL-LOSS INDEMNITY COVERAGE LIMIT',
    centerX,
    plaqueY + 5.2,
    { align: 'center' }
  );

  doc.setTextColor(14, 92, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(11.5);
  doc.text(primaryLimitDisplay, centerX, plaqueY + 11.5, { align: 'center' });

  doc.setTextColor(124, 45, 18);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.6);
  doc.text(
    'Strictly Payable for Proven, Documented Direct Actual Financial or Cargo Losses Only — Zero Uncertain or Speculative Claims',
    centerX,
    plaqueY + 16.2,
    { align: 'center' }
  );

  // Classic Engraved 2-Column Ledger Table
  const tableY = 124;
  const colW = contentWidth / 2;
  const rowH = 12;

  const ledgerRows = [
    [
      {
        label: 'CORPORATE REGISTRATION & TAX IDENTIFIERS',
        value: `Reg: ${cert.legalRegistrationNumber}  |  Tax: ${cert.taxOrVatId}`
      },
      {
        label: 'GLOBAL D-U-N-S & REGISTRY CLASSIFICATION',
        value: `D-U-N-S: ${cert.dunsNumber || 'Verified'}  |  Class: ${cert.tierCode}`
      }
    ],
    [
      {
        label: 'UNDERWRITING & CERTIFICATION TIER',
        value: cert.tierTitle || 'VIP Sovereign Trade Assurance'
      },
      {
        label: 'INDEPENDENT AUDITING & SURVEY AUTHORITY',
        value: cert.auditingBody || 'SGS S.A. & Trade Heaven Custodial Underwriting'
      }
    ],
    [
      {
        label: 'DESIGNATED CUSTODIAL ESCROW VAULT',
        value: `Vault ID: ${cert.escrowVaultId} (Regulated Custodial Rails)`
      },
      {
        label: 'APPROVED INCOTERMS 2020 & QUALITY STANDARDS',
        value: `${(cert.supportedIncoterms || []).join(', ')}  |  ${(cert.isoStandards || []).slice(0, 2).join(', ')}`
      }
    ],
    [
      {
        label: 'EFFECTIVE ISSUE DATE',
        value: cert.issueDate
      },
      {
        label: 'EXPIRATION & ANNUAL RENEWAL DATE',
        value: cert.expiryDate
      }
    ]
  ];

  ledgerRows.forEach((pair, rIdx) => {
    const rY = tableY + rIdx * rowH;
    pair.forEach((cell, cIdx) => {
      const cX = margin + cIdx * colW;
      doc.setFillColor(
        rIdx % 2 === 0 ? 252 : 247,
        rIdx % 2 === 0 ? 249 : 242,
        rIdx % 2 === 0 ? 242 : 230
      );
      doc.setDrawColor(180, 138, 62);
      doc.setLineWidth(0.35);
      doc.rect(cX, rY, colW, rowH, 'FD');

      doc.setTextColor(120, 88, 32);
      doc.setFont('times', 'bold');
      doc.setFontSize(6.8);
      doc.text(cell.label, cX + 3, rY + 4.3);

      doc.setTextColor(15, 28, 52);
      doc.setFont('times', 'bold');
      doc.setFontSize(8.3);
      const fitted = doc.splitTextToSize(cell.value, colW - 6);
      doc.text(fitted[0], cX + 3, rY + 9.3);
    });
  });

  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.5);
  doc.rect(margin, tableY, contentWidth, rowH * 4, 'D');

  // Mandatory Underwriting Covenant Box
  const covenantY = 175.5;
  const covenantH = 44;
  doc.setFillColor(250, 244, 229);
  doc.setDrawColor(146, 64, 14);
  doc.setLineWidth(0.6);
  doc.rect(margin, covenantY, contentWidth, covenantH, 'FD');
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.rect(margin + 1, covenantY + 1, contentWidth - 2, covenantH - 2, 'D');

  doc.setTextColor(124, 45, 18);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.4);
  doc.text(
    'MANDATORY UNDERWRITING COVENANT: COVERS VERIFIED ACTUAL LOSSES ONLY — NO UNCERTAIN CLAIMS',
    centerX,
    covenantY + 5.5,
    { align: 'center' }
  );

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.3);
  doc.line(margin + 6, covenantY + 7.2, pageWidth - margin - 6, covenantY + 7.2);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.9);
  const covClause1 =
    '1. COVERAGE LIMITED STRICTLY TO VERIFIED ACTUAL LOSSES: Insurance and Trade Assurance indemnity under this Certificate applies strictly and exclusively to direct, proven, and quantifiable actual financial or physical cargo losses (verified transit loss/damage, verified non-delivery/off-spec delivery of escrowed cargo, or confirmed intermediary settlement holds) evidenced by Custodial Escrow receipt, Clean Bill of Lading, and independent SGS, Bureau Veritas, Intertek, or Lloyd\'s survey reports.';
  doc.text(doc.splitTextToSize(covClause1, contentWidth - 8), margin + 4, covenantY + 11.5);

  doc.setTextColor(136, 19, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.9);
  const covClause2 =
    '2. STRICT EXCLUSION OF UNCERTAIN, SPECULATIVE & OFF-RECORD CLAIMS: This Certificate does NOT cover, and Trade Heaven Underwriting strictly rejects, any uncertain, unverified, speculative, contingent, indirect, consequential, lost-profit, market-price fluctuation, currency-shift, or unsubstantiated claims, as well as any off-platform dealings conducted outside Export Manager supervision.';
  doc.text(doc.splitTextToSize(covClause2, contentWidth - 8), margin + 4, covenantY + 27.5);

  // Signatures & Embossed Gold Seal
  const sigBaseY = 244;

  doc.setTextColor(22, 46, 88);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13.5);
  doc.text('A. V. Sterling', margin + 28, sigBaseY - 3, { align: 'center' });

  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.4);
  doc.line(margin + 2, sigBaseY, margin + 56, sigBaseY);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('Chief Underwriting Officer', margin + 29, sigBaseY + 4.5, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.text('Directorate of Sovereign Trade Assurance', margin + 29, sigBaseY + 8.5, {
    align: 'center'
  });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.2);
  doc.text('Tradeheaven ECOM Solution LLP', margin + 29, sigBaseY + 12.2, { align: 'center' });

  const sealX = centerX;
  const sealY = sigBaseY + 1;
  doc.setFillColor(248, 234, 190);
  doc.setDrawColor(168, 121, 42);
  doc.setLineWidth(0.9);
  doc.circle(sealX, sealY, 15, 'FD');

  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.45);
  doc.circle(sealX, sealY, 13.2, 'D');

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.3);
  doc.circle(sealX, sealY, 11.6, 'D');

  doc.setTextColor(140, 96, 24);
  doc.setFont('times', 'bold');
  doc.setFontSize(5.6);
  doc.text('• OFFICIAL SEAL •', sealX, sealY - 5.2, { align: 'center' });

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.2);
  doc.text('TRADE HEAVEN', sealX, sealY - 1, { align: 'center' });

  doc.setTextColor(14, 92, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(5.6);
  doc.text('VERIFIED ESCROW', sealX, sealY + 2.8, { align: 'center' });

  doc.setTextColor(140, 96, 24);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(5.6);
  doc.text('LOSS-ONLY • 2026', sealX, sealY + 6.4, { align: 'center' });

  doc.setTextColor(22, 46, 88);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(13.5);
  doc.text('R. K. Sharma', pageWidth - margin - 29, sigBaseY - 3, { align: 'center' });

  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.4);
  doc.line(pageWidth - margin - 56, sigBaseY, pageWidth - margin - 2, sigBaseY);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.5);
  doc.text('Registrar of Custodial Escrow', pageWidth - margin - 29, sigBaseY + 4.5, {
    align: 'center'
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.text('Global Indemnity & Bullion Settlement', pageWidth - margin - 29, sigBaseY + 8.5, {
    align: 'center'
  });
  doc.setFont('times', 'normal');
  doc.setFontSize(7.2);
  doc.text('Sydney • London • Singapore • New Delhi', pageWidth - margin - 29, sigBaseY + 12.2, {
    align: 'center'
  });

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.4);
  doc.line(margin, 265, pageWidth - margin, 265);

  doc.setTextColor(15, 28, 52);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.text(`REGISTRY HASH: ${cert.verificationHash}`, margin, 270);

  doc.setFont('times', 'italic');
  doc.setFontSize(7.5);
  doc.text(`Verify Online: www.tradeheaven.net/?serial=${serialNo}`, pageWidth - margin, 270, {
    align: 'right'
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.3);
  doc.text(
    'Issued by Tradeheaven ECOM Solution LLP   |   Underwriting Desk: help@tradeheaven.net   |   +91 8532934479',
    margin,
    275.2
  );

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.8);
  doc.text('Page 1 of 2', pageWidth - margin, 275.2, { align: 'right' });

  // =========================================================================
  // PAGE 2: CLASSIC INDENTURE SCHEDULE (ARTICLES I TO IV)
  // =========================================================================
  doc.addPage();
  drawClassicSovereignFrame(2);

  doc.setTextColor(146, 98, 24);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.2);
  doc.text(
    `ANNEXURE A TO CERTIFICATE NO. ${serialNo}   •   INDENTURE OF COVENANTS`,
    centerX,
    33,
    { align: 'center' }
  );

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('SCHEDULE OF LOSS-ONLY INSURANCE TERMS,', centerX, 39.5, { align: 'center' });
  doc.text('EXCLUSIONS & CLAIM SETTLEMENT PROTOCOL', centerX, 45.2, { align: 'center' });

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.45);
  doc.line(margin, 48.2, pageWidth - margin, 48.2);

  let p2y = 51.5;

  // Article I
  doc.setFillColor(248, 244, 233);
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.4);
  doc.rect(margin, p2y, contentWidth, 33, 'FD');

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.2);
  doc.text(
    'ARTICLE I — CERTIFIED PRINCIPAL HOLDER & CORPORATE IDENTIFICATION',
    margin + 4,
    p2y + 5.8
  );
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.line(margin + 4, p2y + 7.4, pageWidth - margin - 4, p2y + 7.4);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.1);
  doc.setTextColor(25, 35, 50);
  const sec1Lines = [
    `1. Certificate Serial Number: ${serialNo}   |   Registry Status: ${cert.status === 'ACTIVE_VERIFIED' ? 'ACTIVE & VERIFIED CREDENTIAL' : cert.status}`,
    `2. Certified Legal Entity: ${cert.companyName} (${cert.country})`,
    `3. Authorized Principal Signatory: ${holderName}`,
    `4. Corporate Identifiers: ${cert.legalRegistrationNumber}   |   GST/Tax ID: ${cert.taxOrVatId}   |   D-U-N-S: ${cert.dunsNumber || 'Verified'}`
  ];
  sec1Lines.forEach((line, i) => {
    doc.text(line, margin + 4, p2y + 13 + i * 5);
  });

  p2y += 36.5;

  // Article II
  doc.setFillColor(248, 244, 233);
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.4);
  doc.rect(margin, p2y, contentWidth, 33, 'FD');

  doc.setTextColor(14, 92, 58);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.2);
  doc.text(
    'ARTICLE II — CUSTODIAL ESCROW & LOSS-ONLY INDEMNITY COVERAGE SCHEDULE',
    margin + 4,
    p2y + 5.8
  );
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.line(margin + 4, p2y + 7.4, pageWidth - margin - 4, p2y + 7.4);

  doc.setFont('times', 'normal');
  doc.setFontSize(8.1);
  doc.setTextColor(25, 35, 50);
  const sec2Lines = [
    `1. Underwriting Classification: ${cert.tierTitle} (${cert.tierCode})`,
    `2. Maximum Guaranteed Escrow & Loss Indemnity Limit: ${usdFormatted}`,
    `3. Designated Custodial Escrow Vault ID: ${cert.escrowVaultId}`,
    `4. Approved Incoterms 2020: ${(cert.supportedIncoterms || []).join(', ')}   |   Effective Term: ${cert.issueDate} to ${cert.expiryDate}`
  ];
  sec2Lines.forEach((line, i) => {
    doc.text(line, margin + 4, p2y + 13 + i * 5);
  });

  p2y += 36.5;

  // Article III
  doc.setFillColor(251, 246, 232);
  doc.setDrawColor(146, 64, 14);
  doc.setLineWidth(0.6);
  doc.rect(margin, p2y, contentWidth, 86, 'FD');
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.rect(margin + 1, p2y + 1, contentWidth - 2, 84, 'D');

  doc.setTextColor(124, 45, 18);
  doc.setFont('times', 'bold');
  doc.setFontSize(9.2);
  doc.text(
    'ARTICLE III — STRICT UNDERWRITING MANDATE: ACTUAL LOSSES ONLY (NO UNCERTAIN CLAIMS)',
    margin + 4,
    p2y + 6.2
  );
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.line(margin + 4, p2y + 7.8, pageWidth - margin - 4, p2y + 7.8);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.4);
  doc.text(
    'Clause 3.1 — Indemnity Strictly Limited to Verified Direct Actual Losses Only:',
    margin + 4,
    p2y + 13
  );

  doc.setFont('times', 'normal');
  doc.setFontSize(7.9);
  const sec31 =
    'Insurance and Trade Assurance protection under this Certificate applies strictly and exclusively to direct, proven, and quantifiable actual financial or physical cargo losses sustained during an active, escrow-locked transaction on the Trade Heaven platform:\n' +
    '  (a) Verified physical loss, shortage, or transit damage to the insured commodity cargo during marine or inland carriage;\n' +
    `  (b) Verified non-delivery or off-specification delivery of cargo where buyer funds are locked in Custodial Vault ${cert.escrowVaultId};\n` +
    '  (c) Verified intermediary bank clearing or settlement holds within Trade Heaven regulated custodial payment rails.';
  doc.text(doc.splitTextToSize(sec31, contentWidth - 8), margin + 4, p2y + 17.8);

  doc.setTextColor(136, 19, 55);
  doc.setFont('times', 'bold');
  doc.setFontSize(8.4);
  doc.text(
    'Clause 3.2 — Categorical Exclusion of Uncertain, Speculative & Unsubstantiated Claims:',
    margin + 4,
    p2y + 42.5
  );

  doc.setFont('times', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(60, 20, 30);
  const sec32 =
    'This Certificate does NOT cover, and Trade Heaven Underwriting strictly rejects, any uncertain or non-actual claims:\n' +
    '  (i) Uncertain, Unverified, or Unsubstantiated Claims: Any claim lacking objective documentary proof, independent marine/laboratory inspection reports (SGS / Bureau Veritas / Intertek / TÜV), or verified custodial escrow ledger records;\n' +
    '  (ii) Speculative or Contingent Claims: Any claim based on projected, hypothetical, contingent, or future events;\n' +
    '  (iii) Indirect, Consequential, or Market Fluctuation Claims: Any claim for anticipated or lost profits, commodity spot-price fluctuations, currency exchange shifts, demurrage not backed by escrow terms, or reputational damages;\n' +
    '  (iv) Off-Record / Unmonitored Dealings: Any communication or transaction conducted outside Trade Heaven official recorded channels without the knowledge and supervision of the assigned Export Manager voids coverage and terminates services immediately.';
  doc.text(doc.splitTextToSize(sec32, contentWidth - 8), margin + 4, p2y + 47.3);

  p2y += 89.5;

  // Article IV
  doc.setFillColor(248, 244, 233);
  doc.setDrawColor(18, 32, 56);
  doc.setLineWidth(0.45);
  doc.rect(margin, p2y, contentWidth, 48, 'FD');

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(9);
  doc.text(
    'ARTICLE IV — MANDATORY DOCUMENTARY PROOF FOR CLAIM SETTLEMENT (72-HOUR SLA)',
    margin + 4,
    p2y + 5.8
  );
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.25);
  doc.line(margin + 4, p2y + 7.4, pageWidth - margin - 4, p2y + 7.4);

  doc.setFont('times', 'normal');
  doc.setFontSize(7.9);
  doc.setTextColor(25, 35, 50);
  const sec4 =
    'To qualify as a payable Actual Loss under Clause 3.1, the Claimant must submit:\n' +
    `  1. Official Trade Heaven Custodial Escrow Lock Receipt (Vault ID: ${cert.escrowVaultId});\n` +
    '  2. Signed Commercial Invoice, Proforma Invoice, and Clean On-Board Bill of Lading (B/L), Q88, or Tank Storage Receipt;\n' +
    '  3. Independent Inspection & Loss Quantification Report issued by SGS, Bureau Veritas, Intertek, or a certified Lloyd\'s Marine Surveyor confirming the exact US Dollar value of the direct actual loss.';
  doc.text(doc.splitTextToSize(sec4, contentWidth - 8), margin + 4, p2y + 12);

  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.3);
  doc.line(margin + 4, p2y + 34.5, pageWidth - margin - 4, p2y + 34.5);

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(8.2);
  doc.text('Signed: A. V. Sterling (Chief Underwriting Officer)', margin + 4, p2y + 39.5);

  doc.setTextColor(140, 96, 24);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.text('[ SOVEREIGN SEAL AFFIXED ]', centerX, p2y + 39.5, { align: 'center' });

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(8.2);
  doc.text('Counter-Signed: R. K. Sharma (Escrow Registrar)', pageWidth - margin - 4, p2y + 39.5, {
    align: 'right'
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'italic');
  doc.setFontSize(7.4);
  doc.text(
    'IN WITNESS WHEREOF, Tradeheaven ECOM Solution LLP has executed this Indenture under Official Seal.',
    centerX,
    p2y + 44.8,
    { align: 'center' }
  );

  // Page 2 Footer
  doc.setDrawColor(180, 138, 62);
  doc.setLineWidth(0.4);
  doc.line(margin, 265, pageWidth - margin, 265);

  doc.setTextColor(15, 28, 52);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.2);
  doc.text(`CRYPTOGRAPHIC HASH: ${cert.verificationHash}`, margin, 270);

  doc.setFont('times', 'bold');
  doc.setFontSize(7.5);
  doc.text(`SERIAL NO: ${serialNo}`, pageWidth - margin, 270, { align: 'right' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('times', 'normal');
  doc.setFontSize(7.3);
  doc.text(
    'Issued by Tradeheaven ECOM Solution LLP (www.tradeheaven.net)   |   help@tradeheaven.net',
    margin,
    275.2
  );

  doc.setTextColor(15, 28, 52);
  doc.setFont('times', 'bold');
  doc.setFontSize(7.8);
  doc.text('Page 2 of 2', pageWidth - margin, 275.2, { align: 'right' });

  if (options?.openPrintDialog) {
    doc.autoPrint();
  }

  const safeSerial = serialNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  triggerSafePdfDownload(doc, `TradeHeaven-Certificate-${safeSerial}.pdf`);
};

export const generatePaymentReceiptPDF = (
  receipt: PaymentReceiptPdfData,
  options?: { openPrintDialog?: boolean }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Outer Frame
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, 14, contentWidth, 32, 3, 3, 'F');

  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('OFFICIAL TREASURY & ESCROW SETTLEMENT DOCUMENT', margin + 6, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(17);
  doc.text('PAYMENT & ESCROW SETTLEMENT RECEIPT', margin + 6, 30.5);

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Tradeheaven ECOM Solution LLP  •  www.tradeheaven.net', margin + 6, 37.5);

  const receiptNo =
    receipt.receiptId ||
    receipt.orderId ||
    `TH-RCPT-${Date.now().toString().slice(-6)}`;
  const issuedDate =
    receipt.issuedAt || new Date().toISOString().slice(0, 10);

  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(71, 85, 105);
  doc.roundedRect(pageWidth - margin - 58, 18, 52, 22, 2, 2, 'FD');

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('RECEIPT / ORDER REF', pageWidth - margin - 32, 24, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9);
  doc.text(receiptNo, pageWidth - margin - 32, 30.5, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Date: ${issuedDate}`, pageWidth - margin - 32, 36.5, { align: 'center' });

  let y = 53;

  // Billed To & Beneficiary Two-Column Box
  const colW = (contentWidth - 6) / 2;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, colW, 38, 2, 2, 'FD');
  doc.roundedRect(margin + colW + 6, y, colW, 38, 2, 2, 'FD');

  // Left: Client Details
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CLIENT / BILLED ENTITY', margin + 5, y + 7);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(
    (receipt.companyName || receipt.billingName || 'Verified Trade Client').substring(0, 38),
    margin + 5,
    y + 14
  );

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  if (receipt.billingName) {
    doc.text(`Attn: ${receipt.billingName}`, margin + 5, y + 20.5);
  }
  if (receipt.clientEmail) {
    doc.text(`Email: ${receipt.clientEmail}`, margin + 5, y + 26.5);
  }
  if (receipt.clientPhone) {
    doc.text(`Phone: ${receipt.clientPhone}`, margin + 5, y + 32.5);
  }

  // Right: Beneficiary Treasury Details
  const rightX = margin + colW + 11;
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('BENEFICIARY / TREASURY SETTLEMENT VAULT', rightX, y + 7);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('TRADEHEAVEN ECOM SOLUTION LLP', rightX, y + 14);

  doc.setTextColor(71, 85, 105);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text('Bank: The Currency Cloud Limited', rightX, y + 20.5);
  doc.text('IBAN: GB81TCCL04140453340868', rightX, y + 26.5);
  doc.text('SWIFT / BIC: TCCLGB3L (DO NOT CONVERT TO GBP)', rightX, y + 32.5);

  y += 45;

  // Line Item Table Header
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 10, 1.5, 1.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DESCRIPTION / SERVICE PLAN', margin + 5, y + 6.5);
  doc.text('PAYMENT RAIL', margin + 105, y + 6.5);
  doc.text('STATUS', margin + 138, y + 6.5);
  doc.text('AMOUNT', pageWidth - margin - 5, y + 6.5, { align: 'right' });

  y += 10;

  // Line Item Row
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 26, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text((receipt.title || 'Trade Heaven Service Settlement').substring(0, 48), margin + 5, y + 8);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const descLines = doc.splitTextToSize(
    receipt.description || 'Official Trade Heaven B2B Marketplace & Escrow Settlement',
    92
  );
  doc.text(descLines.slice(0, 2), margin + 5, y + 14.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text(receipt.paymentMethod || 'SWIFT WIRE', margin + 105, y + 10);

  doc.setTextColor(4, 120, 87);
  doc.text(receipt.status || 'RECORDED', margin + 138, y + 10);

  const amountUsdStr = `$${(Number(receipt.amountUsd) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} USD`;
  const primaryAmt = receipt.convertedAmountFormatted || amountUsdStr;

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(10);
  doc.text(primaryAmt, pageWidth - margin - 5, y + 10, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('courier', 'normal');
  doc.setFontSize(7.5);
  doc.text(`(${amountUsdStr})`, pageWidth - margin - 5, y + 16, { align: 'right' });

  y += 32;

  // Wire Reference & Notes Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    `Wire / Transaction Reference: ${receipt.wireTxRef || 'Pending Bank Settlement Confirmation'}`,
    margin + 5,
    y + 8
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    `Notes: ${(receipt.notes || '30-Day Strict Refund Eligibility Window from initial plan start date applies.').substring(0, 95)}`,
    margin + 5,
    y + 15
  );

  y += 27;

  // Trade Assurance Mishap & Stuck Payment Protection Guarantee
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'TRADE ASSURANCE MISHAP & STUCK PAYMENT LOSS COVERAGE (FULL ASSURANCE OF TRADE HEAVEN)',
    margin + 5,
    y + 7
  );

  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const assuranceText =
    'In case of any mishap such as a stuck payment or intermediary bank clearing delay where the Supplier or Buyer holds active Trade Assurance, losses are actively tried to be covered with the direct help of Trade Heaven, and Full Assurance is of Trade Heaven.';
  doc.text(doc.splitTextToSize(assuranceText, contentWidth - 10), margin + 5, y + 13.5);

  y += 38;

  // Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y, pageWidth - margin, y);

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(
    'Official computer-generated receipt issued by Tradeheaven ECOM Solution LLP  •  help@tradeheaven.net  •  +91 8532934479',
    pageWidth / 2,
    y + 7,
    { align: 'center' }
  );

  if (options?.openPrintDialog) {
    doc.autoPrint();
  }

  const safeRef = receiptNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  triggerSafePdfDownload(doc, `TradeHeaven-Receipt-${safeRef}.pdf`);
};

export const generateTradeAssuranceBrochurePDF = (
  _cert?: TradeAssuranceCertificateRecord | null,
  options?: {
    selectedCurrency?: string;
    formattedCoverageLimit?: string;
    openPrintDialog?: boolean;
    recipientRole?: 'SUPPLIER' | 'BUYER' | 'BOTH';
    recipientCompany?: string;
  }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;

  const drawPageFrame = () => {
    doc.setDrawColor(15, 23, 42);
    doc.setLineWidth(1.1);
    doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
    doc.setDrawColor(217, 119, 6);
    doc.setLineWidth(0.35);
    doc.rect(9, 9, pageWidth - 18, pageHeight - 18);
  };

  // ==================== PAGE 1: FEATURES OF TRADE HEAVEN & HOW IT BENEFITS CLIENTS ====================
  drawPageFrame();

  // Top Executive Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(9, 9, pageWidth - 18, 36, 'F');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'OFFICIAL B2B CLIENT GUIDE  •  FEATURES OF TRADE HEAVEN & CLIENT BENEFITS',
    pageWidth / 2,
    17,
    { align: 'center' }
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.text(
    'FEATURES OF TRADE HEAVEN & HOW IT BENEFITS CLIENTS',
    pageWidth / 2,
    26.5,
    { align: 'center' }
  );

  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'Issued by Tradeheaven ECOM Solution LLP  •  End-to-End Escrow Security, SGS/ISO Audit & Client Protection',
    pageWidth / 2,
    33.5,
    { align: 'center' }
  );

  if (options?.recipientCompany) {
    doc.setTextColor(52, 211, 153);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      `Prepared Exclusively For: ${options.recipientCompany} (${options.recipientRole || 'SUPPLIER & BUYER PARTNER'})`,
      pageWidth / 2,
      40.5,
      { align: 'center' }
    );
  } else {
    doc.setTextColor(52, 211, 153);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(
      'Global B2B Trade Ecosystem  •  www.tradeheaven.net',
      pageWidth / 2,
      40.5,
      { align: 'center' }
    );
  }

  let y = 51;

  // Section 1: Overview of Trade Heaven Features & Client Value
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('1. EXECUTIVE OVERVIEW: HOW TRADE HEAVEN BENEFITS GLOBAL B2B CLIENTS', margin + 4, y + 6.5);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const overviewLines = doc.splitTextToSize(
    'Trade Heaven is an end-to-end global B2B trade and escrow ecosystem designed to eliminate cross-border payment risk, counterparty fraud, and quality disputes for Importers, Buyers, Manufacturers, and Exporters. By combining segregated Custodial Escrow protection ($150,000 USD to $2,000,000 USD), third-party factory & pre-shipment inspection (SGS / TUV / Bureau Veritas), and Full Assurance of Trade Heaven stuck-payment loss coverage, clients trade globally with 100% security.',
    contentWidth - 8
  );
  doc.text(overviewLines, margin + 4, y + 12);

  y += 28;

  // Section 2: 5 Core Platform Features & How They Work for Clients
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('2. CORE FEATURES OF TRADE HEAVEN & HOW THEY WORK FOR CLIENTS', margin, y);
  y += 3.5;

  const steps = [
    {
      step: 'FEAT 01',
      title: 'Verified Corporate KYC, Tax/VAT & Factory Audit Screening',
      desc: 'Every supplier and buyer undergoes Corporate Registration, Tax/VAT/GST ID, DUNS, and ISO/SGS plant verification so clients only transact with genuine, accountable business entities.'
    },
    {
      step: 'FEAT 02',
      title: 'Smart Proforma Invoice & Incoterms 2020 Contract Alignment',
      desc: 'Purchase Orders and Proforma Invoices are structured with clear product specifications, delivery schedules, and Incoterms 2020 (FOB, CIF, CFR, DDP, EXW) to protect both parties.'
    },
    {
      step: 'FEAT 03',
      title: 'ACID Custodial Escrow Fund Lock (100% Capital Security)',
      desc: 'Buyers deposit order funds (via SWIFT Wire, LC/DLC MT700, SBLC, or Corporate Settlement) into a segregated Custodial Escrow Vault. Suppliers receive verified proof of funds before production.'
    },
    {
      step: 'FEAT 04',
      title: 'SGS / TUV Pre-Shipment Quality Assay & Bill of Lading Verification',
      desc: 'Before shipment release, independent inspectors (SGS, TUV Rheinland, Bureau Veritas) verify product quality, quantity, and packaging against contract specs alongside a valid Bill of Lading.'
    },
    {
      step: 'FEAT 05',
      title: 'Automated Milestone Settlement & Full Mishap Loss Coverage',
      desc: 'Once shipping and inspection milestones pass, Escrow releases 100% settlement to the Supplier without buyer default risk, while protecting the Buyer against off-spec cargo or non-shipment.'
    }
  ];

  steps.forEach((s, idx) => {
    const boxH = 18.5;
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(margin, y, contentWidth, boxH, 1.5, 1.5, 'FD');

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin + 3, y + 3, 21, 12.5, 1.5, 1.5, 'F');
    doc.setTextColor(251, 191, 36);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.5);
    doc.text(s.step, margin + 13.5, y + 10.5, { align: 'center' });

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(s.title, margin + 27, y + 6);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const lines = doc.splitTextToSize(s.desc, contentWidth - 30);
    doc.text(lines, margin + 27, y + 11);

    y += boxH + 2.2;
  });

  y += 2;

  // Section 3: Dual Value Proposition (How It Benefits Suppliers vs How It Benefits Buyers)
  const colW = (contentWidth - 4) / 2;
  const dualBoxH = 44;

  // Left Column: For Suppliers & Exporters
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.roundedRect(margin, y, colW, dualBoxH, 2, 2, 'FD');

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('HOW TRADE HEAVEN BENEFITS SUPPLIERS & EXPORTERS', margin + 4, y + 6.5);

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const supplierBullets = [
    '• Zero Buyer Default Risk: Order funds are verified & locked in Custodial Escrow before production or dispatch.',
    '• Higher Global RFQ Conversion: Verified factory & compliance credentials build instant trust with Tier-1 importers.',
    '• Bank & LC Underwriting Credibility: Supports MT700 DLC, SBLC, and multi-currency international trade finance.',
    '• Stuck Payment Recovery Support: Trade Heaven actively intervenes with correspondent banks to clear held wires.'
  ];
  let sy = y + 12;
  supplierBullets.forEach(b => {
    const wrapped = doc.splitTextToSize(b, colW - 8);
    doc.text(wrapped, margin + 4, sy);
    sy += wrapped.length * 3.6 + 1;
  });

  // Right Column: For Buyers & Importers
  const rightX = margin + colW + 4;
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(110, 231, 183);
  doc.roundedRect(rightX, y, colW, dualBoxH, 2, 2, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('HOW TRADE HEAVEN BENEFITS BUYERS & IMPORTERS', rightX + 4, y + 6.5);

  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  const buyerBullets = [
    '• 100% Milestone-Gated Release: Funds are never released until Bill of Lading & SGS/TUV inspection pass.',
    '• Pre-Vetted Counterparty KYC: Confirms real Legal Registration, Tax/VAT ID, DUNS, and factory existence.',
    '• Up to $2,000,000 USD Protection: Guaranteed coverage against non-delivery, delayed cargo, or off-spec goods.',
    '• End-to-End Supply Chain Visibility: Complete transparency from factory production line to destination customs.'
  ];
  let by = y + 12;
  buyerBullets.forEach(b => {
    const wrapped = doc.splitTextToSize(b, colW - 8);
    doc.text(wrapped, rightX + 4, by);
    by += wrapped.length * 3.6 + 1;
  });

  y += dualBoxH + 4;

  // Section 4: Mishap & Stuck Payment Protection Guarantee Banner
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD');

  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'FULL ASSURANCE OF TRADE HEAVEN — MISHAP & STUCK PAYMENT LOSS COVERAGE GUARANTEE',
    margin + 4,
    y + 6.5
  );

  doc.setTextColor(241, 245, 249);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const mishapGuaranteeLines = doc.splitTextToSize(
    'In case of any transactional mishap—such as a payment stuck in intermediary bank clearing, correspondent SWIFT hold, customs settlement disruption, or counterparty default—where the Supplier or Buyer holds active Trade Assurance, losses are actively tried to be covered with the direct help of Trade Heaven, and Full Assurance is of Trade Heaven up to the active USD coverage limit.',
    contentWidth - 8
  );
  doc.text(mishapGuaranteeLines, margin + 4, y + 12);

  // Footer Page 1
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Page 1 of 2  •  Tradeheaven ECOM Solution LLP  •  Features of Trade Heaven & How It Benefits Clients',
    pageWidth / 2,
    pageHeight - 11,
    { align: 'center' }
  );

  // ==================== PAGE 2: CLIENT PROTECTION TIERS & STRATEGIC ADVANTAGES ====================
  doc.addPage();
  drawPageFrame();

  // Page 2 Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(9, 9, pageWidth - 18, 24, 'F');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(
    'CLIENT PROTECTION TIERS, STRATEGIC TRADE ADVANTAGES & GLOBAL SUPPORT',
    pageWidth / 2,
    17,
    { align: 'center' }
  );

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13.5);
  doc.text(
    'TRADE HEAVEN PROTECTION TIERS & KEY CLIENT BENEFITS',
    pageWidth / 2,
    25.5,
    { align: 'center' }
  );

  let y2 = 39;

  // Section 5: 3 Official Client Protection Tiers
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('5. TRADE HEAVEN CLIENT PROTECTION TIERS ($150,000 TO $2,000,000 USD)', margin, y2);
  y2 += 4;

  const tiers = [
    {
      name: '01. STANDARD TRADE ASSURANCE PROTECTION',
      limit: '$150,000 USD Escrow Protection Limit',
      auditor: 'Trade Heaven Corporate KYC & Tax Registry Desk',
      features:
        'Includes Legal Registration & Tax/VAT Verification, Segregated Custodial Escrow Account Protection, Milestone-Gated Payout, and Stuck Payment / Mishap Assistance for Buyers and Suppliers.'
    },
    {
      name: '02. GOLD AUDITED TRADE ASSURANCE PROTECTION (MOST POPULAR)',
      limit: '$500,000 USD Escrow Protection Limit',
      auditor: 'SGS / Bureau Veritas + Trade Heaven Compliance Desk',
      features:
        'Includes Full Corporate KYC + ISO 9001 & Quality Audit Verification, Priority Escrow Settlement Clearing, Pre-Shipment Inspection Integration, and Priority Buyer/Supplier Mishap Loss Coverage.'
    },
    {
      name: '03. VIP SOVEREIGN TRADE ASSURANCE & ON-SITE PLANT AUDIT',
      limit: '$2,000,000 USD Escrow Protection Limit',
      auditor: 'On-Site Physical Plant Audit (SGS / TUV Rheinland / BV)',
      features:
        'Designed for High-Value Bulk Commodities & Industrial Machinery. Includes Physical Factory Capacity Audit, MT700 DLC / SBLC Bank Underwriting Support, and Dedicated Senior Trade Mediator.'
    }
  ];

  tiers.forEach((t, idx) => {
    const tBoxH = 24;
    doc.setFillColor(idx === 1 ? 254 : 248, idx === 1 ? 252 : 250, idx === 1 ? 232 : 252);
    doc.setDrawColor(idx === 1 ? 217 : 203, idx === 1 ? 119 : 213, idx === 1 ? 6 : 225);
    doc.roundedRect(margin, y2, contentWidth, tBoxH, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(t.name, margin + 4, y2 + 6);

    doc.setTextColor(4, 120, 87);
    doc.setFont('courier', 'bold');
    doc.setFontSize(8.5);
    doc.text(t.limit, pageWidth - margin - 4, y2 + 6, { align: 'right' });

    doc.setTextColor(30, 64, 175);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(`Verification Authority: ${t.auditor}`, margin + 4, y2 + 11);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const fLines = doc.splitTextToSize(t.features, contentWidth - 8);
    doc.text(fLines, margin + 4, y2 + 16);

    y2 += tBoxH + 3;
  });

  y2 += 3;

  // Section 6: Why Global Clients Choose Trade Heaven (6 Strategic Benefits)
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('6. SIX REASONS WHY GLOBAL CLIENTS CHOOSE TRADE HEAVEN', margin, y2);
  y2 += 4;

  const clientAdvantages = [
    {
      title: '1. Complete Payment & Principal Security',
      detail: 'Buyers never lose deposits to unverified vendors; Suppliers never manufacture goods without confirmed, locked funds in escrow.'
    },
    {
      title: '2. Zero Quality Surprises at Destination Port',
      detail: 'Mandatory SGS, TUV Rheinland, or Bureau Veritas pre-shipment batch sampling ensures goods match exact contract specifications.'
    },
    {
      title: '3. Full Assurance of Trade Heaven on Stuck Payments',
      detail: 'If an international wire is delayed or stuck in intermediary clearing, losses are actively tried to be covered with Trade Heaven help.'
    },
    {
      title: '4. Multi-Currency & Institutional Trade Finance',
      detail: 'Seamless settlement via SWIFT Wire Escrow, Irrevocable Letters of Credit (MT700 DLC / SBLC), and 25+ global currencies.'
    },
    {
      title: '5. Faster Dispute Resolution (72-Hour SLA)',
      detail: 'Dedicated Trade Heaven arbitration and compliance specialists resolve shipping or specification discrepancies within 72 hours.'
    },
    {
      title: '6. Global Reach Across 190+ Trade Corridors',
      detail: 'Connects verified manufacturers, bulk commodity exporters, and institutional buyers with end-to-end customs and freight support.'
    }
  ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y2, contentWidth, 56, 2, 2, 'FD');

  let advY = y2 + 6.5;
  clientAdvantages.forEach(item => {
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(item.title, margin + 4, advY);

    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.4);
    doc.text(item.detail, margin + 6, advY + 3.8);
    advY += 8.6;
  });

  y2 += 61;

  // Section 7: Direct Client Onboarding & Trade Assurance Support
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(margin, y2, contentWidth, 29, 2, 2, 'FD');

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(
    '7. HOW CLIENTS GET STARTED WITH TRADE HEAVEN TRADE ASSURANCE',
    margin + 4,
    y2 + 6.5
  );

  doc.setTextColor(30, 58, 138);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  const onboardingInstructions = [
    '1. Select Your Protection Tier: Choose Standard ($150k), Gold Audited ($500k), or VIP Sovereign ($2M) coverage based on your order volume.',
    '2. Lock Order Terms in Escrow: Link your Proforma Invoice and Incoterms so both Buyer and Supplier are protected under Full Assurance of Trade Heaven.',
    '3. 24/7 Executive Client Support: Contact help@tradeheaven.net or +91 8532934479 for supplier/buyer onboarding, escrow setup, or stuck-payment assistance.'
  ];
  let vy = y2 + 12;
  onboardingInstructions.forEach(line => {
    const wrapped = doc.splitTextToSize(line, contentWidth - 8);
    doc.text(wrapped, margin + 4, vy);
    vy += wrapped.length * 3.5 + 1.2;
  });

  // Page 2 Footer
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    'Page 2 of 2  •  Issued by Tradeheaven ECOM Solution LLP  •  help@tradeheaven.net  •  +91 8532934479  •  www.tradeheaven.net',
    pageWidth / 2,
    pageHeight - 11,
    { align: 'center' }
  );

  if (options?.openPrintDialog) {
    doc.autoPrint();
  }

  triggerSafePdfDownload(
    doc,
    'TradeHeaven-Features-and-Client-Benefits-Brochure.pdf'
  );
};

export const ExportToPDF: React.FC<ExportToPDFProps> = ({
  mode,
  certificateData,
  receiptData,
  checkoutData,
  selectedCurrency = 'USD',
  formattedCoverageLimit,
  buttonLabel,
  variant = 'primary',
  className = '',
  openPrintDialog = false,
  recipientRole,
  recipientCompany
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [justExported, setJustExported] = useState(false);

  const handleExport = () => {
    setIsGenerating(true);
    try {
      if (mode === 'CERTIFICATE' && certificateData) {
        generateCertificatePDF(certificateData, {
          selectedCurrency: String(selectedCurrency),
          formattedCoverageLimit,
          openPrintDialog
        });
      } else if (mode === 'BROCHURE') {
        generateTradeAssuranceBrochurePDF(certificateData, {
          selectedCurrency: String(selectedCurrency),
          formattedCoverageLimit,
          openPrintDialog,
          recipientRole,
          recipientCompany
        });
      } else if (mode === 'PAYMENT_RECEIPT') {
        const resolvedReceipt: PaymentReceiptPdfData = receiptData || {
          orderId: `TH-ORD-${Date.now().toString().slice(-6)}`,
          issuedAt: new Date().toISOString().slice(0, 10),
          title:
            checkoutData?.title ||
            checkoutData?.planName ||
            'Trade Heaven Membership & Escrow Settlement',
          description:
            checkoutData?.description ||
            `Corporate settlement for ${checkoutData?.companyName || checkoutData?.supplierCompany || 'Verified Account'}`,
          type: checkoutData?.type || 'SUBSCRIPTION',
          amountUsd:
            Number(checkoutData?.amountUsd ?? checkoutData?.amount ?? 0) || 0,
          currency: selectedCurrency,
          billingName:
            checkoutData?.billingName ||
            checkoutData?.customerName ||
            checkoutData?.decisionMakerName ||
            'Authorized Signatory',
          companyName:
            checkoutData?.companyName ||
            checkoutData?.supplierCompany ||
            'Verified Corporate Account',
          clientEmail:
            checkoutData?.clientEmail || checkoutData?.customerEmail || '',
          paymentMethod: checkoutData?.preferredPaymentMethod || 'SWIFT WIRE',
          status: 'VERIFIED'
        };
        generatePaymentReceiptPDF(resolvedReceipt, { openPrintDialog });
      }
      setJustExported(true);
      setTimeout(() => setJustExported(false), 2500);
    } catch (err) {
      console.error('[ExportToPDF] Failed to generate PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const variantClasses: Record<NonNullable<ExportToPDFProps['variant']>, string> = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white border border-slate-900',
    emerald:
      'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600',
    secondary:
      'bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-400',
    outline:
      'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
  };

  const defaultLabel =
    mode === 'CERTIFICATE'
      ? 'Export Certificate PDF'
      : mode === 'BROCHURE'
        ? 'Download Working Brochure PDF'
        : 'Export Receipt PDF';

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={isGenerating || (mode === 'CERTIFICATE' && !certificateData)}
      className={`px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 ${variantClasses[variant]} ${className}`}
    >
      {isGenerating ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : justExported ? (
        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      ) : (
        <FileDown className="w-3.5 h-3.5 shrink-0" />
      )}
      <span>
        {isGenerating
          ? 'Generating PDF...'
          : justExported
            ? 'PDF Downloaded'
            : buttonLabel || defaultLabel}
      </span>
    </button>
  );
};

export default ExportToPDF;
