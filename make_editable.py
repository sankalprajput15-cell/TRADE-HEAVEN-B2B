import re

with open('src/components/marketplace/TradeWheelHomePage.tsx', 'r') as f:
    content = f.read()

if "EditableText" not in content:
    content = content.replace(
        "import { SafeImage } from '../common/SafeImage';",
        "import { SafeImage } from '../common/SafeImage';\nimport { EditableText } from '../EditableText';\nimport { EditableImage } from '../EditableImage';"
    )

replacements = [
    (
        r'<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">\s*Premium B2B Supplier Directory\s*</h2>',
        '<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"><EditableText contentKey="homepage.supplierDirectoryTitle" defaultText="Premium B2B Supplier Directory" /></h2>'
    ),
    (
        r'<p className="text-xs sm:text-sm text-slate-500 font-medium">\s*Source directly from verified manufacturers, exporters, and wholesale distributors.\s*</p>',
        '<p className="text-xs sm:text-sm text-slate-500 font-medium"><EditableText contentKey="homepage.supplierDirectorySubtitle" defaultText="Source directly from verified manufacturers, exporters, and wholesale distributors." /></p>'
    ),
    (
        r'<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">\s*Explore Active Buy Requirements \(RFQs\)\s*</h2>',
        '<h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"><EditableText contentKey="homepage.rfqSectionTitle" defaultText="Explore Active Buy Requirements (RFQs)" /></h2>'
    ),
    (
        r'<p className="text-xs sm:text-sm text-slate-500 font-medium">\s*Quote directly on verified buying requests from global importers and enterprises.\s*</p>',
        '<p className="text-xs sm:text-sm text-slate-500 font-medium"><EditableText contentKey="homepage.rfqSectionSubtitle" defaultText="Quote directly on verified buying requests from global importers and enterprises." /></p>'
    ),
    (
        r'<h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">\s*Ready to Board with Us\? Connect with <span className="text-blue-600">Audited Factories &amp; Verified Buyers</span>\s*</h3>',
        '<h3 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight"><EditableText contentKey="homepage.onboardingBannerTitle" defaultText="Ready to Board with Us? Connect with" /> <span className="text-blue-600"><EditableText contentKey="homepage.onboardingBannerHighlight" defaultText="Audited Factories & Verified Buyers" /></span></h3>'
    ),
    (
        r'<p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">\s*Zero fake inquiries, zero spam brokers\. Register for free as an importer or audited factory to access \$480M\+ active RFQs, Swiss escrow protection, and direct wholesale pricing\.\s*</p>',
        '<p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal"><EditableText contentKey="homepage.onboardingBannerDesc" defaultText="Zero fake inquiries, zero spam brokers. Register for free as an importer or audited factory to access $480M+ active RFQs, Swiss escrow protection, and direct wholesale pricing." /></p>'
    ),
    (
        r'<span>Onboard / Work With Us</span>',
        '<span><EditableText contentKey="homepage.btnOnboard" defaultText="Onboard / Work With Us" /></span>'
    ),
    (
        r'<span>Post Free Buy RFQ</span>',
        '<span><EditableText contentKey="homepage.btnPostRfq" defaultText="Post Free Buy RFQ" /></span>'
    )
]

for old, new in replacements:
    content = re.sub(old, new, content)

with open('src/components/marketplace/TradeWheelHomePage.tsx', 'w') as f:
    f.write(content)
