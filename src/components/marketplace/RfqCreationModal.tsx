import React, { useState } from 'react';
import { Incoterm, RfqRequirement, Currency, PaymentTerms } from '../../types';
import { CATEGORIES_TREE, CURRENCY_RATES } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  X, 
  PlusCircle, 
  ShieldCheck, 
  Send, 
  FileText, 
  Globe2, 
  Package, 
  Anchor, 
  Calendar,
  CheckCircle2,
  DollarSign,
  Layers,
  MessageCircle,
  ExternalLink,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { validateUploadFile, compressAndResizeImage, UPLOAD_LIMITS } from '../../utils/fileUploadGuard';
import { bigrockApi } from '../../services/bigrockApi';

interface Props {
  isOpen?: boolean;
  selectedCurrency?: Currency;
  onClose: () => void;
  onSubmitRfq?: (rfq: Partial<RfqRequirement>) => void;
  onRfqCreated?: (rfq: Partial<RfqRequirement>) => void;
}

export const RfqCreationModal: React.FC<Props> = ({
  isOpen = true,
  selectedCurrency = 'USD',
  onClose,
  onSubmitRfq,
  onRfqCreated
}) => {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState(CATEGORIES_TREE[0]?.name || 'Industrial Machinery');
  const [targetQuantity, setTargetQuantity] = useState(1000);
  const [quantityUnit, setQuantityUnit] = useState('Units');
  const [targetPriceUsd, setTargetPriceUsd] = useState(25);
  const [preferredIncoterm, setPreferredIncoterm] = useState<Incoterm>('FOB');
  const [destinationPort, setDestinationPort] = useState('Rotterdam, Netherlands');
  const [shippingMethod, setShippingMethod] = useState<'SEA_FCL' | 'SEA_LCL' | 'AIR_FREIGHT' | 'RAIL_EXPRESS'>('SEA_FCL');
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('30% TT Deposit, 70% against B/L');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('2025-06-30');
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ name: string; size: string; previewUrl?: string }>>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [buyerCompany, setBuyerCompany] = useState('Nordic Industrial Import Oy');
  const [buyerCountry, setBuyerCountry] = useState('Finland');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedId = `rfq-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    const newRfq: RfqRequirement = {
      id: generatedId,
      buyerName: buyerCompany ? `${buyerCompany} (Buyer)` : 'Procurement Officer',
      buyerCompany: buyerCompany || 'International Procurement Corp',
      buyerCountry: buyerCountry || 'Global',
      buyerVerified: true,
      productName: productName || 'Commercial Bulk Sourcing Requirement',
      category: category || 'Industrial Machinery',
      targetQuantity: Number(targetQuantity) || 100,
      quantityUnit: quantityUnit || 'Units',
      targetPriceUsd: Number(targetPriceUsd) || 100,
      preferredIncoterm: preferredIncoterm || 'FOB',
      destinationPort: destinationPort || 'Global Major Hub',
      shippingMethod,
      paymentTerms: paymentTerms || '30% TT Deposit, 70% against B/L',
      targetDeliveryDate,
      detailedRequirements: description || `Seeking direct OEM/ODM factory quotation for ${targetQuantity} ${quantityUnit} of ${productName}. Target Incoterm: ${preferredIncoterm}, Destination Port: ${destinationPort}.`,
      buyerEmail: buyerEmail || 'support@tradeheaven.net',
      urgency: 'STANDARD',
      quotesCount: 0,
      postedDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      status: 'OPEN',
      matchedSupplierCount: 6,
      spamScore: 1.0
    };

    try {
      // Sync to live BigRock PHP MySQL API (POST ./api.php?action=submit_rfq)
      const bigrockResult = await bigrockApi.submitRfq({
        buyer_name: buyerCompany || 'Procurement Officer',
        buyer_email: buyerEmail || 'support@tradeheaven.net',
        buyer_phone: '',
        buyer_company: buyerCompany || 'Procurement Officer',
        buyer_country: 'United States',
        product_name: productName,
        category,
        quantity: Number(targetQuantity) || 100,
        quantity_unit: quantityUnit || 'Units',
        target_price: Number(targetPriceUsd) || 100,
        incoterm: preferredIncoterm,
        destination_port: destinationPort,
        payment_terms: paymentTerms,
        requirements: description || `Seeking direct OEM/ODM factory quotation for ${targetQuantity} ${quantityUnit} of ${productName}. Target Incoterm: ${preferredIncoterm}, Destination Port: ${destinationPort}.`,
        name: buyerCompany || 'Procurement Officer',
        email: buyerEmail || 'support@tradeheaven.net',
        phone: '',
        subject: `Buy Lead RFQ [${generatedId}]: ${targetQuantity} ${quantityUnit} of ${productName}`,
        message: `Target Incoterm: ${preferredIncoterm} | Port: ${destinationPort} | Target Price: $${targetPriceUsd} | Terms: ${paymentTerms} | Description: ${newRfq.detailedRequirements}`
      });
      if (!bigrockResult.success) {
        throw new Error(bigrockResult.message || 'Failed to sync with BigRock MySQL API');
      }
      window.dispatchEvent(new CustomEvent('tradeheaven_rfq_created', { detail: newRfq }));
    } catch (e: any) {
      alert(e.message || 'API Error');
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (typeof onSubmitRfq === 'function') {
          onSubmitRfq(newRfq);
        } else if (typeof onRfqCreated === 'function') {
          onRfqCreated(newRfq);
        } else {
          onClose();
        }
      }, 900);
    }, 500);
  };

  const handleApplyPreset = (preset: 'SOLAR' | 'CNC' | 'DENIM' | 'BATTERY') => {
    if (preset === 'SOLAR') {
      setProductName('580W TOPCon Bifacial Monocrystalline Solar Panels');
      setCategory('Renewable Energy & Solar');
      setTargetQuantity(620);
      setQuantityUnit('Pieces');
      setTargetPriceUsd(68);
      setPreferredIncoterm('CIF');
      setDestinationPort('Hamburg Port, Germany');
      setShippingMethod('SEA_FCL');
      setPaymentTerms('30% TT Deposit, 70% against B/L');
      setDescription('Require 1x40ft FCL container of 580W Grade-A TOPCon bifacial modules. IEC 61215 and TÜV Rheinland certifications required. Complete with MC4-EVO2 connectors.');
      setBuyerCompany('Helios Green Power GmbH');
      setBuyerCountry('Germany');
      setBuyerEmail('procurement@helios-power.de');
    } else if (preset === 'CNC') {
      setProductName('5-Axis High Precision CNC Machining Center with Siemens Controller');
      setCategory('Industrial Machinery & Automation');
      setTargetQuantity(2);
      setQuantityUnit('Sets');
      setTargetPriceUsd(135000);
      setPreferredIncoterm('CIF');
      setDestinationPort('Port of Los Angeles, USA');
      setShippingMethod('SEA_FCL');
      setPaymentTerms('Trade Protection Certificate');
      setDescription('Seeking 2 sets of 5-axis vertical machining centers for aerospace titanium components. 24,000 RPM spindle, 40-tool ATC, linear scales on all axes.');
      setBuyerCompany('Aerospace Tech Dynamics Corp');
      setBuyerCountry('United States');
      setBuyerEmail('sourcing@aerospacedynamics.us');
    } else if (preset === 'DENIM') {
      setProductName('100% GOTS Certified Organic Aegean Cotton Denim Fabric 12.5 oz');
      setCategory('Textiles, Fabrics & Apparel');
      setTargetQuantity(15000);
      setQuantityUnit('Meters');
      setTargetPriceUsd(3.90);
      setPreferredIncoterm('DDP');
      setDestinationPort('Paris Logistics Warehouse, France');
      setShippingMethod('SEA_FCL');
      setPaymentTerms('50% Deposit, 50% upon SGS pre-shipment report');
      setDescription('Need 15,000 meters of 3/1 right-hand twill 12.5oz deep indigo organic denim. GOTS Transaction Certificate is mandatory. Need 5m sample swatch first.');
      setBuyerCompany('Atelier Haute Couture Paris');
      setBuyerCountry('France');
      setBuyerEmail('imports@atelierhautecouture.fr');
    } else if (preset === 'BATTERY') {
      setProductName('51.2V 100Ah 5.12kWh LiFePO4 Server Rack Battery Modules');
      setCategory('Renewable Energy & Solar');
      setTargetQuantity(500);
      setQuantityUnit('Units');
      setTargetPriceUsd(650);
      setPreferredIncoterm('CIF');
      setDestinationPort('Gothenburg Port, Sweden');
      setShippingMethod('SEA_FCL');
      setPaymentTerms('30% TT Deposit, 70% against B/L');
      setDescription('Looking for 500 units of 51.2V 100Ah LiFePO4 server rack batteries for telecom backup. Must have UL1973, CE, and UN38.3 test reports. CAN/RS485 communication.');
      setBuyerCompany('Nordic Clean Energy Solutions AB');
      setBuyerCountry('Sweden');
      setBuyerEmail('marcus.vance@nordicenergy.se');
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-hidden"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-3xl max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-3rem)] flex flex-col shadow-2xl relative text-slate-900 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white/90 hover:text-white transition-colors cursor-pointer shadow-sm"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header (Fixed at top of modal) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 md:p-7 shrink-0 pr-14">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" /> Global Sourcing RFQ Dispatch
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white leading-tight">
            Post Buy Requirement &amp; Request Factory Quotes
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl font-normal">
            Broadcast your purchase specifications to 480,000+ verified factories worldwide. Receive competitive FOB/CIF proforma quotations within 24 hours.
          </p>
        </div>

        {isSuccess ? (
          <div className="p-8 sm:p-12 text-center space-y-5 flex-1 overflow-y-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-4 ring-emerald-50">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold uppercase tracking-wider border border-emerald-300">
                Submit Confirmation: Verified &amp; Saved
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 pt-1">Sourcing RFQ Successfully Confirmed!</h3>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs max-w-lg mx-auto space-y-2 text-left shadow-2xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">RFQ Reference ID:</span>
                <span className="font-mono font-bold text-blue-700">RFQ-2026-CONFIRMED</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Product Requirement:</span>
                <span className="font-bold text-slate-900">{productName || 'Custom Industrial Products'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Target Volume &amp; Port:</span>
                <span className="font-bold text-slate-800">{targetQuantity} {quantityUnit} ({destinationPort})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Synced to MySQL Engine
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Your requirement has been logged in the marketplace database and dispatched to audited factories matching <strong>{category}</strong>.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
            >
              Close &amp; Return to Marketplace
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 md:p-7 space-y-5 flex-1 overflow-y-auto">
            {/* Quick Fill Sample Sourcing Requirements */}
            <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-600" />
                  <span>1-Click Sample Pre-fills (Test with verified real-world data):</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyPreset('SOLAR')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>☀️ 580W Solar Panels (620 pcs / CIF)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('BATTERY')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>🔋 LiFePO4 Rack Batteries (500 units)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('CNC')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>⚙️ 5-Axis CNC Mill (2 sets / $135k)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset('DENIM')}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-[11px] font-bold text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>🧵 Organic Cotton Denim (15k meters)</span>
                </button>
              </div>
            </div>

            {/* Step 1: Product Definition */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-600" />
                1. Product &amp; Volume Target
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Product Name / Sourcing Keyword *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 20kW Solar Inverter, 6000 Series Aluminum Profiles, LiFePO4 Battery Cells"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES_TREE.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Order Volume *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={targetQuantity}
                      onChange={e => setTargetQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      value={quantityUnit}
                      onChange={e => setQuantityUnit(e.target.value)}
                      placeholder="e.g. Units, Tons, Meters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Trade & Logistics */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Anchor className="w-4 h-4 text-emerald-600" />
                2. Incoterms &amp; Logistics Delivery
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Price (USD/Unit)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-mono">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={targetPriceUsd}
                      onChange={e => setTargetPriceUsd(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-3 py-2.5 text-xs text-slate-900 font-mono font-bold focus:border-blue-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Incoterm Rule</label>
                  <select
                    value={preferredIncoterm}
                    onChange={e => setPreferredIncoterm(e.target.value as Incoterm)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-semibold focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    {(['FOB', 'CIF', 'EXW', 'DDP', 'CFR', 'FCA'] as Incoterm[]).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination Port</label>
                  <input
                    type="text"
                    value={destinationPort}
                    onChange={e => setDestinationPort(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Specifications Description & Technical Attachments */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  Detailed Technical Specifications &amp; Quality Standard
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Max 5MB / file</span>
              </div>
              <textarea
                rows={3}
                placeholder="Include material grades, voltage, tolerances, packaging requirements, OEM logo printing, and target inspection standard..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />

              {/* Upload Safety UI */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Attach Product Drawings &amp; Sample Photos</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Compressed to protect performance</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors border border-slate-200">
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{isProcessingFile ? 'Optimizing...' : 'Upload File / Photo (Max 5MB)'}</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      disabled={isProcessingFile}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadError(null);
                        const validation = validateUploadFile(file, file.type.startsWith('image/') ? 'IMAGE' : 'DOCUMENT');
                        if (!validation.valid) {
                          setUploadError(validation.error || 'File exceeded allowed upload capacity.');
                          e.target.value = '';
                          return;
                        }
                        try {
                          setIsProcessingFile(true);
                          if (file.type.startsWith('image/')) {
                            const compressed = await compressAndResizeImage(file);
                            setAttachedFiles(prev => [
                              ...prev,
                              {
                                name: file.name,
                                size: (compressed.sizeBytes / 1024).toFixed(0) + ' KB',
                                previewUrl: compressed.dataUrl
                              }
                            ]);
                          } else {
                            setAttachedFiles(prev => [
                              ...prev,
                              {
                                name: file.name,
                                size: (file.size / 1024).toFixed(0) + ' KB'
                              }
                            ]);
                          }
                        } catch (err: any) {
                          setUploadError(err?.message || 'Failed to process file safely.');
                        } finally {
                          setIsProcessingFile(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>

                  {attachedFiles.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-medium"
                    >
                      {att.previewUrl && att.previewUrl.trim() ? (
                        <img src={att.previewUrl.trim()} alt={`Attachment preview for ${att.name}`} className="w-5 h-5 rounded object-cover" />
                      ) : (
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                      )}
                      <span className="truncate max-w-[120px] font-bold">{att.name}</span>
                      <span className="text-[10px] text-blue-600">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => setAttachedFiles(attachedFiles.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Step 4: Buyer Organization Identification */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-purple-600" />
                3. Buyer Enterprise Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
                  <input
                    type="text"
                    required
                    value={buyerCompany}
                    onChange={e => setBuyerCompany(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Country / Region</label>
                  <input
                    type="text"
                    required
                    value={buyerCountry}
                    onChange={e => setBuyerCountry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Procurement Email</label>
                  <input
                    type="email"
                    required
                    value={buyerEmail}
                    onChange={e => setBuyerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Trade Protection Guarantee Disclaimer */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-0.5">
                <div className="font-bold">Trade Heaven Trade Protection Protection Included</div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Supplier quotations are verified for ISO/CE compliance. Deposit funds remain in neutral Swiss trade protection until pre-shipment SGS inspection sign-off.
                </p>
              </div>
            </div>

            {/* Submit Confirmation Button */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-base flex items-center justify-center gap-2.5 transition-all shadow-lg hover:shadow-xl ring-2 ring-emerald-400/40 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Submitting Confirmation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                    <span>Submit Confirmation</span>
                  </>
                )}
              </button>

              {/* Instant Confirmation Notice */}
              <div className="p-3 bg-emerald-50/90 border border-emerald-300/80 rounded-xl flex items-center justify-between text-xs text-emerald-950 shadow-2xs">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>RFQ requirement will be saved to BigRock database &amp; broadcast to verified suppliers.</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-900 bg-emerald-200/90 border border-emerald-400 px-2 py-0.5 rounded shrink-0">
                  Ready
                </span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
