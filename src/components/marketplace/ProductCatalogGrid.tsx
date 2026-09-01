import React from 'react';
import { Product, Currency } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { MessageCircle, Building, Lock, ShieldCheck, Award } from 'lucide-react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs relative min-w-0 w-full">
      <div>
        {/* Image Placeholder with Shimmer */}
        <div className="relative h-40 sm:h-44 md:h-48 w-full bg-slate-100 overflow-hidden">
          <div className="absolute inset-0 bg-slate-200/80 animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
          
          {/* Badge Skeletons */}
          <div className="absolute top-2.5 left-2.5">
            <div className="h-4.5 w-16 bg-slate-300/80 rounded-full animate-pulse" />
          </div>
          <div className="absolute bottom-2.5 right-2.5">
            <div className="h-4 w-20 bg-slate-700/40 rounded-md animate-pulse" />
          </div>
        </div>

        {/* Content Body Skeleton */}
        <div className="p-3 sm:p-4 space-y-2.5 min-w-0">
          {/* Title Lines */}
          <div className="space-y-1.5 pt-0.5">
            <div className="h-4 w-11/12 bg-slate-200 rounded-md animate-pulse" />
            <div className="h-4 w-2/3 bg-slate-200 rounded-md animate-pulse" />
          </div>

          {/* Pricing Box Skeleton */}
          <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 space-y-2 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <div className="h-2.5 w-20 bg-slate-200 rounded animate-pulse shrink-0" />
              <div className="h-3.5 w-16 bg-amber-100/80 rounded border border-amber-200/60 animate-pulse shrink-0" />
            </div>
            <div className="h-4.5 w-28 bg-slate-300/80 rounded mt-1 animate-pulse" />
            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-1">
              <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
              <div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
            </div>
          </div>

          {/* Supplier Info Skeleton */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-3.5 h-3.5 rounded bg-slate-200 animate-pulse shrink-0" />
              <div className="h-3.5 w-20 bg-slate-200 rounded animate-pulse truncate" />
            </div>
            <div className="h-3 w-10 bg-slate-200 rounded animate-pulse shrink-0" />
          </div>
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="p-3 sm:p-4 pt-0 grid grid-cols-2 gap-2 min-w-0">
        <div className="h-8 sm:h-9 w-full rounded-lg sm:rounded-xl bg-slate-200/80 animate-pulse" />
        <div className="h-8 sm:h-9 w-full rounded-lg sm:rounded-xl bg-blue-200/70 animate-pulse" />
      </div>
    </div>
  );
};

export const ProductListSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 shadow-2xs min-w-0 w-full">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-slate-200/80 overflow-hidden shrink-0 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="h-4 w-14 rounded-full bg-slate-200 animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-3/4 bg-slate-200 rounded-md animate-pulse" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-14 bg-slate-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="h-8 sm:h-9 w-20 rounded-lg bg-slate-200/80 animate-pulse" />
        <div className="h-8 sm:h-9 w-28 rounded-lg bg-blue-200/70 animate-pulse" />
      </div>
    </div>
  );
};

interface Props {
  products: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (supplierId: string) => void;
  onContactSupplier: (product: Product) => void;
  formatPrice: (usdPrice: number) => string;
  getTierBadge: (tier: any) => React.ReactNode;
  isLoading?: boolean;
  skeletonCount?: number;
}

export const ProductCatalogGrid: React.FC<Props> = ({
  products,
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier,
  formatPrice,
  getTierBadge,
  isLoading = false,
  skeletonCount = 12
}) => {
  if (isLoading) {
    return (
      <div id="product-grid-loading-skeletons" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 min-w-0 w-full">
        {Array.from({ length: skeletonCount }).map((_, idx) => (
          <ProductCardSkeleton key={`product-skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 min-w-0 w-full">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs min-w-0 w-full"
        >
          <div className="min-w-0">
            {/* Image Thumbnail */}
            <div 
              onClick={() => onSelectProduct(product)}
              className="relative h-40 sm:h-44 md:h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
            >
              <SafeImage
                src={product.images?.[0]}
                alt={product.title}
                category={product.category}
                productId={product.id}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5">
                {getTierBadge(product.supplierTier)}
              </div>
              <div className="absolute bottom-2.5 right-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>Protected Rate</span>
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-3 sm:p-4 space-y-2.5 min-w-0">
              <div 
                onClick={() => onSelectProduct(product)}
                className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
              >
                {product.title}
              </div>

              {/* Tiered FOB Price range with Confidential / Inquire Protection */}
              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider truncate">FOB Volume Price</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                    <span>Protected Rate</span>
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono mt-0.5 flex items-baseline gap-1 truncate">
                  <span>Inquire for Price</span>
                  <span className="text-[11px] sm:text-xs font-normal text-slate-500 truncate"> / {product.moqUnit || 'Unit'}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 flex items-center justify-between font-medium pt-1.5 border-t border-slate-200/60 gap-1">
                  <span className="truncate">MOQ: <strong className="text-slate-900 font-bold">{(product.moq && product.moq > 0 ? product.moq : 100).toLocaleString()} {product.moqUnit || 'Units'}</strong></span>
                  <span className="shrink-0">Lead: <strong className="text-slate-900 font-bold">{product.leadTimeDays && product.leadTimeDays > 0 ? product.leadTimeDays : 15}d</strong></span>
                </div>
              </div>

              {/* Supplier Trust Summary */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] gap-2 min-w-0">
                <button
                  onClick={() => onOpenStorefront(product.supplierId)}
                  className="text-slate-700 hover:text-blue-600 font-medium min-w-0 text-left flex items-center gap-1 group/sup transition-colors cursor-pointer"
                >
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate max-w-[120px] sm:max-w-[140px]">{product.supplierName}</span>
                </button>
                <span className="text-slate-500 text-[10px] shrink-0 font-mono font-medium">
                  {product.supplierCountry}
                </span>
              </div>
            </div>
          </div>

          {/* Card Action Buttons */}
          <div className="p-3 sm:p-4 pt-0 grid grid-cols-2 gap-2 min-w-0">
            <button
              onClick={() => onContactSupplier(product)}
              className="w-full py-2 px-1.5 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-slate-200 min-h-[38px] cursor-pointer min-w-0"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate">Contact</span>
            </button>
            <button
              onClick={() => onSelectProduct(product)}
              className="w-full py-2 px-1.5 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold transition-colors shadow-2xs min-h-[38px] flex items-center justify-center text-center cursor-pointer min-w-0"
            >
              <span className="truncate">Get Price</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
