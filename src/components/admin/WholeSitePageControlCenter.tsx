import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  ExternalLink,
  Save,
  Upload,
  Pin,
  PinOff,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  RotateCcw,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Layout,
  Package,
  FileText,
  Building2,
  PlusCircle,
  Tag,
  ShieldCheck,
  Wrench,
  Wallet,
  Globe,
  BookOpen,
  Link2,
  X,
  CheckCircle2,
  FileClock
} from 'lucide-react';
import { ActiveView, AuthUser, Product, RfqRequirement } from '../../types';
import { useSiteContent } from '../../context/SiteContentContext';
import {
  DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
  DEFAULT_SITE_CONTENT,
  HomepageDisplayConfig,
  SiteContent
} from '../../data/defaultSiteContent';
import { MOCK_COMPANIES, MOCK_PRODUCTS, MOCK_RFQS } from '../../data/mockData';
import { api } from '../../services/apiService';
import { productImageManagerService } from '../../services/productImageManagerService';
import { SafeImage } from '../common/SafeImage';
import { WholeSitePagePreviewModal } from './WholeSitePagePreviewModal';

const WHOLE_SITE_DRAFT_STORAGE_KEY = 'th_whole_site_draft_v1';

type SitePageKey =
  | 'HOMEPAGE'
  | 'PRODUCT_DIRECTORY'
  | 'BUY_LEADS'
  | 'SUPPLIERS_DIRECTORY'
  | 'POST_BUY_REQUIREMENT'
  | 'POST_SELL_OFFER'
  | 'PREMIUM_MEMBERSHIP'
  | 'MEDIATOR_ENGINE'
  | 'TRADE_TOOLS'
  | 'DASHBOARD'
  | 'GLOBAL_BRAND'
  | 'INFO_AND_POLICIES';

type HomepageSubTab = 'FEATURED_PRODUCTS' | 'BUY_LEADS' | 'SUPPLIERS' | 'HERO_AND_SECTIONS';

interface StagedItemImageChange {
  url: string;
  reset?: boolean;
}

interface StoredSiteDraftPayload {
  draft: SiteContent;
  stagedItemImages: Record<string, StagedItemImageChange>;
  savedAt: string;
}

