import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
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

export interface InvoiceProductLineItem {
  itemNo?: string;
  skuOrHsCode?: string;
  productName: string;
  technicalSpecs?: string;
  packagingSpecs?: string;
  incoterm?: string;
  leadTime?: string;
  quantity: number;
  unit?: string;
  unitPriceUsd: number;
  taxOrFeeUsd?: number;
  lineTotalUsd?: number;
}

export interface PaymentReceiptPdfData {
  receiptId?: string;
  orderId?: string;
  issuedAt?: string;
  validUntil?: string;
  title: string;
  description?: string;
  type?: string;
  amountUsd: number;
  convertedAmountFormatted?: string;
  currency?: Currency | string;
  billingName?: string;
  companyName?: string;
  supplierCompany?: string;
  supplierContact?: string;
  clientEmail?: string;
  clientPhone?: string;
  destinationPort?: string;
  originPort?: string;
  incoterm?: string;
  paymentMethod?: string;
  wireTxRef?: string;
  status?: 'PAID' | 'PENDING' | 'ESCROW_LOCKED' | string;
  notes?: string;
  items?: InvoiceProductLineItem[];
}

export interface ExportToPDFProps {
  mode: 'CERTIFICATE' | 'PAYMENT_RECEIPT' | 'BROCHURE' | 'INVOICE';
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

/**
 * Draws the official Trade Heaven vector brand logo (block TH monogram + wordmark + subtitle)
 */
export function drawTradeHeavenBrandLogo(
  doc: jsPDF,
  x: number,
  y: number,
  options?: {
    boxSize?: number;
    theme?: 'dark' | 'light';
    subtitle?: string;
    showWordmark?: boolean;
  }
) {
  const boxSize = options?.boxSize ?? 11.5;
  const isDark = (options?.theme ?? 'dark') === 'dark';
  const showWordmark = options?.showWordmark ?? true;

  // Outer crest container
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(isDark ? 245 : 15, isDark ? 158 : 23, isDark ? 11 : 42);
  doc.setLineWidth(0.45);
  doc.roundedRect(x, y, boxSize, boxSize, 1.6, 1.6, 'FD');

  // Inner subtle border frame
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.22);
  doc.roundedRect(x + 0.75, y + 0.75, boxSize - 1.5, boxSize - 1.5, 1.0, 1.0, 'D');

  // Vector Block T & H paths (512-unit coordinate grid)
  const sUnit = (boxSize - 1.2) / 512;
  const ox = x + 0.6;
  const oy = y + 0.6;

  doc.setFillColor(15, 23, 42);
  // Letter T
  doc.rect(ox + 60 * sUnit, oy + 122 * sUnit, 186 * sUnit, 52 * sUnit, 'F');
  doc.rect(ox + 127 * sUnit, oy + 174 * sUnit, 52 * sUnit, 196 * sUnit, 'F');
  // Letter H
  doc.rect(ox + 266 * sUnit, oy + 122 * sUnit, 52 * sUnit, 248 * sUnit, 'F');
  doc.rect(ox + 318 * sUnit, oy + 220 * sUnit, 76 * sUnit, 52 * sUnit, 'F');
  doc.rect(ox + 394 * sUnit, oy + 122 * sUnit, 52 * sUnit, 248 * sUnit, 'F');

  // Gold verification accent bar at base of crest
  doc.setFillColor(245, 158, 11);
  doc.rect(ox + 60 * sUnit, oy + 402 * sUnit, 386 * sUnit, 32 * sUnit, 'F');

  if (showWordmark) {
    const textX = x + boxSize + 3.2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(boxSize >= 10 ? 11.5 : 9);
    if (isDark) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(15, 23, 42);
    }
    doc.text('TRADE HEAVEN', textX, y + boxSize * 0.44);

    // Verified pill next to wordmark
    const brandW = doc.getTextWidth('TRADE HEAVEN');
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(textX + brandW + 2, y + boxSize * 0.14, 15.5, 3.8, 0.9, 0.9, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.text('VERIFIED', textX + brandW + 9.75, y + boxSize * 0.39, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(boxSize >= 10 ? 6.8 : 5.8);
    if (isDark) {
      doc.setTextColor(251, 191, 36);
    } else {
      doc.setTextColor(71, 85, 105);
    }
    doc.text(
      options?.subtitle || 'GLOBAL B2B MARKETPLACE & CUSTODIAL ESCROW REGISTRY',
      textX,
      y + boxSize * 0.78
    );
  }
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

  const serialNo = cert.certificateNumber || cert.serialNumber || '115534114618';
  const holderName =
    (cert.applicantName && cert.applicantName.replace(/\s*\(.*?\)\s*/g, '').trim()) ||
    (cert.holder && cert.holder.replace(/.*Attn:\s*/i, '').replace(/\)/g, '').trim()) ||
    'Furqan Uddin';
  const regNumber = cert.legalRegistrationNumber || cert.taxOrVatId || '09AAPPU1468B2ZD';
  const fullAddress =
    cert.registeredAddress ||
    (cert.country === 'India'
      ? '294/88khala bazar, Charminari Masjid ,Lucknow UTTAR PRADESH, 226003, Lucknow'
      : cert.country === 'Australia'
        ? '2 Park Road, Sans Souci NSW 2219, Sydney, Australia'
        : `Corporate Export Trade Zone, ${cert.country}`);
  const now = new Date();
  const todayDdMmYyyy = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  const formattedIssueDate = todayDdMmYyyy;

  const drawCubicBezier = (
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    steps = 10
  ) => {
    let prevX = x0;
    let prevY = y0;
    for (let s = 1; s <= steps; s++) {
      const t = s / steps;
      const mt = 1 - t;
      const nx =
        mt * mt * mt * x0 +
        3 * mt * mt * t * x1 +
        3 * mt * t * t * x2 +
        t * t * t * x3;
      const ny =
        mt * mt * mt * y0 +
        3 * mt * mt * t * y1 +
        3 * mt * t * t * y2 +
        t * t * t * y3;
      doc.line(prevX, prevY, nx, ny);
      prevX = nx;
      prevY = ny;
    }
  };

