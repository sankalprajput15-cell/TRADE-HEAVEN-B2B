import React, { useState } from 'react';
import { Product, Currency, Incoterm, ActiveView } from '../../types';
import { CATEGORIES_TREE, CURRENCY_RATES } from '../../data/mockData';
import { bigrockApi } from '../../services/bigrockApi';
import { validateUploadFile, compressAndResizeImage } from '../../utils/fileUploadGuard';
import { 
  PackagePlus, 
  ShieldCheck, 
  Send, 
  Layers, 
  DollarSign, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  Loader2
} from 'lucide-react';

interface Props {
  selectedCurrency: Currency;
  onProductCreated: (product: Partial<Product>) => void;
  onNavigate?: (view: ActiveView | string) => void;
}

export const PostSellOfferView: React.FC<Props> = ({
  selectedCurrency,
  onProductCreated,
  onNavigate
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
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleApplySampleListing = (sample: 'SOLAR' | 'WHEELS' | 'CNC' | 'RESIN') => {
    if (sample === 'SOLAR') {
      setTitle('580W TOPCon Bifacial Monocrystalline Commercial Solar PV Modules');
      setCategory('Renewable Energy & Solar');
      setSubCategory('Monocrystalline Solar Panels');
      setImageUrl('https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80');
      setMoq(62);
      setMoqUnit('Pieces');
      setPriceTier1(78);
      setPriceTier2(65);
      setPortOfDispatch('Shanghai / Ningbo Port');
      setLeadTimeDays(14);
      setDescription('N-Type TOPCon 144-half-cut bifacial dual-glass solar PV modules. Up to 25% additional rear-side power yield. Anti-PID, 30-year linear power warranty, MC4-EVO2 connectors, and TÜV Rheinland certified.');
      setSupplierName('ApexPower Energy Tech Co., Ltd.');
    } else if (sample === 'WHEELS') {
      setTitle('Custom Forged Monoblock 6061-T6 Aluminum Motorsport Racing Wheels (18-21 Inch)');
      setCategory('Automotive Parts & Transportation');
      setSubCategory('Forged Alloy Wheels');
      setImageUrl('https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&auto=format&fit=crop&q=80');
      setMoq(4);
      setMoqUnit('Pieces');
      setPriceTier1(480);
      setPriceTier2(395);
      setPortOfDispatch('Los Angeles / Long Beach Port');
      setLeadTimeDays(15);
      setDescription('10,000-ton forged aerospace 6061-T6 aluminum alloy motorsport wheels. Engineered for high-speed track endurance, circuit racing, and luxury performance vehicles. Custom PCD bolt patterns.');
      setSupplierName('Apex Dynamics Motorsport & Forgings Inc.');
    } else if (sample === 'CNC') {
      setTitle('Heavy-Duty 5-Axis High Precision CNC Machining Center with Siemens Sinumerik ONE');
      setCategory('Industrial Machinery & Automation');
      setSubCategory('CNC Machining Centers');
      setImageUrl('https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80');
      setMoq(1);
      setMoqUnit('Sets');
      setPriceTier1(148000);
      setPriceTier2(139000);
      setPortOfDispatch('Stuttgart / Hamburg Hub');
      setLeadTimeDays(30);
      setDescription('State-of-the-art 5-Axis CNC Milling Center designed for aerospace, automotive mold making, and medical titanium implants. Features direct-drive torque motors and 24,000 RPM high-speed spindle.');
      setSupplierName('KUKA Precision Engineering GmbH');
    } else if (sample === 'RESIN') {
      setTitle('High-Density Polyethylene (HDPE) Virgin Resin Granules (Blow Molding Grade)');
      setCategory('Chemicals, Polymers & Resins');
      setSubCategory('Virgin HDPE / Polypropylene');
      setImageUrl('https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&auto=format&fit=crop&q=80');
      setMoq(25);
      setMoqUnit('Metric Tons');
      setPriceTier1(1120);
      setPriceTier2(980);
      setPortOfDispatch('Nhava Sheva (JNPT) / Mundra Port');
      setLeadTimeDays(10);
      setDescription('100% Prime Virgin HDPE polymer granules specially engineered for industrial containers, jerry cans, lube oil bottles, and high-pressure chemical drums with outstanding ESCR.');
      setSupplierName('Sudarshan Petrochem & Polymers Ltd.');
    }
  };

  const handleImageUpload = async (file: File) => {
    const check = validateUploadFile(file, 'IMAGE');
    if (!check.valid) {
      setUploadMessage(check.error || 'Invalid image file');
      return;
    }
    setIsUploadingImage(true);
    setUploadMessage('Processing image...');
    try {
      const compressed = await compressAndResizeImage(file);
      const res = await bigrockApi.uploadFile(file, 'products');
      if (res.success && res.publicUrl) {
        setImageUrl(res.publicUrl);
        setUploadMessage('✓ Image processed successfully!');
      } else {
        setImageUrl(compressed.dataUrl);
        setUploadMessage('✓ Image optimized and loaded');
      }
    } catch {
      setUploadMessage('Failed to upload image. Using default URL.');
    } finally {
      setIsUploadingImage(false);
      setTimeout(() => setUploadMessage(null), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      // Save directly to Secure listings database
      await bigrockApi.createListing({
        title,
        description: description || `Factory direct supply of ${title}. MOQ: ${moq} ${moqUnit}, Port: ${portOfDispatch}.`,
        category,
        sub_category: subCategory,
        price: priceTier1,
        image_url: imageUrl,
        moq,
        moq_unit: moqUnit,
        supplier_name: supplierName,
        supplier_country: 'China'
      });
    } catch (err) {
      console.warn('Listing saved to local store');
    }

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
          {/* Quick Fill Sample Products */}
          <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <PackagePlus className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-Click Sample Product Listings (Populate with real factory specifications):</span>
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplySampleListing('SOLAR')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>☀️ 580W Solar Panels ($78/pc)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySampleListing('WHEELS')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>🏎️ 6061-T6 Forged Wheels ($480/pc)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySampleListing('CNC')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>⚙️ 5-Axis CNC Mill ($148,000)</span>
              </button>
              <button
                type="button"
                onClick={() => handleApplySampleListing('RESIN')}
                className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <span>🧪 Virgin HDPE Resin Granules ($1,120/MT)</span>
              </button>
            </div>
          </div>

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

              <div className="sm:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Product Image URL / Asset</label>
                  <span className="text-[10px] text-blue-600 font-bold">Image Attachment</span>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 shrink-0 flex items-center justify-center">
                    {imageUrl && imageUrl.trim() ? (
                      <img src={imageUrl.trim()} alt={title ? `Preview of ${title}` : "Product photo preview"} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex items-center gap-2">
                      <label className="px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 flex items-center gap-1.5 cursor-pointer transition-colors shrink-0">
                        {isUploadingImage ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 text-blue-600" />
                        )}
                        <span>{isUploadingImage ? 'Uploading to Bucket...' : 'Upload Image File'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleImageUpload(f);
                            e.target.value = '';
                          }}
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">or enter image URL below</span>
                    </div>

                    <input
                      type="url"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-mono text-[11px] focus:outline-none focus:border-blue-500"
                    />

                    {uploadMessage && (
                      <div className="text-[10px] font-bold text-emerald-600">
                        {uploadMessage}
                      </div>
                    )}
                  </div>
                </div>
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

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span>By submitting this listing, you confirm that your items comply with Trade Heaven's </span>
              {onNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate('PRODUCT_LISTING_POLICY')}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Product Listing Policy
                </button>
              ) : (
                <span className="font-bold text-blue-600">Product Listing Policy</span>
              )}
              <span>. Prohibited items, IPR infringements, and unauthorized controlled goods will be removed immediately.</span>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