interface SitePageMeta {
  key: SitePageKey;
  group: 'Marketplace' | 'Revenue & Operations' | 'Global & Policies';
  label: string;
  routeView: ActiveView;
  routeQuery: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SITE_PAGES: SitePageMeta[] = [
  {
    key: 'HOMEPAGE',
    group: 'Marketplace',
    label: 'Homepage',
    routeView: 'HOMEPAGE',
    routeQuery: '/?view=HOMEPAGE',
    summary: 'Hero, featured products (1–8), buy leads (1–8), suppliers (1–6), banners, and section visibility.',
    icon: Layout
  },
  {
    key: 'PRODUCT_DIRECTORY',
    group: 'Marketplace',
    label: 'Products Catalog',
    routeView: 'PRODUCT_DIRECTORY',
    routeQuery: '/?view=PRODUCT_DIRECTORY',
    summary: 'Catalog header, banner image, CTA copy, and permanent product photo overrides.',
    icon: Package
  },
  {
    key: 'BUY_LEADS',
    group: 'Marketplace',
    label: 'Buy Leads & RFQs',
    routeView: 'BUY_LEADS',
    routeQuery: '/?view=BUY_LEADS',
    summary: 'Buy leads header, urgent notice, banner photo, and permanent RFQ thumbnail overrides.',
    icon: FileText
  },
  {
    key: 'SUPPLIERS_DIRECTORY',
    group: 'Marketplace',
    label: 'Verified Suppliers',
    routeView: 'SUPPLIERS_DIRECTORY',
    routeQuery: '/?view=SUPPLIERS_DIRECTORY',
    summary: 'Supplier directory copy, audit guarantee, banner image, and homepage pinning.',
    icon: Building2
  },
  {
    key: 'POST_BUY_REQUIREMENT',
    group: 'Marketplace',
    label: 'Post Buying Request',
    routeView: 'POST_BUY_REQUIREMENT',
    routeQuery: '/?view=POST_BUY_REQUIREMENT',
    summary: 'RFQ submission page heading, banner, 3-step labels, and buyer guarantee notice.',
    icon: PlusCircle
  },
  {
    key: 'POST_SELL_OFFER',
    group: 'Marketplace',
    label: 'Post Sell Offer',
    routeView: 'POST_SELL_OFFER',
    routeQuery: '/?view=POST_SELL_OFFER',
    summary: 'Supplier offer page heading, banner, seller notice, and compliance tip.',
    icon: Tag
  },
  {
    key: 'PREMIUM_MEMBERSHIP',
    group: 'Revenue & Operations',
    label: 'Premium Plans & Pricing',
    routeView: 'PREMIUM_MEMBERSHIP',
    routeQuery: '/?view=PREMIUM_MEMBERSHIP',
    summary: 'Membership page headline, banner, discount label, and VIP consulting callout.',
    icon: ShieldCheck
  },
  {
    key: 'MEDIATOR_ENGINE',
    group: 'Revenue & Operations',
    label: 'Escrow & Trade Assurance',
    routeView: 'MEDIATOR_ENGINE',
    routeQuery: '/?view=MEDIATOR_ENGINE',
    summary: 'Escrow protection copy, bank rail notice, guarantee text, and refund terms snippet.',
    icon: ShieldCheck
  },
  {
    key: 'TRADE_TOOLS',
    group: 'Revenue & Operations',
    label: 'Trade Tools & Incoterms',
    routeView: 'TRADE_TOOLS',
    routeQuery: '/?view=TRADE_TOOLS',
    summary: 'Trade calculators page heading and Incoterms, CBM, and Proforma Invoice descriptions.',
    icon: Wrench
  },
  {
    key: 'DASHBOARD',
    group: 'Revenue & Operations',
    label: 'Client Portal & Wallet',
    routeView: 'DASHBOARD',
    routeQuery: '/?view=DASHBOARD',
    summary: 'Client billing title, subtitle, wire transfer instructions, and treasury guarantee.',
    icon: Wallet
  },
  {
    key: 'GLOBAL_BRAND',
    group: 'Global & Policies',
    label: 'Header, Footer & Brand',
    routeView: 'HOMEPAGE',
    routeQuery: 'Global (all pages)',
    summary: 'Brand name, tagline, top-bar announcement, support contacts, WhatsApp, and footer copy.',
    icon: Globe
  },
  {
    key: 'INFO_AND_POLICIES',
    group: 'Global & Policies',
    label: 'Company, Legal & Country Pages',
    routeView: 'ABOUT_US',
    routeQuery: '14 live routes',
    summary: 'Direct index and live links for About, Contact, Onboarding, Policies, Certificates, and SEO Portals.',
    icon: BookOpen
  }
];

interface InfoRouteRow {
  title: string;
  category: string;
  view: ActiveView;
  route: string;
  adminTabHint?: string;
}

const INFO_POLICY_ROUTES: InfoRouteRow[] = [
  { title: 'About Us', category: 'Company', view: 'ABOUT_US', route: '/?view=ABOUT_US' },
  { title: 'Contact Us', category: 'Company', view: 'CONTACT_US', route: '/?view=CONTACT_US' },
  { title: 'Onboard / Work With Us', category: 'Company', view: 'ONBOARD_WITH_US', route: '/?view=ONBOARD_WITH_US' },
  { title: 'Trust & Safety Center', category: 'Trust', view: 'TRUST_SAFETY', route: '/?view=TRUST_SAFETY' },
  { title: 'Trade Assurance Certificate', category: 'Trust', view: 'TRADE_ASSURANCE_CERTIFICATE', route: '/?view=TRADE_ASSURANCE_CERTIFICATE' },
  { title: 'B2B Trust Certificate', category: 'Trust', view: 'B2B_TRUST_CERTIFICATE', route: '/?view=B2B_TRUST_CERTIFICATE' },
  { title: 'Country Portals Hub (SEO)', category: 'SEO Directory', view: 'COUNTRY_HUB', route: '/?view=COUNTRY_HUB', adminTabHint: 'COUNTRIES' },
  { title: 'Global Trade Insights', category: 'Editorial', view: 'INSIGHTS', route: '/?view=INSIGHTS' },
  { title: 'Wallet Top-Up & Ledger', category: 'Finance', view: 'WALLET_TOPUP', route: '/?view=WALLET_TOPUP', adminTabHint: 'WALLET_MANAGER' },
  { title: 'Supplier Bank Withdrawal', category: 'Finance', view: 'SUPPLIER_WITHDRAWAL', route: '/?view=SUPPLIER_WITHDRAWAL', adminTabHint: 'WALLET_MANAGER' },
  { title: 'Privacy Policy', category: 'Legal', view: 'PRIVACY_POLICY', route: '/?view=PRIVACY_POLICY' },
  { title: 'Terms of Use', category: 'Legal', view: 'TERMS_OF_USE', route: '/?view=TERMS_OF_USE' },
  { title: 'Refund Policy', category: 'Legal', view: 'REFUND_POLICY', route: '/?view=REFUND_POLICY' },
  { title: 'Product Listing Policy', category: 'Legal', view: 'PRODUCT_LISTING_POLICY', route: '/?view=PRODUCT_LISTING_POLICY' }
];

const HOMEPAGE_SECTIONS_META: Array<{
  key: keyof HomepageDisplayConfig['sectionVisibility'];
  label: string;
  description: string;
}> = [
  { key: 'announcementBanner', label: 'Announcement Banner', description: 'Admin-published promotional strip below hero.' },
  { key: 'recentRfqs', label: 'Latest Buy Leads & RFQs', description: '8 importer buy-lead cards and RFQ directory bar.' },
  { key: 'featuredProducts', label: 'Featured Wholesale Products', description: '8 wholesale product cards (#featured-products-section).' },
  { key: 'categoryShowcase', label: 'Industry & Category Showcase', description: 'B2B sectors mega-menu and category tiles.' },
  { key: 'verifiedSuppliers', label: 'Audited Global Suppliers', description: 'Top 6 verified exporter cards with factory audits.' },
  { key: 'onboardingBanner', label: 'Partner Onboarding Banner', description: 'Work-with-us CTA banner with editable image.' },
  { key: 'faqSection', label: 'Marketplace FAQ Accordion', description: 'Frequently asked questions for buyers and suppliers.' },
  { key: 'whyChooseSection', label: 'Trade Assurance & Direct Desk', description: 'Compliance highlights and WhatsApp desk CTA.' },
  { key: 'regionBar', label: 'Global Regions & Countries Bar', description: 'Footer-adjacent regional sourcing shortcuts.' }
];

function mergeSiteContentDefaults(source?: Partial<SiteContent> | null): SiteContent {
  return {
    ...DEFAULT_SITE_CONTENT,
    ...(source || {}),
    homepageDisplayConfig: {
      ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
      ...(source?.homepageDisplayConfig || {}),
      sectionVisibility: {
        ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG.sectionVisibility,
        ...(source?.homepageDisplayConfig?.sectionVisibility || {})
      }
    }
  };
}

function readStoredDraft(): StoredSiteDraftPayload | null {
  try {
    const raw = localStorage.getItem(WHOLE_SITE_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.draft && typeof parsed.draft === 'object') {
      return {
        draft: mergeSiteContentDefaults(parsed.draft),
        stagedItemImages: parsed.stagedItemImages && typeof parsed.stagedItemImages === 'object' ? parsed.stagedItemImages : {},
        savedAt: String(parsed.savedAt || new Date().toISOString())
      };
    }
  } catch {}
  return null;
}

interface WholeSitePageControlCenterProps {
  currentUser: AuthUser | null;
  onNavigate: (view: ActiveView) => void;
  onOpenAdminTab?: (tabId: any) => void;
}

export const WholeSitePageControlCenter: React.FC<WholeSitePageControlCenterProps> = ({
  currentUser,
  onNavigate,
  onOpenAdminTab
}) => {
  const { siteContent, updateSiteContent } = useSiteContent();

  const [selectedPage, setSelectedPage] = useState<SitePageKey>('HOMEPAGE');
  const [homepageSubTab, setHomepageSubTab] = useState<HomepageSubTab>('FEATURED_PRODUCTS');
  const [pageSearch, setPageSearch] = useState('');

  // Load saved draft if present, otherwise initialize from live published siteContent
  const initialStoredDraft = useMemo(() => readStoredDraft(), []);

  const [draft, setDraft] = useState<SiteContent>(() =>
    initialStoredDraft ? initialStoredDraft.draft : mergeSiteContentDefaults(siteContent)
  );
  const [stagedItemImages, setStagedItemImages] = useState<Record<string, StagedItemImageChange>>(
    () => initialStoredDraft?.stagedItemImages || {}
  );
  const [savedDraftAt, setSavedDraftAt] = useState<string | null>(
    () => initialStoredDraft?.savedAt || null
  );
  const [hasDraftEdits, setHasDraftEdits] = useState<boolean>(() => Boolean(initialStoredDraft));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live catalog, RFQs, and image override sync
  const [liveProducts, setLiveProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [liveRfqs, setLiveRfqs] = useState<RfqRequirement[]>(MOCK_RFQS);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [imageSyncTick, setImageSyncTick] = useState(0);

  // Search filters inside item pickers
  const [productSearch, setProductSearch] = useState('');
  const [rfqSearch, setRfqSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');

  // Inline URL editor state & file upload state
  const [editingUrlTarget, setEditingUrlTarget] = useState<{ kind: 'item' | 'cms'; id: string; value: string } | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadTargetRef = useRef<{ kind: 'item' | 'cms'; id: string; cmsPath?: string } | null>(null);

  // Keep draft synced with live server content only when there are NO active draft edits
  useEffect(() => {
    if (!hasDraftEdits && !savedDraftAt && siteContent) {
      setDraft(mergeSiteContentDefaults(siteContent));
    }
  }, [siteContent, hasDraftEdits, savedDraftAt]);

  useEffect(() => {
    let mounted = true;
    const loadCatalog = async () => {
      setIsLoadingData(true);
      try {
        await productImageManagerService.ensureHydrated().catch(() => {});
        const [prods, rfqList] = await Promise.all([
          api.getProducts().catch(() => MOCK_PRODUCTS),
          api.getRfqs().catch(() => MOCK_RFQS)
        ]);
        if (!mounted) return;
        setLiveProducts(Array.isArray(prods) && prods.length > 0 ? prods : MOCK_PRODUCTS);
        setLiveRfqs(Array.isArray(rfqList) && rfqList.length > 0 ? rfqList : MOCK_RFQS);
      } finally {
        if (mounted) setIsLoadingData(false);
      }
    };
    loadCatalog();

    const bumpImages = () => setImageSyncTick(v => v + 1);
    window.addEventListener('tradeheaven_product_images_updated', bumpImages);
    window.addEventListener('tradeheaven_product_image_saved', bumpImages);
    window.addEventListener('tradeheaven_products_updated', loadCatalog);
    return () => {
      mounted = false;
      window.removeEventListener('tradeheaven_product_images_updated', bumpImages);
      window.removeEventListener('tradeheaven_product_image_saved', bumpImages);
      window.removeEventListener('tradeheaven_products_updated', loadCatalog);
    };
  }, []);

  const flashNotice = (type: 'success' | 'error', text: string) => {
    setStatusNotice({ type, text });
    window.setTimeout(() => {
      setStatusNotice(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const displayConfig: HomepageDisplayConfig = useMemo(
    () => ({
      ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
      ...(draft.homepageDisplayConfig || {}),
      sectionVisibility: {
        ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG.sectionVisibility,
        ...(draft.homepageDisplayConfig?.sectionVisibility || {})
      }
    }),
    [draft.homepageDisplayConfig]
  );

  const liveDisplayConfig: HomepageDisplayConfig = useMemo(
    () => ({
      ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG,
      ...(siteContent?.homepageDisplayConfig || {}),
      sectionVisibility: {
        ...DEFAULT_HOMEPAGE_DISPLAY_CONFIG.sectionVisibility,
        ...(siteContent?.homepageDisplayConfig?.sectionVisibility || {})
      }
    }),
    [siteContent?.homepageDisplayConfig]
  );

  // Synced products with staged draft photo overrides overlaid for accurate preview
  const syncedProducts = useMemo(() => {
    const base = productImageManagerService.sortProductsLatestUploadedFirst(
      productImageManagerService.applyOverridesToProductList(liveProducts)
    );
    return base.map(p => {
      const staged = stagedItemImages[p.id];
      if (!staged) return p;
      if (staged.reset) {
        const orig = liveProducts.find(origP => origP.id === p.id);
        return orig ? { ...p, images: orig.images } : p;
      }
      return {
        ...p,
        images: [staged.url, ...(p.images || []).slice(1)]
      };
    });
  }, [liveProducts, imageSyncTick, stagedItemImages]);

  // Exact 8 products in draft Featured Wholesale Products
  const resolvedFeaturedProducts = useMemo(() => {
    const hiddenSet = new Set(displayConfig.hiddenProductIds || []);
    const visible = syncedProducts.filter(p => !hiddenSet.has(p.id));
    const pinnedIds = displayConfig.pinnedProductIds || [];
    const mode = displayConfig.featuredProductsMode || 'PINNED_FIRST';

    if (mode !== 'AUTO_LATEST' && pinnedIds.length > 0) {
      const byId = new Map(visible.map(p => [p.id, p]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as Product[];
      if (mode === 'PINNED_ONLY' && pinned.length > 0) {
        return pinned.slice(0, 8);
      }
      const pinnedSet = new Set(pinned.map(p => p.id));
      return [...pinned, ...visible.filter(p => !pinnedSet.has(p.id))].slice(0, 8);
    }
    return visible.slice(0, 8);
  }, [syncedProducts, displayConfig.hiddenProductIds, displayConfig.pinnedProductIds, displayConfig.featuredProductsMode]);

  // Synced RFQs with staged draft photo overrides overlaid
  const syncedRfqs = useMemo(() => {
    return liveRfqs
      .map(r => {
        const rawPhoto = (r as any).image_url || (r as any).image || (r as any).images?.[0];
        const staged = stagedItemImages[r.id];
        const resolvedPhoto = staged
          ? staged.reset
            ? rawPhoto || ''
            : staged.url
          : productImageManagerService.resolveImageSrc({
              src: rawPhoto,
              productId: r.id,
              productTitle: r.productName,
              category: r.category
            });
        const rank = productImageManagerService.getLatestUploadedRank({
          id: r.id,
          title: r.productName,
          updatedAt: (r as any).updatedAt,
          imageUpdatedAt: (r as any).imageUpdatedAt
        });
        return {
          ...r,
          resolvedPhotoUrl: resolvedPhoto || rawPhoto || '',
          recentActivityTs: rank.timestampMs
        };
      })
      .sort((a, b) => (b.recentActivityTs || 0) - (a.recentActivityTs || 0));
  }, [liveRfqs, imageSyncTick, stagedItemImages]);

  const resolvedHomepageRfqs = useMemo(() => {
    const hiddenSet = new Set(displayConfig.hiddenRfqIds || []);
    const visible = syncedRfqs.filter(r => !hiddenSet.has(r.id));
    const pinnedIds = displayConfig.pinnedRfqIds || [];
    const mode = displayConfig.featuredRfqsMode || 'PINNED_FIRST';
    if (mode !== 'AUTO_LATEST' && pinnedIds.length > 0) {
      const byId = new Map(visible.map(r => [r.id, r]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as typeof visible;
      if (mode === 'PINNED_ONLY' && pinned.length > 0) {
        return pinned.slice(0, 8);
      }
      const pinnedSet = new Set(pinned.map(r => r.id));
      return [...pinned, ...visible.filter(r => !pinnedSet.has(r.id))].slice(0, 8);
    }
    return visible.slice(0, 8);
  }, [syncedRfqs, displayConfig.hiddenRfqIds, displayConfig.pinnedRfqIds, displayConfig.featuredRfqsMode]);

  const resolvedHomepageSuppliers = useMemo(() => {
    const hiddenSet = new Set(displayConfig.hiddenSupplierIds || []);
    const visible = MOCK_COMPANIES.filter(c => !hiddenSet.has(c.id));
    const pinnedIds = displayConfig.pinnedSupplierIds || [];
    if (pinnedIds.length > 0) {
      const byId = new Map(visible.map(c => [c.id, c]));
      const pinned = pinnedIds.map(id => byId.get(id)).filter(Boolean) as typeof visible;
      const pinnedSet = new Set(pinned.map(c => c.id));
      return [...pinned, ...visible.filter(c => !pinnedSet.has(c.id))].slice(0, 6);
    }
    return visible.slice(0, 6);
  }, [displayConfig.hiddenSupplierIds, displayConfig.pinnedSupplierIds]);

  // Compute human-readable list of staged changes vs live site
  const pendingImageCount = Object.keys(stagedItemImages).length;

  const changeSummary = useMemo(() => {
    const changes: string[] = [];
    if (
      JSON.stringify(displayConfig.pinnedProductIds) !== JSON.stringify(liveDisplayConfig.pinnedProductIds) ||
      JSON.stringify(displayConfig.hiddenProductIds) !== JSON.stringify(liveDisplayConfig.hiddenProductIds) ||
      displayConfig.featuredProductsMode !== liveDisplayConfig.featuredProductsMode
    ) {
      changes.push('Featured Products slots/order');
    }
    if (
      JSON.stringify(displayConfig.pinnedRfqIds) !== JSON.stringify(liveDisplayConfig.pinnedRfqIds) ||
      JSON.stringify(displayConfig.hiddenRfqIds) !== JSON.stringify(liveDisplayConfig.hiddenRfqIds) ||
      displayConfig.featuredRfqsMode !== liveDisplayConfig.featuredRfqsMode
    ) {
      changes.push('Homepage Buy Leads slots/order');
    }
    if (
      JSON.stringify(displayConfig.pinnedSupplierIds) !== JSON.stringify(liveDisplayConfig.pinnedSupplierIds) ||
      JSON.stringify(displayConfig.hiddenSupplierIds) !== JSON.stringify(liveDisplayConfig.hiddenSupplierIds)
    ) {
      changes.push('Homepage Suppliers order');
    }
    if (JSON.stringify(displayConfig.sectionVisibility) !== JSON.stringify(liveDisplayConfig.sectionVisibility)) {
      changes.push('Homepage section visibility');
    }

    const liveMerged = mergeSiteContentDefaults(siteContent);
    const { homepageDisplayConfig: _d1, ...draftPages } = draft;
    const { homepageDisplayConfig: _d2, ...livePages } = liveMerged;
    if (JSON.stringify(draftPages) !== JSON.stringify(livePages)) {
      changes.push('Page copy & banner images');
    }
    if (pendingImageCount > 0) {
      changes.push(`${pendingImageCount} item photo override${pendingImageCount === 1 ? '' : 's'}`);
    }
    return changes;
  }, [draft, siteContent, displayConfig, liveDisplayConfig, pendingImageCount]);

  // Save Draft (stores locally WITHOUT publishing to live visitors)
  const handleSaveDraft = () => {
    const nowIso = new Date().toISOString();
    const payload: StoredSiteDraftPayload = {
      draft,
      stagedItemImages,
      savedAt: nowIso
    };
    try {
      localStorage.setItem(WHOLE_SITE_DRAFT_STORAGE_KEY, JSON.stringify(payload));
      setSavedDraftAt(nowIso);
      setHasDraftEdits(true);
      flashNotice('success', 'Draft saved locally. Live website is unchanged until you click Publish Live.');
    } catch {
      flashNotice('error', 'Could not store draft in browser storage.');
    }
  };

  // Discard Draft (reverts everything back to current Live site)
  const handleDiscardDraft = () => {
    try {
      localStorage.removeItem(WHOLE_SITE_DRAFT_STORAGE_KEY);
    } catch {}
    setDraft(mergeSiteContentDefaults(siteContent));
    setStagedItemImages({});
    setSavedDraftAt(null);
    setHasDraftEdits(false);
    setEditingUrlTarget(null);
    flashNotice('success', 'Draft discarded. Reverted to live published site state.');
  };

  // Publish Live (commits ALL staged item photo overrides + full SiteContent to server)
  const handlePublishLive = async () => {
    setIsPublishing(true);
    try {
      const stagedEntries = Object.entries(stagedItemImages);
      for (const [itemId, change] of stagedEntries) {
        if (change.reset) {
          await productImageManagerService.resetProductImage(itemId);
        } else if (change.url) {
          await productImageManagerService.setProductImage(itemId, change.url, [change.url]);
        }
      }

      const res = await updateSiteContent(draft, currentUser);
      if (res.success) {
        try {
          localStorage.removeItem(WHOLE_SITE_DRAFT_STORAGE_KEY);
        } catch {}
        setStagedItemImages({});
        setSavedDraftAt(null);
        setHasDraftEdits(false);
        setImageSyncTick(v => v + 1);
        setIsPreviewOpen(false);
        flashNotice('success', 'All draft changes and permanent photos are now published live.');
      } else {
        flashNotice('error', res.message || 'Server returned an error while publishing changes.');
      }
    } catch (err: any) {
      flashNotice('error', err?.message || 'Failed to publish live changes.');
    } finally {
      setIsPublishing(false);
    }
  };

  const mutateDisplayConfig = (
    updater: (prev: HomepageDisplayConfig) => HomepageDisplayConfig,
    noticeText?: string
  ) => {
    const nextConfig = updater(displayConfig);
    setDraft(prev => ({
      ...prev,
      homepageDisplayConfig: nextConfig
    }));
    setHasDraftEdits(true);
    if (noticeText) {
      flashNotice('success', `${noticeText} (Staged in draft — preview or click Publish Live)`);
    }
  };

  const updateDraftField = (path: string, value: any) => {
    setDraft(prev => {
      const clone: any = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cursor = clone;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cursor[parts[i]] || typeof cursor[parts[i]] !== 'object') {
          cursor[parts[i]] = {};
        }
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
      return clone;
    });
    setHasDraftEdits(true);
  };

  // Pin / Unpin / Reorder / Hide helpers (staged in draft first)
  const togglePin = (listType: 'product' | 'rfq' | 'supplier', id: string) => {
    const key =
      listType === 'product'
        ? 'pinnedProductIds'
        : listType === 'rfq'
        ? 'pinnedRfqIds'
        : 'pinnedSupplierIds';
    const hiddenKey =
      listType === 'product'
        ? 'hiddenProductIds'
        : listType === 'rfq'
        ? 'hiddenRfqIds'
        : 'hiddenSupplierIds';
    const maxSlots = listType === 'supplier' ? 6 : 8;

    const current = displayConfig[key] || [];
    const isPinned = current.includes(id);

    if (!isPinned && current.length >= maxSlots) {
      flashNotice('error', `Maximum ${maxSlots} pinned slots reached. Unpin an item first.`);
      return;
    }

    const nextPinned = isPinned ? current.filter(x => x !== id) : [...current, id];
    const nextHidden = (displayConfig[hiddenKey] || []).filter(x => x !== id);

    mutateDisplayConfig(
      prev => ({
        ...prev,
        [key]: nextPinned,
        [hiddenKey]: nextHidden
      }),
      isPinned ? 'Unpinned item' : 'Pinned item to Homepage'
    );
  };

  const movePinnedSlot = (listType: 'product' | 'rfq' | 'supplier', id: string, direction: -1 | 1) => {
    const key =
      listType === 'product'
        ? 'pinnedProductIds'
        : listType === 'rfq'
        ? 'pinnedRfqIds'
        : 'pinnedSupplierIds';
    const current = [...(displayConfig[key] || [])];
    const idx = current.indexOf(id);
    if (idx === -1) {
      const currentShownIds =
        listType === 'product'
          ? resolvedFeaturedProducts.map(p => p.id)
          : listType === 'rfq'
          ? resolvedHomepageRfqs.map(r => r.id)
          : resolvedHomepageSuppliers.map(c => c.id);
      const pos = currentShownIds.indexOf(id);
      const targetPos = pos + direction;
      if (pos === -1 || targetPos < 0 || targetPos >= currentShownIds.length) return;
      const reordered = [...currentShownIds];
      [reordered[pos], reordered[targetPos]] = [reordered[targetPos], reordered[pos]];
      mutateDisplayConfig(prev => ({ ...prev, [key]: reordered }), 'Reordered Homepage slots');
      return;
    }

    const nextIdx = idx + direction;
    if (nextIdx < 0 || nextIdx >= current.length) return;
    [current[idx], current[nextIdx]] = [current[nextIdx], current[idx]];
    mutateDisplayConfig(prev => ({ ...prev, [key]: current }), 'Updated Homepage slot order');
  };

  const toggleHide = (listType: 'product' | 'rfq' | 'supplier', id: string) => {
    const hiddenKey =
      listType === 'product'
        ? 'hiddenProductIds'
        : listType === 'rfq'
        ? 'hiddenRfqIds'
        : 'hiddenSupplierIds';
    const pinnedKey =
      listType === 'product'
        ? 'pinnedProductIds'
        : listType === 'rfq'
        ? 'pinnedRfqIds'
        : 'pinnedSupplierIds';
    const currentHidden = displayConfig[hiddenKey] || [];
    const isHidden = currentHidden.includes(id);
    const nextHidden = isHidden ? currentHidden.filter(x => x !== id) : [...currentHidden, id];
    const nextPinned = isHidden
      ? displayConfig[pinnedKey] || []
      : (displayConfig[pinnedKey] || []).filter(x => x !== id);

    mutateDisplayConfig(
      prev => ({
        ...prev,
        [hiddenKey]: nextHidden,
        [pinnedKey]: nextPinned
      }),
      isHidden ? 'Restored item visibility' : 'Hidden item from Homepage'
    );
  };

  // File upload uploads asset to server storage, then STAGES it in Draft (does not change live page until Publish Live)
  const triggerFileUpload = (target: { kind: 'item' | 'cms'; id: string; cmsPath?: string }) => {
    pendingUploadTargetRef.current = target;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const target = pendingUploadTargetRef.current;
    if (!file || !target) return;

    setUploadingId(target.id);
    try {
      const res = await productImageManagerService.uploadAndAssignImageFile(file, {
        targetFormat: 'webp',
        quality: 0.88
      });

      if (target.kind === 'item') {
        setStagedItemImages(prev => ({
          ...prev,
          [target.id]: { url: res.url }
        }));
        setHasDraftEdits(true);
        flashNotice('success', 'Uploaded photo & staged in draft. Click Preview Draft to inspect or Publish Live to apply.');
      } else if (target.kind === 'cms' && target.cmsPath) {
        updateDraftField(target.cmsPath, res.url);
        flashNotice('success', 'Uploaded banner & staged in draft. Click Preview Draft to inspect or Publish Live to apply.');
      }
    } catch (err: any) {
      flashNotice('error', err?.message || 'Image upload failed. Please try another file.');
    } finally {
      setUploadingId(null);
      pendingUploadTargetRef.current = null;
    }
  };

  const handleSaveManualUrl = () => {
    if (!editingUrlTarget) return;
    const cleanUrl = editingUrlTarget.value.trim();
    if (!cleanUrl) {
      flashNotice('error', 'Please enter a valid image URL or path.');
      return;
    }
    if (editingUrlTarget.kind === 'item') {
      setStagedItemImages(prev => ({
        ...prev,
        [editingUrlTarget.id]: { url: cleanUrl }
      }));
      setHasDraftEdits(true);
      flashNotice('success', 'Staged image URL in draft. Preview or click Publish Live to apply.');
    } else {
      updateDraftField(editingUrlTarget.id, cleanUrl);
      flashNotice('success', 'Staged page banner URL in draft. Preview or click Publish Live to apply.');
    }
    setEditingUrlTarget(null);
  };

  const handleStageResetItemImage = (itemId: string) => {
    setStagedItemImages(prev => ({
      ...prev,
      [itemId]: { url: '', reset: true }
    }));
    setHasDraftEdits(true);
    flashNotice('success', 'Staged image reset in draft. Click Publish Live to restore original.');
  };

  const filteredPages = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return SITE_PAGES;
    return SITE_PAGES.filter(
      p =>
        p.label.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.group.toLowerCase().includes(q) ||
        p.routeQuery.toLowerCase().includes(q)
    );
  }, [pageSearch]);

  const activePageMeta = SITE_PAGES.find(p => p.key === selectedPage) || SITE_PAGES[0];

  const filteredCatalogForPicker = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    const list = syncedProducts;
    if (!q) return list.slice(0, 36);
    return list
      .filter(
        p =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.id || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.supplierName || '').toLowerCase().includes(q)
      )
      .slice(0, 48);
  }, [syncedProducts, productSearch]);

  const filteredRfqsForPicker = useMemo(() => {
    const q = rfqSearch.trim().toLowerCase();
    if (!q) return syncedRfqs.slice(0, 32);
    return syncedRfqs
      .filter(
        r =>
          (r.productName || '').toLowerCase().includes(q) ||
          (r.id || '').toLowerCase().includes(q) ||
          (r.category || '').toLowerCase().includes(q) ||
          (r.buyerCountry || '').toLowerCase().includes(q)
      )
      .slice(0, 48);
  }, [syncedRfqs, rfqSearch]);

  const filteredSuppliers = useMemo(() => {
    const q = supplierSearch.trim().toLowerCase();
    if (!q) return MOCK_COMPANIES;
    return MOCK_COMPANIES.filter(
      c =>
        c.companyName.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q)
    );
  }, [supplierSearch]);

  const formattedSavedDraftTime = useMemo(() => {
    if (!savedDraftAt) return null;
    try {
      return new Date(savedDraftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  }, [savedDraftAt]);

  // Reusable banner image control
  const renderCmsImageControl = (label: string, cmsPath: string, currentUrl: string, helper?: string) => {
    const isBusy = uploadingId === cmsPath;
    const isEditingUrl = editingUrlTarget?.kind === 'cms' && editingUrlTarget.id === cmsPath;

    return (
      <div className="py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-32 h-20 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
          {currentUrl ? (
            <img
              src={currentUrl}
              alt={label}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-slate-900">{label}</div>
              {helper && <div className="text-xs text-slate-500">{helper}</div>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={isBusy}
                onClick={() => triggerFileUpload({ kind: 'cms', id: cmsPath, cmsPath })}
                className="px-3 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isBusy ? 'Uploading...' : 'Upload Image'}</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditingUrlTarget(
                    isEditingUrl ? null : { kind: 'cms', id: cmsPath, value: currentUrl || '' }
                  )
                }
                className="px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span>Edit URL</span>
              </button>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-500 truncate">{currentUrl || 'No image assigned'}</div>

          {isEditingUrl && (
            <div className="pt-2 flex items-center gap-2">
              <input
                type="text"
                value={editingUrlTarget.value}
                onChange={e => setEditingUrlTarget({ ...editingUrlTarget, value: e.target.value })}
                placeholder="/assets/uploads/banner.webp or https://..."
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
              />
              <button
                type="button"
                onClick={handleSaveManualUrl}
                className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
              >
                Stage URL
              </button>
              <button
                type="button"
                onClick={() => setEditingUrlTarget(null)}
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                aria-label="Cancel URL edit"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Reusable text field row
  const renderTextField = (
    label: string,
    path: string,
    value: string,
    multiline = false,
    helper?: string
  ) => (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>
      {multiline ? (
        <textarea
          rows={3}
          value={value || ''}
          onChange={e => updateDraftField(path, e.target.value)}
          className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
        />
      ) : (
        <input
          type="text"
          value={value || ''}
          onChange={e => updateDraftField(path, e.target.value)}
          className="w-full px-3 py-2 text-sm text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
        />
      )}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );

  // Reusable item row for Featured Slots & Catalog Permanent Image Control
  const renderSlotItemRow = (opts: {
    slotNumber?: number;
    id: string;
    title: string;
    metaLine: string;
    imageUrl: string;
    imageType: 'product' | 'rfq' | 'logo';
    category?: string;
    isPinned: boolean;
    isHidden: boolean;
    canMoveUp?: boolean;
    canMoveDown?: boolean;
    listType: 'product' | 'rfq' | 'supplier';
    allowImageEdit?: boolean;
  }) => {
    const isBusy = uploadingId === opts.id;
    const isEditingUrl = editingUrlTarget?.kind === 'item' && editingUrlTarget.id === opts.id;
    const hasStagedPhoto = Boolean(stagedItemImages[opts.id]);

    return (
      <div
        key={`${opts.slotNumber ?? 'pick'}-${opts.id}`}
        className="py-3 px-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50/80 transition-colors"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {typeof opts.slotNumber === 'number' && (
              <div className="w-7 text-xs font-mono font-bold text-slate-500 tabular-nums shrink-0">
                #{opts.slotNumber}
              </div>
            )}

            <div className="w-16 h-12 rounded-md border border-slate-200 bg-slate-100 overflow-hidden shrink-0">
              <SafeImage
                src={opts.imageUrl}
                alt={opts.title}
                productId={opts.id}
                productTitle={opts.title}
                category={opts.category}
                type={opts.imageType}
                isThumbnail={true}
                disableLiveUpload={true}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-slate-900 truncate">{opts.title}</div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="font-mono text-slate-600">{opts.id}</span>
                <span aria-hidden="true">·</span>
                <span className="truncate">{opts.metaLine}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    opts.isHidden
                      ? 'text-red-600 font-semibold'
                      : opts.isPinned
                      ? 'text-emerald-700 font-semibold'
                      : 'text-slate-500'
                  }
                >
                  {opts.isHidden ? 'Hidden on Homepage' : opts.isPinned ? 'Pinned' : 'Auto Order'}
                </span>
                {hasStagedPhoto && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-700 font-semibold">Draft photo pending publish</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {opts.allowImageEdit !== false && (
              <>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => triggerFileUpload({ kind: 'item', id: opts.id })}
                  className="px-2.5 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isBusy ? 'Uploading...' : 'Upload Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingUrlTarget(
                      isEditingUrl ? null : { kind: 'item', id: opts.id, value: opts.imageUrl || '' }
                    )
                  }
                  className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  <span>URL</span>
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleStageResetItemImage(opts.id)}
                  className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 transition-colors cursor-pointer"
                  title="Stage reset to default image"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            {typeof opts.slotNumber === 'number' && (
              <>
                <button
                  type="button"
                  disabled={!opts.canMoveUp}
                  onClick={() => movePinnedSlot(opts.listType, opts.id, -1)}
                  className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 disabled:opacity-35 cursor-pointer"
                  title="Move up one slot"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={!opts.canMoveDown}
                  onClick={() => movePinnedSlot(opts.listType, opts.id, 1)}
                  className="p-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 disabled:opacity-35 cursor-pointer"
                  title="Move down one slot"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => togglePin(opts.listType, opts.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer whitespace-nowrap ${
                opts.isPinned
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {opts.isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
              <span>{opts.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleHide(opts.listType, opts.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold inline-flex items-center gap-1 border transition-colors cursor-pointer whitespace-nowrap ${
                opts.isHidden
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-600 border-slate-300 hover:text-red-700 hover:border-red-300'
              }`}
            >
              {opts.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{opts.isHidden ? 'Show' : 'Hide'}</span>
            </button>
          </div>
        </div>

        {isEditingUrl && (
          <div className="mt-3 pt-2 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              value={editingUrlTarget.value}
              onChange={e => setEditingUrlTarget({ ...editingUrlTarget, value: e.target.value })}
              placeholder="/assets/uploads/product-photo.webp or https://..."
              className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
            <button
              type="button"
              onClick={handleSaveManualUrl}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer whitespace-nowrap"
            >
              Stage Image URL
            </button>
            <button
              type="button"
              onClick={() => setEditingUrlTarget(null)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
              aria-label="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      {/* Shared hidden file input for staged permanent image uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileSelected}
        className="hidden"
      />

      {/* Top Breadcrumb & Primary Action Bar */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Whole Site Page Manager</span>
            <span aria-hidden="true">/</span>
            <span className="font-semibold text-[#0F294D]">{activePageMeta.label}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500 truncate">{activePageMeta.routeQuery}</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">{activePageMeta.label} Control</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="px-3.5 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Before Publish</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate(activePageMeta.routeView)}
            className="px-3 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live</span>
          </button>

          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublishLive}
            className="px-4 py-2 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>
              {isPublishing
                ? 'Publishing...'
                : changeSummary.length > 0
                ? `Publish Live (${changeSummary.length})`
                : 'Publish Live'}
            </span>
          </button>
        </div>
      </div>

      {/* Draft Mode Status Strip (visible whenever draft edits or saved draft exist) */}
      {(hasDraftEdits || savedDraftAt || changeSummary.length > 0) && (
        <div className="px-6 py-2.5 bg-amber-50/90 border-b border-amber-200 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex flex-wrap items-center gap-2">
            <FileClock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              Draft Workspace Active
            </span>
            <span aria-hidden="true" className="text-amber-400">·</span>
            <span className="tabular-nums">
              {changeSummary.length} change{changeSummary.length === 1 ? '' : 's'} not yet live
            </span>
            {formattedSavedDraftTime && (
              <>
                <span aria-hidden="true" className="text-amber-400">·</span>
                <span className="tabular-nums text-amber-800">Draft saved at {formattedSavedDraftTime}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="font-semibold text-[#0F294D] hover:underline cursor-pointer whitespace-nowrap"
            >
              Preview Draft
            </button>
            <span aria-hidden="true" className="text-amber-300">|</span>
            <button
              type="button"
              onClick={handleSaveDraft}
              className="font-semibold text-amber-900 hover:underline cursor-pointer whitespace-nowrap"
            >
              Save Draft
            </button>
            <span aria-hidden="true" className="text-amber-300">|</span>
            <button
              type="button"
              onClick={handleDiscardDraft}
              className="font-semibold text-red-700 hover:underline cursor-pointer whitespace-nowrap"
            >
              Discard Draft
            </button>
          </div>
        </div>
      )}

      {/* Inline Status Notice */}
      {statusNotice && (
        <div
          className={`px-6 py-2.5 border-b text-xs font-medium flex items-center justify-between gap-3 ${
            statusNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotice(null)}
            className="text-current opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 2-Column SaaS Workspace: Left Page Navigator + Right Selected Page Control */}
      <div className="flex flex-col lg:flex-row min-h-[680px]">
        {/* Left Sidebar: All Site Pages in One Place */}
        <aside className="w-full lg:w-[272px] shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/60 p-4 space-y-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={pageSearch}
              onChange={e => setPageSearch(e.target.value)}
              placeholder="Filter site pages..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
            />
          </div>

          {(['Marketplace', 'Revenue & Operations', 'Global & Policies'] as const).map(groupName => {
            const groupItems = filteredPages.filter(p => p.group === groupName);
            if (groupItems.length === 0) return null;
            return (
              <div key={groupName} className="space-y-1">
                <div className="px-2 pb-1 text-[11px] font-semibold text-slate-500">
                  {groupName}
                </div>
                {groupItems.map(page => {
                  const Icon = page.icon;
                  const active = page.key === selectedPage;
                  return (
                    <button
                      key={page.key}
                      type="button"
                      onClick={() => setSelectedPage(page.key)}
                      className={`w-full text-left px-3 py-2 rounded-md text-xs font-medium flex items-center gap-2.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#0F294D] text-white font-semibold'
                          : 'text-slate-700 hover:bg-slate-200/70 hover:text-slate-900'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="truncate">{page.label}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}

          <div className="pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1 px-2">
            <div className="font-semibold text-slate-700">Live Inventory Snapshot</div>
            <div className="tabular-nums">
              {syncedProducts.length} Products · {syncedRfqs.length} Buy Leads · {MOCK_COMPANIES.length} Suppliers
            </div>
          </div>
        </aside>

        {/* Right Main Viewport */}
        <div className="flex-1 min-w-0 p-6 space-y-6 bg-white">
          <p className="text-sm text-slate-600">{activePageMeta.summary}</p>

          {/* ================= 1. HOMEPAGE WORKSPACE ================= */}
          {selectedPage === 'HOMEPAGE' && (
            <div className="space-y-6">
              {/* Segmented sub-navigation */}
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
                {(
                  [
                    { id: 'FEATURED_PRODUCTS', label: `Featured Products (${resolvedFeaturedProducts.length}/8)` },
                    { id: 'BUY_LEADS', label: `Buy Leads / RFQs (${resolvedHomepageRfqs.length}/8)` },
                    { id: 'SUPPLIERS', label: `Suppliers (${resolvedHomepageSuppliers.length}/6)` },
                    { id: 'HERO_AND_SECTIONS', label: 'Hero, Banners & Sections' }
                  ] as const
                ).map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setHomepageSubTab(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
                      homepageSubTab === tab.id
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUBTAB A: FEATURED WHOLESALE PRODUCTS (SLOTS 1-8) */}
              {homepageSubTab === 'FEATURED_PRODUCTS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Displayed in Featured Wholesale Products (Slots 1–8)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        All changes stay in draft so you can inspect Preview Before Publish, Save Draft, or Publish Live when ready.
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                      {(
                        [
                          { id: 'PINNED_FIRST', label: 'Pinned First' },
                          { id: 'PINNED_ONLY', label: 'Locked Pinned Only' },
                          { id: 'AUTO_LATEST', label: 'Auto Latest' }
                        ] as const
                      ).map(modeOpt => (
                        <button
                          key={modeOpt.id}
                          type="button"
                          onClick={() =>
                            mutateDisplayConfig(
                              prev => ({ ...prev, featuredProductsMode: modeOpt.id }),
                              `Featured Products mode set to ${modeOpt.label}`
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                            displayConfig.featuredProductsMode === modeOpt.id
                              ? 'bg-white text-[#0F294D] shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {modeOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active 8 Draft Slots */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Homepage Slots (#1–#{resolvedFeaturedProducts.length})
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {(displayConfig.pinnedProductIds || []).length} Pinned · {(displayConfig.hiddenProductIds || []).length} Hidden
                      </span>
                    </div>

                    {isLoadingData ? (
                      <div className="p-6 text-xs text-slate-500">Loading catalog...</div>
                    ) : resolvedFeaturedProducts.length === 0 ? (
                      <div className="p-6 text-xs text-slate-500">
                        No products currently visible. Unhide or pin products from the catalog picker below.
                      </div>
                    ) : (
                      resolvedFeaturedProducts.map((prod, idx) =>
                        renderSlotItemRow({
                          slotNumber: idx + 1,
                          id: prod.id,
                          title: prod.title,
                          metaLine: `${prod.category || 'Wholesale'} · ${prod.supplierName || prod.supplierCountry || 'Verified Exporter'}`,
                          imageUrl: prod.images?.[0] || (prod as any).imageUrl || '',
                          imageType: 'product',
                          category: prod.category,
                          isPinned: (displayConfig.pinnedProductIds || []).includes(prod.id),
                          isHidden: (displayConfig.hiddenProductIds || []).includes(prod.id),
                          canMoveUp: idx > 0,
                          canMoveDown: idx < resolvedFeaturedProducts.length - 1,
                          listType: 'product'
                        })
                      )
                    )}
                  </div>

                  {/* Full Catalog Picker */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900">
                        All Catalog Products — Choose &amp; Pin to Homepage
                      </h4>
                      <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={productSearch}
                          onChange={e => setProductSearch(e.target.value)}
                          placeholder="Search by title, ID, category, supplier..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
                        />
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto">
                      {filteredCatalogForPicker.map(prod =>
                        renderSlotItemRow({
                          id: prod.id,
                          title: prod.title,
                          metaLine: `${prod.category || 'Wholesale'} · ${prod.supplierCountry || 'Global'}`,
                          imageUrl: prod.images?.[0] || (prod as any).imageUrl || '',
                          imageType: 'product',
                          category: prod.category,
                          isPinned: (displayConfig.pinnedProductIds || []).includes(prod.id),
                          isHidden: (displayConfig.hiddenProductIds || []).includes(prod.id),
                          listType: 'product'
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB B: BUY LEADS / RFQS (SLOTS 1-8) */}
              {homepageSubTab === 'BUY_LEADS' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Displayed in Latest Buy Leads &amp; RFQs (Slots 1–8)
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Pin specific buyer requirements, stage card photos, or hide RFQs before publishing live.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 shrink-0">
                      {(
                        [
                          { id: 'PINNED_FIRST', label: 'Pinned First' },
                          { id: 'PINNED_ONLY', label: 'Locked Pinned Only' },
                          { id: 'AUTO_LATEST', label: 'Auto Latest' }
                        ] as const
                      ).map(modeOpt => (
                        <button
                          key={modeOpt.id}
                          type="button"
                          onClick={() =>
                            mutateDisplayConfig(
                              prev => ({ ...prev, featuredRfqsMode: modeOpt.id }),
                              `Homepage Buy Leads mode set to ${modeOpt.label}`
                            )
                          }
                          className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                            displayConfig.featuredRfqsMode === modeOpt.id
                              ? 'bg-white text-[#0F294D] shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {modeOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Homepage Buy Lead Slots (#1–#{resolvedHomepageRfqs.length})
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {(displayConfig.pinnedRfqIds || []).length} Pinned · {(displayConfig.hiddenRfqIds || []).length} Hidden
                      </span>
                    </div>
                    {resolvedHomepageRfqs.map((rfq, idx) =>
                      renderSlotItemRow({
                        slotNumber: idx + 1,
                        id: rfq.id,
                        title: rfq.productName,
                        metaLine: `${rfq.buyerCountry} · ${Number(rfq.targetQuantity || 0).toLocaleString()} ${rfq.quantityUnit || 'Units'}`,
                        imageUrl: rfq.resolvedPhotoUrl,
                        imageType: 'rfq',
                        category: rfq.category,
                        isPinned: (displayConfig.pinnedRfqIds || []).includes(rfq.id),
                        isHidden: (displayConfig.hiddenRfqIds || []).includes(rfq.id),
                        canMoveUp: idx > 0,
                        canMoveDown: idx < resolvedHomepageRfqs.length - 1,
                        listType: 'rfq'
                      })
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900">All Buy Leads — Pin or Edit Photo</h4>
                      <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={rfqSearch}
                          onChange={e => setRfqSearch(e.target.value)}
                          placeholder="Search RFQ title, ID, country..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
                        />
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[380px] overflow-y-auto">
                      {filteredRfqsForPicker.map(rfq =>
                        renderSlotItemRow({
                          id: rfq.id,
                          title: rfq.productName,
                          metaLine: `${rfq.buyerCountry} · ${rfq.category}`,
                          imageUrl: rfq.resolvedPhotoUrl,
                          imageType: 'rfq',
                          category: rfq.category,
                          isPinned: (displayConfig.pinnedRfqIds || []).includes(rfq.id),
                          isHidden: (displayConfig.hiddenRfqIds || []).includes(rfq.id),
                          listType: 'rfq'
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB C: VERIFIED SUPPLIERS (SLOTS 1-6) */}
              {homepageSubTab === 'SUPPLIERS' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Displayed in Audited Global Suppliers (Top 6 Slots)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Control which exporter profiles appear first on the homepage and hide profiles you do not want featured.
                    </p>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Homepage Supplier Slots (#1–#{resolvedHomepageSuppliers.length})
                      </span>
                      <span className="text-slate-500 tabular-nums">
                        {(displayConfig.pinnedSupplierIds || []).length} Pinned · {(displayConfig.hiddenSupplierIds || []).length} Hidden
                      </span>
                    </div>
                    {resolvedHomepageSuppliers.map((comp, idx) =>
                      renderSlotItemRow({
                        slotNumber: idx + 1,
                        id: comp.id,
                        title: comp.companyName,
                        metaLine: `${comp.country} · ${comp.tier}`,
                        imageUrl: comp.logoUrl,
                        imageType: 'logo',
                        isPinned: (displayConfig.pinnedSupplierIds || []).includes(comp.id),
                        isHidden: (displayConfig.hiddenSupplierIds || []).includes(comp.id),
                        canMoveUp: idx > 0,
                        canMoveDown: idx < resolvedHomepageSuppliers.length - 1,
                        listType: 'supplier',
                        allowImageEdit: false
                      })
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-sm font-bold text-slate-900">All Verified Suppliers</h4>
                      <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={supplierSearch}
                          onChange={e => setSupplierSearch(e.target.value)}
                          placeholder="Search company, country..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
                        />
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[360px] overflow-y-auto">
                      {filteredSuppliers.map(comp =>
                        renderSlotItemRow({
                          id: comp.id,
                          title: comp.companyName,
                          metaLine: `${comp.country} · ${comp.tier}`,
                          imageUrl: comp.logoUrl,
                          imageType: 'logo',
                          isPinned: (displayConfig.pinnedSupplierIds || []).includes(comp.id),
                          isHidden: (displayConfig.hiddenSupplierIds || []).includes(comp.id),
                          listType: 'supplier',
                          allowImageEdit: false
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB D: HERO, BANNERS & SECTION VISIBILITY */}
              {homepageSubTab === 'HERO_AND_SECTIONS' && (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-900">Homepage Section Visibility</h3>
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-200">
                      {HOMEPAGE_SECTIONS_META.map(sec => {
                        const enabled = displayConfig.sectionVisibility[sec.key] !== false;
                        return (
                          <div
                            key={sec.key}
                            className="px-4 py-3 flex items-center justify-between gap-4 hover:bg-slate-50/70"
                          >
                            <div>
                              <div className="text-sm font-semibold text-slate-900">{sec.label}</div>
                              <div className="text-xs text-slate-500">{sec.description}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                mutateDisplayConfig(
                                  prev => ({
                                    ...prev,
                                    sectionVisibility: {
                                      ...prev.sectionVisibility,
                                      [sec.key]: !enabled
                                    }
                                  }),
                                  `${sec.label} set to ${!enabled ? 'Visible' : 'Hidden'}`
                                )
                              }
                              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap ${
                                enabled
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              {enabled ? 'Visible' : 'Hidden'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-sm font-bold text-slate-900">Homepage Banner &amp; Hero Images</h3>
                    <div className="border-t border-slate-200">
                      {renderCmsImageControl(
                        'Hero Background Image',
                        'homepage.heroBgImage',
                        draft.homepage?.heroBgImage || '',
                        'Primary hero backdrop shown at the top of the homepage.'
                      )}
                      {renderCmsImageControl(
                        'Onboarding Partner Banner Thumbnail',
                        'homepage.onboardingBannerImage',
                        draft.homepage?.onboardingBannerImage || '',
                        'Image inside the "Ready to Board with Us?" section.'
                      )}
                      {renderCmsImageControl(
                        'Promo Column 1 Banner',
                        'homepage.bannerImageCol1',
                        draft.homepage?.bannerImageCol1 || ''
                      )}
                      {renderCmsImageControl(
                        'Promo Column 2 Banner',
                        'homepage.bannerImageCol2',
                        draft.homepage?.bannerImageCol2 || ''
                      )}
                      {renderCmsImageControl(
                        'Promo Column 3 Banner',
                        'homepage.bannerImageCol3',
                        draft.homepage?.bannerImageCol3 || ''
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900">Homepage Copy &amp; Headlines</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderTextField('Hero Headline', 'homepage.heroHeadline', draft.homepage?.heroHeadline || '')}
                      {renderTextField('Hero Highlight Text', 'homepage.heroHeadlineGradient', draft.homepage?.heroHeadlineGradient || '')}
                    </div>
                    {renderTextField('Hero Subheadline', 'homepage.heroSubheadline', draft.homepage?.heroSubheadline || '', true)}
                    {renderTextField('Top Announcement Ticker', 'homepage.announcementTicker', draft.homepage?.announcementTicker || '')}
                    {renderTextField('Search Input Placeholder', 'homepage.searchPlaceholder', draft.homepage?.searchPlaceholder || '')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= 2. PRODUCTS CATALOG PAGE ================= */}
          {selectedPage === 'PRODUCT_DIRECTORY' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Products Page Copy &amp; Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Page Title', 'productsPage.title', draft.productsPage?.title || '')}
                  {renderTextField('Eyebrow Label', 'productsPage.badgeText', draft.productsPage?.badgeText || '')}
                </div>
                {renderTextField('Page Subtitle', 'productsPage.subtitle', draft.productsPage?.subtitle || '', true)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('CTA Banner Heading', 'productsPage.ctaBannerTitle', draft.productsPage?.ctaBannerTitle || '')}
                  {renderTextField('CTA Button Text', 'productsPage.ctaButtonText', draft.productsPage?.ctaButtonText || '')}
                </div>
                {renderCmsImageControl(
                  'Products Catalog Header Banner',
                  'productsPage.bannerImageUrl',
                  draft.productsPage?.bannerImageUrl || ''
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">All Product Images (Staged &amp; Permanent Overrides)</h3>
                    <p className="text-xs text-slate-500">
                      Upload a replacement photo or paste a URL to preview in draft before publishing live.
                    </p>
                  </div>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Filter catalog products..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
                    />
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[460px] overflow-y-auto">
                  {filteredCatalogForPicker.map(prod =>
                    renderSlotItemRow({
                      id: prod.id,
                      title: prod.title,
                      metaLine: `${prod.category || 'Wholesale'} · ${prod.supplierName || prod.supplierCountry || 'Verified'}`,
                      imageUrl: prod.images?.[0] || (prod as any).imageUrl || '',
                      imageType: 'product',
                      category: prod.category,
                      isPinned: (displayConfig.pinnedProductIds || []).includes(prod.id),
                      isHidden: (displayConfig.hiddenProductIds || []).includes(prod.id),
                      listType: 'product'
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. BUY LEADS & RFQS PAGE ================= */}
          {selectedPage === 'BUY_LEADS' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Buy Leads Page Copy &amp; Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Page Title', 'buyLeadsPage.title', draft.buyLeadsPage?.title || '')}
                  {renderTextField('Post RFQ Button Label', 'buyLeadsPage.postRfqButtonText', draft.buyLeadsPage?.postRfqButtonText || '')}
                </div>
                {renderTextField('Page Subtitle', 'buyLeadsPage.subtitle', draft.buyLeadsPage?.subtitle || '', true)}
                {renderTextField('Urgent Demand Notice', 'buyLeadsPage.urgentNoticeText', draft.buyLeadsPage?.urgentNoticeText || '')}
                {renderCmsImageControl(
                  'Buy Leads Header Banner',
                  'buyLeadsPage.bannerImageUrl',
                  draft.buyLeadsPage?.bannerImageUrl || ''
                )}
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-bold text-slate-900">All Buy Lead / RFQ Photos</h3>
                  <div className="relative w-full sm:w-72">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={rfqSearch}
                      onChange={e => setRfqSearch(e.target.value)}
                      placeholder="Filter buy leads..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0F294D]/20 focus:border-[#0F294D]"
                    />
                  </div>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[440px] overflow-y-auto">
                  {filteredRfqsForPicker.map(rfq =>
                    renderSlotItemRow({
                      id: rfq.id,
                      title: rfq.productName,
                      metaLine: `${rfq.buyerCountry} · ${rfq.category}`,
                      imageUrl: rfq.resolvedPhotoUrl,
                      imageType: 'rfq',
                      category: rfq.category,
                      isPinned: (displayConfig.pinnedRfqIds || []).includes(rfq.id),
                      isHidden: (displayConfig.hiddenRfqIds || []).includes(rfq.id),
                      listType: 'rfq'
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 4. VERIFIED SUPPLIERS PAGE ================= */}
          {selectedPage === 'SUPPLIERS_DIRECTORY' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Suppliers Directory Copy &amp; Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Page Title', 'suppliersPage.title', draft.suppliersPage?.title || '')}
                  {renderTextField('Eyebrow Label', 'suppliersPage.badgeText', draft.suppliersPage?.badgeText || '')}
                </div>
                {renderTextField('Page Subtitle', 'suppliersPage.subtitle', draft.suppliersPage?.subtitle || '', true)}
                {renderTextField('Audit Guarantee Statement', 'suppliersPage.auditGuaranteeText', draft.suppliersPage?.auditGuaranteeText || '')}
                {renderCmsImageControl(
                  'Suppliers Directory Banner',
                  'suppliersPage.bannerImageUrl',
                  draft.suppliersPage?.bannerImageUrl || ''
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Supplier Visibility &amp; Homepage Pinning</h3>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[420px] overflow-y-auto">
                  {filteredSuppliers.map(comp =>
                    renderSlotItemRow({
                      id: comp.id,
                      title: comp.companyName,
                      metaLine: `${comp.country} · ${comp.tier}`,
                      imageUrl: comp.logoUrl,
                      imageType: 'logo',
                      isPinned: (displayConfig.pinnedSupplierIds || []).includes(comp.id),
                      isHidden: (displayConfig.hiddenSupplierIds || []).includes(comp.id),
                      listType: 'supplier',
                      allowImageEdit: false
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. POST BUYING REQUEST PAGE ================= */}
          {selectedPage === 'POST_BUY_REQUIREMENT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextField('Page Title', 'postRfqPage.title', draft.postRfqPage?.title || '')}
                {renderTextField('Eyebrow Label', 'postRfqPage.badgeText', draft.postRfqPage?.badgeText || '')}
              </div>
              {renderTextField('Page Subtitle', 'postRfqPage.subtitle', draft.postRfqPage?.subtitle || '', true)}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderTextField('Step 1 Title', 'postRfqPage.step1Title', draft.postRfqPage?.step1Title || '')}
                {renderTextField('Step 2 Title', 'postRfqPage.step2Title', draft.postRfqPage?.step2Title || '')}
                {renderTextField('Step 3 Title', 'postRfqPage.step3Title', draft.postRfqPage?.step3Title || '')}
              </div>
              {renderTextField('Buyer Guarantee Notice', 'postRfqPage.guaranteeText', draft.postRfqPage?.guaranteeText || '')}
              {renderCmsImageControl(
                'Post Buying Request Banner',
                'postRfqPage.bannerImageUrl',
                draft.postRfqPage?.bannerImageUrl || ''
              )}
            </div>
          )}

          {/* ================= 6. POST SELL OFFER PAGE ================= */}
          {selectedPage === 'POST_SELL_OFFER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextField('Page Title', 'postSellOfferPage.title', draft.postSellOfferPage?.title || '')}
                {renderTextField('Eyebrow Label', 'postSellOfferPage.badgeText', draft.postSellOfferPage?.badgeText || '')}
              </div>
              {renderTextField('Page Subtitle', 'postSellOfferPage.subtitle', draft.postSellOfferPage?.subtitle || '', true)}
              {renderTextField('Seller Notice', 'postSellOfferPage.sellerNotice', draft.postSellOfferPage?.sellerNotice || '', true)}
              {renderTextField('Compliance Tip', 'postSellOfferPage.complianceTip', draft.postSellOfferPage?.complianceTip || '')}
              {renderCmsImageControl(
                'Post Sell Offer Banner',
                'postSellOfferPage.bannerImageUrl',
                draft.postSellOfferPage?.bannerImageUrl || ''
              )}
            </div>
          )}

          {/* ================= 7. PREMIUM PLANS PAGE ================= */}
          {selectedPage === 'PREMIUM_MEMBERSHIP' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {renderTextField('Page Title', 'premiumPlansPage.title', draft.premiumPlansPage?.title || '')}
                {renderTextField('Annual Discount Label', 'premiumPlansPage.annualDiscountBadge', draft.premiumPlansPage?.annualDiscountBadge || '')}
              </div>
              {renderTextField('Page Subtitle', 'premiumPlansPage.subtitle', draft.premiumPlansPage?.subtitle || '', true)}
              {renderTextField('VIP Consulting Headline', 'premiumPlansPage.vipConsultingHeadline', draft.premiumPlansPage?.vipConsultingHeadline || '')}
              {renderTextField('VIP Consulting Description', 'premiumPlansPage.vipConsultingDescription', draft.premiumPlansPage?.vipConsultingDescription || '', true)}
              {renderTextField('VIP Consulting CTA Button', 'premiumPlansPage.vipConsultingButtonText', draft.premiumPlansPage?.vipConsultingButtonText || '')}
              {renderCmsImageControl(
                'Premium Plans Banner',
                'premiumPlansPage.bannerImageUrl',
                draft.premiumPlansPage?.bannerImageUrl || ''
              )}
            </div>
          )}

          {/* ================= 8. ESCROW & TRADE ASSURANCE PAGE ================= */}
          {selectedPage === 'MEDIATOR_ENGINE' && (
            <div className="space-y-4">
              {renderTextField('Escrow Page Title', 'escrowPolicy.title', draft.escrowPolicy?.title || '')}
              {renderTextField('Escrow Page Subtitle', 'escrowPolicy.subtitle', draft.escrowPolicy?.subtitle || '', true)}
              {renderTextField('Bank Rail Notice', 'escrowPolicy.bankRailNotice', draft.escrowPolicy?.bankRailNotice || '')}
              {renderTextField('Guarantee Notice', 'escrowPolicy.guaranteeNotice', draft.escrowPolicy?.guaranteeNotice || '')}
              {renderTextField('Refund Terms Snippet', 'escrowPolicy.refundTermsSnippet', draft.escrowPolicy?.refundTermsSnippet || '', true)}
            </div>
          )}

          {/* ================= 9. TRADE TOOLS PAGE ================= */}
          {selectedPage === 'TRADE_TOOLS' && (
            <div className="space-y-4">
              {renderTextField('Trade Tools Title', 'tradeToolsPage.title', draft.tradeToolsPage?.title || '')}
              {renderTextField('Trade Tools Subtitle', 'tradeToolsPage.subtitle', draft.tradeToolsPage?.subtitle || '', true)}
              {renderTextField('Incoterms Calculator Summary', 'tradeToolsPage.incotermsDesc', draft.tradeToolsPage?.incotermsDesc || '', true)}
              {renderTextField('Container CBM Summary', 'tradeToolsPage.cbmDesc', draft.tradeToolsPage?.cbmDesc || '', true)}
              {renderTextField('Proforma Invoice Generator Summary', 'tradeToolsPage.piGeneratorDesc', draft.tradeToolsPage?.piGeneratorDesc || '', true)}
            </div>
          )}

          {/* ================= 10. CLIENT PORTAL & WALLET PAGE ================= */}
          {selectedPage === 'DASHBOARD' && (
            <div className="space-y-4">
              {renderTextField('Client Portal Title', 'clientAdminPage.title', draft.clientAdminPage?.title || '')}
              {renderTextField('Client Portal Subtitle', 'clientAdminPage.subtitle', draft.clientAdminPage?.subtitle || '', true)}
              {renderTextField('Wire Transfer Instructions', 'clientAdminPage.wireInstructionsNotice', draft.clientAdminPage?.wireInstructionsNotice || '', true)}
              {renderTextField('Treasury Guarantee Text', 'clientAdminPage.treasuryGuarantee', draft.clientAdminPage?.treasuryGuarantee || '')}
            </div>
          )}

          {/* ================= 11. GLOBAL BRAND, HEADER & FOOTER ================= */}
          {selectedPage === 'GLOBAL_BRAND' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Brand Identity &amp; Top Header</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Site Name', 'brand.siteName', draft.brand?.siteName || '')}
                  {renderTextField('Site Tagline', 'brand.siteTagline', draft.brand?.siteTagline || '')}
                  {renderTextField('Support Email', 'brand.supportEmail', draft.brand?.supportEmail || '')}
                  {renderTextField('Support Phone', 'brand.supportPhone', draft.brand?.supportPhone || '')}
                  {renderTextField('WhatsApp Number', 'brand.whatsappNumber', draft.brand?.whatsappNumber || '')}
                  {renderTextField('WhatsApp URL', 'brand.whatsappUrl', draft.brand?.whatsappUrl || '')}
                </div>
                {renderTextField('Top Bar Announcement', 'brand.topBarAnnouncement', draft.brand?.topBarAnnouncement || '')}
                {renderTextField('Office Address', 'brand.officeAddress', draft.brand?.officeAddress || '')}
              </div>

              <div className="pt-4 border-t border-slate-200 space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Footer Content</h3>
                {renderTextField('Footer Tagline', 'headerAndFooter.footerTagline', draft.headerAndFooter?.footerTagline || '', true)}
                {renderTextField('Footer Mission', 'headerAndFooter.footerMission', draft.headerAndFooter?.footerMission || '', true)}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderTextField('Copyright Line', 'headerAndFooter.footerCopyright', draft.headerAndFooter?.footerCopyright || '')}
                  {renderTextField('Compliance / Registration Note', 'headerAndFooter.footerIsoText', draft.headerAndFooter?.footerIsoText || '')}
                  {renderTextField('Footer Support Email', 'headerAndFooter.footerSupportEmail', draft.headerAndFooter?.footerSupportEmail || '')}
                  {renderTextField('Footer Support Phone', 'headerAndFooter.footerSupportPhone', draft.headerAndFooter?.footerSupportPhone || '')}
                </div>
                {renderTextField('Footer Headquarters Address', 'headerAndFooter.footerHeadquarters', draft.headerAndFooter?.footerHeadquarters || '')}
              </div>
            </div>
          )}

          {/* ================= 12. ALL COMPANY, LEGAL & COUNTRY PAGES ================= */}
          {selectedPage === 'INFO_AND_POLICIES' && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                    <th className="py-2.5 px-4">Page</th>
                    <th className="py-2.5 px-4">Section</th>
                    <th className="py-2.5 px-4">Live Route</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs">
                  {INFO_POLICY_ROUTES.map(row => (
                    <tr key={row.view} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">{row.title}</td>
                      <td className="py-3 px-4 text-slate-600">{row.category}</td>
                      <td className="py-3 px-4 font-mono text-slate-500">{row.route}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {row.adminTabHint && onOpenAdminTab && (
                            <button
                              type="button"
                              onClick={() => onOpenAdminTab(row.adminTabHint)}
                              className="px-2.5 py-1.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold cursor-pointer whitespace-nowrap"
                            >
                              Admin Tool
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onNavigate(row.view)}
                            className="px-2.5 py-1.5 rounded-md bg-[#0F294D] hover:bg-blue-900 text-white font-semibold inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Open Page</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Draft Preview Modal (Desktop & Mobile) */}
      <WholeSitePagePreviewModal
        isOpen={isPreviewOpen}
        pageKey={selectedPage}
        pageLabel={activePageMeta.label}
        draft={draft}
        displayConfig={displayConfig}
        featuredProducts={resolvedFeaturedProducts}
        homepageRfqs={resolvedHomepageRfqs}
        homepageSuppliers={resolvedHomepageSuppliers}
        catalogProducts={syncedProducts}
        allRfqs={syncedRfqs}
        pendingImageCount={pendingImageCount}
        changeSummary={changeSummary}
        isPublishing={isPublishing}
        onClose={() => setIsPreviewOpen(false)}
        onSaveDraft={handleSaveDraft}
        onPublishLive={handlePublishLive}
      />
    </div>
  );
};
