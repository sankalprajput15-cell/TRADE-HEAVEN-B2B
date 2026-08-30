import React from 'react';
import { Product, Currency } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { MessageCircle, Building, Lock, ShieldCheck, Award } from 'lucide-react';

interface Props {
  products: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onOpenStorefront: (supplierId: string) => void;
  onContactSupplier: (product: Product) => void;
  formatPrice: (usdPrice: number) => string;
  getTierBadge: (tier: any) => React.ReactNode;
}

export const ProductCatalogGrid: React.FC<Props> = ({
  products,
  selectedCurrency,
  onSelectProduct,
  onOpenStorefront,
  onContactSupplier,
  formatPrice,
  getTierBadge,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
      {products.map(product => (
        <div
          key={product.id}
          className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-2xs"
        >
          <div>
            {/* Image Thumbnail */}
            <div 
              onClick={() => onSelectProduct(product)}
              className="relative h-44 sm:h-48 w-full bg-slate-100 overflow-hidden cursor-pointer"
            >
              <SafeImage
                src={product.images?.[0]}
                alt={product.title}
                category={product.category}
                productId={product.id}
                className="w-full h-full group-hover:scale-105 transition-transform duration-300"
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
            <div className="p-3.5 sm:p-4 space-y-2.5">
              <div 
                onClick={() => onSelectProduct(product)}
                className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
              >
                {product.title}
              </div>

              {/* Tiered FOB Price range with Confidential / Inquire Protection */}
              <div className="bg-slate-50 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">FOB Volume Price</span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    <Lock className="w-2.5 h-2.5 text-amber-600" />
                    <span>Protected Rate</span>
                  </span>
                </div>
                <div className="text-sm sm:text-base font-black text-slate-800 font-mono mt-0.5 flex items-baseline gap-1">
                  <span>Inquire for Price</span>
                  <span className="text-[11px] sm:text-xs font-normal text-slate-500"> / {product.moqUnit || 'Unit'}</span>
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-600 mt-1.5 flex items-center justify-between font-medium pt-1.5 border-t border-slate-200/60">
                  <span>MOQ: <strong className="text-slate-900 font-bold">{(product.moq && product.moq > 0 ? product.moq : 100).toLocaleString()} {product.moqUnit || 'Units'}</strong></span>
                  <span>Lead: <strong className="text-slate-900 font-bold">{product.leadTimeDays && product.leadTimeDays > 0 ? product.leadTimeDays : 15}d</strong></span>
                </div>
              </div>

              {/* Supplier Trust Summary */}
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => onOpenStorefront(product.supplierId)}
                  className="text-slate-700 hover:text-blue-600 font-medium truncate max-w-[150px] sm:max-w-[170px] text-left flex items-center gap-1 group/sup transition-colors cursor-pointer"
                >
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{product.supplierName}</span>
                </button>
                <span className="text-slate-500 text-[10px] shrink-0 font-mono font-medium">
                  {product.supplierCountry}
                </span>
              </div>
            </div>
          </div>

          {/* Card Action Buttons */}
          <div className="p-3.5 sm:p-4 pt-0 grid grid-cols-2 gap-2">
            <button
              onClick={() => onContactSupplier(product)}
              className="w-full py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 min-h-[40px] cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>Contact</span>
            </button>
            <button
              onClick={() => onSelectProduct(product)}
              className="w-full py-2.5 sm:py-2 rounded-lg sm:rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs min-h-[40px] flex items-center justify-center cursor-pointer"
            >
              <span>Get Latest Price</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
