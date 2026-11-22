import React, { useState } from 'react';
import {
  X,
  Monitor,
  Smartphone,
  Save,
  CheckCircle2,
  EyeOff,
  Mail,
  ArrowRight,
  Lock,
  ShieldCheck
} from 'lucide-react';
import { Product, RfqRequirement } from '../../types';
import { SiteContent, HomepageDisplayConfig, DEFAULT_SITE_SECTION_LAYOUTS } from '../../data/defaultSiteContent';
import { getResponsiveGridColsClass, mergeHomepageDisplayConfig } from '../../utils/gridLayoutUtils';
import { SafeImage } from '../common/SafeImage';

export interface PreviewSupplierItem {
  id: string;
  companyName: string;
  country: string;
  tier: string;
  logoUrl: string;
  description?: string;
  tradeAssuranceLimitUsd?: number;
}

export interface PreviewRfqItem extends RfqRequirement {
  resolvedPhotoUrl: string;
}

interface WholeSitePagePreviewModalProps {
  isOpen: boolean;
  pageKey: string;
  pageLabel: string;
  draft: SiteContent;
  displayConfig: HomepageDisplayConfig;
  featuredProducts: Product[];
  homepageRfqs: PreviewRfqItem[];
  homepageSuppliers: PreviewSupplierItem[];
  catalogProducts: Product[];
  allRfqs: PreviewRfqItem[];
  pendingImageCount: number;
  changeSummary: string[];
  isPublishing: boolean;
  onClose: () => void;
  onSaveDraft: () => void;
  onPublishLive: () => void;
}

