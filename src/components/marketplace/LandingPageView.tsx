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
  ExternalLink,
  Sparkles,
  Check
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from './LanguageRegionSelector';

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
  const { languageCode, currentLanguage, setLanguage, t, isRTL } = useLanguage();

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
        alert(languageCode === 'zh' ? '请填写产品名称和采购数量。' : 'Please enter both Product Name and Quantity.');
        return;
      }
    }
    if (nextStep === 3) {
      if (!destination.trim()) {
        alert(languageCode === 'zh' ? '请填写目标交货港口或目的国家。' : 'Please enter your Target Destination / Port of Discharge.');
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

  const isZh = languageCode === 'zh';

  const activeCorridor = CORRIDOR_DATA[selectedCorridorKey] || CORRIDOR_DATA['usa'];

  return (
    <div className="space-y-16 pb-16">
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE LANGUAGE & TEST SWITCHER BAR */}
      {/* ========================================================================= */}
      <div className="mx-4 sm:mx-6 lg:mx-8 bg-slate-900 border border-slate-700/90 rounded-2xl p-3 sm:p-4 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 border border-sky-400/30">
            <Globe2 className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold flex items-center gap-2 text-white">
              <span>{isZh ? '🌏 国际化语言测试模式' : '🌏 International Locale Live Preview'}</span>
              <span className="text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-600/40 px-2 py-0.5 rounded-full font-bold">
                {currentLanguage.flag} {currentLanguage.nativeName} ({currentLanguage.code.toUpperCase()})
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isZh ? '当前展示：简体中文 (中国及亚太地区)。可点击右侧快捷切换测试：' : 'Switch locale instantly to verify multi-language rendering and translated landing page:'}
            </p>
          </div>
        </div>

        {/* Quick Locale Pills */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => setLanguage('zh')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isZh
                ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>🇨🇳</span>
            <span>简体中文 (Chinese)</span>
            {isZh && <Check className="w-3.5 h-3.5 text-amber-200" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              languageCode === 'en'
                ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <span>🇺🇸</span>
            <span>English (US)</span>
            {languageCode === 'en' && <Check className="w-3.5 h-3.5 text-blue-200" />}
          </button>

          <button
            type="button"
            onClick={() => setLanguage('es')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              languageCode === 'es'
                ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>🇪🇸</span>
            <span>Español</span>
          </button>

          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              languageCode === 'ar'
                ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>🇦🇪</span>
            <span>العربية</span>
          </button>
        </div>
      </div>

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
                <span>{isZh ? '180+ 国际战略港口 • 125,000+ 活跃批发采购商' : '180+ Global Ports • 125,000+ Active Wholesale Buyers'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                {isZh ? (
                  <>
                    新一代数字化 <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-300">
                      全球B2B跨境贸易
                    </span> <br />
                    与大宗商品源头直采平台。
                  </>
                ) : (
                  <>
                    The Next-Generation <br className="hidden sm:inline" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-300">
                      Global B2B Marketplace
                    </span> <br />
                    &amp; Cross-Border Sourcing Platform.
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed font-normal">
                {isZh
                  ? '连接全球认证生产工厂、外贸出口商与国际批发采购商。提供全球采购需求(RFQ)即时广播、透明FOB/CIF离岸到岸比价与第三方资金托管履约保障。'
                  : 'Connecting verified manufacturers, exporters, and wholesale buyers worldwide with direct RFQ broadcasting, transparent FOB/CIF pricing, and custodial trade protection.'}
              </p>

              {/* Dual CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('PRODUCT_DIRECTORY')}
                  className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{isZh ? '采购商品货源 (买家通道)' : 'Source Products (Buyer)'}</span>
                </button>
                <button
                  onClick={() => onNavigate('ONBOARD_WITH_US')}
                  className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md flex items-center gap-2.5 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>{isZh ? '全球货源出海 (供应商入驻)' : 'Sell Globally (Supplier)'}</span>
                </button>
              </div>

              {/* Quick Search & Filter in Hero */}
              <form onSubmit={handleHeroSearch} className="max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20 flex flex-col sm:flex-row gap-2 mt-4">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="bg-slate-900/80 text-white text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-700 outline-none cursor-pointer shrink-0"
                >
                  <option value="all">{isZh ? '所有工业行业' : 'All Sectors'}</option>
                  <option value="Agriculture & Food">{isZh ? '农业与大宗食品' : 'Agriculture & Food'}</option>
                  <option value="Apparel & Garments">{isZh ? '服装与纺织面料' : 'Apparel & Fabrics'}</option>
                  <option value="Safety & PPE">{isZh ? '安全防护与医疗劳保' : 'Safety, PPE & Medical'}</option>
                  <option value="Industrial Machinery">{isZh ? '工业重工与数控机械' : 'Machinery & Industrial'}</option>
                  <option value="Furniture & Home Decor">{isZh ? '商用家具与整装建材' : 'Furniture & Decor'}</option>
                  <option value="Chemicals & Plastics">{isZh ? '精细化工与塑料原料' : 'Chemicals & Oils'}</option>
                </select>

                <div className="flex-1 flex items-center px-3 bg-white/5 rounded-xl border border-white/10">
                  <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={isZh ? '搜索大宗商品、海关HS编码、制造工厂...' : 'Search commodities, HS codes, factories...'}
                    className="w-full text-xs text-white placeholder-slate-400 bg-transparent focus:outline-none py-2"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  {isZh ? '搜索商机' : 'Find Deals'}
                </button>
              </form>

              {/* Quick Commodity Tags */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">{isZh ? '热门行业:' : 'Trending:'}</span>
                {[
                  { en: 'Basmati Rice', zh: '巴斯马蒂大米' },
                  { en: 'PPE Gear', zh: '医用防护物资' },
                  { en: 'Industrial Pumps', zh: '工业离心泵' },
                  { en: 'Organic Cotton', zh: '有机棉面料' },
                  { en: 'Agarwood Extract', zh: '天然沉香精油' }
                ].map((tagObj) => (
                  <button
                    key={tagObj.en}
                    onClick={() => handleQuickTagClick(isZh ? tagObj.zh : tagObj.en)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-900/60 border border-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {isZh ? tagObj.zh : tagObj.en}
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
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      {isZh ? '全球实时大宗现货与采购买盘' : 'Live Global Trade Exchange'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/20">
                    {isZh ? '实时行情' : 'REAL-TIME'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{isZh ? '1121 蒸谷巴斯马蒂香米' : '1121 Steam Basmati Rice'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 font-mono text-[10px]">FOB</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{isZh ? '目的港: 阿联酋杰贝阿里港 • 500吨' : 'Destination: Jebel Ali Port, UAE • 500 MT'}</p>
                      <div className="text-[10px] text-blue-400 font-medium">{isZh ? '买家: Al-Mansoor 食品进出口集团' : 'Buyer: Al-Mansoor Foodstuff Trading LLC'}</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$840/MT</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{isZh ? '工业级丁腈防护手套 (100只装)' : 'Industrial Nitrile Gloves (100ct)'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 font-mono text-[10px]">CIF</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{isZh ? '目的港: 美国洛杉矶港 • 20,000箱' : 'Destination: Port of Los Angeles, USA • 20,000 Boxes'}</p>
                      <div className="text-[10px] text-blue-400 font-medium">{isZh ? '买家: MedShield 医疗供应链集团' : 'Buyer: MedShield Logistics Inc.'}</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$4.15/Box</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{isZh ? '50HP 农用大流量深井潜水泵' : 'Submersible Pumps 50HP'}</span>
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px]">EXW</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{isZh ? '目的港: 巴西桑托斯港 • 120台' : 'Destination: Santos Port, Brazil • 120 Units'}</p>
                      <div className="text-[10px] text-blue-400 font-medium">{isZh ? '买家: Agrotech 农机装备股份' : 'Buyer: Agrotech Equipamentos S.A.'}</div>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold shrink-0">$1,250/Unit</span>
                  </div>
                </div>

                <button
                  onClick={onOpenCreateRfq}
                  className="w-full py-2.5 rounded-xl bg-blue-600/30 hover:bg-blue-600 border border-blue-500/40 text-blue-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>{isZh ? '发布采购标书 / 查看全球活跃买盘' : 'Post RFQ or View Active Sourcing Leads'}</span>
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
                <div className="text-xs font-bold text-white">{isZh ? '100% 验厂实名认证供应商' : '100% Verified Suppliers'}</div>
                <div className="text-[11px] text-slate-400">{isZh ? 'KYC与生产实地验厂审计' : 'KYC & Factory Audits'}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">{isZh ? '独立资金托管履约保护' : 'Secure Escrow Protection'}</div>
                <div className="text-[11px] text-slate-400">{isZh ? '分阶段按质验货放款' : 'Milestone Trade Vaults'}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Container className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">{isZh ? '全球多式联运物流网络' : 'Global Logistics Support'}</div>
                <div className="text-[11px] text-slate-400">{isZh ? '清关退税与SGS商检' : 'Customs & Inspection'}</div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <BadgeCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white">{isZh ? '源头工厂一手出厂价' : 'Direct Factory Access'}</div>
                <div className="text-[11px] text-slate-400">{isZh ? '零中介加价透明询盘' : 'Zero Middleman Spread'}</div>
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
            <span>{isZh ? '企业级B2B跨境贸易基础设施' : 'Enterprise B2B Infrastructure'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isZh ? '专为高价值跨境大宗贸易打造' : 'Engineered for High-Stakes International Commerce'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {isZh
              ? 'Trade Heaven 通过算法采购匹配、实地验厂审计与瑞士第三方资金托管结算通道，打破传统外贸壁垒，让跨境交易安全透明。'
              : 'Trade Heaven breaks traditional export barriers through algorithmic buyer matching, audited supply chains, and frictionless cross-border escrow payment rails.'}
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
                {isZh ? '覆盖全球 180+ 战略市场' : 'Unmatched Global Reach'}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {isZh
                  ? '深度覆盖美国、阿联酋中东、印度、新加坡、巴西、澳大利亚及欧洲市场，支持实时多币种本地清算。'
                  : 'Active trade coverage across USA, UAE, India, Singapore, Brazil, Australia, Saudi Arabia, and Europe with real-time localized currency settlement.'}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-blue-600">
              <span>{isZh ? '180+ 活跃国际港口' : '180+ Active Markets'}</span>
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
                {isZh ? '智能贸易赋能套件' : 'Trade Enablement Suite'}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {isZh
                  ? '为工厂配备多语言独立站SEO、AI商机智能匹配、WhatsApp实时洽谈及专属国际出口客户经理。'
                  : 'Empower your factory with automated SEO digital storefronts, AI-driven RFQ matchmaking, WhatsApp chat integrations, and dedicated International Export Managers.'}
              </p>
            </div>
            <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>{isZh ? '智能AI商机引擎' : 'Smart Match Engine'}</span>
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
                {isZh ? '定制化会员增长阶梯' : 'Tailored Growth Tiers'}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {isZh
                  ? '从中小企业入门版到金牌与VIP企业版，根据预算获取高意向买家线索与顶级展位推荐。'
                  : 'From starter SME tiers to Gold & VIP Business memberships, scale at your budget with guaranteed verified buyer leads and product showcase banners.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('PREMIUM_MEMBERSHIP')}
              className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-amber-600 w-full text-left cursor-pointer"
            >
              <span>{isZh ? '查看会员方案' : 'View Membership Tiers'}</span>
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
                {isZh ? '100% 资金第三方托管' : 'Trade Assurance Escrow'}
              </h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                {isZh
                  ? '买家货款安全存入合规托管账户，在收到提单及SGS质检报告合格后分批放款，保障买卖双方权益。'
                  : 'Protect 100% of your capital. Buyer funds are securely escrowed and released to suppliers only upon bill of lading verification and pre-shipment quality release.'}
              </p>
            </div>
            <button
              onClick={() => onNavigate('TRADE_TOOLS')}
              className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between text-xs font-bold text-indigo-600 w-full text-left cursor-pointer"
            >
              <span>{isZh ? '了解托管保障' : 'Explore Escrow Vaults'}</span>
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
              <span>{isZh ? '智能极速买家匹配引擎' : 'Instant Buyer Match Engine'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight tracking-tight">
              {isZh ? '60秒发布采购需求 快速触达源头厂家' : 'Post Your Buy Requirement in 60 Seconds'}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {isZh
                ? '向全球 50,000+ 家经实地验厂的优质制造商精准广播您的采购标书，24小时内获取具有竞争力的 FOB/CIF 报价单、质检报告及免费样品。'
                : 'Broadcast your purchasing tenders to over 50,000+ audited manufacturers. Receive competitive FOB/CIF quotation breakdowns, lab reports, and samples within 24 hours.'}
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs border border-blue-400/20">1</div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isZh ? '源头工厂一手出厂报价' : 'Direct Factory Quotations'}</h4>
                  <p className="text-xs text-slate-400">{isZh ? '无中间商层层加价或隐性差价佣金。' : 'No intermediary commissions or hidden trading spreads.'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs border border-emerald-400/20">2</div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isZh ? '跨境履约信用托管保障' : 'Trade Assurance Protected'}</h4>
                  <p className="text-xs text-slate-400">{isZh ? '第三方托管账户锁定货款，直至目的地口岸实物提单验收。' : 'Escrow vault holding your funds until physical port discharge.'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs border border-amber-400/20">3</div>
                <div>
                  <h4 className="text-sm font-bold text-white">{isZh ? '专属国际出口服务顾问' : 'Dedicated International Export Manager'}</h4>
                  <p className="text-xs text-slate-400">{isZh ? '提供多语种商务翻译、单证核验及全程物流追踪协助。' : 'Assisted translation, document verification, and shipment tracking.'}</p>
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
                    <span className="block font-bold text-slate-900">{isZh ? '第一步' : 'Step 1'}</span>
                    <span className="text-slate-500">{isZh ? '采购商品与数量' : 'Product & Volume'}</span>
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
                    <span className="block font-bold text-slate-900">{isZh ? '第二步' : 'Step 2'}</span>
                    <span className="text-slate-500">{isZh ? '目的港与贸易条款' : 'Port & Terms'}</span>
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
                    <span className="block font-bold text-slate-900">{isZh ? '第三步' : 'Step 3'}</span>
                    <span className="text-slate-500">{isZh ? '联系人与提交' : 'Submit'}</span>
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
                          {isZh ? '所需采购商品或大宗货物名称' : 'Product Name or Required Commodity'} <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          placeholder={isZh ? '例如：特级1121巴斯马蒂大米 / 医用无粉丁腈手套 / 纯棉平纹布' : 'e.g., 1121 Sella Basmati Rice / Nitrile Exam Gloves'}
                          className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {isZh ? '所属产业分类' : 'Industry Category'} <span className="text-rose-500">*</span>
                          </label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="Agriculture & Food">{isZh ? '农业、粮食与食品' : 'Agriculture & Food'}</option>
                            <option value="Textiles & Apparel">{isZh ? '纺织面料与成衣' : 'Textiles & Apparel'}</option>
                            <option value="Safety & Medical">{isZh ? '劳保PPE与医疗器械' : 'Safety, PPE & Medical'}</option>
                            <option value="Machinery & Industrial">{isZh ? '工业机械与成套装备' : 'Machinery & Industrial'}</option>
                            <option value="Furniture & Decor">{isZh ? '家具家居与工艺装潢' : 'Furniture & Decor'}</option>
                            <option value="Chemicals & Oils">{isZh ? '精细化工与塑料原料' : 'Chemicals & Oils'}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {isZh ? '预计采购总量与单位' : 'Quantity & Unit'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder={isZh ? '例如：500 公吨 / 10,000 箱 / 2个40尺高柜' : 'e.g., 500 Metric Tons / 10,000 Boxes'}
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
                          <span>{isZh ? '继续填写交付与条款' : 'Proceed to Delivery & Terms'}</span>
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
                            {isZh ? '贸易术语 (Incoterm)' : 'Preferred Incoterm'}
                          </label>
                          <select
                            value={incoterm}
                            onChange={(e) => setIncoterm(e.target.value)}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                          >
                            <option value="FOB">FOB (装运港船上交货)</option>
                            <option value="CIF">CIF (成本加保险费、运费)</option>
                            <option value="CFR">CFR (成本加运费)</option>
                            <option value="EXW">EXW (工厂交货)</option>
                            <option value="DDP">DDP (完税后交货)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {isZh ? '目的港口或卸货口岸' : 'Destination Port'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={destination}
                            onChange={(e) => setDestination(e.target.value)}
                            placeholder={isZh ? '例如：上海港、宁波港、迪拜杰贝阿里、休斯顿港' : 'e.g., Jebel Ali, Port of Houston, Rotterdam'}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          {isZh ? '技术规格要求与目标单价 (选填)' : 'Technical Specs & Target Price'}
                        </label>
                        <textarea
                          rows={3}
                          value={specs}
                          onChange={(e) => setSpecs(e.target.value)}
                          placeholder={isZh ? '例如：包装要求 (50kg PP编织袋)、水分含量小于12%、需具备SGS第三方检测认证、目标CIF价...' : 'Packaging (50kg PP bags), moisture content, lab testing certificates (SGS/FDA), target price...'}
                          className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                        ></textarea>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRfqStep(1)}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          {isZh ? '返回上一步' : 'Back'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRfqNext(3)}
                          className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span>{isZh ? '继续填写联系方式' : 'Proceed to Contact Info'}</span>
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
                            {isZh ? '企业/公司名称' : 'Company Name'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={isZh ? '例如：香港远东进出口贸易有限公司' : 'e.g., Al-Maha General Trading Co.'}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {isZh ? '联系人姓名 / 职务' : 'Contact Person'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={contactName}
                            onChange={(e) => setContactName(e.target.value)}
                            placeholder={isZh ? '例如：张总 (采购总监)' : 'e.g., Tariq Al-Mansoor'}
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {isZh ? '商务电子邮箱' : 'Corporate Email'} <span className="text-rose-500">*</span>
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
                            {isZh ? '联系电话 / WhatsApp / 微信' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+86 138 0000 0000 / +971 50 123 4567"
                            className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-xl text-[11px] text-blue-900 border border-blue-100 flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <span>{isZh ? '您的采购标书将经过数据加密直接精准推送给认证的一线源头工厂。严格遵守保密协议(NDA)。' : 'Your request will be cryptographically broadcasted to vetted tier-1 factories. NDA protection guaranteed.'}</span>
                      </div>

                      <div className="pt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => setRfqStep(2)}
                          className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm cursor-pointer"
                        >
                          {isZh ? '返回上一步' : 'Back'}
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                          <span>{isZh ? '立即广播全球采购需求' : 'Broadcast RFQ Now'}</span>
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
                  <h3 className="text-2xl font-black text-slate-900">{isZh ? '采购标书发布成功！' : 'RFQ Broadcast Successfully!'}</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    {isZh ? (
                      <>您的全球采购需求已生成专属参考编号 <strong className="text-blue-600">{refCode}</strong>，并已推送到经过严格验厂审核的认证出口商网络中。</>
                    ) : (
                      <>Your sourcing request has been assigned Reference <strong className="text-blue-600">{refCode}</strong> and routed to our verified international exporters network.</>
                    )}
                  </p>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetRfq}
                      className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      {isZh ? '发布另一条需求' : 'Post Another Requirement'}
                    </button>
                    <button
                      onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
                      className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      {isZh ? '探索认证供应商' : 'Explore Suppliers'}
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
            <span>{isZh ? '活跃双边跨国贸易走廊' : 'Active Bilateral Trade Corridors'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {isZh ? '高流动性跨境主力航线与陆海新通道' : 'High-Volume Cross-Border Trade Lanes'}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            {isZh
              ? 'Trade Heaven 在全球核心贸易枢纽设有报关绿色通道、验货质检团队与多币种跨境结算资金池。'
              : 'Trade Heaven operates direct custom-cleared freight lanes, verified buyer networks, and banking escrow across key world trade centers.'}
          </p>
        </div>

        {/* Interactive Corridor Country Tabs */}
        <div className="flex items-center justify-center flex-wrap gap-2.5">
          {[
            { key: 'usa', label: isZh ? '🇺🇸 美国 • 北美枢纽' : '🇺🇸 United States • North America' },
            { key: 'uae', label: isZh ? '🇦🇪 阿联酋 • 中东与北非' : '🇦🇪 UAE • MENA Hub' },
            { key: 'india', label: isZh ? '🇮🇳 印度 • 南亚走廊' : '🇮🇳 India • South Asia' },
            { key: 'singapore', label: isZh ? '🇸🇬 新加坡 • 东盟经贸' : '🇸🇬 Singapore • ASEAN' },
            { key: 'saudi', label: isZh ? '🇸🇦 沙特阿拉伯 • 海湾合作委员会' : '🇸🇦 Saudi Arabia • GCC' },
            { key: 'brazil', label: isZh ? '🇧🇷 巴西 • 拉美大宗' : '🇧🇷 Brazil • LATAM' },
            { key: 'uk', label: isZh ? '🇬🇧 英国 • 欧洲通道' : '🇬🇧 United Kingdom • Europe' },
            { key: 'australia', label: isZh ? '🇦🇺 澳大利亚 • 大洋洲' : '🇦🇺 Australia • Oceania' }
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
              <div className="text-xs font-bold text-slate-400 uppercase">{isZh ? '主要进出口大宗品类' : 'Top Inbound / Outbound Commodities'}</div>
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
                <div className="text-xs font-bold text-blue-300 uppercase">{isZh ? '通关与信保支付' : 'Customs & Trade Assurance'}</div>
                <div className="text-xl font-bold text-white mt-1">{activeCorridor.stat}</div>
                <p className="text-xs text-slate-300 mt-1">{isZh ? '支持SWIFT及本地快速清算通道，多币种直接结算。' : 'Escrow supported in major global currencies via SWIFT & local rails.'}</p>
              </div>
              <button
                onClick={onOpenCreateRfq}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>{isZh ? '发布该走廊采购标书' : 'Post Corridor Tender'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
