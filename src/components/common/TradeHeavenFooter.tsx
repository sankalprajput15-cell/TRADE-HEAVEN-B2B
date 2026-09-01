import React from 'react';
import { 
  ShieldCheck, 
  Globe2, 
  ExternalLink, 
  Database, 
  Lock, 
  Star, 
  Send, 
  Award, 
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  Layers,
  HeartHandshake,
  Headphones,
  MessageCircle,
  Clock,
  Edit3
} from 'lucide-react';
import { TradeHeavenLogo } from './TradeHeavenLogo';
import { SOCIAL_LINKS, OFFICIAL_WHATSAPP_DATA } from './TradeHeavenSocialBar';
import { ActiveView, AuthUser } from '../../types';
import { useSiteContent } from '../../context/SiteContentContext';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onNavigate: (view: ActiveView | string) => void;
  onOpenBackendModal?: () => void;
  totalProductsCount?: number;
  totalRfqsCount?: number;
  currentUser?: AuthUser | null;
  onContactClick?: () => void;
  onOpenAuthModal?: () => void;
}

export const TradeHeavenFooter: React.FC<Props> = ({
  onNavigate,
  onOpenBackendModal,
  totalProductsCount = 1200,
  totalRfqsCount = 350,
  currentUser,
  onContactClick,
  onOpenAuthModal
}) => {
  const { siteContent, isUserAuthorized, isLiveEditMode, openQuickEdit, currentUser: contextUser } = useSiteContent();
  const { t, tText } = useLanguage();
  const effectiveUser = currentUser || contextUser || null;
  const userAuth = isUserAuthorized(effectiveUser);
  const isAdmin = Boolean(
    effectiveUser && (
      effectiveUser.role === 'ADMIN' || 
      userAuth.isSuperAdmin || 
      userAuth.isAuthorized
    )
  );

  const handleCmsClick = () => {
    if (isAdmin) {
      onNavigate('CMS_MANAGEMENT');
    }
  };

  const brand = siteContent.brand;
  const hf = siteContent.headerAndFooter;

  const whatsappPhone = brand.whatsappNumber || OFFICIAL_WHATSAPP_DATA.phone;
  const whatsappUrl = brand.whatsappUrl || OFFICIAL_WHATSAPP_DATA.url;
  const supportEmail = brand.supportEmail || 'help@tradeheaven.net';

  const handleContactOpen = () => {
    if (onContactClick) {
      onContactClick();
    } else {
      onNavigate('CONTACT_US');
    }
  };

  return (
    <footer id="trade-heaven-global-footer" className="relative mt-16 bg-slate-100 text-slate-700 text-xs border-t border-slate-200 group">
      
      {/* Live Edit Mode Trigger Button (Strictly Admin / Creator Only) */}
      {isAdmin && isLiveEditMode && (
        <button
          type="button"
          onClick={() => openQuickEdit('FOOTER')}
          className="absolute top-4 right-4 z-20 px-3.5 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-xl hover:bg-amber-300 transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Footer &amp; Legal</span>
        </button>
      )}

      {/* Top Banner: Corporate Guarantee & TrustScore */}
      <div className="border-b border-slate-200 bg-slate-200/60 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-center md:text-left">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% trade protection &amp; Verified Factory Assurance</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-700 border border-blue-500/20 font-bold text-xs">
              <Headphones className="w-3.5 h-3.5 text-blue-600" />
              <span>H2H Human-to-Human Dedicated Account Support</span>
            </div>
          </div>
          {/* Social Links Row */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 mr-1">Follow {brand.siteName || 'Trade Heaven'}:</span>
            {SOCIAL_LINKS.map(item => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Trade Heaven on ${item.name}`}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-700 flex items-center justify-center transition-all group shadow-xs"
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Multi-Column Footer */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Column 1: Brand & Mission (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <TradeHeavenLogo size="md" variant="dark" showWordmark={true} />
            </div>
            <p className="text-slate-600 text-xs leading-relaxed max-w-sm">
              {hf?.footerMission || "Trade Heaven is an international B2B marketplace and export portal connecting verified global buyers with vetted manufacturing plants across 180+ countries."}
            </p>
            <div className="space-y-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-2">
                <Globe2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Global Sourcing in Europe, Asia, Americas &amp; Middle East</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>IEM (International Export Manager) Strategic Services</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Verified Supplier Audits with SGS, Bureau Veritas &amp; TÜV</span>
              </div>
            </div>
            {/* Official Social Badges */}
            <div className="pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Official Media Channels
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SOCIAL_LINKS.map(s => (
                  <a
                    key={s.name}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-700 text-[10px] font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                  >
                    <span>{s.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Sourcing & Buy Leads */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              {t('buyerSourcingHub')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('PRODUCT_DIRECTORY')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('viewAllProducts')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('BUY_LEADS')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('buyLeadsNav')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('POST_BUY_REQUIREMENT')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('postBuyRequirement')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('SUPPLIERS_DIRECTORY')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('fullSupplierDirectory')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('RFQ_HUB')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('rfqHubNav')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('TRADE_TOOLS')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('incotermsNav')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Supplier & Membership */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              {t('suppliersExportersHub')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('ONBOARD_WITH_US')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('workWithUsNav')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('SELLER_OFFER')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('postCargoOffer')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('PREMIUM_PLANS')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('membershipPlans')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('DASHBOARD')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('exporterDashboard')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              Platform &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <button onClick={() => onNavigate('ABOUT_US')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('aboutUs')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('LANDING_PAGE')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('landingPageNav')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('TRADE_PROTECTION')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  {t('tradeAssurance')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('TERMS_OF_USE')} className="hover:text-blue-600 transition-colors text-left cursor-pointer font-medium text-slate-800">
                  Terms of Use
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('REFUND_POLICY')} className="hover:text-blue-600 transition-colors text-left cursor-pointer">
                  Refund &amp; Cancellation Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('PRODUCT_LISTING_POLICY')} className="hover:text-blue-600 transition-colors text-left cursor-pointer font-medium text-slate-800">
                  Product Listing Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('PRIVACY_POLICY')} className="hover:text-blue-600 transition-colors text-left cursor-pointer font-medium text-slate-800">
                  Privacy Policy
                </button>
              </li>
              {isAdmin && (
                <li className="relative pt-2">
                  <button 
                    id="footer-cms-admin-btn"
                    onClick={handleCmsClick} 
                    className="transition-colors text-left font-bold cursor-pointer flex items-center gap-1.5 text-amber-700 hover:text-amber-800"
                    title="Full-Site CMS Editor (Admin Access Granted)"
                  >
                    <span>Full-Site CMS Editor</span>
                    <span className="text-[9px] bg-amber-400/20 text-amber-800 border border-amber-400/40 px-1.5 py-0.5 rounded font-black tracking-wider uppercase">
                      Admin
                    </span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 5: Contact & WhatsApp Desk */}
          <div className="space-y-3 lg:col-span-1">
            <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">
              {t('helpDeskHeading')}
            </h4>

            <div className="space-y-2.5">
              {/* Help Desk Email Card */}
              <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span>Official Help Desk</span>
                  </div>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 border border-blue-200">
                    24/7
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-950 tracking-wide truncate">
                  {supportEmail}
                </div>
                <p className="text-[10px] text-slate-500 leading-tight">
                  Dispatches immediately to senior trade managers &amp; trade protection team.
                </p>
                <button
                  id="footer-open-contact-form-btn"
                  onClick={handleContactOpen}
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Open Contact Form</span>
                </button>
              </div>

              {/* WhatsApp Card */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs space-y-1.5">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>Official WhatsApp</span>
                  </div>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Live
                  </span>
                </div>
                <div className="font-mono text-xs font-bold text-slate-950 tracking-wide">
                  {whatsappPhone}
                </div>
                <a
                  id="footer-whatsapp-chat-btn"
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-1 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Corporate Trust & Legal Strip */}
        <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="font-bold text-slate-900">{hf?.footerCopyright || '© 2025–2026 Tradeheaven ECOM Solution LLP. All rights reserved.'}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-slate-700 font-medium">{hf?.footerIsoText || 'Govt. Registered LLP (MCA) • GST Compliant Entity'}</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              256-Bit SSL Encrypted • Secure Gateway Processing
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-600">
            <button onClick={() => onNavigate('TERMS_OF_USE')} className="hover:text-slate-950 transition-colors text-slate-700 font-semibold underline decoration-slate-300 underline-offset-4 cursor-pointer">
              Terms of Use
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => onNavigate('PRIVACY_POLICY')} className="hover:text-slate-950 transition-colors text-slate-700 font-semibold underline decoration-slate-300 underline-offset-4 cursor-pointer">
              Privacy Policy
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => onNavigate('PRODUCT_LISTING_POLICY')} className="hover:text-slate-950 transition-colors text-slate-700 font-semibold underline decoration-slate-300 underline-offset-4 cursor-pointer">
              Product Listing Policy
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => onNavigate('REFUND_POLICY')} className="hover:text-slate-950 transition-colors text-slate-700 font-semibold underline decoration-slate-300 underline-offset-4 cursor-pointer">
              Return &amp; Refund Policy
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={handleContactOpen} className="hover:text-slate-950 transition-colors cursor-pointer">
              Help Center
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={() => onNavigate('TRADE_TOOLS')} className="hover:text-slate-950 transition-colors cursor-pointer">
              Incoterms 2020 Rules
            </button>
            <span className="text-slate-300">•</span>
            <button onClick={handleContactOpen} className="hover:text-slate-950 transition-colors cursor-pointer">
              Dispute Mediation
            </button>
            <span className="text-slate-300">•</span>
            <a href={`mailto:${supportEmail}`} className="hover:text-slate-950 font-mono transition-colors text-blue-600">
              {supportEmail}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
