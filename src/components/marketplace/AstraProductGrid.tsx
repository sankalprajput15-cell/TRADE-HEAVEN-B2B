import React from 'react';
import { Product, Currency } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { MessageCircle, Lock } from 'lucide-react';

interface Props {
  products: Product[];
  selectedCurrency: Currency;
  onSelectProduct: (product: Product) => void;
  onContactSupplier: (product: Product) => void;
}

export const AstraProductGrid: React.FC<Props> = ({
  products,
  selectedCurrency,
  onSelectProduct,
  onContactSupplier,
}) => {
  // Filter specifically for Astra Commodities products
  const astraProducts = products.filter(p => p.supplierId === 'comp-astra-commodities');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {astraProducts.map(product => (
        <div
          key={product.id}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div 
            onClick={() => onSelectProduct(product)}
            className="h-44 w-full bg-slate-100 overflow-hidden cursor-pointer relative"
          >
            <SafeImage
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400'}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
            <div className="absolute bottom-2.5 right-2.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold shadow-xs">
                <Lock className="w-2.5 h-2.5 text-amber-400" />
                <span>Protected Rate</span>
              </span>
            </div>
          </div>
          <div className="p-4 space-y-2">
            <h4 
              onClick={() => onSelectProduct(product)}
              className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2"
            >
              {product.title}
            </h4>
            <div className="flex items-center justify-between">
              <div className="text-sm font-black text-slate-800 font-mono">
                Inquire for Price / {product.moqUnit}
              </div>
              <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                <Lock className="w-2.5 h-2.5 text-amber-600" />
                <span>Inquire</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-2">{product.description}</p>
          </div>
          <div className="p-4 pt-0 flex gap-2">
            <button
              onClick={() => onContactSupplier(product)}
              className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 flex items-center justify-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3 h-3" /> Contact
            </button>
            <button
              onClick={() => onSelectProduct(product)}
              className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white cursor-pointer"
            >
              Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