export const WholeSitePagePreviewModal: React.FC<WholeSitePagePreviewModalProps> = ({
  isOpen,
  pageKey,
  pageLabel,
  draft,
  displayConfig,
  featuredProducts,
  homepageRfqs,
  homepageSuppliers,
  catalogProducts,
  allRfqs,
  pendingImageCount,
  changeSummary,
  isPublishing,
  onClose,
  onSaveDraft,
  onPublishLive
}) => {
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  if (!isOpen) return null;

  const mergedDisplay = mergeHomepageDisplayConfig(displayConfig);
  const vis = mergedDisplay.sectionVisibility;
  const layouts = mergedDisplay.sectionLayouts || DEFAULT_SITE_SECTION_LAYOUTS;

  const formatProductPrice = (prod: Product) => {
    const tiers = Array.isArray(prod.priceTiers) ? prod.priceTiers : [];
    const fallback = Number((prod as any).fobPriceUsd || (prod as any).price || 0);
    const minPrice = Number(tiers[tiers.length - 1]?.priceUsd ?? fallback) || 0;
    const maxPrice = Number(tiers[0]?.priceUsd ?? fallback) || 0;
    if (minPrice > 0 && maxPrice > minPrice) {
      return `$${minPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} – $${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (maxPrice > 0) {
      return `$${maxPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return 'Request Quote';
  };

  const renderPageBannerPreview = (
    title: string,
    subtitle: string,
    bannerUrl?: string,
    eyebrow?: string,
    extraNotice?: string
  ) => (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white relative">
      {bannerUrl && (
        <img
          src={bannerUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
      )}
      <div className="relative p-6 sm:p-8 bg-gradient-to-r from-[#0F294D]/95 via-[#0F294D]/80 to-[#0F294D]/60 space-y-2">
        {eyebrow && (
          <div className="text-xs font-semibold text-blue-200">{eyebrow}</div>
        )}
        <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight max-w-2xl">
          {title || 'Untitled Page'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
        {extraNotice && (
          <div className="pt-2 text-xs text-amber-200 font-medium">{extraNotice}</div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={`Draft Preview — ${pageLabel}`}
    >
      {/* Preview Top Bar */}
      <div className="px-4 sm:px-6 py-3 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-amber-300">Draft Preview (Not Live Yet)</span>
            <span aria-hidden="true">/</span>
            <span className="text-white font-semibold truncate">{pageLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums text-slate-300">
              {changeSummary.length} pending change{changeSummary.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Viewport Toggle */}
        <div className="inline-flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
          <button
            type="button"
            onClick={() => setViewportMode('desktop')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              viewportMode === 'desktop'
                ? 'bg-white text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode('mobile')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors ${
              viewportMode === 'mobile'
                ? 'bg-white text-slate-900'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile</span>
          </button>
        </div>

        {/* Primary Preview Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onSaveDraft}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            type="button"
            disabled={isPublishing}
            onClick={onPublishLive}
            className="px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isPublishing ? 'Publishing...' : 'Publish Live Now'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            aria-label="Close preview"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Pending Changes Summary Strip */}
      {changeSummary.length > 0 && (
        <div className="px-4 sm:px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-900 flex flex-wrap items-center gap-x-3 gap-y-1 shrink-0">
          <span className="font-bold">Changes queued for publish:</span>
          {changeSummary.map((item, idx) => (
            <React.Fragment key={item}>
              {idx > 0 && <span aria-hidden="true" className="text-amber-400">·</span>}
              <span>{item}</span>
            </React.Fragment>
          ))}
          {pendingImageCount > 0 && (
            <>
              <span aria-hidden="true" className="text-amber-400">·</span>
              <span className="font-semibold tabular-nums">
                {pendingImageCount} staged photo override{pendingImageCount === 1 ? '' : 's'}
              </span>
            </>
          )}
        </div>
      )}

      {/* Scrollable Preview Stage */}
      <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-6">
        <div
          className={`mx-auto bg-slate-50 border border-slate-300 rounded-xl shadow-xl overflow-hidden transition-all ${
            viewportMode === 'mobile' ? 'max-w-[412px]' : 'max-w-[1280px]'
          }`}
        >
          {/* Simulated Site Top Announcement & Header */}
          <div className="bg-[#0F294D] text-white px-4 py-1.5 text-[11px] flex items-center justify-between gap-4">
            <span className="truncate">{draft.brand?.topBarAnnouncement || draft.homepage?.announcementTicker}</span>
            <span className="hidden sm:inline shrink-0 text-blue-200">{draft.brand?.supportEmail}</span>
          </div>
          <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4">
            <div className="font-black text-base text-[#0F294D] tracking-tight whitespace-nowrap">
              {draft.brand?.siteName || 'Trade Heaven'}
            </div>
            <div className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-600">
              <span>Homepage</span>
              <span>Products</span>
              <span>Buy Leads</span>
              <span>Suppliers</span>
              <span>Escrow</span>
            </div>
            <div className="text-xs font-semibold text-[#EA580C] whitespace-nowrap">
              Preview Mode
            </div>
          </div>

          {/* Page-Specific Preview Content */}
          <div className="p-4 sm:p-6 space-y-6">
            {/* HOMEPAGE / SITE GRID MATRIX PREVIEW */}
            {(pageKey === 'HOMEPAGE' || pageKey === 'SITE_GRID_MATRIX') && (
              <>
                {/* Hero Banner Preview */}
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-900 text-white relative">
                  {draft.homepage?.heroBgImage && (
                    <img
                      src={draft.homepage.heroBgImage}
                      alt="Hero Background Preview"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                  )}
                  <div className="relative p-6 sm:p-10 bg-gradient-to-r from-[#0F294D]/95 via-[#0F294D]/80 to-transparent space-y-3">
                    <div className="text-xs font-semibold text-emerald-300">
                      {draft.homepage?.heroTrustEyebrow}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black leading-tight max-w-2xl">
                      {draft.homepage?.heroHeadline}{' '}
                      <span className="text-amber-300">{draft.homepage?.heroHeadlineGradient}</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
                      {draft.homepage?.heroSubheadline}
                    </p>
                    <div className="pt-2 max-w-lg">
                      <div className="bg-white text-slate-500 text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 truncate">
                        {draft.homepage?.searchPlaceholder || 'Search products, RFQs, suppliers...'}
                      </div>
                    </div>
                  </div>
                </div>

                {!vis.announcementBanner && (
                  <div className="px-4 py-2.5 bg-slate-200/70 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Announcement Banner is hidden in this draft.</span>
                  </div>
                )}

                {/* Buy Leads Section Preview */}
                {vis.recentRfqs ? (
                  <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-xs font-semibold text-[#EA580C]">Latest Buy Leads &amp; RFQs</div>
                        <h2 className="text-base font-bold text-[#0F294D]">
                          Showing {homepageRfqs.length} Buy Lead Cards · {layouts.recentRfqs.columns} cols × {layouts.recentRfqs.rows} rows ({displayConfig.featuredRfqsMode.replace('_', ' ')})
                        </h2>
                      </div>
                    </div>
                    <div
                      className={`grid gap-4 ${
                        viewportMode === 'mobile'
                          ? 'grid-cols-1'
                          : getResponsiveGridColsClass(layouts.recentRfqs.columns)
                      }`}
                    >
                      {homepageRfqs.map((rfq, idx) => (
                        <article
                          key={rfq.id}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <div className="aspect-4/3 bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                              <SafeImage
                                src={rfq.resolvedPhotoUrl}
                                alt={rfq.productName}
                                productId={rfq.id}
                                productTitle={rfq.productName}
                                category={rfq.category}
                                type="rfq"
                                isThumbnail={true}
                                disableLiveUpload={true}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono font-bold tabular-nums">
                                #{idx + 1}
                              </span>
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="text-[11px] font-mono text-slate-500 truncate">{rfq.id}</div>
                              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 min-h-[2rem]">
                                {rfq.productName}
                              </h3>
                              <div className="text-[11px] text-slate-600 tabular-nums">
                                {Number(rfq.targetQuantity || 0).toLocaleString()} {rfq.quantityUnit || 'Units'} · {rfq.buyerCountry}
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Lock className="w-2.5 h-2.5 text-amber-600" />
                              <span>Target Open</span>
                            </span>
                            <span className="text-[#EA580C] font-bold inline-flex items-center gap-0.5">
                              <span>Quote</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="px-4 py-2.5 bg-slate-200/70 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Latest Buy Leads &amp; RFQs section is hidden in this draft.</span>
                  </div>
                )}

                {/* Featured Wholesale Products Section Preview */}
                {vis.featuredProducts ? (
                  <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-xs font-semibold text-blue-700">Factory Direct Wholesale Catalog</div>
                        <h2 className="text-base font-bold text-[#0F294D]">
                          Featured Wholesale Products ({featuredProducts.length} slots · {layouts.featuredProducts.layoutMode === 'CAROUSEL' && layouts.featuredProducts.rows <= 1 ? `Carousel ${layouts.featuredProducts.columns} visible` : `${layouts.featuredProducts.columns} cols × ${layouts.featuredProducts.rows} rows`} · {displayConfig.featuredProductsMode.replace('_', ' ')})
                        </h2>
                      </div>
                    </div>
                    <div
                      className={`grid gap-4 ${
                        viewportMode === 'mobile'
                          ? 'grid-cols-1'
                          : getResponsiveGridColsClass(layouts.featuredProducts.columns)
                      }`}
                    >
                      {featuredProducts.map((prod, idx) => (
                        <article
                          key={prod.id}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between"
                        >
                          <div>
                            <div className="aspect-4/3 bg-slate-100 border-b border-slate-100 overflow-hidden relative">
                              <SafeImage
                                src={prod.images?.[0] || (prod as any).imageUrl || ''}
                                alt={prod.title}
                                productId={prod.id}
                                productTitle={prod.title}
                                category={prod.category}
                                type="product"
                                isThumbnail={true}
                                disableLiveUpload={true}
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#0F294D]/90 text-white text-[10px] font-mono font-bold tabular-nums">
                                Slot #{idx + 1}
                              </span>
                            </div>
                            <div className="p-3 space-y-1.5">
                              <div className="text-[11px] font-semibold text-blue-700 truncate">
                                {prod.category}
                              </div>
                              <h3 className="text-xs font-bold text-slate-900 line-clamp-2 min-h-[2rem]">
                                {prod.title}
                              </h3>
                              <div className="text-sm font-black text-[#0F294D] tabular-nums">
                                {formatProductPrice(prod)}
                              </div>
                              <div className="text-[11px] text-slate-500 tabular-nums">
                                MOQ: {Number(prod.moq || 1).toLocaleString()} {prod.moqUnit || 'Units'}
                              </div>
                            </div>
                          </div>
                          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="text-slate-600 truncate">
                              {prod.supplierName || prod.supplierCountry}
                            </span>
                            <span className="text-[#0F294D] font-bold inline-flex items-center gap-1 shrink-0">
                              <Mail className="w-3 h-3" />
                              <span>Inquire</span>
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="px-4 py-2.5 bg-slate-200/70 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Featured Wholesale Products section is hidden in this draft.</span>
                  </div>
                )}

                {/* Suppliers Section Preview */}
                {vis.verifiedSuppliers ? (
                  <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="border-b border-slate-200 pb-3">
                      <div className="text-xs font-semibold text-blue-700">Audited Global Manufacturers</div>
                      <h2 className="text-base font-bold text-[#0F294D]">
                        Top {homepageSuppliers.length} Suppliers on Homepage ({layouts.verifiedSuppliers.columns} cols × {layouts.verifiedSuppliers.rows} rows)
                      </h2>
                    </div>
                    <div
                      className={`grid gap-4 ${
                        viewportMode === 'mobile'
                          ? 'grid-cols-1'
                          : getResponsiveGridColsClass(layouts.verifiedSuppliers.columns)
                      }`}
                    >
                      {homepageSuppliers.map((comp, idx) => (
                        <div key={comp.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                          <div className="flex items-center gap-3">
                            <SafeImage
                              src={comp.logoUrl}
                              alt={comp.companyName}
                              type="logo"
                              isThumbnail={true}
                              disableLiveUpload={true}
                              className="w-10 h-10 rounded-md border border-slate-200 bg-white shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="text-[11px] text-slate-500">
                                #{idx + 1} · {comp.tier} · {comp.country}
                              </div>
                              <div className="text-xs font-bold text-slate-900 truncate">
                                {comp.companyName}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="px-4 py-2.5 bg-slate-200/70 border border-dashed border-slate-300 rounded-lg text-xs text-slate-600 flex items-center gap-2">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Verified Suppliers section is hidden in this draft.</span>
                  </div>
                )}

                {/* Onboarding Banner Preview */}
                {vis.onboardingBanner && (
                  <section className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-4">
                    {draft.homepage?.onboardingBannerImage && (
                      <img
                        src={draft.homepage.onboardingBannerImage}
                        alt="Onboarding Banner Preview"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    )}
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="text-xs font-semibold text-emerald-700 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Partner Network</span>
                      </div>
                      <div className="text-sm font-bold text-[#0F294D]">
                        {draft.homepage?.onboardingBannerTitle || 'Ready to Board with Us? Connect with'}{' '}
                        <span className="text-[#EA580C]">
                          {draft.homepage?.onboardingBannerHighlight || 'Audited Factories & Verified Buyers'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {draft.homepage?.onboardingBannerDesc || 'Register as an international importer or audited factory to access global buyer RFQs and Trade Assurance.'}
                      </p>
                    </div>
                  </section>
                )}

                {/* Compact visibility summary for remaining lower sections */}
                <div className="px-4 py-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="font-semibold text-slate-800">Lower Homepage Sections:</span>
                  <span>Category Showcase: <strong>{vis.categoryShowcase ? 'Visible' : 'Hidden'}</strong></span>
                  <span>FAQ Accordion: <strong>{vis.faqSection ? 'Visible' : 'Hidden'}</strong></span>
                  <span>Trade Assurance Desk: <strong>{vis.whyChooseSection ? 'Visible' : 'Hidden'}</strong></span>
                  <span>Regions Bar: <strong>{vis.regionBar ? 'Visible' : 'Hidden'}</strong></span>
                </div>
              </>
            )}

            {/* PRODUCTS CATALOG PREVIEW */}
            {pageKey === 'PRODUCT_DIRECTORY' && (
              <div className="space-y-5">
                {renderPageBannerPreview(
                  draft.productsPage?.title,
                  draft.productsPage?.subtitle,
                  draft.productsPage?.bannerImageUrl,
                  draft.productsPage?.badgeText,
                  draft.productsPage?.ctaBannerTitle
                )}
                <div
                  className={`grid gap-4 ${
                    viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  }`}
                >
                  {catalogProducts.slice(0, 8).map(prod => (
                    <div key={prod.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="aspect-4/3 bg-slate-100">
                        <SafeImage
                          src={prod.images?.[0] || (prod as any).imageUrl || ''}
                          alt={prod.title}
                          productId={prod.id}
                          productTitle={prod.title}
                          category={prod.category}
                          type="product"
                          isThumbnail={true}
                          disableLiveUpload={true}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-[11px] text-blue-700 font-semibold truncate">{prod.category}</div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-2">{prod.title}</div>
                        <div className="text-xs font-bold text-[#0F294D] tabular-nums">{formatProductPrice(prod)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BUY LEADS PREVIEW */}
            {pageKey === 'BUY_LEADS' && (
              <div className="space-y-5">
                {renderPageBannerPreview(
                  draft.buyLeadsPage?.title,
                  draft.buyLeadsPage?.subtitle,
                  draft.buyLeadsPage?.bannerImageUrl,
                  draft.buyLeadsPage?.badgeText,
                  draft.buyLeadsPage?.urgentNoticeText
                )}
                <div
                  className={`grid gap-4 ${
                    viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
                  }`}
                >
                  {allRfqs.slice(0, 8).map(rfq => (
                    <div key={rfq.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                      <div className="aspect-4/3 bg-slate-100">
                        <SafeImage
                          src={rfq.resolvedPhotoUrl}
                          alt={rfq.productName}
                          productId={rfq.id}
                          productTitle={rfq.productName}
                          category={rfq.category}
                          type="rfq"
                          isThumbnail={true}
                          disableLiveUpload={true}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 space-y-1">
                        <div className="text-[11px] font-mono text-slate-500">{rfq.id}</div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-2">{rfq.productName}</div>
                        <div className="text-[11px] text-slate-600">{rfq.buyerCountry}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUPPLIERS DIRECTORY PREVIEW */}
            {pageKey === 'SUPPLIERS_DIRECTORY' && (
              <div className="space-y-5">
                {renderPageBannerPreview(
                  draft.suppliersPage?.title,
                  draft.suppliersPage?.subtitle,
                  draft.suppliersPage?.bannerImageUrl,
                  draft.suppliersPage?.badgeText,
                  draft.suppliersPage?.auditGuaranteeText
                )}
                <div className={`grid gap-4 ${viewportMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
                  {homepageSuppliers.map(comp => (
                    <div key={comp.id} className="p-4 bg-white border border-slate-200 rounded-lg flex items-center gap-3">
                      <SafeImage
                        src={comp.logoUrl}
                        alt={comp.companyName}
                        type="logo"
                        isThumbnail={true}
                        disableLiveUpload={true}
                        className="w-11 h-11 rounded-md border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{comp.companyName}</div>
                        <div className="text-[11px] text-slate-500">{comp.country} · {comp.tier}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POST RFQ PREVIEW */}
            {pageKey === 'POST_BUY_REQUIREMENT' && (
              <div className="space-y-4">
                {renderPageBannerPreview(
                  draft.postRfqPage?.title,
                  draft.postRfqPage?.subtitle,
                  draft.postRfqPage?.bannerImageUrl,
                  draft.postRfqPage?.badgeText,
                  draft.postRfqPage?.guaranteeText
                )}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { num: '01', text: draft.postRfqPage?.step1Title },
                    { num: '02', text: draft.postRfqPage?.step2Title },
                    { num: '03', text: draft.postRfqPage?.step3Title }
                  ].map(step => (
                    <div key={step.num} className="p-4 bg-white border border-slate-200 rounded-lg">
                      <div className="text-xs font-mono font-bold text-[#EA580C]">Step {step.num}</div>
                      <div className="text-sm font-bold text-slate-900 mt-1">{step.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* POST SELL OFFER PREVIEW */}
            {pageKey === 'POST_SELL_OFFER' && (
              <div className="space-y-4">
                {renderPageBannerPreview(
                  draft.postSellOfferPage?.title,
                  draft.postSellOfferPage?.subtitle,
                  draft.postSellOfferPage?.bannerImageUrl,
                  draft.postSellOfferPage?.badgeText
                )}
                <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-2 text-xs text-slate-700">
                  <div><strong>Seller Notice:</strong> {draft.postSellOfferPage?.sellerNotice}</div>
                  <div><strong>Compliance Tip:</strong> {draft.postSellOfferPage?.complianceTip}</div>
                </div>
              </div>
            )}

            {/* PREMIUM MEMBERSHIP PREVIEW */}
            {pageKey === 'PREMIUM_MEMBERSHIP' && (
              <div className="space-y-4">
                {renderPageBannerPreview(
                  draft.premiumPlansPage?.title,
                  draft.premiumPlansPage?.subtitle,
                  draft.premiumPlansPage?.bannerImageUrl,
                  draft.premiumPlansPage?.annualDiscountBadge
                )}
                <div className="p-5 bg-white border border-slate-200 rounded-lg space-y-2">
                  <div className="text-sm font-bold text-[#0F294D]">{draft.premiumPlansPage?.vipConsultingHeadline}</div>
                  <p className="text-xs text-slate-600">{draft.premiumPlansPage?.vipConsultingDescription}</p>
                  <div className="pt-1">
                    <span className="inline-block px-3.5 py-2 rounded-md bg-[#0F294D] text-white text-xs font-semibold">
                      {draft.premiumPlansPage?.vipConsultingButtonText}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ESCROW PREVIEW */}
            {pageKey === 'MEDIATOR_ENGINE' && (
              <div className="space-y-4">
                {renderPageBannerPreview(
                  draft.escrowPolicy?.title,
                  draft.escrowPolicy?.subtitle,
                  undefined,
                  draft.escrowPolicy?.bankRailNotice,
                  draft.escrowPolicy?.guaranteeNotice
                )}
                <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong>Refund Guarantee:</strong> {draft.escrowPolicy?.refundTermsSnippet}
                </div>
              </div>
            )}

            {/* TRADE TOOLS PREVIEW */}
            {pageKey === 'TRADE_TOOLS' && (
              <div className="space-y-4">
                {renderPageBannerPreview(draft.tradeToolsPage?.title, draft.tradeToolsPage?.subtitle)}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="text-sm font-bold text-[#0F294D]">Incoterms 2020 Calculator</div>
                    <p className="text-xs text-slate-600">{draft.tradeToolsPage?.incotermsDesc}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="text-sm font-bold text-[#0F294D]">Container CBM Estimator</div>
                    <p className="text-xs text-slate-600">{draft.tradeToolsPage?.cbmDesc}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1">
                    <div className="text-sm font-bold text-[#0F294D]">Proforma Invoice Generator</div>
                    <p className="text-xs text-slate-600">{draft.tradeToolsPage?.piGeneratorDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* CLIENT PORTAL PREVIEW */}
            {pageKey === 'DASHBOARD' && (
              <div className="space-y-4">
                {renderPageBannerPreview(
                  draft.clientAdminPage?.title,
                  draft.clientAdminPage?.subtitle,
                  undefined,
                  draft.clientAdminPage?.treasuryGuarantee
                )}
                <div className="p-4 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong>Wire Transfer Instructions:</strong> {draft.clientAdminPage?.wireInstructionsNotice}
                </div>
              </div>
            )}

            {/* GLOBAL BRAND / HEADER & FOOTER PREVIEW */}
            {(pageKey === 'GLOBAL_BRAND' || pageKey === 'INFO_AND_POLICIES') && (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <div className="text-lg font-black text-white">{draft.brand?.siteName}</div>
                    <div className="text-xs text-slate-400">{draft.brand?.siteTagline}</div>
                  </div>
                  <div className="text-xs text-emerald-400 font-semibold">
                    WhatsApp: {draft.brand?.whatsappNumber}
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {draft.headerAndFooter?.footerTagline}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {draft.headerAndFooter?.footerMission}
                </p>
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                  <span>{draft.headerAndFooter?.footerCopyright}</span>
                  <span>{draft.headerAndFooter?.footerIsoText}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