  const drawDashedCircle = (cx: number, cy: number, r: number, numDashes: number, dashRatio = 0.68) => {
    const stepAngle = (Math.PI * 2) / numDashes;
    for (let i = 0; i < numDashes; i++) {
      const aStart = i * stepAngle;
      const aEnd = aStart + stepAngle * dashRatio;
      const segs = 3;
      let px = cx + r * Math.cos(aStart);
      let py = cy + r * Math.sin(aStart);
      for (let k = 1; k <= segs; k++) {
        const a = aStart + ((aEnd - aStart) * k) / segs;
        const nx = cx + r * Math.cos(a);
        const ny = cy + r * Math.sin(a);
        doc.line(px, py, nx, ny);
        px = nx;
        py = ny;
      }
    }
  };

  const drawFivePointStar = (cx: number, cy: number, outerR: number, innerR: number) => {
    const pts: Array<{ x: number; y: number }> = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      pts.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle)
      });
    }
    for (let i = 0; i < 10; i++) {
      const p1 = pts[i];
      const p2 = pts[(i + 1) % 10];
      doc.triangle(cx, cy, p1.x, p1.y, p2.x, p2.y, 'F');
    }
  };

  const drawScrollFlourish = (cx: number, topY: number, flip180: boolean) => {
    const scale = 0.235;
    const mapPt = (sx: number, sy: number) => {
      const rx = flip180 ? 220 - sx : sx;
      const ry = flip180 ? 34 - sy : sy;
      return {
        x: cx + (rx - 110) * scale,
        y: topY + ry * scale
      };
    };

    // Central diamond spearhead (M110 4 L114 12 L110 26 L106 12 Z)
    doc.setFillColor(181, 173, 155);
    const dTop = mapPt(110, 4);
    const dRight = mapPt(114, 12);
    const dBot = mapPt(110, 26);
    const dLeft = mapPt(106, 12);
    doc.triangle(dTop.x, dTop.y, dRight.x, dRight.y, dBot.x, dBot.y, 'F');
    doc.triangle(dTop.x, dTop.y, dLeft.x, dLeft.y, dBot.x, dBot.y, 'F');

    doc.setDrawColor(181, 173, 155);
    doc.setLineWidth(0.38);

    const drawWing = (mirrorX: boolean) => {
      const mx = (x: number) => (mirrorX ? 220 - x : x);
      const b1 = [mapPt(mx(110), 24), mapPt(mx(95), 10), mapPt(mx(75), 6), mapPt(mx(58), 14)];
      const b2 = [mapPt(mx(58), 14), mapPt(mx(46), 19), mapPt(mx(44), 29), mapPt(mx(54), 30)];
      const b3 = [mapPt(mx(54), 30), mapPt(mx(62), 31), mapPt(mx(66), 23), mapPt(mx(59), 20)];
      const b4 = [mapPt(mx(59), 20), mapPt(mx(90), 22), mapPt(mx(100), 26), mapPt(mx(110), 28)];
      [b1, b2, b3, b4].forEach(seg => {
        drawCubicBezier(
          seg[0].x,
          seg[0].y,
          seg[1].x,
          seg[1].y,
          seg[2].x,
          seg[2].y,
          seg[3].x,
          seg[3].y,
          12
        );
      });
    };

    drawWing(false);
    drawWing(true);
  };

  const drawClassicSovereignFrame = () => {
    // Outer white frame + Warm Cream Parchment Canvas (#EFECE1)
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFillColor(239, 236, 225);
    doc.rect(6, 6, pageWidth - 12, pageHeight - 12, 'F');

    const borderLeft = 14;
    const borderTop = 14;
    const borderRight = pageWidth - 14;
    const borderBottom = pageHeight - 14;
    const cornerSize = 5.2;

    // Inner continuous filigree guide rule
    doc.setDrawColor(138, 131, 114);
    doc.setLineWidth(0.32);
    doc.rect(
      borderLeft + cornerSize - 0.6,
      borderTop + cornerSize - 0.6,
      borderRight - borderLeft - (cornerSize - 0.6) * 2,
      borderBottom - borderTop - (cornerSize - 0.6) * 2
    );

    // Repeating wavy S-curve filigree motif along top & bottom edges (matching horizontalFiligreeSvg)
    const horizSpan = borderRight - borderLeft - cornerSize * 2;
    const horizSteps = Math.round(horizSpan / 8.5);
    const tileW = horizSpan / horizSteps;
    const tileH = 4.6;

    const drawHorizFiligreeTile = (x0: number, yEdge: number, invertY: boolean) => {
      const tx = (u: number) => x0 + (u / 36) * tileW;
      const ty = (v: number) =>
        invertY ? yEdge - (v / 18) * tileH : yEdge + (v / 18) * tileH;

      doc.setDrawColor(138, 131, 114);
      doc.setLineWidth(0.24);
      // Outer wave: M2,13 C5,5 10,5 13,11 C15,14 21,14 23,11 C26,5 31,5 34,13
      drawCubicBezier(tx(2), ty(13), tx(5), ty(5), tx(10), ty(5), tx(13), ty(11), 6);
      drawCubicBezier(tx(13), ty(11), tx(15), ty(14), tx(21), ty(14), tx(23), ty(11), 6);
      drawCubicBezier(tx(23), ty(11), tx(26), ty(5), tx(31), ty(5), tx(34), ty(13), 6);

      // Inner wave: M6,13 C8,8 12,8 14,12 M22,12 C24,8 28,8 30,13
      doc.setLineWidth(0.18);
      drawCubicBezier(tx(6), ty(13), tx(8), ty(8), tx(12), ty(8), tx(14), ty(12), 5);
      drawCubicBezier(tx(22), ty(12), tx(24), ty(8), tx(28), ty(8), tx(30), ty(13), 5);

      // 3 small dots
      doc.setFillColor(138, 131, 114);
      doc.circle(tx(9), ty(6.5), 0.25, 'F');
      doc.circle(tx(18), ty(5.5), 0.3, 'F');
      doc.circle(tx(27), ty(6.5), 0.25, 'F');
    };

    for (let i = 0; i < horizSteps; i++) {
      const x0 = borderLeft + cornerSize + i * tileW;
      drawHorizFiligreeTile(x0, borderTop + 0.3, false);
      drawHorizFiligreeTile(x0, borderBottom - 0.3, true);
    }

    // Repeating wavy S-curve filigree motif along left & right edges (matching verticalFiligreeSvg)
    const vertSpan = borderBottom - borderTop - cornerSize * 2;
    const vertSteps = Math.round(vertSpan / 8.5);
    const vTileH = vertSpan / vertSteps;
    const vTileW = 4.6;

    const drawVertFiligreeTile = (xEdge: number, y0: number, invertX: boolean) => {
      const tx = (u: number) =>
        invertX ? xEdge - (u / 18) * vTileW : xEdge + (u / 18) * vTileW;
      const ty = (v: number) => y0 + (v / 36) * vTileH;

      doc.setDrawColor(138, 131, 114);
      doc.setLineWidth(0.24);
      drawCubicBezier(tx(13), ty(2), tx(5), ty(5), tx(5), ty(10), tx(11), ty(13), 6);
      drawCubicBezier(tx(11), ty(13), tx(14), ty(15), tx(14), ty(21), tx(11), ty(23), 6);
      drawCubicBezier(tx(11), ty(23), tx(5), ty(26), tx(5), ty(31), tx(13), ty(34), 6);

      doc.setLineWidth(0.18);
      drawCubicBezier(tx(13), ty(6), tx(8), ty(8), tx(8), ty(12), tx(12), ty(14), 5);
      drawCubicBezier(tx(12), ty(22), tx(8), ty(24), tx(8), ty(28), tx(13), ty(30), 5);

      doc.setFillColor(138, 131, 114);
      doc.circle(tx(6.5), ty(9), 0.25, 'F');
      doc.circle(tx(5.5), ty(18), 0.3, 'F');
      doc.circle(tx(6.5), ty(27), 0.25, 'F');
    };

    for (let i = 0; i < vertSteps; i++) {
      const y0 = borderTop + cornerSize + i * vTileH;
      drawVertFiligreeTile(borderLeft + 0.3, y0, false);
      drawVertFiligreeTile(borderRight - 0.3, y0, true);
    }

    // 4 Corner double-squares (▣)
    const cornerCoords = [
      { x: borderLeft, y: borderTop },
      { x: borderRight - cornerSize, y: borderTop },
      { x: borderLeft, y: borderBottom - cornerSize },
      { x: borderRight - cornerSize, y: borderBottom - cornerSize }
    ];
    cornerCoords.forEach(c => {
      doc.setFillColor(239, 236, 225);
      doc.setDrawColor(138, 131, 114);
      doc.setLineWidth(0.45);
      doc.rect(c.x, c.y, cornerSize, cornerSize, 'FD');
      doc.setLineWidth(0.3);
      doc.rect(c.x + 1.1, c.y + 1.1, cornerSize - 2.2, cornerSize - 2.2, 'D');
      doc.setFillColor(138, 131, 114);
      doc.rect(c.x + 2.1, c.y + 2.1, cornerSize - 4.2, cornerSize - 4.2, 'F');
    });
  };

  // Helper to draw green circular checkmark icon
  const drawGreenCheckmark = (cx: number, cy: number) => {
    doc.setFillColor(21, 153, 43);
    doc.circle(cx, cy, 2.3, 'F');
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.55);
    doc.line(cx - 1.0, cy + 0.1, cx - 0.2, cy + 0.9);
    doc.line(cx - 0.2, cy + 0.9, cx + 1.1, cy - 0.8);
  };

  // =========================================================================
  // SINGLE-PAGE TRADE ASSURANCE CERTIFICATE (EXACT SITE REPLICA)
  // =========================================================================
  drawClassicSovereignFrame();

  // 1. Top ornamental scroll flourish + horizontal line
  drawScrollFlourish(centerX, 24.5, false);
  doc.setDrawColor(200, 193, 176);
  doc.setLineWidth(0.35);
  doc.line(centerX - 54, 33.8, centerX + 54, 33.8);

  // Main Title: TRADE ASSURANCE CERTIFICATE
  doc.setTextColor(44, 44, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.text('TRADE ASSURANCE CERTIFICATE', centerX, 42.5, { align: 'center' });

  // Bottom horizontal line + mirrored ornamental scroll flourish
  doc.setDrawColor(200, 193, 176);
  doc.setLineWidth(0.35);
  doc.line(centerX - 54, 47.2, centerX + 54, 47.2);
  drawScrollFlourish(centerX, 48.2, true);

  // 2. Central CERTIFIED | 100% Trusted Emblem
  const stampX = centerX - 15.5;
  const stampY = 72;

  // 3 concentric green seal rings (outer dashed, middle solid, inner dashed)
  doc.setDrawColor(56, 133, 66);
  doc.setLineWidth(0.75);
  drawDashedCircle(stampX, stampY, 10.8, 32, 0.72);
  doc.setLineWidth(0.45);
  doc.circle(stampX, stampY, 9.5, 'D');
  doc.setLineWidth(0.3);
  drawDashedCircle(stampX, stampY, 8.1, 26, 0.65);

  // Top 3 & Bottom 3 Five-Pointed Vector Stars (★ ★ ★)
  doc.setFillColor(56, 133, 66);
  [-3.1, 0, 3.1].forEach(dx => {
    drawFivePointStar(stampX + dx, stampY - 5.5, 1.05, 0.42);
    drawFivePointStar(stampX + dx, stampY + 5.6, 1.05, 0.42);
  });

  // Angled (-12 deg) Green CERTIFIED Ribbon Banner
  const ribbonAngleRad = (-12 * Math.PI) / 180;
  const rotRibbonPt = (lx: number, ly: number) => ({
    x: stampX + lx * Math.cos(ribbonAngleRad) - ly * Math.sin(ribbonAngleRad),
    y: stampY + lx * Math.sin(ribbonAngleRad) + ly * Math.cos(ribbonAngleRad)
  });

  const rw = 11.6;
  const rh = 2.95;
  const rTL = rotRibbonPt(-rw, -rh);
  const rTR = rotRibbonPt(rw, -rh);
  const rBR = rotRibbonPt(rw, rh);
  const rBL = rotRibbonPt(-rw, rh);

  // Fill green ribbon + cream border
  doc.setFillColor(56, 133, 66);
  doc.triangle(rTL.x, rTL.y, rTR.x, rTR.y, rBR.x, rBR.y, 'F');
  doc.triangle(rTL.x, rTL.y, rBL.x, rBL.y, rBR.x, rBR.y, 'F');
  doc.setDrawColor(239, 236, 225);
  doc.setLineWidth(0.38);
  doc.line(rTL.x, rTL.y, rTR.x, rTR.y);
  doc.line(rTR.x, rTR.y, rBR.x, rBR.y);
  doc.line(rBR.x, rBR.y, rBL.x, rBL.y);
  doc.line(rBL.x, rBL.y, rTL.x, rTL.y);

  // Inner light-green pinstripes inside ribbon
  doc.setDrawColor(165, 214, 167);
  doc.setLineWidth(0.2);
  const pTopL = rotRibbonPt(-rw + 0.7, -rh + 0.75);
  const pTopR = rotRibbonPt(rw - 0.7, -rh + 0.75);
  const pBotL = rotRibbonPt(-rw + 0.7, rh - 0.75);
  const pBotR = rotRibbonPt(rw - 0.7, rh - 0.75);
  doc.line(pTopL.x, pTopL.y, pTopR.x, pTopR.y);
  doc.line(pBotL.x, pBotL.y, pBotR.x, pBotR.y);

  // Rotated white "CERTIFIED" text inside ribbon
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  const txtAnchor = rotRibbonPt(0, 0.95);
  doc.text('CERTIFIED', txtAnchor.x, txtAnchor.y, { align: 'center', angle: 12 });

  // Vertical Green Bar
  doc.setDrawColor(46, 139, 69);
  doc.setLineWidth(0.75);
  doc.line(centerX, stampY - 8.5, centerX, stampY + 8.5);

  // 100% Trusted Text
  doc.setTextColor(59, 155, 76);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13.5);
  doc.text('100%', centerX + 5.5, stampY - 1.2);
  doc.setFontSize(12.5);
  doc.text('Trusted', centerX + 5.5, stampY + 5.2);

  // 3. Certification Statement
  doc.setTextColor(117, 116, 110);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text('This is to certify that', centerX, 95, { align: 'center' });

  doc.setTextColor(38, 38, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(19.5);
  doc.text(cert.companyName.substring(0, 46), centerX, 105.5, { align: 'center' });

  // "is an esteemed and reliable seller on " + bold "Trade Heaven"
  const sellerPrefix = 'is an esteemed and reliable seller on ';
  const sellerBrand = 'Trade Heaven';
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'normal');
  const prefixW = doc.getTextWidth(sellerPrefix);
  doc.setFont('helvetica', 'bold');
  const brandW = doc.getTextWidth(sellerBrand);
  const totalSellerW = prefixW + brandW;
  const sellerStartX = centerX - totalSellerW / 2;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(117, 116, 110);
  doc.text(sellerPrefix, sellerStartX, 113.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(110, 109, 104);
  doc.text(sellerBrand, sellerStartX + prefixW, 113.5);

  // 4. Verified Details Block (Address, Director/Owner, Registration number)
  const blockLeft = 42;
  let detailY = 129;

  // Address
  drawGreenCheckmark(blockLeft, detailY - 1.2);
  doc.setTextColor(110, 109, 104);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Address', blockLeft + 4.5, detailY);

  doc.setTextColor(34, 34, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  const addrLines = doc.splitTextToSize(fullAddress, pageWidth - blockLeft * 2 - 6);
  doc.text(addrLines.slice(0, 2), blockLeft + 4.5, detailY + 6.5);

  // Director/Owner & Registration number
  detailY = 156;
  drawGreenCheckmark(blockLeft, detailY - 1.2);
  doc.setTextColor(110, 109, 104);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Director/Owner', blockLeft + 4.5, detailY);

  doc.setTextColor(34, 34, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.8);
  doc.text(holderName.substring(0, 30), blockLeft + 4.5, detailY + 6.8);

  const rightColLeft = centerX + 5;
  drawGreenCheckmark(rightColLeft, detailY - 1.2);
  doc.setTextColor(110, 109, 104);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Registration number', rightColLeft + 4.5, detailY);

  doc.setTextColor(34, 34, 32);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.8);
  doc.text(regNumber.substring(0, 28), rightColLeft + 4.5, detailY + 6.8);

  // 5. Horizontal Divider & Verification Footnote
  doc.setDrawColor(207, 203, 192);
  doc.setLineWidth(0.35);
  doc.line(35, 176, pageWidth - 35, 176);

  doc.setTextColor(43, 43, 41);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.8);
  doc.text(
    'The process of verification has been carried out by Trade Heaven and its bank.',
    centerX,
    187,
    { align: 'center' }
  );

  // 6. Certificate no. & Issue date Row
  const certColX = centerX - 30;
  const dateColX = centerX + 30;

  doc.setTextColor(30, 30, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(serialNo, certColX, 201, { align: 'center' });
  doc.setTextColor(112, 111, 106);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Certificate no.', certColX, 207.5, { align: 'center' });

  doc.setTextColor(30, 30, 28);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12.5);
  doc.text(formattedIssueDate, dateColX, 201, { align: 'center' });
  doc.setTextColor(112, 111, 106);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Issue date', dateColX, 207.5, { align: 'center' });

  // 7. Lower Horizontal Divider & Black/White Trade Heaven Footer
  doc.setDrawColor(207, 203, 192);
  doc.setLineWidth(0.35);
  doc.line(50, 221, pageWidth - 50, 221);

  const logoY = 232;
  // White badge box with black border
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.35);
  doc.roundedRect(centerX - 36, logoY - 5.5, 72, 11, 1.5, 1.5, 'FD');

  // Official TH Square Monogram inside badge (exact block T & H vector paths matching SVG)
  const thBoxX = centerX - 34;
  const thBoxY = logoY - 4.1;
  const thBoxSize = 8.2;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.32);
  doc.roundedRect(thBoxX, thBoxY, thBoxSize, thBoxSize, 0.7, 0.7, 'FD');

  const sUnit = thBoxSize / 512;
  doc.setFillColor(0, 0, 0);
  // Letter T: M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z
  doc.rect(thBoxX + 66 * sUnit, thBoxY + 136 * sUnit, 180 * sUnit, 50 * sUnit, 'F');
  doc.rect(thBoxX + 131 * sUnit, thBoxY + 186 * sUnit, 50 * sUnit, 190 * sUnit, 'F');
  // Letter H: M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z
  doc.rect(thBoxX + 266 * sUnit, thBoxY + 136 * sUnit, 50 * sUnit, 240 * sUnit, 'F');
  doc.rect(thBoxX + 316 * sUnit, thBoxY + 231 * sUnit, 80 * sUnit, 50 * sUnit, 'F');
  doc.rect(thBoxX + 396 * sUnit, thBoxY + 136 * sUnit, 50 * sUnit, 240 * sUnit, 'F');

  // Black & White Wordmark
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.2);
  doc.setTextColor(0, 0, 0);
  doc.text('TRADE HEAVEN', centerX - 24, logoY - 0.5);

  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.2);
  doc.text('Global B2B Marketplace & Exporters Network', centerX - 24, logoY + 3.0);

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TRADE HEAVEN', centerX, 246, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.8);
  doc.text('Tradeheaven ECOM Solution LLP, B-18424, Gauri Ganj, Auraiya Road,', centerX, 252.5, {
    align: 'center'
  });
  doc.text('In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh 206244, India', centerX, 257.5, {
    align: 'center'
  });

  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.2);
  doc.text('+91-8532934479   |   support@tradeheaven.net   |   www.tradeheaven.net', centerX, 264.5, {
    align: 'center'
  });

  if (options?.openPrintDialog) {
    doc.autoPrint();
  }

  const safeSerial = serialNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  triggerSafePdfDownload(doc, `TradeHeaven-Certificate-${safeSerial}.pdf`);
};

