import React, { useState } from 'react';
import { Product, Currency, Incoterm } from '../../types';
import { CATEGORIES_TREE, CURRENCY_RATES } from '../../data/mockData';
import { 
  PackagePlus, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  Layers, 
  DollarSign, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onProductCreated: (product: Partial<Product>) => void;
}

export const PostSellOfferView: React.FC<Props> = ({
  selectedCurrency,
  onProductCreated
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES_TREE[0]?.name || 'Industrial Machinery');
  const [subCategory, setSubCategory] = useState('CNC & Precision Tooling');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80');
  const [moq, setMoq] = useState<number>(50);
  const [moqUnit, setMoqUnit] = useState('Units');
  const [priceTier1, setPriceTier1] = useState<number>(120);
  const [priceTier2, setPriceTier2] = useState<number>(95);
  const [portOfDispatch, setPortOfDispatch] = useState('Ningbo / Shanghai Port');
  const [leadTimeDays, setLeadTimeDays] = useState<number>(15);
  const [description, setDescription] = useState('');
  const [supplierName, setSupplierName] = useState('Zhejiang Precision Machinery Co.');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProd: Partial<Product> = {
      title,
      category,
      subCategory,
      images: [imageUrl],
      moq: Number(moq),
      moqUnit,
      priceTiers: [
        { minUnits: moq, maxUnits: moq * 5, priceUsd: Number(priceTier1) },
        { minUnits: moq * 5 + 1, priceUsd: Number(priceTier2) }
      ],
      supportedIncoterms: ['FOB', 'CIF', 'EXW'] as Incoterm[],
      portOfDispatch,
      leadTimeDays: Number(leadTimeDays),
      supplyAbilityPerMonth: '50,000 Units / Month',
      packagingDetails: 'Export standard seaworthy carton & wooden pallet packaging',
      supplierName,
      supplierCountry: 'China',
      supplierTier: 'GOLD',
      supplierTrustScore: 95,
      specifications: [
        { name: 'Material Standard', value: 'Aerospace Grade 6061-T6' },
        { name: 'Certification', value: 'ISO 9001:2015, CE, RoHS' }
      ]
    };

    setIsSuccess(true);
    setTimeout(() => {
      onProductCreated(newProd);
    }, 1200);
  };

  return (
    <div id="post-sell-offer-root" className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <PackagePlus className="w-3.5 h-3.5" />
          <span>Factory Exporter Direct Listing Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
          List Product / Post Sell Offer
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-normal">
          Publish your factory's production capabilities, tiered FOB volume pricing, and technical parameters to verified global buyers.
        </p>
      </div>

      {isSuccess ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-900">Product Successfully Listed!</h3>
          <p className="text-xs text-slate-600">
            Your export product is now live on the Trade Heaven global catalog and indexed for buyer RFQs.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
              <Layers className="w-4 h-4 text-blue-600" />
              1. Product Identification &amp; Category
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Heavy Duty CNC Milling Machine 5-Axis VMC"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sector Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  {CATEGORIES_TREE.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Subcategory / Application</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">High-Resolution Photo URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Volume Pricing & MOQ */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              2. Tiered FOB Volume Pricing &amp; MOQ
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Minimum Order Qty (MOQ)</label>
                <input
                  type="number"
                  min="1"
                  value={moq}
                  onChange={e => setMoq(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">MOQ Unit Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceTier1}
                  onChange={e => setPriceTier1(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">High Volume Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceTier2}
                  onChange={e => setPriceTier2(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-emerald-700 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Logistics & Dispatch */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-200">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              3. Port of Dispatch &amp; Production Lead Time
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dispatch Port</label>
                <input
                  type="text"
                  value={portOfDispatch}
                  onChange={e => setPortOfDispatch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Production Lead Time (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={leadTimeDays}
                  onChange={e => setLeadTimeDays(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Publish Export Offer to Global Catalog</span>
          </button>
        </form>
      )}
    </div>
  );
};
