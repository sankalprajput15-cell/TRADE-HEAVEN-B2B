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
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Outer decorative border
  doc.setDrawColor(15, 23, 42); // slate-900
  doc.setLineWidth(1.2);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  doc.setDrawColor(217, 119, 6); // amber-600
  doc.setLineWidth(0.4);
  doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.roundedRect(margin, 14, contentWidth, 34, 3, 3, 'F');

  doc.setTextColor(251, 191, 36); // amber-400
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('OFFICIAL TRADE HEAVEN ESCROW & AUDIT CREDENTIAL', margin + 6, 22);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('CERTIFICATE OF TRADE ASSURANCE', margin + 6, 31);

  doc.setTextColor(203, 213, 225); // slate-300
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(
    'Issued by Tradeheaven ECOM Solution LLP  |  Global B2B Compliance & Escrow Registry',
    margin + 6,
    38
  );

  // Serial Number Badge in Header
  const serialNo = cert.certificateNumber || cert.serialNumber || 'THC-2026-VERIFIED';
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(pageWidth - margin - 62, 19, 56, 18, 2, 2, 'FD');

  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('CERTIFICATE SERIAL NO.', pageWidth - margin - 34, 25, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.5);
  doc.text(serialNo, pageWidth - margin - 34, 32, { align: 'center' });

  let y = 55;

  // Status & Verification Bar
  const isVerified = cert.status === 'ACTIVE_VERIFIED';
  if (isVerified) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
  } else {
    doc.setFillColor(255, 251, 235); // amber-50
    doc.setDrawColor(245, 158, 11); // amber-500
  }
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 12, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(isVerified ? 6 : 146, isVerified ? 95 : 64, isVerified ? 70 : 14);
  const statusLabel =
    cert.status === 'ACTIVE_VERIFIED'
      ? 'STATUS: ACTIVE & VERIFIED IN GLOBAL REGISTRY'
      : `STATUS: ${cert.status}`;
  doc.text(statusLabel, margin + 5, y + 7.5);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.text(`Tier: ${cert.tierCode}`, pageWidth - margin - 5, y + 7.5, { align: 'right' });

  y += 18;

  // Certified Legal Entity & Coverage Limit Highlight Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('CERTIFIED LEGAL ENTITY / HOLDER', margin + 6, y + 8);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const holderName = cert.holder || cert.companyName || 'Verified Corporate Entity';
  doc.text(holderName.substring(0, 46), margin + 6, y + 16);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`${cert.businessType}  •  ${cert.country}`, margin + 6, y + 23);

  // Coverage Limit on Right
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('GUARANTEED ESCROW PROTECTION LIMIT', pageWidth - margin - 6, y + 8, {
    align: 'right'
  });

  const usdFormatted = `$${(Number(cert.coverageLimitUsd) || 0).toLocaleString()} USD`;
  const primaryLimitDisplay = options?.formattedCoverageLimit
    ? `${options.formattedCoverageLimit} (${options.selectedCurrency || 'USD'})`
    : usdFormatted;

  doc.setTextColor(4, 120, 87); // emerald-700
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.text(primaryLimitDisplay, pageWidth - margin - 6, y + 16.5, { align: 'right' });

  doc.setTextColor(100, 116, 139);
  doc.setFont('courier', 'normal');
  doc.setFontSize(8);
  doc.text(`USD Equivalent: ${usdFormatted}`, pageWidth - margin - 6, y + 23, {
    align: 'right'
  });

  y += 37;

  // Specification Grid (2 columns x 3 rows)
  const colWidth = (contentWidth - 6) / 2;
  const rowHeight = 20;

  const specs = [
    {
      label: 'Certification Tier',
      value: cert.tierTitle || 'Standard Trade Assurance Certificate'
    },
    {
      label: 'Auditing & KYC Authority',
      value: cert.auditingBody || 'Trade Heaven KYC & Corporate Registry Desk'
    },
    {
      label: 'Corporate Registration & Tax ID',
      value: `Reg: ${cert.legalRegistrationNumber}  |  Tax: ${cert.taxOrVatId}`
    },
    {
      label: 'Custodial Escrow Vault ID',
      value: cert.escrowVaultId || 'TH-VAULT-VERIFIED'
    },
    {
      label: 'Validity Period (Issue — Expiry)',
      value: `${cert.issueDate}  to  ${cert.expiryDate}`
    },
    {
      label: 'Verified Standards & Incoterms',
      value: `${(cert.isoStandards || []).join(', ') || 'ISO 9001:2015'} (${(cert.supportedIncoterms || []).join(', ') || 'FOB, CIF, DDP'})`
    }
  ];

  specs.forEach((spec, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const boxX = margin + col * (colWidth + 6);
    const boxY = y + row * (rowHeight + 4);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(boxX, boxY, colWidth, rowHeight, 2, 2, 'FD');

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(spec.label.toUpperCase(), boxX + 4, boxY + 6.5);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const wrapped = doc.splitTextToSize(spec.value, colWidth - 8);
    doc.text(wrapped.slice(0, 2), boxX + 4, boxY + 13);
  });

  y += 3 * (rowHeight + 4) + 4;

  // Trade Heaven Full Assurance & Stuck Payment / Mishap Protection Guarantee Box
  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(16, 185, 129); // emerald-500
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 32, 2.5, 2.5, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(
    'FULL ASSURANCE OF TRADE HEAVEN — MISHAP & STUCK PAYMENT LOSS COVERAGE GUARANTEE',
    margin + 5,
    y + 7
  );

  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const guaranteeCopy =
    'In the event of any transactional mishap—such as a payment stuck in clearing, correspondent bank hold, or settlement bottleneck—where either the Supplier or the Buyer holds active Trade Assurance, financial losses are actively mediated and tried to be covered in full with the direct assistance of Trade Heaven. Full Assurance is of Trade Heaven up to the certified USD Escrow Protection Limit stated above.';
  const wrappedGuarantee = doc.splitTextToSize(guaranteeCopy, contentWidth - 10);
  doc.text(wrappedGuarantee, margin + 5, y + 13.5);

  y += 38;

  // Cryptographic Hash & Registry Verification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('CRYPTOGRAPHIC AUDIT & REGISTRY HASH', margin + 5, y + 6.5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8);
  doc.text(cert.verificationHash || '0x8F9A2C4E1B7D0841VERIFIED', margin + 5, y + 12.5);

  doc.setTextColor(37, 99, 235);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(
    `Verify online at: https://www.tradeheaven.net/?view=TRADE_ASSURANCE_CERTIFICATE&serial=${encodeURIComponent(serialNo)}`,
    margin + 5,
    y + 18.5
  );

  y += 30;

  // Signature & Seal Footer
  doc.setDrawColor(203, 213, 225);
  doc.line(margin, y + 12, margin + 68, y + 12);
  doc.line(pageWidth - margin - 68, y + 12, pageWidth - margin, y + 12);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Authorized Compliance Signatory', margin, y + 17);
  doc.text('Escrow & Trade Assurance Directorate', pageWidth - margin, y + 17, {
    align: 'right'
  });

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Tradeheaven ECOM Solution LLP', margin, y + 22);
  doc.text('help@tradeheaven.net  |  +91 8532934479', pageWidth - margin, y + 22, {
    align: 'right'
  });

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
