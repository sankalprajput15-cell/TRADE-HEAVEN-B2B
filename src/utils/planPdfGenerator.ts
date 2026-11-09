import { SaaSPlan } from '../types/planPricingTypes';

export function downloadPlanPdfBrochure(plan: SaaSPlan, formattedPrice: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Trade Heaven - ${plan.name} Brochure</title>
      <style>
        @page { size: A4; margin: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 0; background: #f8fafc; }
        .page { width: 210mm; height: 297mm; page-break-after: always; position: relative; box-sizing: border-box; background: #ffffff; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 25mm 20mm; }
        .cover { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); color: #ffffff; }
        .header-brand { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #38bdf8; padding-bottom: 15px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #ffffff; }
        .logo span { color: #38bdf8; }
        .badge { background: #38bdf8; color: #0f172a; padding: 6px 14px; font-size: 11px; font-weight: 800; border-radius: 20px; text-transform: uppercase; }
        .title-box { margin-top: 40px; }
        h1 { font-size: 42px; font-weight: 900; line-height: 1.1; margin: 0 0 10px 0; color: #ffffff; }
        h2 { font-size: 24px; font-weight: 800; color: #38bdf8; margin: 0 0 20px 0; }
        .price-tag { display: inline-block; background: #10b981; color: #ffffff; padding: 12px 24px; font-size: 26px; font-weight: 900; border-radius: 12px; margin-top: 20px; }
        .section-title { font-size: 22px; font-weight: 900; color: #1e3a8a; border-bottom: 3px solid #38bdf8; padding-bottom: 8px; margin-bottom: 20px; text-transform: uppercase; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 15px; }
        ul { list-style: none; padding: 0; margin: 0; }
        li { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; font-weight: 600; color: #1e293b; display: flex; align-items: center; gap: 10px; }
        li::before { content: "✔"; color: #10b981; font-weight: bold; }
        .footer { text-align: center; font-size: 12px; font-weight: 700; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 15px; }
      </style>
    </head>
    <body>
      <!-- COVER PAGE -->
      <div class="page cover">
        <div>
          <div class="header-brand">
            <div class="logo">TRADE <span>HEAVEN</span></div>
            <div class="badge">Official Brochure</div>
          </div>
          <div class="title-box">
            <p style="color: #38bdf8; font-weight: 800; text-transform: uppercase; font-size: 14px; letter-spacing: 2px;">Global B2B Marketplace</p>
            <h1>${plan.name}</h1>
            <h2>${plan.tierBadge || 'Enterprise Trade Suite'}</h2>
            <p style="color: #cbd5e1; font-size: 16px; max-width: 80%;">
              ${plan.description}
            </p>
            <div class="price-tag">${formattedPrice} / year</div>
          </div>
        </div>
        <div class="footer" style="color: #94a3b8; border-color: rgba(255,255,255,0.1);">
          www.tradeheaven.net • Official Global Export &amp; Sourcing Suite
        </div>
      </div>

      <!-- PAGE 2: ABOUT US & INTRODUCTION -->
      <div class="page">
        <div>
          <div class="header-brand">
            <div class="logo" style="color: #0f172a;">TRADE <span>HEAVEN</span></div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b;">About &amp; Introduction</div>
          </div>
          <div style="margin-top: 30px;">
            <div class="section-title">About Us...</div>
            <p><strong>We are a global B2B Marketplace</strong> specializing in international trade as well as solving the difficulties faced by companies involved in import and export.</p>
            <p>We are the one-stop solution for businesses looking to connect with international buyers and expand their global reach across borders with absolute security.</p>
            
            <div class="section-title" style="margin-top: 40px;">Introduction</div>
            <p><strong>Help businesses succeed</strong> by providing them genuine leads for their products.</p>
            <p>Trades Heaven provides various opportunities for businesses including manufacturers, exporters, and wholesalers to connect with other businesses and companies across the globe. We are the much-needed bridge between B2B sellers and buyers.</p>
            <p>We have clients from different industries such as textile and apparel, consumer electronics, medical supplies, agriculture and food, home supplies, heavy machinery, industrial tools, etc.</p>
          </div>
        </div>
        <div class="footer">www.tradeheaven.net</div>
      </div>

      <!-- PAGE 3: PLAN FEATURES & SERVICES -->
      <div class="page">
        <div>
          <div class="header-brand">
            <div class="logo" style="color: #0f172a;">TRADE <span>HEAVEN</span></div>
            <div style="font-size: 12px; font-weight: 700; color: #64748b;">${plan.name} Features</div>
          </div>
          <div style="margin-top: 30px;">
            <div class="section-title">Included Services &amp; Features</div>
            <p>Target Audience: <strong>${plan.targetAudience || 'Global Exporters & Importers'}</strong></p>
            <ul>
              ${(plan.featuresList || [
                'Verified & Genuine Order Matching',
                'Dedicated Catalogue Page & Product Listings',
                'Business Website & Domain Hosting',
                'SSL Secure Encryption & Language Converter',
                'Dedicated Account Manager & 24/7 Support'
              ]).map(f => `<li>${f.replace(/\*\*/g, '')}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="footer">www.tradeheaven.net</div>
      </div>

      <!-- PAGE 4: MISSION & CONTACT -->
      <div class="page cover" style="background: linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%);">
        <div>
          <div class="header-brand">
            <div class="logo">TRADE <span>HEAVEN</span></div>
            <div class="badge">Contact Us</div>
          </div>
          <div class="title-box">
            <div class="section-title" style="color: #38bdf8; border-color: #38bdf8;">Our Mission</div>
            <p style="font-size: 16px; color: #f8fafc; line-height: 1.8;">
              Solve the problem of exporters and importers for smooth and secure transactions. Providing exporters and importers scalable and cost-effective solutions to enable small and medium-scale businesses to establish a strong footing in the global sector.
            </p>
            
            <div class="section-title" style="margin-top: 40px; color: #38bdf8; border-color: #38bdf8;">Work With Us!</div>
            <p style="font-size: 15px; color: #cbd5e1;">
              🌐 www.tradeheaven.net<br>
              📧 Officialtradeheaven@gmail.com<br>
              📱 @tradeheavenb2b
            </p>
          </div>
        </div>
        <div class="footer" style="color: #94a3b8; border-color: rgba(255,255,255,0.1);">
          www.tradeheaven.net • Thank You for Choosing Trade Heaven
        </div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
