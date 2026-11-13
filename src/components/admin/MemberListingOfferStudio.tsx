import React, { useState, useEffect } from 'react';
import {
  Building2,
  UserPlus,
  PackagePlus,
  Upload,
  FileText,
  Mail,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  CreditCard,
  ShieldCheck,
  Send,
  Sparkles,
  Image as ImageIcon,
  X
} from 'lucide-react';
import { CATEGORIES_TREE } from '../../data/mockData';

interface StudioCreatedEntry {
  company: any;
  product: any;
  user?: any;
  createdAt?: string;
}

export const MemberListingOfferStudio: React.FC<{
  onNavigate?: (view: any, options?: any) => void;
}> = ({ onNavigate }) => {
  // Section 1: Member & Plan Setup
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [planName, setPlanName] = useState<'Free' | 'Basic Plan' | 'Silver' | 'Gold' | 'Platinum' | 'VIP'>('Basic Plan');
  const [paymentMethod, setPaymentMethod] = useState('Card Payment');
  const [accountPassword, setAccountPassword] = useState('');

  // Section 2: Product Listing, Specs & Media/PDF Upload
  const [productTitle, setProductTitle] = useState('');
  const [category, setCategory] = useState('Energy, Minerals & Metals');
  const [subCategory, setSubCategory] = useState('Ultrafine & Nano Copper Powder');
  const [priceRangeUsd, setPriceRangeUsd] = useState('Advance Payment & Counter-Offers Open');
  const [moq, setMoq] = useState('1');
  const [moqUnit, setMoqUnit] = useState('Units');
  const [portOfDispatch, setPortOfDispatch] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [specsLines, setSpecsLines] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [pdfUrl, setPdfUrl] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Section 3: Buyer Offer Alert Email (Optional)
  const [sendOfferEmail, setSendOfferEmail] = useState(true);
  const [buyerOfferCount, setBuyerOfferCount] = useState('50');
  const [offerPaymentType, setOfferPaymentType] = useState('Advance Payment');
  const [offerExpiryText, setOfferExpiryText] = useState('24 hours');
  const [customBuyerNames, setCustomBuyerNames] = useState('');
  const [adminCopyEmail, setAdminCopyEmail] = useState('yr943334@gmail.com');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultBanner, setResultBanner] = useState<{
    type: 'success' | 'error';
    message: string;
    details?: string;
  } | null>(null);
  const [recentCatalog, setRecentCatalog] = useState<StudioCreatedEntry[]>([]);

  const loadExistingCustomCatalog = async () => {
    try {
      const res = await fetch('/api/v1/public/custom-catalog');
      const data = await res.json();
      if (data?.success && Array.isArray(data.products)) {
        const compMap = new Map<string, any>();
        (data.companies || []).forEach((c: any) => compMap.set(c.id, c));
        setRecentCatalog(
          data.products.map((p: any) => ({
            product: p,
            company: compMap.get(p.supplierId) || { companyName: p.supplierName, country: p.supplierCountry }
          }))
        );
      }
    } catch {}
  };

  useEffect(() => {
    void loadExistingCustomCatalog();
  }, []);

  const readFileAsDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });

  const handleImageFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploadingMedia(true);
    setResultBanner(null);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const dataUrl = await readFileAsDataUrl(file);
        const res = await fetch('/api/v1/admin/upload-document-or-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, dataUrl })
        });
        const data = await res.json();
        if (data?.success && data.url) {
          newUrls.push(data.url);
        }
      }
      if (newUrls.length > 0) {
        setUploadedImages(prev => [...prev, ...newUrls]);
      }
    } catch (err: any) {
      setResultBanner({ type: 'error', message: err?.message || 'Image upload failed' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handlePdfFileSelected = async (file: File | null) => {
    if (!file) return;
    setIsUploadingMedia(true);
    setResultBanner(null);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const res = await fetch('/api/v1/admin/upload-document-or-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, dataUrl })
      });
      const data = await res.json();
      if (data?.success && data.url) {
        setPdfUrl(data.url);
      } else {
        setResultBanner({ type: 'error', message: data?.message || 'PDF upload failed' });
      }
    } catch (err: any) {
      setResultBanner({ type: 'error', message: err?.message || 'PDF upload failed' });
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultBanner(null);
    if (!companyName.trim() || !email.trim() || !productTitle.trim()) {
      setResultBanner({
        type: 'error',
        message: 'Please fill in Company Name, Client Email, and Product Title.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/admin/onboard-member-and-listing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          contactName: contactName.trim() || companyName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          address: address.trim(),
          country: country.trim(),
          planName,
          paymentMethod,
          accountPassword: accountPassword.trim(),
          productTitle: productTitle.trim(),
          category,
          subCategory,
          priceRangeUsd: priceRangeUsd.trim(),
          moq: Number(moq) || 1,
          moqUnit: moqUnit.trim() || 'Units',
          portOfDispatch: portOfDispatch.trim() || address.trim() || country.trim(),
          productDescription: productDescription.trim(),
          specsLines: specsLines.trim(),
          images: uploadedImages,
          pdfUrl: pdfUrl.trim(),
          sendOfferEmail,
          buyerOfferCount: Number(buyerOfferCount) || 50,
          offerPaymentType: offerPaymentType.trim() || 'Advance Payment',
          offerExpiryText: offerExpiryText.trim() || '24 hours',
          customBuyerNames: customBuyerNames.trim(),
          adminCopyEmail: adminCopyEmail.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || 'Failed to publish member & product listing.');
      }

      // Sync with browser local custom catalog & trigger live marketplace refresh
      try {
        const raw = localStorage.getItem('trade_heaven_custom_products');
        const arr = raw ? JSON.parse(raw) : [];
        const updated = [data.product, ...(Array.isArray(arr) ? arr.filter((x: any) => x?.id !== data.product.id) : [])];
        localStorage.setItem('trade_heaven_custom_products', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('tradeheaven_custom_catalog_updated', { detail: data }));
      } catch {}

      await loadExistingCustomCatalog();

      setResultBanner({
        type: 'success',
        message: `${companyName.trim()} listed as ${planName} Member with "${productTitle.trim()}" live in the marketplace${
          sendOfferEmail ? ` & ${buyerOfferCount}-buyer offer alert sent to ${email.trim().toLowerCase()}` : ''
        }!`,
        details: `Login Email: ${data.user?.email} | Temporary Password: ${data.user?.password || 'Set'}`
      });
    } catch (err: any) {
      setResultBanner({
        type: 'error',
        message: err?.message || 'Unable to complete onboarding & dispatch.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="member-listing-offer-studio">
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[11px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SELF-SERVICE ADMIN STUDIO • ZERO CODE NEEDED</span>
            </div>
            <h2 className="text-xl font-black tracking-tight">
              Onboard Member, List Product (Photos &amp; PDF) &amp; Send Buyer Offer Alert
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Register any client under their selected membership plan and payment method, attach product images and inspection PDFs directly to the live catalog, and email urgent buyer offer notifications with one click.
            </p>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('PRODUCT_DIRECTORY')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 cursor-pointer"
            >
              View Live Catalog →
            </button>
          )}
        </div>
      </div>

      {resultBanner && (
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
            resultBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {resultBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-sm">{resultBanner.message}</div>
            {resultBanner.details && (
              <div className="font-mono text-[11px] mt-1 opacity-90">{resultBanner.details}</div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitAll} className="space-y-6">
        {/* SECTION 1: MEMBER & PLAN DETAILS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-black text-slate-900">1. Client Company, Plan Tier &amp; Login Account</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Legal Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. AFREH GROUP LIMITED"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                data-testid="studio-company-name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Person *</label>
              <input
                type="text"
                required
                placeholder="e.g. Yaw Afreh Poku"
                value={contactName}
                onChange={e => setContactName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Client Corporate Email *</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                data-testid="studio-client-email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Registered Street Address / City</label>
              <input
                type="text"
                placeholder="e.g. 31 The Ridgeway, Braeside, Chatham, Kent, England"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                placeholder="United Kingdom"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Membership Plan Tier</label>
              <select
                value={planName}
                onChange={e => setPlanName(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Basic Plan">Basic Plan Member</option>
                <option value="Free">Free Member</option>
                <option value="Silver">Silver Supplier</option>
                <option value="Gold">Gold Verified Supplier</option>
                <option value="Platinum">Platinum Supplier</option>
                <option value="VIP">VIP Exporter</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Card Payment">Card Payment</option>
                <option value="SBLC Only">SBLC Only</option>
                <option value="Advance Payment / Escrow">Advance Payment / Escrow</option>
                <option value="Bank Wire (T/T)">Bank Wire (T/T)</option>
                <option value="Irrevocable DLC">Irrevocable DLC</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp (Optional)</label>
              <input
                type="text"
                placeholder="+44 ... or leave blank"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Portal Login Password (Optional — auto-generated if empty)</label>
              <input
                type="text"
                placeholder="e.g. Afreh@2026 (client logs in with Email + Password + 6-Digit Email OTP)"
                value={accountPassword}
                onChange={e => setAccountPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-mono focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PRODUCT LISTING, TECHNICAL SPECS & FILE UPLOADS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <PackagePlus className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-black text-slate-900">2. Product Listing, Technical Specs &amp; Photos / PDF Report</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ultra Dispersed Copper Powder (99.9991% Cu • Argon Stabilised • TU 1793-001-74350164-2005)"
                value={productTitle}
                onChange={e => setProductTitle(e.target.value)}
                data-testid="studio-product-title"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              >
                <option value="Energy, Minerals & Metals">Energy, Minerals &amp; Metals</option>
                {(CATEGORIES_TREE || []).filter(c => c.name !== 'Energy, Minerals & Metals').map(c => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Subcategory</label>
              <input
                type="text"
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Price / Offer Text</label>
              <input
                type="text"
                value={priceRangeUsd}
                onChange={e => setPriceRangeUsd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1">MOQ</label>
                <input
                  type="number"
                  min={1}
                  value={moq}
                  onChange={e => setMoq(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit</label>
                <input
                  type="text"
                  value={moqUnit}
                  onChange={e => setMoqUnit(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">Product Description &amp; Lab Custody Summary</label>
              <textarea
                rows={3}
                placeholder="Describe purity, Argon stabilisation, packaging (e.g. 250g bottles / 80 per container), last inspection report year..."
                value={productDescription}
                onChange={e => setProductDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-3">
              <label className="block font-bold text-slate-700 mb-1">
                Technical Specifications (one per line, use <span className="font-mono">Key: Value</span>)
              </label>
              <textarea
                rows={4}
                placeholder={`Standard: TU 1793-001-74350164-2005\nSurface Area: 1.52 m2/g\nParticle Size: <= 7.0 micron (0.444)\nPackaging: 250g bottles x 80 bottles x 4 containers`}
                value={specsLines}
                onChange={e => setSpecsLines(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11px] text-slate-900 focus:bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* File Uploads: Images & PDF */}
            <div className="md:col-span-2 p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Upload Product Photos (JPG / PNG / WEBP)</span>
                </span>
                <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingMedia ? 'Uploading...' : 'Select Photos'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={e => void handleImageFilesSelected(e.target.files)}
                  />
                </label>
              </div>
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {uploadedImages.map((url, idx) => (
                    <div key={`${url}-${idx}`} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
                      <img src={url} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-rose-600" />
                  <span>Inspection / Assay PDF</span>
                </span>
                <label className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold cursor-pointer flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={e => void handlePdfFileSelected(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
              {pdfUrl && (
                <div className="text-[11px] text-emerald-700 font-mono truncate">
                  Attached: {pdfUrl}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: INSTANT BUYER OFFER NOTIFICATION EMAIL */}
        <div className="bg-white rounded-2xl border border-amber-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-black text-slate-900">
                3. Instant Buyer Offer Alert Email (Counter-Offer / Accept Window)
              </h3>
            </div>
            <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={sendOfferEmail}
                onChange={e => setSendOfferEmail(e.target.checked)}
                className="w-4 h-4 accent-amber-600 rounded"
              />
              <span>Send Email Immediately on Publish</span>
            </label>
          </div>

          {sendOfferEmail && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Number of Buyers</label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={buyerOfferCount}
                  onChange={e => setBuyerOfferCount(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payment Offer Type</label>
                <input
                  type="text"
                  value={offerPaymentType}
                  onChange={e => setOfferPaymentType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-600" />
                  <span>Offer Expires In</span>
                </label>
                <input
                  type="text"
                  value={offerExpiryText}
                  onChange={e => setOfferExpiryText(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-bold focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Admin Copy Email</label>
                <input
                  type="email"
                  value={adminCopyEmail}
                  onChange={e => setAdminCopyEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block font-bold text-slate-700 mb-1">
                  Optional Custom Buyer Names (one per line — remaining rows auto-fill up to Buyer Count)
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional: paste specific buyer company names one per line..."
                  value={customBuyerNames}
                  onChange={e => setCustomBuyerNames(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 font-medium focus:bg-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingMedia}
          data-testid="studio-publish-submit-btn"
          className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Member, Listing &amp; Dispatching Email...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>
                Publish Member &amp; Product Live{sendOfferEmail ? ' + Send Offer Email Now' : ''}
              </span>
            </>
          )}
        </button>
      </form>

      {/* LIVE SELF-SERVICE STUDIO CATALOG LIST */}
      {recentCatalog.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Studio-Published Members &amp; Products ({recentCatalog.length})</span>
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentCatalog.map(item => (
              <div
                key={item.product?.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-3"
              >
                {item.product?.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-900 truncate">{item.company?.companyName}</div>
                  <div className="text-[11px] font-semibold text-blue-700 truncate">{item.product?.title}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {item.company?.contactEmail || item.company?.country} • {item.product?.moq} {item.product?.moqUnit}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
