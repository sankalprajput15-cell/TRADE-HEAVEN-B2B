import React from 'react';
import { 
  Globe2, 
  ShieldCheck, 
  Award, 
  Building2, 
  TrendingUp, 
  Package, 
  Truck, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  BookOpen, 
  Users, 
  Layers, 
  Zap, 
  Briefcase, 
  ShoppingBag,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { ActiveView } from '../../types';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';

interface Props {
  onNavigate: (view: ActiveView) => void;
  onOpenCreateRfq: () => void;
}

export const AboutTradeHeavenView: React.FC<Props> = ({ onNavigate, onOpenCreateRfq }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.3),transparent_50%)] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Value Added Services &amp; About Trade Heaven</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Redefining Global B2B Trade &amp; Supply Chain Excellence
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            We have redefined the best B2B marketplace experience, providing a powerful B2B portal for international trade. From import and export to connecting global buyers and sellers, we go beyond just a platform with a seamless trade ecosystem.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('SUPPLIERS_DIRECTORY')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <span>Explore Verified Suppliers</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenCreateRfq}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Post Buy Requirement (RFQ)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Leading Global B2B Marketplace</div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Connecting Importers &amp; Exporters Worldwide
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              <strong>Trade Heaven</strong> is a trending global B2B marketplace dedicated to revolutionizing the world of online B2B portals and import-export business providers. As a leading B2B eCommerce marketplace our mission is to empower import and export across the globe by providing a robust platform that simplifies and enhances the quality of supply chain management.
            </p>
          </div>

          <div className="p-6 bg-blue-50/70 rounded-2xl border border-blue-100 space-y-3">
            <h3 className="font-bold text-base text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <span>Our Core Mission</span>
            </h3>
            <p className="text-xs sm:text-sm text-blue-950 leading-relaxed">
              With a seamless trade ecosystem providing verified buyers, importers, suppliers, manufacturers &amp; exporters, we help businesses expand globally and unlock new opportunities in international markets with absolute peace of mind.
            </p>
          </div>
        </div>

        {/* Quick Contact & WhatsApp Box */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 flex flex-col justify-between shadow-md">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Speak with a Trade Expert</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Need immediate matchmaking or custom export advisory? Our senior trade desk is online 24/7.
              </p>
            </div>
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs font-mono text-emerald-300">
              WhatsApp: +91 8532934479
            </div>
          </div>
          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Chat on WhatsApp Now</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Why Choose Trade Heaven? */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
            <Award className="w-4 h-4 text-blue-600" />
            <span>Excellence &amp; Reliability</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Why Choose Trade Heaven?
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            At Trade Heaven, we offer a feature-rich and interactive marketplace platform designed to support the diverse needs of B2B businesses. If you are a wholesale dealer or an international buyer, our B2B website ensures a seamless, quick and secure experience. Here’s why we stand out:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Comprehensive International B2B Marketplace</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connect with buyers and sellers, distributors, manufacturers, wholesalers, importers, exporters near you and from all corners of the world on our platform for international trade. Explore product catalogs, stocks and wholesale supplies.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Specialized B2B Industry Solutions</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              For B2B fashion, B2B agriculture, or any other sectors, our marketplace is customized to meet the unique demands of your industry, ensuring tailored matchmaking and verified leads.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Efficient and Secure Transactions</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              We streamline online wholesale business processes, making them manageable and efficient, ensuring your transactions are secure, safe, and smooth with multi-currency escrow protection.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Support for SMEs and Exporters</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our platform is especially designed to solve challenges faced by SMEs and export-import companies looking to expand globally with dedicated International Export Managers (IEM).
            </p>
          </div>
        </div>
      </div>

      {/* Benefits of Joining Trade Heaven */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* For Exporters */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600">Manufacturer &amp; Seller Growth</div>
              <h3 className="text-xl font-black text-slate-900">Benefits for Exporters</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Increased Visibility:</strong> By listing products on Trade Heaven, exporters can reach a broader audience, increasing their chances of securing international deals.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Market Insights:</strong> Access to trade intelligence helps exporters identify lucrative markets and tailor their offerings accordingly.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Networking Opportunities:</strong> The platform facilitates connections with potential verified buyers and partners globally, enhancing business prospects.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Sell Diverse Products:</strong> Exporters can list products across thousands of categories and sub-categories for maximum exposure and reach.
              </div>
            </div>
          </div>
        </div>

        {/* For Importers */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-600">Global Sourcing Power</div>
              <h3 className="text-xl font-black text-slate-900">Benefits for Importers</h3>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Diverse Product Range:</strong> Importers can find a wide variety of products across different categories, ensuring they meet their specific needs.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Quality Assurance:</strong> The platform emphasizes quality by verified sellers, giving importers confidence in their purchasing decisions.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900">Cost-Effective Solutions:</strong> Competitive pricing across various products helps importers manage costs effectively.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Story Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl space-y-6">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">Our Proven Track Record</div>
          <h2 className="text-2xl sm:text-3xl font-black">Our Success Story</h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            We have empowered numerous small and medium-sized businesses not just in acquiring new customers but also in retaining them. Our commitment goes beyond connecting B2B business. We ensure that you achieve tangible results by turning prospects into loyal customers.
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => onNavigate('PREMIUM_MEMBERSHIP')}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <span>Explore Premium Membership Tiers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Specialized B2B Industry Sectors */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
            <Package className="w-4 h-4 text-indigo-600" />
            <span>Specialized Industry Hubs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            A B2B Marketplace Platform for Buyers &amp; Sellers
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            What sets us apart is our unwavering commitment to excellence and our dedication to providing more than just a platform. At Trade Heaven, we pride ourselves on offering a diverse range of categories and products on our B2B marketplace platform, for varied needs of B2B business across the globe. Here’s a look at some of the key sectors we serve:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              B2B Fashion Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our B2B fashion marketplace is a hub for reliable fashion products suppliers offering a wide variety of quality apparel. With the clothing industry being one of the most dynamic sectors, our platform connects clothing buyers with apparel suppliers for men’s, women’s, children’s clothing, accessories, and seasonal fashion items.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              B2B Furniture Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Find a diverse range of manufacturers, wholesalers and exporters specializing in furniture and home décor. Ideal for those looking to expand residential, office, or outdoor furniture collections with verified global suppliers.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              B2B Equipment Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Featuring trusted sellers offering protective gear such as helmets, gloves, and PPE meeting strict industry standards at competitive prices for safety equipment buyers.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
              B2B Agriculture Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              From staple grains like rice and wheat to fresh fruits and vegetables, our agriculture marketplace offers an unparalleled range of agricultural products and competent suppliers.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
              B2B Electronic Marketplace
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Connecting businesses with suppliers offering Adapters, CD-ROMs, Chargers, Computer CPUs, and electronic devices meeting industry standards for reliability and durability.
            </p>
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
              Tools, Machinery &amp; Supplies
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Advanced tools, machinery, appliances, electronic devices, office supplies, and gadgets to enhance business performance and ensure complete operational success.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
