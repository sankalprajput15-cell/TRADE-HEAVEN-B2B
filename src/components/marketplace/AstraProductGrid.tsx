import React from 'react';
import { Product, Currency } from '../../types';
import { SafeImage } from '../common/SafeImage';
import { MessageCircle } from 'lucide-react';

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
            className="h-44 w-full bg-slate-100 overflow-hidden cursor-pointer"
          >
            <SafeImage
              src={product.images[0] || 'https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=400'}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
            />
          </div>
          <div className="p-4 space-y-2">
            <h4 
              onClick={() => onSelectProduct(product)}
              className="font-bold text-sm text-slate-900 hover:text-blue-600 cursor-pointer line-clamp-2"
            >
              {product.title}
            </h4>
            <div className="text-sm font-black text-emerald-700 font-mono">
              ${product.fobPriceUsd.toLocaleString()} / {product.moqUnit}
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
