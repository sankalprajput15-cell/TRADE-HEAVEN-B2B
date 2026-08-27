import React, { useState } from 'react';
import {
  Globe2,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Send,
  Boxes,
  Lock,
  Container,
  BadgeCheck,
  Cpu,
  Crown,
  ShieldAlert,
  Wheat,
  Shirt,
  ShieldPlus,
  Armchair,
  Cog,
  FlaskConical,
  Navigation,
  Phone,
  Mail,
  MapPin,
  FileText,
  Store,
  ChevronDown,
  Search,
  ExternalLink
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onNavigate: (view: ActiveView) => void;
  onOpenCreateRfq: () => void;
  onCategorySelect?: (category: string) => void;
}

interface CorridorInfo {
  region: string;
  title: string;
  desc: string;
  stat: string;
  commodities: { name: string; val: string }[];
}

const CORRIDOR_DATA: Record<string, CorridorInfo> = {
  usa: {
    region: 'North American Trade Lane',
    title: 'USA - Global Freight & Sourcing Corridor',
    desc: 'Direct oceanic logistics to Port of Los Angeles, New York/New Jersey, Houston, and Savannah with automated FDA, USDA, and customs tariff management.',
    stat: '4-7 Days Port Turnaround',
    commodities: [
      { name: 'PPE & Medical Disposables', val: '$185M Monthly' },
      { name: 'Organic Cotton Textiles', val: '$120M Monthly' },
      { name: 'Industrial Pumps & CNC Spares', val: '$94M Monthly' }
    ]
  },
  uae: {
    region: 'Middle East & GCC Logistics Hub',
    title: 'UAE (Jebel Ali) - Global Re-Export Hub',
    desc: 'Zero-duty freezone transshipment via Jebel Ali Port and Dubai World Central connecting GCC, East Africa, and Central Asia.',
    stat: '24-48h Clearance in Freezones',
    commodities: [
      { name: '1121 Sella Basmati Rice', val: '$240M Monthly' },
      { name: 'Agarwood & Natural Extracts', val: '$68M Monthly' },
      { name: 'Building & Construction Hardware', val: '$110M Monthly' }
    ]
  },
  india: {
    region: 'South Asian Manufacturing Powerhouse',
    title: 'India - Global Export & Manufacturing Hub',
    desc: 'Direct factory dispatch from Nhava Sheva (JNPT), Mundra, and Chennai ports with verified IEC registration and APEDA certifications.',
    stat: 'Export to 180+ Countries',
    commodities: [
      { name: 'Basmati & Non-Basmati Grains', val: '$320M Monthly' },
      { name: 'Apparel & Handcrafted Textiles', val: '$195M Monthly' },
      { name: 'Specialty Chemicals & Agro Solutions', val: '$140M Monthly' }
    ]
  },
  singapore: {
    region: 'Southeast Asia Trade Gateway',
    title: 'Singapore - ASEAN Transshipment Hub',
    desc: 'Premier financial and maritime junction handling bulk container distribution, Letter of Credit negotiation, and ASEAN trade agreements.',
    stat: 'Top Global Maritime Hub',
    commodities: [
      { name: 'Industrial Electronics & Chips', val: '$280M Monthly' },
      { name: 'Machinery & Automation Modules', val: '$160M Monthly' },
      { name: 'Petrochemicals & Virgin Resins', val: '$190M Monthly' }
    ]
  },
  saudi: {
    region: 'Kingdom of Saudi Arabia Vision 2030',
    title: 'Saudi Arabia - Industrial & Sourcing Lane',
    desc: 'Expedited customs clearance through Jeddah Islamic Port and King Abdulaziz Port Dammam with SASO/SABER compliance integration.',
    stat: 'Vision 2030 Priority Fast-Track',
    commodities: [
      { name: 'Heavy Industrial Machinery', val: '$210M Monthly' },
      { name: 'Foodstuff & Agribusiness', val: '$175M Monthly' },
      { name: 'Safety Equipment & Protective Gear', val: '$85M Monthly' }
    ]
  },
  brazil: {
    region: 'Latin America Agro & Minerals',
    title: 'Brazil - Santos Port Agricultural Corridor',
    desc: 'Connecting Mercosur buyers with global tier-1 machinery, packaging tools, and chemical suppliers via Santos and Paranaguá ports.',
    stat: 'Direct Southern Hemisphere Route',
    commodities: [
      { name: 'Agrochemicals & Fertilizers', val: '$150M Monthly' },
      { name: 'Centrifugal Slurry Pumps', val: '$72M Monthly' },
      { name: 'Commercial Furniture Fittings', val: '$45M Monthly' }
    ]
  },
  uk: {
    region: 'UK & Western Europe Corridor',
    title: 'United Kingdom - Felixstowe & London Gateway',
    desc: 'Frictionless customs handling via Felixstowe and Southampton with CE/UKCA regulatory compliance and Sterling escrow support.',
    stat: 'Next-Day Express Customs',
    commodities: [
      { name: 'Organic Apparel & Home Linen', val: '$115M Monthly' },
      { name: 'Specialty Gourmet Grains', val: '$65M Monthly' },
      { name: 'Hospital Consumables & PPE', val: '$80M Monthly' }
    ]
  },
  australia: {
    region: 'Oceania & Pacific Trade Lane',
    title: 'Australia - Port Botany & Melbourne Gateway',
    desc: 'Biosecurity (BICON) pre-screened shipments, quarantine-cleared agro goods, and heavy industrial machinery via Sydney and Melbourne.',
    stat: 'Full BICON Pre-cleared',
    commodities: [
      { name: 'Mining Machinery & Pumps', val: '$135M Monthly' },
      { name: 'Engineered Wood Furniture', val: '$55M Monthly' },
      { name: 'Premium Long-Grain Rice', val: '$48M Monthly' }
    ]
  }
};

