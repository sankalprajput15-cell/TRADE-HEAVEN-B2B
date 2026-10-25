import React from 'react';
import {
  Layers,
  Building2,
  Package,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Search,
  Lock,
  UserPlus,
  LogIn,
  ShieldCheck,
  Trees,
  Tractor,
  Flame,
  Laptop,
  Zap,
  Radio,
  Cpu,
  Wrench,
  Wheat,
  Sprout,
  UtensilsCrossed,
  Beef,
  Fish,
  Wine,
  GlassWater,
  Flower2,
  Car,
  FlaskConical,
  Scissors,
  Stethoscope,
  Sun,
  Box,
  ArrowUpDown,
  Armchair,
  Wind,
  Home,
  Printer,
  Cog,
  Anchor,
  Shield,
  Pickaxe,
  FileText,
  Fuel,
  Snowflake,
  CircleDot,
  Hammer,
  Plane
} from 'lucide-react';
import { CATEGORIES_TREE, MOCK_RFQS } from '../../data/mockData';
import { getAllSuppliersWithUsers } from '../../services/apiService';
import { Product, RfqRequirement } from '../../types';
import { useAuth } from '../../context/AuthContext';

export type QuickFilterMode = 'ALL' | 'PRODUCTS' | 'SUPPLIERS' | 'RFQ_LEADS';

export const triggerRegistrationModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tradeheaven_open_register'));
  }
};

export const triggerLoginModal = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('tradeheaven_open_login'));
  }
};

export const triggerProductDirectoryRedirect = (query: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_search_product_directory', {
        detail: { query: query.trim() }
      })
    );
  }
};

export const triggerRfqLeadSelection = (rfq: RfqRequirement, query: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('tradeheaven_search_rfq_leads', {
        detail: { rfq, query: query.trim() }
      })
    );
  }
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Trees,
  Building2,
  Tractor,
  Flame,
  Laptop,
  Zap,
  Radio,
  Cpu,
  Wrench,
  Wheat,
  Sprout,
  UtensilsCrossed,
  Beef,
  Fish,
  Wine,
  GlassWater,
  Flower2,
  Car,
  FlaskConical,
  Scissors,
  Stethoscope,
  Sun,
  Box,
  Layers,
  ArrowUpDown,
  Armchair,
  Wind,
  Home,
  Package,
  Printer,
  Cog,
  Anchor,
  Shield,
  Pickaxe,
  FileText,
  Fuel,
  Snowflake,
  CircleDot,
  Hammer,
  Plane
};

/**
 * Resolves the appropriate Lucide icon for a product category by icon key or category name keywords.
 */
export const CategoryIcon: React.FC<{
  icon?: string;
  categoryName?: string;
  className?: string;
}> = ({ icon, categoryName = '', className = 'w-3.5 h-3.5' }) => {
  if (icon && ICON_MAP[icon]) {
    const MappedIcon = ICON_MAP[icon];
    return <MappedIcon className={className} />;
  }

  const lower = categoryName.toLowerCase();
  if (lower.includes('fuel') || lower.includes('petroleum') || lower.includes('diesel') || lower.includes('oil') || lower.includes('espo') || lower.includes('bitumen')) {
    return <Fuel className={className} />;
  }
  if (lower.includes('bamboo') || lower.includes('wood') || lower.includes('timber') || lower.includes('skewer')) {
    return <Trees className={className} />;
  }
  if (lower.includes('excavat') || lower.includes('tractor') || lower.includes('bulldozer') || lower.includes('construction')) {
    return <Tractor className={className} />;
  }
  if (lower.includes('weld') || lower.includes('solder') || lower.includes('furnace')) {
    return <Flame className={className} />;
  }
  if (lower.includes('computer') || lower.includes('software') || lower.includes('hardware') || lower.includes('laptop')) {
    return <Laptop className={className} />;
  }
  if (lower.includes('electric') || lower.includes('power') || lower.includes('generator') || lower.includes('inverter') || lower.includes('turbine')) {
    return <Zap className={className} />;
  }
  if (lower.includes('electronic') || lower.includes('pcb') || lower.includes('semiconductor') || lower.includes('sensor')) {
    return <Cpu className={className} />;
  }
  if (lower.includes('machinery') || lower.includes('cnc') || lower.includes('conveyor') || lower.includes('automation')) {
    return <Cog className={className} />;
  }
  if (lower.includes('fish') || lower.includes('seafood') || lower.includes('lobster') || lower.includes('shrimp') || lower.includes('salmon')) {
    return <Fish className={className} />;
  }
  if (lower.includes('meat') || lower.includes('livestock') || lower.includes('poultry') || lower.includes('beef')) {
    return <Beef className={className} />;
  }
  if (lower.includes('farm') || lower.includes('grain') || lower.includes('rice') || lower.includes('cashew') || lower.includes('wheat') || lower.includes('broccoli') || lower.includes('avocado') || lower.includes('vanilla')) {
    return <Wheat className={className} />;
  }
  if (lower.includes('fertilizer') || lower.includes('seed') || lower.includes('sprout') || lower.includes('agri')) {
    return <Sprout className={className} />;
  }
  if (lower.includes('food') || lower.includes('hotel') || lower.includes('restaurant') || lower.includes('kitchen') || lower.includes('jam') || lower.includes('catering')) {
    return <UtensilsCrossed className={className} />;
  }
  if (lower.includes('chemical') || lower.includes('polymer') || lower.includes('resin') || lower.includes('acid') || lower.includes('sulphur')) {
    return <FlaskConical className={className} />;
  }
  if (lower.includes('textile') || lower.includes('fabric') || lower.includes('apparel') || lower.includes('clothes') || lower.includes('garment')) {
    return <Scissors className={className} />;
  }
  if (lower.includes('medical') || lower.includes('health') || lower.includes('surgical') || lower.includes('hospital')) {
    return <Stethoscope className={className} />;
  }
  if (lower.includes('solar') || lower.includes('renewable')) {
    return <Sun className={className} />;
  }
  if (lower.includes('auto') || lower.includes('car') || lower.includes('tire') || lower.includes('vehicle')) {
    return <Car className={className} />;
  }
  if (lower.includes('mining') || lower.includes('ore') || lower.includes('coal') || lower.includes('mineral')) {
    return <Pickaxe className={className} />;
  }
  if (lower.includes('metal') || lower.includes('copper') || lower.includes('gold') || lower.includes('aluminium') || lower.includes('steel') || lower.includes('scrap') || lower.includes('germanium')) {
    return <Shield className={className} />;
  }
  if (lower.includes('marine') || lower.includes('ship') || lower.includes('vessel')) {
    return <Anchor className={className} />;
  }
  if (lower.includes('packag') || lower.includes('box') || lower.includes('carton') || lower.includes('container')) {
    return <Box className={className} />;
  }
  if (lower.includes('paper') || lower.includes('print')) {
    return <FileText className={className} />;
  }
  if (lower.includes('tool') || lower.includes('hardware') || lower.includes('instrument')) {
    return <Hammer className={className} />;
  }

  return <Layers className={className} />;
};

export interface SearchRegistrationGateProps {
  query?: string;
  onRegister?: () => void;
  onLogin?: () => void;
  onClearSearch?: () => void;
  onPreview?: () => void;
  variant?: 'dropdown' | 'panel';
}

export const SearchRegistrationGate: React.FC<SearchRegistrationGateProps> = ({
  query = '',
  onRegister,
  onLogin,
  onClearSearch,
  onPreview,
  variant = 'dropdown'
}) => {
  const { setCurrentUser } = useAuth();
  const cleanQuery = query.trim();

  const handleRegister = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onRegister) onRegister();
    triggerRegistrationModal();
  };

  const handleLogin = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onLogin) onLogin();
    triggerLoginModal();
  };

  const handleQuickDemo = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const demoUser = {
      id: 'buyer-titan-01',
      name: 'Vikram Singhania',
      email: 'procurement@titanindustrial.in',
      role: 'BUYER' as const,
      companyName: 'Titan Global Imports Pvt Ltd',
      country: 'India',
      isVerified: true,
      isPremium: true,
      membershipStatus: 'paid' as const,
      status: 'ACTIVE' as const
    };
    setCurrentUser(demoUser);
  };

  if (variant === 'panel') {
    return (
      <div
        id="search-results-registration-gate"
        className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center space-y-5 shadow-xs max-w-2xl mx-auto my-2"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
          <Lock className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full inline-block border border-amber-200/80">
            Registration Required · Protected B2B Search Index
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900">
            {cleanQuery
              ? `Register to View Search Results for "${cleanQuery}"`
              : 'Register Free to Access Marketplace Search Results'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
            To protect verified manufacturers, importers, and wholesale pricing from automated scraping, search results across product categories, suppliers, and RFQs are exclusively visible to registered members.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            data-testid="panel-register-btn"
            onClick={handleRegister}
            onMouseDown={handleRegister}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register Free to View Results</span>
          </button>

          <button
            type="button"
            data-testid="panel-login-btn"
            onClick={handleLogin}
            onMouseDown={handleLogin}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            data-testid="panel-demo-login-btn"
            onClick={handleQuickDemo}
            onMouseDown={handleQuickDemo}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            title="Instantly sign in as a demo buyer to test search and quick filters"
          >
            <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>1-Click Demo Buyer Access</span>
          </button>

          {onClearSearch && cleanQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              Clear Search
            </button>
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>100% Free B2B Registration</span>
          <span aria-hidden="true">·</span>
          <span>Instant Access to Audited Suppliers &amp; Categories</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="search-dropdown-registration-gate"
      className="p-5 sm:p-6 bg-white text-center space-y-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
        <Lock className="w-5 h-5" />
      </div>

      <div className="space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full inline-block border border-amber-200/80">
          Registration Required
        </div>
        <div className="text-sm font-black text-slate-900">
          {cleanQuery
            ? `Search Results for "${cleanQuery}" Are Protected`
            : 'Marketplace Search is Protected for Registered Members'}
        </div>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Sign in or create a free Trade Heaven corporate account to unlock verified manufacturers, live pricing tiers, and RFQ leads.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
        <button
          type="button"
          data-testid="gate-register-btn"
          onClick={handleRegister}
          onMouseDown={handleRegister}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Register Free to Unlock</span>
        </button>

        <button
          type="button"
          data-testid="gate-login-btn"
          onClick={handleLogin}
          onMouseDown={handleLogin}
          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In</span>
        </button>

        <button
          type="button"
          data-testid="gate-demo-login-btn"
          onClick={handleQuickDemo}
          onMouseDown={handleQuickDemo}
          className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          title="Instantly sign in as a demo buyer to test search and quick filters"
        >
          <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
          <span>1-Click Demo Access</span>
        </button>

        {onPreview && (
          <button
            type="button"
            data-testid="gate-preview-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview();
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPreview();
            }}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80"
          >
            <span>Preview Results</span>
          </button>
        )}
      </div>

      <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Instant verification · Zero registration fee · Free access</span>
      </div>
    </div>
  );
};

export interface CategorySuggestion {
  id: string;
  name: string;
  icon?: string;
  parentCategory?: string;
  isSubcategory: boolean;
  productCount: number;
  supplierCountLabel?: string;
}

export interface SupplierSuggestion {
  id: string;
  companyName: string;
  contactPerson?: string;
  country: string;
  tier: string;
  trustScore?: number;
  productCount: number;
}

export interface AutoSuggestResults {
  categories: CategorySuggestion[];
  suppliers: SupplierSuggestion[];
  products: Product[];
  rfqs: RfqRequirement[];
  totalCount: number;
}

/**
 * Highlights matching substring in bold inside a suggestion label for high visual clarity.
 */
export const HighlightedMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery || !text) {
    return <span className="font-medium">{text}</span>;
  }
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <strong
            key={idx}
            className="font-black text-slate-950 bg-amber-200/85 rounded-xs px-0.5 underline decoration-amber-500/70 decoration-2 underline-offset-2"
          >
            {part}
          </strong>
        ) : (
          <span key={idx} className="font-medium text-slate-700">
            {part}
          </span>
        )
      )}
    </>
  );
};

/**
 * Computes real-time auto-suggestions for Product Categories, Supplier Names, Products, and RFQ Leads as the user types.
 */
export function useSearchAutoSuggest(
  query: string,
  products: Product[] = [],
  maxCategories = 6,
  maxSuppliers = 6,
  maxProducts = 4,
  rfqs: RfqRequirement[] = MOCK_RFQS,
  maxRfqs = 5
): AutoSuggestResults {
  return React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { categories: [], suppliers: [], products: [], rfqs: [], totalCount: 0 };
    }

    // Count products per category & supplier for rich context
    const categoryProductCounts = new Map<string, number>();
    const supplierProductCounts = new Map<string, number>();

    for (const p of products) {
      if (!p) continue;
      if (p.category) {
        const key = p.category.toLowerCase();
        categoryProductCounts.set(key, (categoryProductCounts.get(key) || 0) + 1);
      }
      if (p.subCategory) {
        const subKey = p.subCategory.toLowerCase();
        categoryProductCounts.set(subKey, (categoryProductCounts.get(subKey) || 0) + 1);
      }
      if (p.supplierName) {
        const sKey = p.supplierName.toLowerCase();
        supplierProductCounts.set(sKey, (supplierProductCounts.get(sKey) || 0) + 1);
      }
    }

    // 1. Collect & rank matching Product Categories and Subcategories
    const seenCategories = new Set<string>();
    const rawCategories: Array<CategorySuggestion & { score: number }> = [];

    for (const cat of CATEGORIES_TREE) {
      const catLower = cat.name.toLowerCase();
      if (catLower.includes(q) && !seenCategories.has(catLower)) {
        seenCategories.add(catLower);
        const startsWith = catLower.startsWith(q) || catLower.split(/\s+/).some(w => w.startsWith(q));
        rawCategories.push({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          isSubcategory: false,
          productCount: categoryProductCounts.get(catLower) || 0,
          supplierCountLabel: cat.count ? cat.count.split('|')[0]?.trim() : undefined,
          score: startsWith ? 100 : 60
        });
      }

      for (const sub of cat.subcategories || []) {
        const subLower = sub.toLowerCase();
        if (subLower.includes(q) && !seenCategories.has(subLower)) {
          seenCategories.add(subLower);
          const startsWith = subLower.startsWith(q) || subLower.split(/\s+/).some(w => w.startsWith(q));
          rawCategories.push({
            id: `${cat.id}::${sub}`,
            name: sub,
            icon: cat.icon,
            parentCategory: cat.name,
            isSubcategory: true,
            productCount: categoryProductCounts.get(subLower) || categoryProductCounts.get(catLower) || 0,
            score: startsWith ? 90 : 50
          });
        }
      }
    }

    // Also include any dynamic product categories not in CATEGORIES_TREE
    for (const p of products) {
      if (!p?.category) continue;
      const catLower = p.category.toLowerCase();
      if (catLower.includes(q) && !seenCategories.has(catLower)) {
        seenCategories.add(catLower);
        const startsWith = catLower.startsWith(q);
        rawCategories.push({
          id: `dyn-cat-${catLower}`,
          name: p.category,
          isSubcategory: false,
          productCount: categoryProductCounts.get(catLower) || 1,
          score: startsWith ? 85 : 45
        });
      }
    }

    rawCategories.sort((a, b) => b.score - a.score || b.productCount - a.productCount);
    const categories = rawCategories.slice(0, maxCategories);

    // 2. Collect & rank matching Suppliers (by Supplier Name / Contact Person and Company Name)
    const allSuppliers = getAllSuppliersWithUsers();
    const seenSuppliers = new Set<string>();
    const rawSuppliers: Array<SupplierSuggestion & { score: number }> = [];

    for (const s of allSuppliers) {
      if (!s || !s.companyName) continue;
      const compLower = s.companyName.toLowerCase();
      const personLower = (s.contactPerson || '').toLowerCase();
      const countryLower = (s.country || '').toLowerCase();

      const matchesCompany = compLower.includes(q);
      const matchesPerson = personLower.includes(q);
      const matchesCountry = q.length >= 3 && countryLower.startsWith(q);

      if ((matchesCompany || matchesPerson || matchesCountry) && !seenSuppliers.has(compLower)) {
        seenSuppliers.add(compLower);
        const startsWith =
          compLower.startsWith(q) ||
          personLower.startsWith(q) ||
          compLower.split(/\s+/).some(w => w.startsWith(q)) ||
          personLower.split(/\s+/).some(w => w.startsWith(q));

        rawSuppliers.push({
          id: s.id,
          companyName: s.companyName,
          contactPerson: s.contactPerson,
          country: s.country || 'Global',
          tier: s.tier || 'VERIFIED',
          trustScore: s.trustScore,
          productCount: supplierProductCounts.get(compLower) || 0,
          score: startsWith ? 100 : matchesCompany || matchesPerson ? 70 : 40
        });
      }
    }

    // Also check product supplierName values in case a product supplier isn't in allSuppliers
    for (const p of products) {
      if (!p?.supplierName) continue;
      const sLower = p.supplierName.toLowerCase();
      if (sLower.includes(q) && !seenSuppliers.has(sLower)) {
        seenSuppliers.add(sLower);
        const startsWith = sLower.startsWith(q);
        rawSuppliers.push({
          id: p.supplierId || `supp-${sLower}`,
          companyName: p.supplierName,
          country: p.supplierCountry || 'Global',
          tier: p.supplierTier || 'VERIFIED',
          productCount: supplierProductCounts.get(sLower) || 1,
          score: startsWith ? 85 : 55
        });
      }
    }

    rawSuppliers.sort((a, b) => b.score - a.score || b.productCount - a.productCount);
    const suppliers = rawSuppliers.slice(0, maxSuppliers);

    // 3. Top matching products
    const matchedProducts = products
      .filter(
        p =>
          p &&
          ((p.title || '').toLowerCase().includes(q) ||
            (p.category || '').toLowerCase().includes(q) ||
            (p.supplierName || '').toLowerCase().includes(q))
      )
      .slice(0, maxProducts);

    // 4. Top matching RFQ Leads
    const matchedRfqs = (rfqs || MOCK_RFQS)
      .filter(
        r =>
          r &&
          ((r.productName || '').toLowerCase().includes(q) ||
            (r.category || '').toLowerCase().includes(q) ||
            ((r as any).subCategory || '').toLowerCase().includes(q) ||
            (r.buyerCompany || '').toLowerCase().includes(q) ||
            (r.buyerCountry || '').toLowerCase().includes(q) ||
            (r.destinationPort || '').toLowerCase().includes(q) ||
            (r.id || '').toLowerCase().includes(q))
      )
      .slice(0, maxRfqs);

    return {
      categories,
      suppliers,
      products: matchedProducts,
      rfqs: matchedRfqs,
      totalCount: categories.length + suppliers.length + matchedProducts.length + matchedRfqs.length
    };
  }, [query, products, maxCategories, maxSuppliers, maxProducts, rfqs, maxRfqs]);
}

interface DropdownProps {
  query: string;
  suggestions: AutoSuggestResults;
  activeIndex: number;
  onSelectCategory: (category: CategorySuggestion) => void;
  onSelectSupplier: (supplier: SupplierSuggestion) => void;
  onSelectProduct?: (product: Product) => void;
  onSelectRfq?: (rfq: RfqRequirement) => void;
  onViewAllResults?: () => void;
  onRequireAuth?: () => void;
  quickFilter?: QuickFilterMode;
  onQuickFilterChange?: (mode: QuickFilterMode) => void;
  className?: string;
}

export const SearchAutoSuggestDropdown: React.FC<DropdownProps> = ({
  query,
  suggestions,
  activeIndex,
  onSelectCategory,
  onSelectSupplier,
  onSelectProduct,
  onSelectRfq,
  onViewAllResults,
  onRequireAuth,
  quickFilter: controlledQuickFilter,
  onQuickFilterChange,
  className = ''
}) => {
  const { user: currentUser } = useAuth();
  const [previewUnlocked, setPreviewUnlocked] = React.useState(false);
  const isRegistered = Boolean(currentUser || previewUnlocked);
  const [internalQuickFilter, setInternalQuickFilter] = React.useState<QuickFilterMode>('ALL');
  const activeQuickFilter = controlledQuickFilter !== undefined ? controlledQuickFilter : internalQuickFilter;

  const handleQuickFilterSelect = (mode: QuickFilterMode) => {
    const nextMode = activeQuickFilter === mode && mode !== 'ALL' ? 'ALL' : mode;
    setInternalQuickFilter(nextMode);
    if (onQuickFilterChange) {
      onQuickFilterChange(nextMode);
    }
  };

  const { categories, suppliers, products, rfqs = [] } = suggestions;
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  const handleSeeAllClick = () => {
    if (!isRegistered) {
      if (onRequireAuth) onRequireAuth();
      else triggerRegistrationModal();
      return;
    }
    if (onViewAllResults) {
      onViewAllResults();
    } else {
      triggerProductDirectoryRedirect(trimmed);
    }
  };

  const handleRfqItemSelect = (rfq: RfqRequirement) => {
    if (!isRegistered) {
      if (onRequireAuth) onRequireAuth();
      else triggerRegistrationModal();
      return;
    }
    if (onSelectRfq) {
      onSelectRfq(rfq);
    } else {
      triggerRfqLeadSelection(rfq, trimmed);
    }
  };

  if (!isRegistered) {
    return (
      <div
        role="dialog"
        aria-label="Registration required to view search results"
        className={`bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
      >
        <div className="px-3.5 py-2 bg-slate-900 text-white flex items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-slate-200 truncate">
              Protected Search for <strong className="text-white font-bold">"{trimmed}"</strong>
            </span>
          </div>
          <span className="text-amber-400 font-mono text-[10px] font-bold shrink-0">
            Registration Required
          </span>
        </div>
        <SearchRegistrationGate
          query={trimmed}
          variant="dropdown"
          onRegister={() => {
            if (onRequireAuth) onRequireAuth();
            else triggerRegistrationModal();
          }}
          onLogin={triggerLoginModal}
          onPreview={() => setPreviewUnlocked(true)}
        />
      </div>
    );
  }

  const showProductsSection = activeQuickFilter === 'ALL' || activeQuickFilter === 'PRODUCTS';
  const showSuppliersSection = activeQuickFilter === 'ALL' || activeQuickFilter === 'SUPPLIERS';
  const showRfqsSection = activeQuickFilter === 'ALL' || activeQuickFilter === 'RFQ_LEADS';

  const visibleCategories = showProductsSection ? categories : [];
  const visibleProducts = showProductsSection ? products : [];
  const visibleSuppliers = showSuppliersSection ? suppliers : [];
  const visibleRfqs = showRfqsSection ? rfqs : [];

  const productsBadgeCount = categories.length + (onSelectProduct ? products.length : 0);
  const suppliersBadgeCount = suppliers.length;
  const rfqsBadgeCount = rfqs.length;

  const hasVisibleResults =
    visibleCategories.length > 0 ||
    visibleSuppliers.length > 0 ||
    (Boolean(onSelectProduct) && visibleProducts.length > 0) ||
    visibleRfqs.length > 0;

  let runningIndex = -1;

  return (
    <div
      role="listbox"
      aria-label="Real-time search suggestions for categories, products, suppliers, and RFQ leads"
      className={`bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150 ${className}`}
    >
      {/* Top Status Bar */}
      <div className="px-3.5 py-2 bg-slate-900 text-white flex items-center justify-between gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0 truncate">
          <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-300 truncate">
            Auto-suggest for <strong className="text-white font-bold">"{trimmed}"</strong>
          </span>
        </div>
        <span className="text-slate-400 font-mono text-[10px] shrink-0">
          {productsBadgeCount} Products · {suppliersBadgeCount} Suppliers · {rfqsBadgeCount} RFQs
        </span>
      </div>

      {/* Quick Filter Row: Toggle between 'Products', 'Suppliers', and 'RFQ Leads' */}
      <div
        data-testid="autosuggest-quick-filter-row"
        className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
          Quick Filter:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            data-testid="quick-filter-all"
            onMouseDown={(e) => {
              e.preventDefault();
              handleQuickFilterSelect('ALL');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
              activeQuickFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
            }`}
          >
            <span>All</span>
          </button>

          <button
            type="button"
            data-testid="quick-filter-products"
            onMouseDown={(e) => {
              e.preventDefault();
              handleQuickFilterSelect('PRODUCTS');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeQuickFilter === 'PRODUCTS'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/80'
            }`}
          >
            <Package className={`w-3 h-3 shrink-0 ${activeQuickFilter === 'PRODUCTS' ? 'text-white' : 'text-blue-600'}`} />
            <span>Products</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                activeQuickFilter === 'PRODUCTS' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {productsBadgeCount}
            </span>
          </button>

          <button
            type="button"
            data-testid="quick-filter-suppliers"
            onMouseDown={(e) => {
              e.preventDefault();
              handleQuickFilterSelect('SUPPLIERS');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeQuickFilter === 'SUPPLIERS'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200/80'
            }`}
          >
            <Building2 className={`w-3 h-3 shrink-0 ${activeQuickFilter === 'SUPPLIERS' ? 'text-slate-950' : 'text-amber-600'}`} />
            <span>Suppliers</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                activeQuickFilter === 'SUPPLIERS' ? 'bg-amber-600/30 text-slate-950' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {suppliersBadgeCount}
            </span>
          </button>

          <button
            type="button"
            data-testid="quick-filter-rfq-leads"
            onMouseDown={(e) => {
              e.preventDefault();
              handleQuickFilterSelect('RFQ_LEADS');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeQuickFilter === 'RFQ_LEADS'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80'
            }`}
          >
            <FileText className={`w-3 h-3 shrink-0 ${activeQuickFilter === 'RFQ_LEADS' ? 'text-white' : 'text-emerald-600'}`} />
            <span>RFQ Leads</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.2 rounded-md ${
                activeQuickFilter === 'RFQ_LEADS' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {rfqsBadgeCount}
            </span>
          </button>
        </div>
      </div>

      {!hasVisibleResults ? (
        <div className="p-4 text-center text-xs text-slate-500 space-y-2">
          <div>
            No matching{' '}
            {activeQuickFilter === 'PRODUCTS'
              ? 'products or categories'
              : activeQuickFilter === 'SUPPLIERS'
              ? 'suppliers'
              : activeQuickFilter === 'RFQ_LEADS'
              ? 'RFQ leads'
              : 'results'}{' '}
            found for <strong className="text-slate-800">"{trimmed}"</strong>.
          </div>
          {activeQuickFilter !== 'ALL' && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                handleQuickFilterSelect('ALL');
              }}
              className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
            >
              Reset Quick Filter to view all matches
            </button>
          )}
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {/* Section 1: Matching Product Categories with Domain Icons */}
          {visibleCategories.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>Product Categories</span>
                </span>
                <span className="font-mono">{visibleCategories.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {visibleCategories.map((cat) => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  const isHighlighted = activeIndex === itemIndex;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelectCategory(cat);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isHighlighted ? 'bg-blue-50 text-blue-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                          <CategoryIcon
                            icon={cat.icon}
                            categoryName={cat.parentCategory || cat.name}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-900 truncate group-hover:text-blue-700">
                            <HighlightedMatch text={cat.name} query={trimmed} />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            {cat.isSubcategory && cat.parentCategory ? (
                              <>
                                <span>
                                  in <HighlightedMatch text={cat.parentCategory} query={trimmed} />
                                </span>
                                <span aria-hidden="true">·</span>
                              </>
                            ) : (
                              <>
                                <span>Primary Sector</span>
                                <span aria-hidden="true">·</span>
                              </>
                            )}
                            <span>
                              {cat.productCount > 0
                                ? `${cat.productCount} active listings`
                                : cat.supplierCountLabel || 'Verified sector'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Matching Products (if callback provided) */}
          {onSelectProduct && visibleProducts.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-blue-600" />
                  <span>Matching Products</span>
                </span>
                <span className="font-mono">{visibleProducts.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {visibleProducts.map((prod) => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  const isHighlighted = activeIndex === itemIndex;

                  return (
                    <button
                      key={prod.id}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelectProduct(prod);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isHighlighted ? 'bg-blue-50/80 text-slate-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                          <CategoryIcon
                            categoryName={prod.category}
                            className="w-4 h-4"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-900 truncate group-hover:text-sky-700">
                            <HighlightedMatch text={prod.title} query={trimmed} />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            <span>
                              <HighlightedMatch text={prod.category} query={trimmed} />
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>
                              <HighlightedMatch text={prod.supplierName} query={trimmed} />
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Matching Supplier Names & Companies */}
          {visibleSuppliers.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-amber-600" />
                  <span>Verified Suppliers &amp; Exporters</span>
                </span>
                <span className="font-mono">{visibleSuppliers.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {visibleSuppliers.map((supp) => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  const isHighlighted = activeIndex === itemIndex;

                  return (
                    <button
                      key={supp.id}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onSelectSupplier(supp);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isHighlighted ? 'bg-amber-50/80 text-slate-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:border-amber-500 transition-colors">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-900 truncate group-hover:text-amber-800 flex items-center gap-1.5">
                            <span className="truncate">
                              <HighlightedMatch text={supp.companyName} query={trimmed} />
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            {supp.contactPerson && (
                              <>
                                <span className="text-slate-700">
                                  <HighlightedMatch text={supp.contactPerson} query={trimmed} />
                                </span>
                                <span aria-hidden="true">·</span>
                              </>
                            )}
                            <span>{supp.country}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-semibold text-amber-700">{supp.tier}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-700 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 4: Matching RFQ Leads */}
          {visibleRfqs.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span>Active RFQ Leads &amp; Buy Requirements</span>
                </span>
                <span className="font-mono">{visibleRfqs.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {visibleRfqs.map((rfq) => {
                  runningIndex += 1;
                  const itemIndex = runningIndex;
                  const isHighlighted = activeIndex === itemIndex;

                  return (
                    <button
                      key={rfq.id}
                      type="button"
                      role="option"
                      aria-selected={isHighlighted}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleRfqItemSelect(rfq);
                      }}
                      className={`w-full px-2.5 py-2 rounded-xl text-left flex items-center justify-between gap-3 transition-colors cursor-pointer group ${
                        isHighlighted ? 'bg-emerald-50/80 text-slate-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-900 truncate group-hover:text-emerald-700 flex items-center gap-1.5">
                            <span className="truncate">
                              <HighlightedMatch text={rfq.productName} query={trimmed} />
                            </span>
                            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              {rfq.targetQuantity?.toLocaleString()} {rfq.quantityUnit}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            <span>
                              Buyer: <HighlightedMatch text={rfq.buyerCompany} query={trimmed} />
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{rfq.buyerCountry}</span>
                            {rfq.preferredIncoterm && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono font-semibold text-emerald-700">{rfq.preferredIncoterm}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Action: See All Results button redirecting to Product Directory */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-2 text-[11px]">
        <span className="text-slate-500 hidden sm:inline truncate">
          Use ↑↓ arrows to navigate · Enter to select
        </span>
        <button
          type="button"
          data-testid="autosuggest-see-all-results-btn"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSeeAllClick();
          }}
          className="w-full sm:w-auto ml-auto px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
        >
          <span>See All Results</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


