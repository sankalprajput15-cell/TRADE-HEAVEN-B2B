import React from 'react';
import type { TradeAssuranceCertificateRecord } from './TradeAssuranceCertificateView';

export function getTodayDdMmYyyy(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export function formatCertDateDdMmYyyy(dateStr?: string): string {
  if (!dateStr) return getTodayDdMmYyyy();
  const trimmed = dateStr.trim();
  // Already DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    return trimmed;
  }
  // YYYY-MM-DD -> DD-MM-YYYY
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymd) {
    return `${ymd[3]}-${ymd[2]}-${ymd[1]}`;
  }
  return trimmed;
}

export function resolveCertificateDirector(cert: TradeAssuranceCertificateRecord): string {
  if (cert.applicantName && cert.applicantName.trim()) {
    return cert.applicantName.replace(/\s*\(.*?\)\s*/g, '').trim();
  }
  if (cert.holder && cert.holder.trim()) {
    const attnMatch = cert.holder.match(/Attn:\s*([^)]+)/i);
    if (attnMatch) return attnMatch[1].trim();
    if (cert.holder.toLowerCase() !== cert.companyName.toLowerCase()) {
      return cert.holder.trim();
    }
  }
  return 'Authorized Managing Director';
}

export function resolveCertificateAddress(cert: TradeAssuranceCertificateRecord): string {
  if (cert.registeredAddress && cert.registeredAddress.trim()) {
    return cert.registeredAddress.trim();
  }
  const fallbackByCountry: Record<string, string> = {
    India: '294/88khala bazar, Charminari Masjid ,Lucknow UTTAR PRADESH, 226003, Lucknow',
    Australia: '2 Park Road, Sans Souci NSW 2219, Sydney, Australia',
    Germany: 'Thyssenstraße 142, 47166 Duisburg, North Rhine-Westphalia, Germany',
    'United States': 'Suite 400, 1200 Harbor Boulevard, Weehawken, NJ 07086, United States',
    'United Kingdom': '71-75 Shelton Street, Covent Garden, London WC2H 9JQ, United Kingdom',
    Singapore: '10 Marina Boulevard, #32-01 Marina Bay Financial Centre, Singapore 018983',
    'United Arab Emirates': 'Plot S20412, Jebel Ali Free Zone (JAFZA South), Dubai, UAE'
  };
  return (
    fallbackByCountry[cert.country] ||
    `Corporate Export Trade Zone, ${cert.country}`
  );
}

interface ClassicTradeAssuranceCertificateCardProps {
  certificate: TradeAssuranceCertificateRecord;
  marketplaceBrandName?: string;
  marketplaceAddressLine1?: string;
  marketplaceAddressLine2?: string;
  marketplacePhone?: string;
  marketplaceEmail?: string;
  className?: string;
}

const GreenVerifiedCheckIcon: React.FC = () => (
  <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#15992B] text-white shrink-0 shadow-2xs">
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="w-3 h-3"
      aria-hidden="true"
    >
      <path
        d="M3.5 8.3L6.5 11.3L12.7 4.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const CornerSquareOrnament: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br' }> = ({
  position
}) => {
  const posClasses = {
    tl: 'top-0 left-0',
    tr: 'top-0 right-0',
    bl: 'bottom-0 left-0',
    br: 'bottom-0 right-0'
  }[position];

  return (
    <div
      className={`absolute ${posClasses} w-5 h-5 bg-[#EFECE1] border-[1.5px] border-[#8A8372] flex items-center justify-center z-20`}
      aria-hidden="true"
    >
      <div className="w-2.5 h-2.5 border border-[#8A8372] flex items-center justify-center">
        <div className="w-1 h-1 bg-[#8A8372]" />
      </div>
    </div>
  );
};

export const ClassicTradeAssuranceCertificateCard: React.FC<
  ClassicTradeAssuranceCertificateCardProps