export const LandingPageView: React.FC<Props> = ({
  onNavigate,
  onOpenCreateRfq,
  onCategorySelect
}) => {
  // Search state
  const [searchCategory, setSearchCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Corridor Switcher state
  const [selectedCorridorKey, setSelectedCorridorKey] = useState<string>('usa');

  // RFQ Step State
  const [rfqStep, setRfqStep] = useState<1 | 2 | 3>(1);
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Agriculture & Food');
  const [incoterm, setIncoterm] = useState('FOB');
  const [destination, setDestination] = useState('');
  const [specs, setSpecs] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [refCode, setRefCode] = useState('');

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onCategorySelect && searchCategory !== 'all') {
      onCategorySelect(searchCategory);
    }
    onNavigate('PRODUCT_DIRECTORY');
  };

  const handleQuickTagClick = (tag: string) => {
    setSearchQuery(tag);
    onNavigate('PRODUCT_DIRECTORY');
  };

  const handleRfqNext = (nextStep: 2 | 3) => {
    if (nextStep === 2) {
      if (!productName.trim() || !quantity.trim()) {
        alert('Please enter both Product Name and Quantity.');
        return;
      }
    }
    if (nextStep === 3) {
      if (!destination.trim()) {
        alert('Please enter your Target Destination / Port of Discharge.');
        return;
      }
    }
    setRfqStep(nextStep);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = '#TH-' + Math.floor(10000 + Math.random() * 90000);
    setRefCode(code);
    setIsSubmitted(true);
  };

  const handleResetRfq = () => {
    setProductName('');
    setQuantity('');
    setDestination('');
    setSpecs('');
    setCompanyName('');
    setContactName('');
    setEmail('');
    setPhone('');
    setIsSubmitted(false);
    setRfqStep(1);
  };

  const activeCorridor = CORRIDOR_DATA[selectedCorridorKey] || CORRIDOR_DATA['usa'];

  return (
    <div className="space-y-16 pb-16">
      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-6 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                <span>180+ Global Ports &bull; 125,000+ Active Wholesale Buyers</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                The Next-Generation <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-300">
                  Global B2B Marketplace
                </span> <br />
                &amp; Cross-Border Sourcing Platform.
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                Connecting verified manufacturers, exporters, and wholesale buyers worldwide with direct RFQ broadcasting, transparent FOB/CIF pricing, and custodial trade protection.
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Source Products (Buyer)</span>
                </button>
                <button
                  onClick={() => onNavigate('ONBOARD_WITH_US')}
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Sell Globally (Supplier)</span>
                </button>
              </div>

              {/* Quick Search & Filter in Hero */}
              <form onSubmit={handleHeroSearch} className="max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 flex flex-col sm:flex-row gap-2 mt-4">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-slate-900/80 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 outline-none cursor-pointer shrink-0"
                >
                  <option value="all">All Sectors</option>
                  <option value="Agriculture & Food">Agriculture &amp; Food</option>
                  <option value="Apparel & Garments">Apparel &amp; Fabrics</option>
                  <option value="Safety & PPE">Safety, PPE &amp; Medical</option>
                  <option value="Industrial Machinery">Machinery &amp; Industrial</option>
                  <option value="Furniture & Home Decor">Furniture &amp; Decor</option>
                  <option value="Chemicals & Plastics">Chemicals &amp; Oils</option>
                </select>

                <div className="flex-1 flex items-center px-3 bg-white/5 rounded-xl border border-white/10">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search commodities, HS codes, factories..."
                    className="w-full text-xs text-white placeholder-slate-400 bg-transparent focus:outline-none py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  Find Deals
                </button>
              </form>

              {/* Quick Commodity Tags */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Trending:</span>
                {['Basmati Rice', 'PPE Gear', 'Industrial Pumps', 'Organic Cotton', 'Agarwood Extract'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickTagClick(tag)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-900/60 border border-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Live Exchange Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Global Trade Exchange</span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/20">
                    REAL-TIME
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>1121 Steam Basmati Rice</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">FOB</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Destination: Jebel Ali Port, UAE &bull; 500 MT</p>
                      <div className="text-[10px] text-blue-400 font-medium">Buyer: Al-Mansoor Foodstuff Trading LLC</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$840/MT</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Industrial Nitrile Gloves (100ct)</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-mono text-[10px]">CIF</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Destination: Port of Los Angeles, USA &bull; 20,000 Boxes</p>
                      <div className="text-[10px] text-blue-400 font-medium">Buyer: MedShield Logistics Inc.</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$4.15/Box</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>Submersible Pumps 50HP</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px]">EXW</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Destination: Santos Port, Brazil &bull; 120 Units</p>
                      <div className="text-[10px] text-blue-400 font-medium">Buyer: Agrotech Equipamentos S.A.</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$1,250/Unit</span>
                  </div>
                </div>

                <button
                  onClick={onOpenCreateRfq}
                  className="w-full py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Post RFQ or View Active Sourcing Leads</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Trust Badges Bar */}
          <div className="mt-14 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">100% Verified Suppliers</div>
                <div className="text-[11px] text-slate-400">KYC &amp; Factory Audits</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Secure Escrow Protection</div>
                <div className="text-[11px] text-slate-400">Milestone Trade Vaults</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Container className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Global Logistics Support</div>
                <div className="text-[11px] text-slate-400">Customs &amp; Inspection</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">Direct Factory Access</div>
                <div className="text-[11px] text-slate-400">Zero Middleman Spread</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. VALUE PROPOSITION / CORE ADVANTAGES (4 INTERACTIVE CARDS) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-blue-600" />
            <span>Enterprise B2B Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Engineered for High-Stakes International Commerce
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Trade Heaven breaks traditional export barriers through algorithmic buyer matching, audited supply chains, and frictionless cross-border escrow payment rails.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Advantage 1 */}
          <div className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Globe2 className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Unmatched Global Reach
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Active trade coverage across USA, UAE, India, Singapore, Brazil, Australia, Saudi Arabia, and Europe with real-time localized currency settlement.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>180+ Active Markets</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Advantage 2 */}
          <div className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <Cpu className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                Trade Enablement Suite
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Empower your factory with automated SEO digital storefronts, AI-driven RFQ matchmaking, WhatsApp chat integrations, and dedicated International Export Managers.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Smart Match Engine</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Advantage 3 */}
          <div className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all">
                <Crown className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Tailored Growth Tiers
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                From starter SME tiers to Gold &amp; VIP Business memberships, scale at your budget with guaranteed verified buyer leads and product showcase banners.
              </p>
            </div>
            <button
              onClick={() => onNavigate('PREMIUM_MEMBERSHIP')}
              className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-amber-600 w-full text-left cursor-pointer"
            >
              <span>View Membership Tiers</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Advantage 4 */}
          <div className="group bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Trade Assurance Escrow
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Protect 100% of your capital. Buyer funds are securely escrowed and released to suppliers only upon bill of lading verification and pre-shipment quality release.
              </p>
            </div>
            <button
              onClick={() => onNavigate('TRADE_TOOLS')}
              className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 w-full text-left cursor-pointer"
            >
              <span>Explore Escrow Vaults</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SPECIALIZED INDUSTRY HUBS (CATEGORY GRID) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold uppercase tracking-wider">
              <span>High-Liquidity Sectors</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Explore Specialized Industry Hubs
            </h2>
            <p className="text-slate-600 text-sm">
              Discover verified wholesale catalogs, factory certifications, and live tender requirements by industrial sector.
            </p>
          </div>

          <button
            onClick={() => onNavigate('PRODUCT_DIRECTORY')}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
          >
            <span>View all 48+ sub-sectors</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Hub 1 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
                  <Wheat className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">2,480+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Agriculture &amp; Commodities
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Premium 1121 &amp; Traditional Basmati Rice, milling wheat, yellow maize, organic pulses, spices, and high-efficiency agro machinery.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Basmati Rice</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Spices &amp; Herbs</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Agro Machinery</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Agriculture & Food');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source Agriculture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hub 2 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center font-bold">
                  <Shirt className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">3,120+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Textiles &amp; Apparel
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Ready-to-wear garments, organic cotton fabrics, raw combed yarn, denim textiles, technical workwear, and handcrafted apparel.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Raw Cotton Yarn</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">OEM Garments</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Home Linen</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Apparel & Garments');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source Textiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hub 3 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                  <ShieldPlus className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">1,940+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Safety, PPE &amp; Medical Supplies
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                CE &amp; FDA certified PPE gear, industrial helmets, chemical-resistant gloves, surgical consumables, and hospital disposables.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Nitrile Gloves</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Safety Helmets</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Hospital Gowns</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Safety & PPE');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source PPE &amp; Medical</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hub 4 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 border border-teal-200 flex items-center justify-center font-bold">
                  <Armchair className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">1,450+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Furniture &amp; Interiors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Solid wood commercial fittings, ergonomic corporate workstations, luxury hospitality furniture, and modular home decor.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Office Desks</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Hotel Furnishing</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Teak Wood Sets</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Furniture & Home Decor');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source Furniture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hub 5 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                  <Cog className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">2,890+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Industrial Tools &amp; Machinery
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Automated packaging machinery, CNC milling units, heavy centrifugal pumps, hydraulic presses, and diesel generators.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">CNC Lathes</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Packaging Units</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Slurry Pumps</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Industrial Machinery');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source Machinery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Hub 6 */}
          <div className="group bg-white rounded-3xl p-7 border border-slate-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">1,210+ Suppliers</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Chemicals &amp; Natural Extracts
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pure Agarwood/Oud extract oils, pure cosmetic Argan oil, active industrial solvents, virgin polymers, and specialty compounds.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2">
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Agarwood Extract</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Virgin HDPE</span>
                <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">Essential Oils</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (onCategorySelect) onCategorySelect('Chemicals & Plastics');
                onNavigate('PRODUCT_DIRECTORY');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Source Chemicals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE RFQ (REQUEST FOR QUOTE) 3-STEP SECTION */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 p-6 sm:p-12 lg:p-16 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>Instant Buyer Match Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              Post Your Buy Requirement in 60 Seconds
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Broadcast your purchasing tenders to over 50,000+ audited manufacturers. Receive competitive FOB/CIF quotation breakdowns, lab reports, and samples within 24 hours.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs border border-blue-400/20">1</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Direct Factory Quotations</h4>
                  <p className="text-xs text-slate-400">No intermediary commissions or hidden trading spreads.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-400/20">2</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Trade Assurance Protected</h4>
                  <p className="text-xs text-slate-400">Escrow vault holding your funds until physical port discharge.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs border border-amber-400/20">3</div>
                <div>
                  <h4 className="text-sm font-bold text-white">Dedicated International Export Manager</h4>
                  <p className="text-xs text-slate-400">Assisted translation, document verification, and shipment tracking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right RFQ Form */}
          <div className="lg:col-span-7">
            <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-200">
              {/* Stepper Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                    rfqStep === 1 ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {rfqStep > 1 ? '✓' : '1'}
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold text-slate-900">Step 1</span>
                    <span className="text-slate-500">Product &amp; Volume</span>
                  </div>
                </div>
                <div className="h-0.5 w-10 sm:w-16 bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                    rfqStep === 2 ? 'bg-blue-600 text-white' : rfqStep > 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {rfqStep > 2 ? '✓' : '2'}
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold text-slate-900">Step 2</span>
                    <span className="text-slate-500">Port &amp; Terms</span>
                  </div>
                </div>
                <div className="h-0.5 w-10 sm:w-16 bg-slate-200"></div>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center ${
                    rfqStep === 3 ? 'bg-blue-600 text-white' : isSubmitted ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isSubmitted ? '✓' : '3'}
                  </div>
                  <div className="text-xs">
                    <span className="block font-bold text-slate-900">Step 3</span>
                    <span className="text-slate-500">Submit</span>
                  </div>
                </div>
              </div>

              {!isSubmitted ? (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  {/* Step 1 */}
                  {rfqStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Product Name or Required Commodity <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder="e.g., 1121 Sella Basmati Rice / Nitrile Exam Gloves"
                          className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Industry Category <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="Agriculture & Food">Agriculture &amp; Food</option>
                            <option value="Textiles & Apparel">Textiles &amp; Apparel</option>
                            <option value="Safety & Medical">Safety, PPE &amp; Medical</option>
                            <option value="Machinery & Industrial">Machinery &amp; Industrial</option>
                            <option value="Furniture & Decor">Furniture &amp; Decor</option>
                            <option value="Chemicals & Oils">Chemicals &amp; Oils</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Quantity &amp; Unit <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g., 500 Metric Tons / 10,000 Boxes"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleRfqNext(2)}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span>Proceed to Delivery &amp; Terms</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {rfqStep === 2 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Preferred Incoterm
                          </label>
                          <select
                            value={incoterm}
                            onChange={(e) => setIncoterm(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="FOB">FOB (Free on Board)</option>
                            <option value="CIF">CIF (Cost, Insurance &amp; Freight)</option>
                            <option value="CFR">CFR (Cost and Freight)</option>
                            <option value="EXW">EXW (Ex Works)</option>
                            <option value="DDP">DDP (Delivered Duty Paid)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Destination Port <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder="e.g., Jebel Ali, Port of Houston, Rotterdam"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Technical Specs &amp; Target Price
                        </label>
                        <textarea
                          rows={3}
                          value={specs}
                          onChange={(e) => setSpecs(e.target.value)}
                          placeholder="Packaging (50kg PP bags), moisture content, lab testing certificates (SGS/FDA), target price..."
                          className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        ></textarea>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRfqStep(1)}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRfqNext(3)}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span>Proceed to Contact Info</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3 */}
                  {rfqStep === 3 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Company Name <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Al-Maha General Trading Co."
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Contact Person <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder="e.g., Tariq Al-Mansoor"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Corporate Email <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="purchasing@company.com"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Phone / WhatsApp <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+971 50 123 4567"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 border border-blue-100 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>Your request will be cryptographically broadcasted to vetted tier-1 factories. NDA protection guaranteed.</span>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRfqStep(2)}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>Broadcast RFQ Now</span>
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900">RFQ Broadcast Successfully!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Your sourcing request has been assigned Reference <strong className="text-blue-600">{refCode}</strong> and routed to our verified international exporters network.
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetRfq}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Post Another Requirement
                    </button>
                    <button
                      onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Explore Suppliers
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. GLOBAL TRADE CORRIDORS SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5 text-blue-600" />
            <span>Active Bilateral Trade Corridors</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            High-Volume Cross-Border Trade Lanes
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Trade Heaven operates direct custom-cleared freight lanes, verified buyer networks, and banking escrow across key world trade centers.
          </p>
        </div>

        {/* Interactive Corridor Country Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2.5">
          {[
            { key: 'usa', label: '🇺🇸 United States • North America' },
            { key: 'uae', label: '🇦🇪 UAE • MENA Hub' },
            { key: 'india', label: '🇮🇳 India • South Asia' },
            { key: 'singapore', label: '🇸🇬 Singapore • ASEAN' },
            { key: 'saudi', label: '🇸🇦 Saudi Arabia • GCC' },
            { key: 'brazil', label: '🇧🇷 Brazil • LATAM' },
            { key: 'uk', label: '🇬🇧 United Kingdom • Europe' },
            { key: 'australia', label: '🇦🇺 Australia • Oceania' }
          ].map((corridor) => (
            <button
              key={corridor.key}
              onClick={() => setSelectedCorridorKey(corridor.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedCorridorKey === corridor.key
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {corridor.label}
            </button>
          ))}
        </div>

        {/* Detail Display Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">{activeCorridor.region}</div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">{activeCorridor.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeCorridor.desc}
              </p>
            </div>

            <div className="space-y-4 bg-slate-800/60 p-6 rounded-2xl border border-slate-700/60">
              <div className="text-xs font-bold text-slate-400 uppercase">Top Inbound / Outbound Commodities</div>
              <div className="space-y-2 text-xs">
                {activeCorridor.commodities.map((item, idx) => (
                  <div key={idx} className={`flex justify-between py-1 ${idx < activeCorridor.commodities.length - 1 ? 'border-b border-slate-700' : ''}`}>
                    <span className="text-slate-300">{item.name}</span>
                    <span className="font-bold text-emerald-400">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 bg-blue-950/60 p-6 rounded-2xl border border-blue-800/50 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-blue-300 uppercase">Customs &amp; Trade Assurance</div>
                <div className="text-xl font-bold text-white mt-1">{activeCorridor.stat}</div>
                <p className="text-xs text-slate-300 mt-1">Escrow supported in major global currencies via SWIFT &amp; local rails.</p>
              </div>
              <button
                onClick={onOpenCreateRfq}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Post Corridor Tender</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
