import React from 'react';
import { CATEGORIES_TREE } from '../../data/mockData';
import { useSiteContent } from '../../context/SiteContentContext';
import { SafeImage } from '../common/SafeImage';
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
  Sparkles,
  ArrowRight,
  Edit3
} from 'lucide-react';

interface Props {
  selectedCategory: string | null;
  onSelectCategory: (catName: string) => void;
}

export const CategoryMegaMenu: React.FC<Props> = ({ selectedCategory, onSelectCategory }) => {
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
      default: return <Sparkles className="w-4 h-4 text-blue-600" />;
    }
  };

  const hp = siteContent?.homepage;
  const categoriesToRender = (hp?.categoriesList && hp.categoriesList.length > 0) 
    ? hp.categoriesList 
    : (CATEGORIES_TREE || []).map(c => ({
        id: c.id,
        name: c.name,
        description: (c.subcategories || []).join(', '),
        iconName: c.icon,
        image: (c as any).image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
        badge: 'Verified',
        productCount: c.count || 0
      }));

  return (
    <div id="category-mega-menu" className="relative bg-white border border-slate-200 rounded-3xl p-5 sm:p-7 shadow-sm group">
      
      {/* Live Visual Edit Trigger (Strictly Admin / Creator Only) */}
      {isAdmin && isLiveEditMode && (
        <button
          type="button"
          onClick={() => openQuickEdit('CATEGORIES')}
          className="absolute top-4 right-4 z-20 px-3.5 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md hover:bg-amber-300 transition-all cursor-pointer"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Categories</span>
        </button>
      )}

      <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 mb-5">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            {hp.featuredCategoriesHeading || 'Verified Industrial Sourcing Sectors & Factory Directories'}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {hp.featuredCategoriesSubheading || 'Browse audited manufacturing suppliers by specialized industry vertical and production capability'}
          </p>
        </div>
        {selectedCategory && (
          <button
            onClick={() => onSelectCategory('')}
            className="text-xs text-blue-600 hover:text-blue-800 font-bold transition-colors bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 shrink-0 cursor-pointer"
          >
            Clear Filter ({selectedCategory})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {categoriesToRender.map(cat => {
          const isSelected = selectedCategory === cat.name;
          const catImage = cat.image || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80';
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? '' : cat.name)}
              className={`relative overflow-hidden rounded-2xl border text-left transition-all group flex flex-col justify-between p-3.5 cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Category Photo Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200 relative group-hover:scale-105 transition-transform">
                  <SafeImage 
                    src={catImage} 
                    alt={cat.name} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                  <div className="absolute bottom-1 right-1 p-0.5 rounded bg-white/90 text-slate-900 shadow-xs z-10">
                    {getCategoryIcon(cat.iconName || 'Box')}
                  </div>
                </div>

                {/* Category Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                      {cat.productCount}
                    </span>
                    {cat.badge && (
                      <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 line-clamp-1 mt-1">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {cat.description}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
                <span className="text-[10px] text-blue-600 font-bold group-hover:underline">Explore Products &amp; Exporters</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