> = ({
  certificate,
  marketplaceBrandName = 'Trade Heaven',
  marketplaceAddressLine1 = 'Tradeheaven ECOM Solution LLP, B-18424, Gauri Ganj, Auraiya Road,',
  marketplaceAddressLine2 = 'In Front Of Anshik Motor, Dibiyapur, Auraiya, Uttar Pradesh 206244, India',
  marketplacePhone = '+91-8532934479',
  marketplaceEmail = 'support@tradeheaven.net',
  className = ''
}) => {
  const directorName = resolveCertificateDirector(certificate);
  const fullAddress = resolveCertificateAddress(certificate);
  const formattedIssueDate = getTodayDdMmYyyy();
  const serialNo = certificate.certificateNumber || certificate.serialNumber || '115534114618';
  const regNumber = certificate.legalRegistrationNumber || certificate.taxOrVatId || '09AAPPU1468B2ZD';

  // Horizontal & Vertical repeating filigree SVG data URLs matching the classic certificate border
  const horizontalFiligreeSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="18" viewBox="0 0 36 18">
      <g fill="none" stroke="#8A8372" stroke-width="1">
        <path d="M2,13 C5,5 10,5 13,11 C15,14 21,14 23,11 C26,5 31,5 34,13" />
        <path d="M6,13 C8,8 12,8 14,12 M22,12 C24,8 28,8 30,13" stroke-width="0.8"/>
        <circle cx="9" cy="6.5" r="1.2" fill="#8A8372" />
        <circle cx="18" cy="5.5" r="1.4" fill="#8A8372" />
        <circle cx="27" cy="6.5" r="1.2" fill="#8A8372" />
        <line x1="0" y1="15.5" x2="36" y2="15.5" stroke="#8A8372" stroke-width="1" />
      </g>
    </svg>
  `);

  const verticalFiligreeSvg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="36" viewBox="0 0 18 36">
      <g fill="none" stroke="#8A8372" stroke-width="1">
        <path d="M13,2 C5,5 5,10 11,13 C14,15 14,21 11,23 C5,26 5,31 13,34" />
        <path d="M13,6 C8,8 8,12 12,14 M12,22 C8,24 8,28 13,30" stroke-width="0.8"/>
        <circle cx="6.5" cy="9" r="1.2" fill="#8A8372" />
        <circle cx="5.5" cy="18" r="1.4" fill="#8A8372" />
        <circle cx="6.5" cy="27" r="1.2" fill="#8A8372" />
        <line x1="15.5" y1="0" x2="15.5" y2="36" stroke="#8A8372" stroke-width="1" />
      </g>
    </svg>
  `);

  return (
    <div
      className={`bg-white p-3 sm:p-5 rounded-sm shadow-xl border border-slate-200 max-w-[680px] mx-auto select-text ${className}`}
    >
      {/* Cream / Antique Parchment Certificate Sheet */}
      <div className="bg-[#EFECE1] p-4 sm:p-7 relative text-[#2B2B29] font-sans">
        {/* Ornate Filigree Border Container */}
        <div className="relative p-5 sm:p-9">
          {/* 4 Corner Squares */}
          <CornerSquareOrnament position="tl" />
          <CornerSquareOrnament position="tr" />
          <CornerSquareOrnament position="bl" />
          <CornerSquareOrnament position="br" />

          {/* Top Filigree Strip */}
          <div
            className="absolute top-[1px] left-5 right-5 h-[18px] z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,${horizontalFiligreeSvg}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '36px 18px'
            }}
            aria-hidden="true"
          />

          {/* Bottom Filigree Strip */}
          <div
            className="absolute bottom-[1px] left-5 right-5 h-[18px] z-10 rotate-180"
            style={{
              backgroundImage: `url("data:image/svg+xml,${horizontalFiligreeSvg}")`,
              backgroundRepeat: 'repeat-x',
              backgroundSize: '36px 18px'
            }}
            aria-hidden="true"
          />

          {/* Left Filigree Strip */}
          <div
            className="absolute top-5 bottom-5 left-[1px] w-[18px] z-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,${verticalFiligreeSvg}")`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '18px 36px'
            }}
            aria-hidden="true"
          />

          {/* Right Filigree Strip */}
          <div
            className="absolute top-5 bottom-5 right-[1px] w-[18px] z-10 rotate-180"
            style={{
              backgroundImage: `url("data:image/svg+xml,${verticalFiligreeSvg}")`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '18px 36px'
            }}
            aria-hidden="true"
          />

          {/* Inner Certificate Content Body */}
          <div className="relative z-20 pt-2 pb-2 px-1 sm:px-4 text-center space-y-6">
            {/* 1. HEADER WITH TOP & BOTTOM ORNAMENTAL SCROLL FLOURISHES */}
            <div className="space-y-3">
              {/* Top Scroll Flourish + Thin Rule */}
              <div className="flex flex-col items-center">
                <svg
                  viewBox="0 0 220 34"
                  className="w-40 sm:w-44 h-7 text-[#B5AD9B]"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M110 4 L114 12 L110 26 L106 12 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M110 24 C95 10, 75 6, 58 14 C46 19, 44 29, 54 30 C62 31, 66 23, 59 20 C90 22, 100 26, 110 28"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110 24 C125 10, 145 6, 162 14 C174 19, 176 29, 166 30 C158 31, 154 23, 161 20 C130 22, 120 26, 110 28"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="w-full max-w-[380px] h-[1px] bg-[#C8C1B0] mt-1" />
              </div>

              {/* Certificate Main Heading */}
              <h3 className="text-lg sm:text-[23px] font-bold tracking-[0.04em] text-[#2C2C2A] uppercase leading-tight">
                TRADE ASSURANCE CERTIFICATE
              </h3>

              {/* Bottom Thin Rule + Mirrored Scroll Flourish */}
              <div className="flex flex-col items-center">
                <div className="w-full max-w-[380px] h-[1px] bg-[#C8C1B0] mb-1" />
                <svg
                  viewBox="0 0 220 34"
                  className="w-40 sm:w-44 h-7 text-[#B5AD9B] rotate-180"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M110 4 L114 12 L110 26 L106 12 Z"
                    fill="currentColor"
                  />
                  <path
                    d="M110 24 C95 10, 75 6, 58 14 C46 19, 44 29, 54 30 C62 31, 66 23, 59 20 C90 22, 100 26, 110 28"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M110 24 C125 10, 145 6, 162 14 C174 19, 176 29, 166 30 C158 31, 154 23, 161 20 C130 22, 120 26, 110 28"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* 2. CENTRAL "CERTIFIED | 100% Trusted" STAMP EMBLEM */}
            <div className="flex items-center justify-center gap-4 sm:gap-5 py-1">
              {/* Green Circular CERTIFIED Stamp */}
              <div className="relative w-[78px] h-[78px] flex items-center justify-center shrink-0">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  aria-hidden="true"
                >
                  {/* Outer scalloped/double green seal ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="#388542"
                    strokeWidth="3"
                    strokeDasharray="6 2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="39"
                    fill="none"
                    stroke="#388542"
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="33"
                    fill="none"
                    stroke="#388542"
                    strokeWidth="1.2"
                    strokeDasharray="3 2"
                  />
                  {/* Top 3 stars */}
                  <text
                    x="50"
                    y="29"
                    textAnchor="middle"
                    fill="#388542"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ★ ★ ★
                  </text>
                  {/* Bottom 3 stars */}
                  <text
                    x="50"
                    y="77"
                    textAnchor="middle"
                    fill="#388542"
                    fontSize="9"
                    fontWeight="bold"
                  >
                    ★ ★ ★
                  </text>
                  {/* Angled Green CERTIFIED Ribbon */}
                  <g transform="rotate(-12 50 50)">
                    <rect
                      x="3"
                      y="38"
                      width="94"
                      height="24"
                      rx="2"
                      fill="#388542"
                      stroke="#EFECE1"
                      strokeWidth="1.5"
                    />
                    <line
                      x1="6"
                      y1="41"
                      x2="94"
                      y2="41"
                      stroke="#A5D6A7"
                      strokeWidth="0.8"
                    />
                    <line
                      x1="6"
                      y1="59"
                      x2="94"
                      y2="59"
                      stroke="#A5D6A7"
                      strokeWidth="0.8"
                    />
                    <text
                      x="50"
                      y="54"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="12.5"
                      fontWeight="800"
                      letterSpacing="1.2"
                    >
                      CERTIFIED
                    </text>
                  </g>
                </svg>
              </div>

              {/* Vertical Green Divider Line */}
              <div className="w-[2.5px] h-12 bg-[#2E8B45] rounded-full shrink-0" />

              {/* 100% Trusted Text */}
              <div className="text-left leading-tight text-[#3B9B4C]">
                <div className="text-xl sm:text-[22px] font-medium tracking-tight">
                  100%
                </div>
                <div className="text-lg sm:text-[20px] font-medium tracking-tight">
                  Trusted
                </div>
              </div>
            </div>

            {/* 3. THIS IS TO CERTIFY THAT + COMPANY NAME */}
            <div className="space-y-1.5 pt-1">
              <p className="text-xs sm:text-[14px] text-[#75746E] font-normal">
                This is to certify that
              </p>
              <h4 className="text-xl sm:text-[27px] font-normal text-[#262624] tracking-tight leading-snug px-2">
                {certificate.companyName}
              </h4>
              <p className="text-xs sm:text-[14.5px] text-[#75746E]">
                is an esteemed and reliable seller on{' '}
                <strong className="font-bold text-[#6E6D68]">
                  {marketplaceBrandName}
                </strong>
              </p>
            </div>

            {/* 4. VERIFIED DETAILS (ADDRESS, DIRECTOR/OWNER, REGISTRATION NUMBER) */}
            <div className="max-w-[490px] mx-auto text-left space-y-6 pt-3">
              {/* Address Block */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <GreenVerifiedCheckIcon />
                  <span className="text-sm sm:text-[15px] text-[#6E6D68] font-normal">
                    Address
                  </span>
                </div>
                <div className="pl-[26px] text-xs sm:text-[14.5px] font-bold text-[#222220] leading-relaxed">
                  {fullAddress}
                </div>
              </div>

              {/* Director/Owner & Registration Number 2-Column Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GreenVerifiedCheckIcon />
                    <span className="text-sm sm:text-[15px] text-[#6E6D68] font-normal">
                      Director/Owner
                    </span>
                  </div>
                  <div className="pl-[26px] text-xs sm:text-[15px] font-bold text-[#222220] break-words">
                    {directorName}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <GreenVerifiedCheckIcon />
                    <span className="text-sm sm:text-[15px] text-[#6E6D68] font-normal">
                      Registration number
                    </span>
                  </div>
                  <div className="pl-[26px] text-xs sm:text-[15px] font-bold text-[#222220] font-sans break-all">
                    {regNumber}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. HORIZONTAL DIVIDER & VERIFICATION FOOTNOTE */}
            <div className="pt-3 space-y-4">
              <div className="w-full max-w-[520px] mx-auto h-[1px] bg-[#CFCBC0]" />
              <p className="text-xs sm:text-[13px] text-[#2B2B29] font-normal">
                The process of verification has been carried out by {marketplaceBrandName} and its bank.
              </p>
            </div>

            {/* 6. CERTIFICATE NO. & ISSUE DATE */}
            <div className="max-w-[400px] mx-auto grid grid-cols-2 gap-4 pt-1 pb-2">
              <div className="text-center space-y-1">
                <div className="text-sm sm:text-[17px] font-bold text-[#1E1E1C] tracking-tight break-all">
                  {serialNo}
                </div>
                <div className="text-xs sm:text-[13.5px] text-[#706F6A]">
                  Certificate no.
                </div>
              </div>

              <div className="text-center space-y-1">
                <div className="text-sm sm:text-[17px] font-bold text-[#1E1E1C] tracking-tight">
                  {formattedIssueDate}
                </div>
                <div className="text-xs sm:text-[13.5px] text-[#706F6A]">
                  Issue date
                </div>
              </div>
            </div>

            {/* 7. LOWER DIVIDER & MARKETPLACE FOOTER */}
            <div className="space-y-4 pt-1">
              <div className="w-full max-w-[390px] mx-auto h-[1px] bg-[#CFCBC0]" />

              {/* Marketplace Logo Lockup (Black & White Trade Heaven Details) */}
              <div className="flex flex-col items-center space-y-2 text-black">
                <div className="inline-flex items-center gap-2.5 bg-white px-3 py-1.5 rounded-lg border border-black/80 shadow-2xs">
                  {/* Official Trade Heaven TH Monogram Logo (Black & White) */}
                  <svg
                    viewBox="0 0 512 512"
                    className="w-8 h-8 shrink-0 rounded border border-black bg-white"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Trade Heaven Logo"
                  >
                    <title>Trade Heaven Logo</title>
                    <rect width="512" height="512" fill="#FFFFFF" />
                    <g fill="#000000">
                      {/* Letter T */}
                      <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
                      {/* Letter H */}
                      <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
                    </g>
                  </svg>
                  <div className="text-left leading-none">
                    <div className="text-xs sm:text-[13.5px] font-black tracking-tight uppercase text-black">
                      <span>{marketplaceBrandName.split(' ')[0] || 'TRADE'}</span>{' '}
                      <span>{marketplaceBrandName.split(' ').slice(1).join(' ') || 'HEAVEN'}</span>
                    </div>
                    <div className="text-[9px] font-semibold text-black/80 mt-0.5">
                      Global B2B Marketplace &amp; Exporters Network
                    </div>
                  </div>
                </div>

                <div className="text-xs sm:text-[14.5px] font-bold tracking-wide text-black uppercase pt-0.5">
                  {marketplaceBrandName.toUpperCase()}
                </div>

                <div className="text-[11.5px] sm:text-[12.5px] text-black leading-snug space-y-0.5">
                  <div>{marketplaceAddressLine1}</div>
                  <div>{marketplaceAddressLine2}</div>
                </div>

                <div className="text-[11.5px] sm:text-[12.5px] text-black font-medium pt-0.5">
                  {marketplacePhone} &nbsp;|&nbsp; {marketplaceEmail} &nbsp;|&nbsp; www.tradeheaven.net
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassicTradeAssuranceCertificateCard;
