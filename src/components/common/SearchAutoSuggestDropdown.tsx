import React from 'react';
import { Layers, Building2, Package, ArrowUpRight, CheckCircle2, Search } from 'lucide-react';
import { CATEGORIES_TREE } from '../../data/mockData';
import { getAllSuppliersWithUsers } from '../../services/apiService';
import { Product } from '../../types';

export interface CategorySuggestion {
  id: string;
  name: string;
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
  totalCount: number;
}

/**
 * Highlights matching substring inside a label without breaking layout.
 */
export const HighlightedMatch: React.FC<{ text: string; query: string }> = ({ text, query }) => {
  const cleanQuery = query.trim();
  if (!cleanQuery || !text) {
    return <>{text}</>;
  }
  const escaped = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <>
      {parts.map((part, idx) =>
        part.toLowerCase() === cleanQuery.toLowerCase() ? (
          <mark
            key={idx}
            className="bg-amber-200/80 text-slate-950 font-extrabold rounded-xs px-0.5"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      )}
    </>
  );
};

/**
 * Computes real-time auto-suggestions for Product Categories and Supplier Names as the user types.
 */
export function useSearchAutoSuggest(
  query: string,
  products: Product[] = [],
  maxCategories = 6,
  maxSuppliers = 6,
  maxProducts = 4
): AutoSuggestResults {
  return React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { categories: [], suppliers: [], products: [], totalCount: 0 };
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

    return {
      categories,
      suppliers,
      products: matchedProducts,
      totalCount: categories.length + suppliers.length + matchedProducts.length
    };
  }, [query, products, maxCategories, maxSuppliers, maxProducts]);
}

interface DropdownProps {
  query: string;
  suggestions: AutoSuggestResults;
  activeIndex: number;
  onSelectCategory: (category: CategorySuggestion) => void;
  onSelectSupplier: (supplier: SupplierSuggestion) => void;
  onSelectProduct?: (product: Product) => void;
  onViewAllResults?: () => void;
  className?: string;
}

export const SearchAutoSuggestDropdown: React.FC<DropdownProps> = ({
  query,
  suggestions,
  activeIndex,
  onSelectCategory,
  onSelectSupplier,
  onSelectProduct,
  onViewAllResults,
  className = ''
}) => {
  const { categories, suppliers, products } = suggestions;
  const trimmed = query.trim();

  if (!trimmed) {
    return null;
  }

  let runningIndex = -1;

  return (
    <div
      role="listbox"
      aria-label="Real-time search suggestions for categories and suppliers"
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
          {categories.length} Categories · {suppliers.length} Suppliers
        </span>
      </div>

      {categories.length === 0 && suppliers.length === 0 && products.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500">
          No matching product categories or suppliers found for <strong className="text-slate-800">"{trimmed}"</strong>.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {/* Section 1: Matching Product Categories */}
          {categories.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-blue-600" />
                  <span>Product Categories</span>
                </span>
                <span className="font-mono">{categories.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {categories.map((cat) => {
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
                        <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <Layers className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-700">
                            <HighlightedMatch text={cat.name} query={trimmed} />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            {cat.isSubcategory && cat.parentCategory ? (
                              <>
                                <span>in {cat.parentCategory}</span>
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

          {/* Section 2: Matching Supplier Names & Companies */}
          {suppliers.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-amber-600" />
                  <span>Verified Suppliers &amp; Exporters</span>
                </span>
                <span className="font-mono">{suppliers.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {suppliers.map((supp) => {
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
                        <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-amber-800 flex items-center gap-1.5">
                            <span className="truncate">
                              <HighlightedMatch text={supp.companyName} query={trimmed} />
                            </span>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            {supp.contactPerson && (
                              <>
                                <span className="text-slate-700 font-medium">
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

          {/* Section 3: Matching Products (if callback provided) */}
          {onSelectProduct && products.length > 0 && (
            <div className="p-2">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-emerald-600" />
                  <span>Matching Products</span>
                </span>
                <span className="font-mono">{products.length}</span>
              </div>
              <div className="mt-0.5 space-y-0.5">
                {products.map((prod) => {
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
                        isHighlighted ? 'bg-emerald-50/80 text-slate-950' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                          <Package className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700">
                            <HighlightedMatch text={prod.title} query={trimmed} />
                          </div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                            <span>{prod.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{prod.supplierName}</span>
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

      {/* Footer Action */}
      {onViewAllResults && (
        <div className="px-3.5 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Use ↑↓ arrows to navigate, Enter to select</span>
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              onViewAllResults();
            }}
            className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1"
          >
            <span>Search all for "{trimmed}"</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
