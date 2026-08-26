import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { 
  X, 
  Save, 
  CheckCircle2, 
  SlidersHorizontal, 
  Layers, 
  Image as ImageIcon,
  RotateCcw,
  Type
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sectionKey: string | null;
}

export const LiveSectionEditModal: React.FC<Props> = ({
  isOpen,
  onClose,
  sectionKey
}) => {
  const { siteContent, updateSiteContent, currentUser, isUserAuthorized } = useSiteContent();
  const [formData, setFormData] = useState(siteContent);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;

  React.useEffect(() => {
    setFormData(siteContent);
  }, [siteContent, isOpen]);

  if (!isOpen || !sectionKey || !isAdmin) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await updateSiteContent(formData, currentUser);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const getSectionTitle = () => {
    switch (sectionKey) {
      case 'HERO': return '🌟 Edit Hero Section & Specialist Card';
      case 'TOP_ANNOUNCEMENT': return '📢 Edit Top Announcement & Header Ticker';
      case 'STATS': return '📊 Edit Key Trade Metrics & Volume Stats';
      case 'CATEGORIES': return '🏭 Edit Industrial Sourcing Categories';
      case 'H2H': return '🤝 Edit H2H (Human-to-Human) & IEM Advantage';
      case 'ESCROW': return '🛡️ Edit Trade Assurance Escrow & Guarantees';
      case 'TESTIMONIALS': return '⭐ Edit Buyer Testimonials & Reviews';
      case 'CONTACT': return '📞 Edit WhatsApp Desk & Support Information';
      case 'FOOTER': return '📑 Edit Footer Taglines, Mission & Legal';
      default: return `✏️ Edit ${sectionKey}`;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-slate-900 text-sm sm:text-base truncate">{getSectionTitle()}</h3>
              <p className="text-[11px] text-slate-500 truncate">Live Visual Editor • Changes apply immediately across the entire site</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-600 transition-colors cursor-pointer shrink-0 ml-2"
            title="Close Modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {savedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Section updated successfully!</span>
            </div>
          )}

          {/* Section 1: HERO */}
          {sectionKey === 'HERO' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Main Title (Line 1)</label>
                <input
                  type="text"
                  value={formData.homepage.heroHeadline}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroHeadline: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Highlighted Text (Gradient Line 2)</label>
                <input
                  type="text"
                  value={formData.homepage.heroHeadlineGradient}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroHeadlineGradient: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-amber-800 font-black focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={formData.homepage.heroSubheadline}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroSubheadline: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trust Eyebrow Badge</label>
                <input
                  type="text"
                  value={formData.homepage.heroTrustEyebrow}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroTrustEyebrow: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hero Background Image URL</label>
                <input
                  type="text"
                  value={formData.homepage.heroBgImage}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, heroBgImage: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900">Trade Specialist Advisor Box</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.homepage.tradeSpecialist.name}
                      onChange={e => setFormData({ 
                        ...formData, 
                        homepage: { 
                          ...formData.homepage, 
                          tradeSpecialist: { ...formData.homepage.tradeSpecialist, name: e.target.value } 
                        } 
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-bold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Title</label>
                    <input
                      type="text"
                      value={formData.homepage.tradeSpecialist.title}
                      onChange={e => setFormData({ 
                        ...formData, 
                        homepage: { 
                          ...formData.homepage, 
                          tradeSpecialist: { ...formData.homepage.tradeSpecialist, title: e.target.value } 
                        } 
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-900 font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Quote</label>
                    <input
                      type="text"
                      value={formData.homepage.tradeSpecialist.quote}
                      onChange={e => setFormData({ 
                        ...formData, 
                        homepage: { 
                          ...formData.homepage, 
                          tradeSpecialist: { ...formData.homepage.tradeSpecialist, quote: e.target.value } 
                        } 
                      })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: STATS */}
          {sectionKey === 'STATS' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Verified Importers</label>
                  <input
                    type="text"
                    value={formData.homepage.verifiedBuyersCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, verifiedBuyersCount: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.homepage.verifiedBuyersLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, verifiedBuyersLabel: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-600 text-xs mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Audited Factories</label>
                  <input
                    type="text"
                    value={formData.homepage.activeSuppliersCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, activeSuppliersCount: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.homepage.activeSuppliersLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, activeSuppliersLabel: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-600 text-xs mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Export Corridors / Countries</label>
                  <input
                    type="text"
                    value={formData.homepage.supportedCountriesCount}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, supportedCountriesCount: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-base focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.homepage.supportedCountriesLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, supportedCountriesLabel: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-600 text-xs mt-1 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GMV Trade Volume</label>
                  <input
                    type="text"
                    value={formData.homepage.tradeVolumeGmv}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, tradeVolumeGmv: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-800 font-black text-base focus:outline-none"
                  />
                  <input
                    type="text"
                    value={formData.homepage.tradeVolumeGmvLabel}
                    onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, tradeVolumeGmvLabel: e.target.value } })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-600 text-xs mt-1 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: H2H ADVANTAGE */}
          {sectionKey === 'H2H' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">H2H Pill Badge</label>
                <input
                  type="text"
                  value={formData.homepage.h2hPillBadge}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hPillBadge: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">H2H Headline</label>
                <input
                  type="text"
                  value={formData.homepage.h2hHeadline}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hHeadline: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">H2H Subheadline</label>
                <textarea
                  rows={2}
                  value={formData.homepage.h2hSubheadline}
                  onChange={e => setFormData({ ...formData, homepage: { ...formData.homepage, h2hSubheadline: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 4: TOP_ANNOUNCEMENT */}
          {sectionKey === 'TOP_ANNOUNCEMENT' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Top Announcement Ticker Message</label>
                <textarea
                  rows={3}
                  value={formData.homepage.announcementTicker}
                  onChange={e => setFormData({ 
                    ...formData, 
                    homepage: { ...formData.homepage, announcementTicker: e.target.value },
                    brand: { ...formData.brand, topBarAnnouncement: e.target.value }
                  })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 5: CONTACT */}
          {sectionKey === 'CONTACT' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official WhatsApp Phone Number</label>
                <input
                  type="text"
                  value={formData.brand.whatsappNumber}
                  onChange={e => setFormData({ ...formData, brand: { ...formData.brand, whatsappNumber: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-emerald-800 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.brand.supportEmail}
                  onChange={e => setFormData({ ...formData, brand: { ...formData.brand, supportEmail: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Corporate HQ Address</label>
                <input
                  type="text"
                  value={formData.brand.officeAddress}
                  onChange={e => setFormData({ ...formData, brand: { ...formData.brand, officeAddress: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 6: FOOTER */}
          {sectionKey === 'FOOTER' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Footer Tagline</label>
                <textarea
                  rows={2}
                  value={formData.headerAndFooter.footerTagline}
                  onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerTagline: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mission Statement</label>
                <textarea
                  rows={2}
                  value={formData.headerAndFooter.footerMission}
                  onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerMission: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Copyright Line</label>
                <input
                  type="text"
                  value={formData.headerAndFooter.footerCopyright}
                  onChange={e => setFormData({ ...formData, headerAndFooter: { ...formData.headerAndFooter, footerCopyright: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Section 7: ESCROW */}
          {sectionKey === 'ESCROW' && (
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Escrow Title</label>
                <input
                  type="text"
                  value={formData.escrowPolicy.title}
                  onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, title: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Escrow Subtitle</label>
                <textarea
                  rows={2}
                  value={formData.escrowPolicy.subtitle}
                  onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, subtitle: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">100% Refund Guarantee Notice</label>
                <input
                  type="text"
                  value={formData.escrowPolicy.guaranteeNotice}
                  onChange={e => setFormData({ ...formData, escrowPolicy: { ...formData.escrowPolicy, guaranteeNotice: e.target.value } })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave()}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply &amp; Save Section</span>
          </button>
        </div>
      </div>
    </div>
  );
};