export const generatePaymentReceiptPDF = (
  receipt: PaymentReceiptPdfData,
  options?: { openPrintDialog?: boolean; filenamePrefix?: string }
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

  // Outer Precision Double Frame
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.7);
  doc.rect(6, 6, pageWidth - 12, pageHeight - 12);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.rect(7.6, 7.6, pageWidth - 15.2, pageHeight - 15.2);

  // =========================================================================
  // 1. TOP BRAND IDENTITY HEADER BANNER (WITH LOGOS & METADATA CARD)
  // =========================================================================
  doc.setFillColor(15, 23, 42); // Slate-900
  doc.roundedRect(margin, 11, contentWidth, 29, 2, 2, 'F');
  // Dual Gold + Emerald bottom accent strip inside header
  doc.setFillColor(245, 158, 11);
  doc.rect(margin, 38.2, contentWidth * 0.62, 1.8, 'F');
  doc.setFillColor(16, 185, 129);
  doc.rect(margin + contentWidth * 0.62, 38.2, contentWidth * 0.38, 1.8, 'F');

  // Official Vector TH Brand Logo & Wordmark
  drawTradeHeavenBrandLogo(doc, margin + 4.5, 14, {
    boxSize: 12,
    theme: 'dark',
    subtitle: 'GLOBAL B2B MARKETPLACE, ESCROW & TREASURY CLEARING DESK'
  });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(
    'Issuing Entity: Tradeheaven ECOM Solution LLP  |   portal: www.tradeheaven.net  |  help@tradeheaven.net',
    margin + 4.5,
    31.2
  );
  doc.setTextColor(52, 211, 153);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(
    'DOCUMENT ARCHITECTURE: SEGREGATED TECHNICAL SPECS (PART A) & CONFIDENTIAL PRICING (PART B)',
    margin + 4.5,
    35.8
  );

  // Right Metadata Pill Box
  const receiptNo =
    receipt.receiptId ||
    receipt.orderId ||
    `TH-INV-${Date.now().toString().slice(-6)}`;
  const issuedDate = receipt.issuedAt || new Date().toISOString().slice(0, 10);
  const validUntil =
    receipt.validUntil ||
    new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);

  const metaBoxW = 58;
  const metaBoxX = pageWidth - margin - metaBoxW - 3.5;
  doc.setFillColor(30, 41, 59);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(0.35);
  doc.roundedRect(metaBoxX, 13.5, metaBoxW, 22.5, 1.5, 1.5, 'FD');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('COMMERCIAL INVOICE & RECEIPT', metaBoxX + metaBoxW / 2, 17.8, {
    align: 'center'
  });

  doc.setTextColor(255, 255, 255);
  doc.setFont('courier', 'bold');
  doc.setFontSize(8.8);
  doc.text(receiptNo, metaBoxX + metaBoxW / 2, 22.8, { align: 'center' });

  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.text(`Issued: ${issuedDate}  |  Valid: ${validUntil}`, metaBoxX + metaBoxW / 2, 27.3, {
    align: 'center'
  });

  // Status badge inside metadata card
  const statusLabel = (receipt.status || 'VERIFIED INVOICE').toUpperCase();
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(metaBoxX + 7, 29.3, metaBoxW - 14, 4.8, 1, 1, 'F');
  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.text(`STATUS: ${statusLabel}`, metaBoxX + metaBoxW / 2, 32.6, { align: 'center' });

  let y = 43.5;

  // =========================================================================
  // 2. TWO-COLUMN COUNTERPARTY & BENEFICIARY CARDS
  // =========================================================================
  const colW = (contentWidth - 4) / 2;
  const partyCardH = 27;

  // Left Card: Buyer / Billed Entity
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, colW, partyCardH, 1.5, 1.5, 'FD');
  doc.setFillColor(37, 99, 235);
  doc.rect(margin, y, 2.2, partyCardH, 'F');

  doc.setTextColor(30, 64, 175);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('BUYER / CONSIGNEE & BILLED ENTITY', margin + 5, y + 5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(
    (receipt.companyName || receipt.billingName || 'Verified Corporate Trade Account').substring(0, 44),
    margin + 5,
    y + 10.2
  );

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(
    `Attn / Signatory: ${receipt.billingName || 'Authorized Procurement Officer'}`,
    margin + 5,
    y + 15
  );
  doc.text(
    `Email: ${receipt.clientEmail || 'procurement@verified-partner.com'}${receipt.clientPhone ? `  |  Tel: ${receipt.clientPhone}` : ''}`,
    margin + 5,
    y + 19.5
  );
  doc.text(
    `Destination / Terms: ${receipt.destinationPort || 'Global Customs Port'}  |  Incoterm: ${receipt.incoterm || 'CIF / FOB (Incoterms 2020)'}`,
    margin + 5,
    y + 24
  );

  // Right Card: Supplier / Beneficiary & Treasury
  const rightCardX = margin + colW + 4;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(rightCardX, y, colW, partyCardH, 1.5, 1.5, 'FD');
  doc.setFillColor(16, 185, 129);
  doc.rect(rightCardX, y, 2.2, partyCardH, 'F');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('ISSUING SUPPLIER / ESCROW BENEFICIARY', rightCardX + 5, y + 5);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.8);
  doc.text(
    (receipt.supplierCompany || 'TRADEHEAVEN ECOM SOLUTION LLP').substring(0, 44),
    rightCardX + 5,
    y + 10.2
  );

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.text(
    `Beneficiary Treasury: TRADEHEAVEN ECOM SOLUTION LLP (Verified Vault)`,
    rightCardX + 5,
    y + 15
  );
  doc.text(
    `Quality & Audit Partner: SGS / TUV Rheinland / ISO 9001 Desk`,
    rightCardX + 5,
    y + 19.5
  );
  doc.text(
    `Settlement Rail: ${receipt.paymentMethod || 'SWIFT MT103 Corporate Wire / Custodial Escrow'}`,
    rightCardX + 5,
    y + 24
  );

  y += partyCardH + 4.5;

  // =========================================================================
  // 3. PART A — NON-SENSITIVE PRODUCT & TECHNICAL SPECIFICATIONS TABLE
  //    (Strictly segregated from price-sensitive valuation data)
  // =========================================================================
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentWidth, 7.5, 1.2, 1.2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text(
    'PART A  ·  NON-SENSITIVE PRODUCT, TECHNICAL & LOGISTICS SPECIFICATIONS',
    margin + 3.5,
    y + 5.1
  );

  // Right badge indicating Non-Sensitive Public/Logistics Scope
  doc.setFillColor(14, 116, 144); // Cyan-700
  doc.roundedRect(pageWidth - margin - 67, y + 1.2, 64.5, 5.1, 1, 1, 'F');
  doc.setTextColor(224, 242, 254);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(
    'NON-SENSITIVE SPECS ONLY (NO PRICING)',
    pageWidth - margin - 34.75,
    y + 4.6,
    { align: 'center' }
  );

  y += 8.8;

  // Build normalized line items
  const resolvedItems: InvoiceProductLineItem[] =
    receipt.items && receipt.items.length > 0
      ? receipt.items
      : [
          {
            itemNo: '01',
            skuOrHsCode: receipt.type ? `TH-${receipt.type.slice(0, 8).toUpperCase()}-01` : 'HS-8479.89 / TH-01',
            productName: receipt.title || 'Trade Heaven B2B Export Contract & Escrow Settlement',
            technicalSpecs:
              receipt.description ||
              'ISO 9001 Quality Management verified; SGS / TUV pre-shipment batch inspection; sovereign legal KYC & Certificate of Origin compliance.',
            packagingSpecs: 'Export-Grade Containerized / Verified Digital Dossier',
            incoterm: receipt.incoterm || 'CIF / FOB (Incoterms 2020)',
            leadTime: '7 – 21 Calendar Days',
            quantity: 1,
            unit: 'Lot / Contract',
            unitPriceUsd: Number(receipt.amountUsd) || 0,
            taxOrFeeUsd: 0,
            lineTotalUsd: Number(receipt.amountUsd) || 0
          }
        ];

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        'ITEM',
        'SKU / HS CODE',
        'PRODUCT / SERVICE NAME',
        'TECHNICAL, QUALITY & PACKAGING SPECIFICATIONS (NON-SENSITIVE)',
        'INCOTERM & LEAD TIME',
        'QTY / UNIT'
      ]
    ],
    body: resolvedItems.map((item, idx) => [
      item.itemNo || String(idx + 1).padStart(2, '0'),
      item.skuOrHsCode || `TH-SKU-0${idx + 1}`,
      item.productName,
      `${item.technicalSpecs || 'ISO 9001 & SGS pre-shipment quality verified.'}${
        item.packagingSpecs ? `\nPackaging: ${item.packagingSpecs}` : ''
      }`,
      `${item.incoterm || receipt.incoterm || 'CIF / FOB'}\nLead: ${item.leadTime || '7-14 Days'}`,
      `${item.quantity.toLocaleString()} ${item.unit || 'Units'}`
    ]),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.2,
      cellPadding: 2.4,
      textColor: [30, 41, 59],
      lineColor: [203, 213, 225],
      lineWidth: 0.25,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 6.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 11, halign: 'center', font: 'courier', fontStyle: 'bold' },
      1: { cellWidth: 26, font: 'courier', fontSize: 6.8 },
      2: { cellWidth: 38, fontStyle: 'bold' },
      3: { cellWidth: 63 },
      4: { cellWidth: 26 },
      5: { cellWidth: 22, halign: 'right', font: 'courier', fontStyle: 'bold' }
    }
  });

  const afterSpecTableY = (doc as any).lastAutoTable?.finalY
    ? (doc as any).lastAutoTable.finalY + 4.5
    : y + 28;
  y = afterSpecTableY;

  // =========================================================================
  // 4. SEGREGATION DIVIDER: NON-SENSITIVE SPECS vs. PRICE-SENSITIVE SCHEDULE
  // =========================================================================
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.35);
  doc.line(margin, y + 3, pageWidth - margin, y + 3);

  const dividerPillW = 138;
  const dividerPillX = (pageWidth - dividerPillW) / 2;
  doc.setFillColor(254, 243, 199); // Amber-100
  doc.setDrawColor(217, 119, 6);
  doc.roundedRect(dividerPillX, y, dividerPillW, 6, 1.5, 1.5, 'FD');
  doc.setTextColor(146, 64, 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.3);
  doc.text(
    'CONFIDENTIAL FINANCIAL BOUNDARY  ·  PRICE-SENSITIVE VALUATION & TREASURY DATA BELOW',
    pageWidth / 2,
    y + 4,
    { align: 'center' }
  );

  y += 9;

  // =========================================================================
  // 5. PART B — PRICE-SENSITIVE COMMERCIAL PRICING & ESCROW SETTLEMENT TABLE
  // =========================================================================
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, contentWidth, 7.5, 1.2, 1.2, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.6);
  doc.text(
    'PART B  ·  PRICE-SENSITIVE COMMERCIAL VALUATION & SETTLEMENT SCHEDULE',
    margin + 3.5,
    y + 5.1
  );

  doc.setFillColor(180, 83, 9); // Amber-700
  doc.roundedRect(pageWidth - margin - 65, y + 1.2, 62.5, 5.1, 1, 1, 'F');
  doc.setTextColor(255, 251, 235);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.text(
    'CONFIDENTIAL  ·  FINANCE & TREASURY',
    pageWidth - margin - 33.75,
    y + 4.6,
    { align: 'center' }
  );

  y += 8.8;

  const formatUsd = (val: number) =>
    `$${(Number(val) || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} USD`;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [
      [
        'ITEM',
        'BILLABLE PRODUCT / SERVICE LINE ITEM',
        'BILLABLE QTY',
        'CURRENCY',
        'UNIT PRICE (USD)',
        'ESCROW / TAX',
        'LINE TOTAL (USD)'
      ]
    ],
    body: resolvedItems.map((item, idx) => {
      const lineTotal =
        item.lineTotalUsd ?? item.quantity * item.unitPriceUsd + (item.taxOrFeeUsd || 0);
      return [
        item.itemNo || String(idx + 1).padStart(2, '0'),
        item.productName,
        `${item.quantity.toLocaleString()} ${item.unit || 'Units'}`,
        String(receipt.currency || 'USD'),
        formatUsd(item.unitPriceUsd),
        item.taxOrFeeUsd ? formatUsd(item.taxOrFeeUsd) : '$0.00 (Included)',
        formatUsd(lineTotal)
      ];
    }),
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 7.4,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.25,
      valign: 'middle'
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 6.8
    },
    columnStyles: {
      0: { cellWidth: 11, halign: 'center', font: 'courier', fontStyle: 'bold' },
      1: { cellWidth: 59, fontStyle: 'bold' },
      2: { cellWidth: 23, halign: 'right', font: 'courier' },
      3: { cellWidth: 18, halign: 'center', font: 'courier', fontStyle: 'bold' },
      4: { cellWidth: 26, halign: 'right', font: 'courier' },
      5: { cellWidth: 23, halign: 'right', font: 'courier', textColor: [4, 120, 87] },
      6: {
        cellWidth: 26,
        halign: 'right',
        font: 'courier',
        fontStyle: 'bold',
        fillColor: [254, 252, 232]
      }
    }
  });

  y = (doc as any).lastAutoTable?.finalY
    ? (doc as any).lastAutoTable.finalY + 4.5
    : y + 24;

  // =========================================================================
  // 6. TWO-COLUMN BANK WIRE COORDINATES & COMMERCIAL TOTALS SUMMARY
  // =========================================================================
  const totalUsdVal = Number(receipt.amountUsd) || 0;
  const amountUsdStr = formatUsd(totalUsdVal);
  const primaryAmt = receipt.convertedAmountFormatted || amountUsdStr;
  const deposit30Usd = formatUsd(totalUsdVal * 0.3);
  const balance70Usd = formatUsd(totalUsdVal * 0.7);

  const summaryBoxH = 44;
  const leftBoxW = contentWidth * 0.56;
  const rightBoxW = contentWidth * 0.44 - 4;

  // Left Box: Official Bank Settlement Coordinates (SWIFT MT103)
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, leftBoxW, summaryBoxH, 1.5, 1.5, 'FD');

  doc.setFillColor(15, 23, 42);
  doc.roundedRect(margin, y, leftBoxW, 6.5, 1.5, 1.5, 'F');
  doc.rect(margin, y + 3.5, leftBoxW, 3, 'F');
  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text(
    'OFFICIAL CORPORATE BANK WIRE COORDINATES (SWIFT MT103)',
    margin + 3.5,
    y + 4.5
  );

  const bankRows = [
    ['Beneficiary Name:', 'TRADEHEAVEN ECOM SOLUTION LLP'],
    ['Receiving Bank:', 'The Currency Cloud Limited (London, UK)'],
    ['IBAN (Multi-CCY):', 'GB81TCCL04140453340868'],
    ['BIC / SWIFT Code:', 'TCCLGB3L  (DO NOT CONVERT TO GBP)'],
    ['Wire Reference:', receipt.wireTxRef || receiptNo]
  ];

  let by = y + 10.8;
  bankRows.forEach(([k, v]) => {
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.text(k, margin + 3.5, by);

    doc.setTextColor(15, 23, 42);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.1);
    doc.text(v.substring(0, 42), margin + 30, by);
    by += 5.4;
  });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.text(
    `Notes: ${(receipt.notes || '30-Day Refund Eligibility Window & Full Assurance of Trade Heaven applies.').substring(0, 68)}`,
    margin + 3.5,
    y + summaryBoxH - 2.8
  );

  // Right Box: Price-Sensitive Financial Totals & Escrow Split
  const finBoxX = margin + leftBoxW + 4;
  doc.setFillColor(15, 23, 42);
  doc.setDrawColor(15, 23, 42);
  doc.roundedRect(finBoxX, y, rightBoxW, summaryBoxH, 1.5, 1.5, 'FD');

  doc.setTextColor(251, 191, 36);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.8);
  doc.text('FINANCIAL SETTLEMENT SUMMARY', finBoxX + 4, y + 5.5);

  const finLines = [
    ['Subtotal (Net USD):', amountUsdStr],
    ['Escrow & SGS Audit Fee:', '$0.00 (Included)'],
    ['30% Deposit Milestone:', deposit30Usd],
    ['70% B/L Balance Milestone:', balance70Usd]
  ];

  let fy = y + 11.2;
  finLines.forEach(([label, val]) => {
    doc.setTextColor(203, 213, 225);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.text(label, finBoxX + 4, fy);

    doc.setTextColor(255, 255, 255);
    doc.setFont('courier', 'bold');
    doc.setFontSize(7.1);
    doc.text(val, finBoxX + rightBoxW - 4, fy, { align: 'right' });
    fy += 5.1;
  });

  // Total Amount Highlight Box inside Financial Card
  doc.setFillColor(6, 78, 59);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.35);
  doc.roundedRect(finBoxX + 3, y + 31.2, rightBoxW - 6, 10.5, 1.2, 1.2, 'FD');

  doc.setTextColor(167, 243, 208);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('TOTAL SETTLEMENT', finBoxX + 6, y + 35.5);
  doc.setTextColor(203, 213, 225);
  doc.setFont('courier', 'normal');
  doc.setFontSize(6.2);
  doc.text(`(${amountUsdStr})`, finBoxX + 6, y + 39.6);

  doc.setTextColor(52, 211, 153);
  doc.setFont('courier', 'bold');
  doc.setFontSize(9.2);
  doc.text(primaryAmt, finBoxX + rightBoxW - 6, y + 37.8, { align: 'right' });

  y += summaryBoxH + 4.5;

  // =========================================================================
  // 7. TRADE ASSURANCE MISHAP & STUCK PAYMENT LOSS COVERAGE BANNER
  // =========================================================================
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, y, contentWidth, 16.5, 1.5, 1.5, 'FD');

  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.4);
  doc.text(
    'TRADE ASSURANCE MISHAP & STUCK PAYMENT LOSS COVERAGE (FULL ASSURANCE OF TRADE HEAVEN)',
    margin + 4,
    y + 5.2
  );

  doc.setTextColor(6, 78, 59);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  const assuranceText =
    'In case of any mishap such as a stuck payment or intermediary bank clearing delay where the Supplier or Buyer holds active Trade Assurance, losses are actively tried to be covered with the direct help of Trade Heaven, and Full Assurance is of Trade Heaven.';
  doc.text(doc.splitTextToSize(assuranceText, contentWidth - 8), margin + 4, y + 9.8);

  // =========================================================================
  // 8. OFFICIAL BRANDED FOOTER WITH MINI VECTOR LOGO
  // =========================================================================
  const footerY = pageHeight - 17;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 2, pageWidth - margin, footerY - 2);

  drawTradeHeavenBrandLogo(doc, margin, footerY, {
    boxSize: 7.5,
    theme: 'light',
    showWordmark: false
  });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.text(
    'TRADEHEAVEN ECOM SOLUTION LLP  ·  OFFICIAL COMMERCIAL INVOICE & ESCROW REGISTRY',
    margin + 9.5,
    footerY + 3
  );

  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.6);
  doc.text(
    'B-18424, Gauri Ganj, Auraiya Road, Dibiyapur, UP 206244, India  |  +91-8532934479  |  help@tradeheaven.net  |  www.tradeheaven.net',
    margin + 9.5,
    footerY + 6.6
  );

  doc.setTextColor(15, 23, 42);
  doc.setFont('courier', 'bold');
  doc.setFontSize(6.8);
  doc.text('Page 1 of 1', pageWidth - margin, footerY + 4.8, { align: 'right' });

  if (options?.openPrintDialog) {
    doc.autoPrint();
  }

  const safeRef = receiptNo.replace(/[^a-zA-Z0-9-_]/g, '_');
  const prefix = options?.filenamePrefix || 'TradeHeaven-Invoice';
  triggerSafePdfDownload(doc, `${prefix}-${safeRef}.pdf`);
};

export const generateCommercialInvoicePDF = (
  invoiceData: PaymentReceiptPdfData,
  options?: { openPrintDialog?: boolean }
) => {
  generatePaymentReceiptPDF(invoiceData, {
    ...options,
    filenamePrefix: 'TradeHeaven-Commercial-Invoice'
  });
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
      } else if (mode === 'PAYMENT_RECEIPT' || mode === 'INVOICE') {
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
        generatePaymentReceiptPDF(resolvedReceipt, {
          openPrintDialog,
          filenamePrefix:
            mode === 'INVOICE'
              ? 'TradeHeaven-Commercial-Invoice'
              : 'TradeHeaven-Invoice-Receipt'
        });
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
        : mode === 'INVOICE'
          ? 'Download Invoice PDF'
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
