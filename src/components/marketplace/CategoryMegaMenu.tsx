import React from 'react';
import { CATEGORIES_TREE, GLOBAL_B2B_TRADE_METRICS } from '../../data/mockData';
import { useSiteContent } from '../../context/SiteContentContext';
import { SafeImage } from '../common/SafeImage';
import { ActiveView } from '../../types';
import { 
  Cpu, 
  Radio, 
  FlaskConical, 
  Scissors, 
  Wheat, 
  Stethoscope, 
  Sun, 
  Box, 
  Car,
  ChevronRight,
  Layers,
  ArrowRight,
  Edit3,
  Package,
  Building2,
  FileText,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (catName: string) => void;
  onNavigateToCategory?: (catName: string, subcategory?: string) => void;
  onNavigateToSuppliers?: (sectorName?: string) => void;
  onNavigateToRfqs?: (categoryName?: string) => void;
  onNavigate?: (view: ActiveView) => void;
  onOpenCreateRfq?: () => void;
}

export const CategoryMegaMenu: React.FC<Props> = ({ 
  selectedCategory, 
  onSelectCategory,
  onNavigateToCategory,
  onNavigateToSuppliers,
  onNavigateToRfqs,
  onNavigate,
  onOpenCreateRfq
}) => {
  const { siteContent, isLiveEditMode, openQuickEdit, currentUser, isUserAuthorized } = useSiteContent();
  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cpu': return <Cpu className="w-4 h-4 text-blue-600" />;
      case 'Car': return <Car className="w-4 h-4 text-rose-600" />;
      case 'Radio': return <Radio className="w-4 h-4 text-emerald-600" />;
      case 'FlaskConical': return <FlaskConical className="w-4 h-4 text-amber-600" />;
      case 'Scissors': return <Scissors className="w-4 h-4 text-purple-600" />;
      case 'Wheat': return <Wheat className="w-4 h-4 text-yellow-600" />;
      case 'Stethoscope': return <Stethoscope className="w-4 h-4 text-teal-600" />;
      case 'Sun': return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Box': return <Box className="w-4 h-4 text-indigo-600" />;
      default: return <Box className="w-4 h-4 text-blue-600" />;
    }
  };

  const hp = siteContent?.homepage;
  const categoriesToRender = (hp?.categoriesList && hp.categoriesList.length > 0) 
    ? hp.categoriesList 
    : (CATEGORIES_TREE || []).map(c => ({
        id: c.id,
        name: c.name,
        description: (c.subcategories || []).join(', '),
        subcategories: c.subcategories || [],
        iconName: c.icon,
        image: (c as any).image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        badge: 'Verified',
        productCount: c.count || '25,000+ Items'
      }));

  const handleCategoryClick = (catName: string) => {
    if (onNavigateToCategory) {
      onNavigateToCategory(catName);
    } else {
      onSelectCategory(catName);
      if (onNavigate) {
        onNavigate('PRODUCT_DIRECTORY');
      }
    }
  };

  const handleSubcategoryClick = (catName: string, subcategory: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToCategory) {
      onNavigateToCategory(catName, subcategory);
    } else if (onNavigate) {
      onNavigate('PRODUCT_DIRECTORY');
    }
  };

  const handleSuppliersClick = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToSuppliers) {
      onNavigateToSuppliers(catName);
    } else if (onNavigate) {
      onNavigate('SUPPLIERS_DIRECTORY');
    }
  };

  const handleRfqsClick = (catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onNavigateToRfqs) {
      onNavigateToRfqs(catName);
    } else if (onOpenCreateRfq) {
      onOpenCreateRfq();
    } else if (onNavigate) {
      onNavigate('BUY_LEADS');
    }
  };

  return (
    <div id="category-mega-menu" className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm group">
      
      {/* Live Visual Edit Trigger (Strictly Admin / Creator Only) */}
      {isAdmin && isLiveEditMode && (
        <button
          id="btn-edit-categories"
          type="button"
          onClick={() => openQuickEdit('CATEGORIES')}
          className="absolute top-4 right-4 z-20 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:bg-amber-300 transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Categories</span>
        </button>
      )}

      {/* Section Header with Direct Navigation Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-bold border border-blue-200 mb-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Industrial Sectors &amp; Global Sourcing Verticals</span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            {hp.featuredCategoriesHeading || 'Verified Direct Factory Sectors & Wholesale Directories'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            {hp.featuredCategoriesSubheading || 'Browse audited manufacturing suppliers by specialized industry vertical, explore verified catalog items, or source factory quotations.'}
          </p>
        </div>

        {/* Quick Top Links */}
        <div className="flex items-center flex-wrap gap-2 shrink-0">
          {selectedCategory && (
            <button
              id="btn-clear-category-filter"
              onClick={() => onSelectCategory('')}
              className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 shrink-0 cursor-pointer flex items-center gap-1"
            >
              <span>Clear Filter ({selectedCategory})</span>
              <span className="text-blue-400">×</span>
            </button>
          )}

          <button
            id="btn-nav-all-products"
            onClick={() => onNavigate ? onNavigate('PRODUCT_DIRECTORY') : handleCategoryClick('')}
            className="text-xs font-bold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Package className="w-3.5 h-3.5 text-blue-600" />
            <span>Full Catalog</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>

          <button
            id="btn-nav-all-suppliers"
            onClick={() => onNavigate ? onNavigate('SUPPLIERS_DIRECTORY') : onNavigateToSuppliers?.()}
            className="text-xs font-bold text-slate-700 hover:text-emerald-600 bg-slate-50 hover:bg-emerald-50 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Factory Directory</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesToRender.map(cat => {
          const isSelected = selectedCategory === cat.name;
          const catImage = cat.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80';
          
          // Parse subcategories into array
          const rawSubcats = (cat as any).subcategories && Array.isArray((cat as any).subcategories) && (cat as any).subcategories.length > 0
            ? (cat as any).subcategories
            : (cat.description || '').split(',').map((s: string) => s.trim()).filter(Boolean);

          const subcategoriesList: string[] = rawSubcats.slice(0, 4);

          return (
            <div
              key={cat.id}
              id={`category-card-${cat.id}`}
              onClick={() => handleCategoryClick(cat.name)}
              className={`relative overflow-hidden rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 cursor-pointer group hover:-translate-y-0.5 ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-lg'
              }`}
            >
              <div>
                {/* Header Row: Thumbnail + Title & Count */}
                <div className="flex items-start gap-3.5">
                  {/* Category Photo Thumbnail */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative group-hover:scale-105 transition-transform">
                    <SafeImage 
                      src={catImage} 
                      alt={cat.name} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <div className="absolute bottom-1 right-1 p-1 rounded-md bg-white/95 text-slate-900 shadow-xs z-10">
                      {getCategoryIcon(cat.iconName || 'Box')}
                    </div>
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/70">
                        {cat.productCount}
                      </span>
                      {cat.badge && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>{cat.badge}</span>
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {cat.name}
                    </h3>
                    
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Clickable Subcategory Tags / Links */}
                {subcategoriesList.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Top Subcategories:</span>
                      <span className="text-[9px] text-emerald-600 font-bold lowercase">verified metrics</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {subcategoriesList.map((sub, idx) => {
                        const m = (GLOBAL_B2B_TRADE_METRICS || []).find(
                          item => item.subcategory.toLowerCase() === sub.toLowerCase() || item.main_category.toLowerCase() === cat.name.toLowerCase()
                        );
                        return (
                          <button
                            key={idx}
                            id={`subcat-btn-${cat.id}-${idx}`}
                            type="button"
                            onClick={(e) => handleSubcategoryClick(cat.name, sub, e)}
                            className="px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-blue-100 hover:text-blue-800 text-[10px] font-medium text-slate-700 border border-slate-200/70 hover:border-blue-300 transition-all cursor-pointer flex items-center gap-1 max-w-full truncate"
                            title={m ? `${m.total_verified_suppliers} Verified Suppliers | ${m.total_buying_leads_rfqs} Live RFQs | ${m.growth_trend}` : `Search ${sub} products`}
                          >
                            <span className="truncate">{sub}</span>
                            {m && (
                              <span className="text-[9px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded shrink-0">
                                {m.total_verified_suppliers}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Bar at Bottom of Card (Explicit, Functional Links) */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                <button
                  id={`cat-products-link-${cat.id}`}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCategoryClick(cat.name);
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <Package className="w-3 h-3" />
                  <span>View Products</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id={`cat-suppliers-link-${cat.id}`}
                    type="button"
                    onClick={(e) => handleSuppliersClick(cat.name, e)}
                    className="text-[10px] font-semibold text-slate-600 hover:text-emerald-700 bg-slate-50 hover:bg-emerald-50 px-2 py-0.5 rounded-md border border-slate-200 hover:border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`View verified manufacturers for ${cat.name}`}
                  >
                    <Building2 className="w-3 h-3 text-emerald-600" />
                    <span>Factories</span>
                  </button>

                  <button
                    id={`cat-rfqs-link-${cat.id}`}
                    type="button"
                    onClick={(e) => handleRfqsClick(cat.name, e)}
                    className="text-[10px] font-semibold text-slate-600 hover:text-amber-700 bg-slate-50 hover:bg-amber-50 px-2 py-0.5 rounded-md border border-slate-200 hover:border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                    title={`View live buy leads or post RFQ for ${cat.name}`}
                  >
                    <FileText className="w-3 h-3 text-amber-600" />
                    <span>RFQs</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sourcing Bottom Banner with Direct Action Links */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3 text-left w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0 text-blue-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Looking for custom OEM/ODM production across these industrial sectors?</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5">
              Submit your detailed specification once to receive direct factory quotations, MOQ terms, and trade protection-backed lead times.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto shrink-0 sm:justify-end">
          <button
            id="category-menu-post-rfq-btn"
            type="button"
            onClick={() => onOpenCreateRfq ? onOpenCreateRfq() : (onNavigate ? onNavigate('RFQ_HUB') : null)}
            className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Post Free Sourcing RFQ</span>
          </button>
          <button
            id="category-menu-view-suppliers-btn"
            type="button"
            onClick={() => onNavigate ? onNavigate('SUPPLIERS_DIRECTORY') : null}
            className="w-full sm:w-auto justify-center px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Verified Factories</span>
          </button>
        </div>
      </div>

    </div>
  );
};
