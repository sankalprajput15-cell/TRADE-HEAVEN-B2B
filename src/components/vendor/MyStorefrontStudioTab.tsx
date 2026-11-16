import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AuthUser,
  Currency,
  Product,
  DetailedVendorProfile,
  ComplianceCertificate,
  FactoryTourImage,
  Incoterm,
  SupplierTier
} from '../../types';
import { CATEGORIES_TREE, CURRENCY_RATES } from '../../data/mockData';
import { SafeImage } from '../common/SafeImage';
import { VisualProductImagePicker } from '../common/VisualProductImagePicker';
import { MediaManagementStudio } from './MediaManagementStudio';
import { api } from '../../services/apiService';
import { bigrockApi } from '../../services/bigrockApi';
import { validateUploadFile, compressAndResizeImage } from '../../utils/fileUploadGuard';
import { validateMediaFile, fileToDataUrl, saveCustomVendorProfile } from '../../utils/mediaUploadUtils';
import { isManuallyUploadedImageUrl, ensureUniqueVerifiedProductImageForUpload } from '../../services/visualProductImageService';
import { productImageManagerService } from '../../services/productImageManagerService';
import {
  resolveUserStorefrontId,
  buildVendorProfileForUser,
  doesProductBelongToStorefront,
  getPublicStorefrontUrl
} from '../../utils/storefrontUtils';
import {
  Store,
  PlusCircle,
  Eye,
  Copy,
  Check,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  FileCheck,
  Factory,
  Upload,
  Loader2,
  X,
  Search,
  Save,
  Building2,
  Globe,
  CheckCircle2,
  AlertCircle,
  Layers,
  Share2
} from 'lucide-react';

export interface MyStorefrontStudioTabProps {
  currentUser: AuthUser | null;
  selectedCurrency: Currency;
  products: Product[];
  onProductCreated?: (product: Product, opts?: { stayInDashboard?: boolean; alreadySaved?: boolean }) => void;
  onProductUpdated?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
  onOpenStorefront: (companyId: string) => void;
  onOpenCreateRfq?: () => void;
  initialSection?: 'PRODUCTS' | 'BRANDING' | 'CERTIFICATES';
  openAddProductInitially?: boolean;
  onClearAddProductTrigger?: () => void;
}

const DEFAULT_CATEGORIES = Array.from(
  new Set([
    'Petroleum & Refined Fuels',
    'Heavy Equipment & Generators',
    'Mobile Cranes & Earthmoving',
    'Agriculture, Spices & Food Commodities',
    'Industrial Machinery & Automation',
    'Metals, Steel & Minerals',
    'Renewable Energy & Solar',
    'Chemicals, Polymers & Resins',
    'Construction, Hardware & Building Materials',
    'Automotive Parts & Transportation',
    'Electronics & Component PCB',
    'Medical, Healthcare & PPE',
    'Packaging, Printing & Paper',
    'Textiles, Fabrics & Apparel',
    ...CATEGORIES_TREE.map(c => c.name)
  ])
);

const ALL_INCOTERMS: Incoterm[] = ['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'FCA', 'DAP', 'TTO'];

export const MyStorefrontStudioTab: React.FC<MyStorefrontStudioTabProps> = ({
  currentUser,
  selectedCurrency,
  products: globalProducts,
  onProductCreated,
  onProductUpdated,
  onProductDeleted,
  onOpenStorefront,
  onOpenCreateRfq,
  initialSection = 'PRODUCTS',
  openAddProductInitially = false,
  onClearAddProductTrigger
}) => {
  const storefrontId = useMemo(() => resolveUserStorefrontId(currentUser), [currentUser]);
  const publicStorefrontUrl = useMemo(() => getPublicStorefrontUrl(storefrontId), [storefrontId]);

  const [section, setSection] = useState<'PRODUCTS' | 'BRANDING' | 'CERTIFICATES'>(initialSection);
  const [vendorProfile, setVendorProfile] = useState<DetailedVendorProfile>(() =>
    buildVendorProfileForUser(currentUser, storefrontId)
  );
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    window.setTimeout(() => setToast(null), 4000);
  };

  // Keep section synchronized when parent switches shortcut tabs
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  // Reload storefront profile when user or external studio edits change
  useEffect(() => {
    setVendorProfile(buildVendorProfileForUser(currentUser, storefrontId));
    const onUpdated = (e: Event) => {
      const custom = e as CustomEvent<{ companyId?: string; profile?: DetailedVendorProfile }>;
      if (!custom?.detail?.companyId || custom.detail.companyId === storefrontId) {
        setVendorProfile(buildVendorProfileForUser(currentUser, storefrontId));
      }
    };
    window.addEventListener('tradeheaven_vendor_profile_updated', onUpdated);
    return () => window.removeEventListener('tradeheaven_vendor_profile_updated', onUpdated);
  }, [currentUser, storefrontId]);

  // Currency formatting
  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) ||
    CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: converted < 10 ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  };

  // Filter live marketplace products belonging to this storefront
  const storefrontProducts = useMemo(() => {
    return (globalProducts || []).filter(p => doesProductBelongToStorefront(p, storefrontId, currentUser));
  }, [globalProducts, storefrontId, currentUser]);

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    return storefrontProducts.filter(p => {
      const q = productSearch.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q);
      const matchCat = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [storefrontProducts, productSearch, productCategoryFilter]);

  const existingCategories = useMemo(() => {
    return Array.from(new Set(storefrontProducts.map(p => p.category).filter(Boolean)));
  }, [storefrontProducts]);

  // ---------------------------------------------------------------------------
  // ADD PRODUCT MODAL STATE
  // ---------------------------------------------------------------------------
  const [isAddModalOpen, setIsAddModalOpen] = useState(openAddProductInitially);
  useEffect(() => {
    if (openAddProductInitially) {
      setIsAddModalOpen(true);
      onClearAddProductTrigger?.();
    }
  }, [openAddProductInitially, onClearAddProductTrigger]);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState(
    vendorProfile.id === 'comp-melissa-mpcommodity' ? 'Petroleum & Refined Fuels' : DEFAULT_CATEGORIES[0]
  );
  const [newPriceUsd, setNewPriceUsd] = useState('950');
  const [newPriceLabel, setNewPriceLabel] = useState('');
  const [newMoq, setNewMoq] = useState('100');
  const [newMoqUnit, setNewMoqUnit] = useState('Metric Tons');
  const [newPort, setNewPort] = useState(
    vendorProfile.portsOfDispatch?.[0] || `${vendorProfile.city}, ${vendorProfile.country}`
  );
  const [newLeadTime, setNewLeadTime] = useState('14');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newGallery, setNewGallery] = useState<string[]>([]);
  const [newHasManualImage, setNewHasManualImage] = useState(false);
  const [newAutoMatched, setNewAutoMatched] = useState(false);
  const [isUploadingNewImg, setIsUploadingNewImg] = useState(false);
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      showToast('Please enter a product title.', 'error');
      return;
    }

    setIsSubmittingNew(true);
    try {
      const manualOrPicked =
        newHasManualImage && newImageUrl.trim()
          ? [newImageUrl.trim(), ...newGallery.filter(u => u !== newImageUrl.trim())].slice(0, 4)
          : newGallery;

      const targetId = `prod-${Date.now()}`;
      let finalImages = manualOrPicked;
      if (finalImages.length === 0) {
        const existingOverrides = productImageManagerService.getState().overrides || {};
        const usedUrls = Object.values(existingOverrides)
          .map(o => o?.primary)
          .filter((u): u is string => Boolean(u));
        const resolved = await ensureUniqueVerifiedProductImageForUpload({
          productId: targetId,
          productName: newTitle.trim(),
          category: newCategory,
          specifications: newDescription.trim(),
          usedUrls
        });
        finalImages = resolved.gallery.length > 0 ? resolved.gallery : (resolved.primaryUrl ? [resolved.primaryUrl] : []);
      }

      const numericPrice = Math.max(0, parseFloat(newPriceUsd) || 0);
      const moqNum = Math.max(1, parseInt(newMoq, 10) || 1);
      const leadNum = Math.max(1, parseInt(newLeadTime, 10) || 14);

      const payload: Partial<Product> = {
        id: targetId,
        title: newTitle.trim(),
        category: newCategory,
        subCategory: newCategory,
        description:
          newDescription.trim() ||
          `Direct wholesale supply from ${vendorProfile.companyName} (${vendorProfile.city}, ${vendorProfile.country}).`,
        images: finalImages,
        moq: moqNum,
        moqUnit: newMoqUnit.trim() || 'Units',
        priceTiers: [{ minUnits: moqNum, priceUsd: numericPrice > 0 ? numericPrice : 100 }],
        priceRangeUsd: newPriceLabel.trim() || undefined,
        supportedIncoterms: (vendorProfile.supportedIncotermsList as Incoterm[]) || ['FOB', 'CIF'],
        portOfDispatch: newPort.trim() || vendorProfile.portsOfDispatch?.[0] || 'International Port',
        leadTimeDays: leadNum,
        supplierId: storefrontId,
        supplierName: vendorProfile.companyName,
        supplierCountry: vendorProfile.country || currentUser?.country || 'Global',
        supplierTier: (vendorProfile.tier as SupplierTier) || 'SILVER',
        supplierTrustScore: vendorProfile.trustScore || 95,
        specifications: [
          { name: 'Supplier', value: vendorProfile.companyName },
          { name: 'Payment Terms', value: vendorProfile.acceptedPaymentTerms?.[0] || 'Confirmed L/C or Escrow' },
          { name: 'Quality Standard', value: 'ISO 9001 & SGS Export Audited' }
        ]
      };

      const res = await api.createProduct(payload);
      const created = (res.data || payload) as Product;
      onProductCreated?.(created, { stayInDashboard: true, alreadySaved: true });

      setIsAddModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewPriceLabel('');
      setNewImageUrl('');
      setNewGallery([]);
      setNewHasManualImage(false);
      setNewAutoMatched(false);
      showToast(`Added "${created.title}" to your live storefront & global catalog.`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to publish product to storefront.', 'error');
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // ---------------------------------------------------------------------------
  // EDIT PRODUCT MODAL STATE
  // ---------------------------------------------------------------------------
  const [editingProd, setEditingProd] = useState<Product | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriceUsd, setEditPriceUsd] = useState('0');
  const [editPriceLabel, setEditPriceLabel] = useState('');
  const [editMoq, setEditMoq] = useState('1');
  const [editMoqUnit, setEditMoqUnit] = useState('Units');
  const [editPort, setEditPort] = useState('');
  const [editLeadTime, setEditLeadTime] = useState('14');
  const [editDescription, setEditDescription] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editHasManualImage, setEditHasManualImage] = useState(false);
  const [editAutoMatched, setEditAutoMatched] = useState(false);
  const [isUploadingEditImg, setIsUploadingEditImg] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const openEditProduct = (prod: Product) => {
    setEditingProd(prod);
    setEditTitle(prod.title);
    setEditCategory(prod.category);
    setEditPriceUsd(String(prod.priceTiers?.[0]?.priceUsd ?? prod.fobPriceUsd ?? 100));
    setEditPriceLabel(prod.priceRangeUsd || '');
    setEditMoq(String(prod.moq || 1));
    setEditMoqUnit(prod.moqUnit || 'Units');
    setEditPort(prod.portOfDispatch || '');
    setEditLeadTime(String(prod.leadTimeDays || 14));
    setEditDescription(prod.description || '');
    setEditImages(prod.images || []);
    setEditHasManualImage((prod.images || []).some(u => isManuallyUploadedImageUrl(u)));
    setEditAutoMatched(false);
  };

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProd) return;
    setIsSavingEdit(true);
    try {
      const numericPrice = Math.max(0, parseFloat(editPriceUsd) || 0);
      const moqNum = Math.max(1, parseInt(editMoq, 10) || 1);
      const leadNum = Math.max(1, parseInt(editLeadTime, 10) || 14);

      const updated: Product = {
        ...editingProd,
        supplierId: editingProd.supplierId || storefrontId,
        supplierName: editingProd.supplierName || vendorProfile.companyName,
        title: editTitle.trim() || editingProd.title,
        category: editCategory || editingProd.category,
        moq: moqNum,
        moqUnit: editMoqUnit.trim() || editingProd.moqUnit,
        portOfDispatch: editPort.trim() || editingProd.portOfDispatch,
        leadTimeDays: leadNum,
        description: editDescription.trim() || editingProd.description,
        priceRangeUsd: editPriceLabel.trim() || undefined,
        priceTiers: [
          { minUnits: moqNum, priceUsd: numericPrice > 0 ? numericPrice : 100 },
          ...(editingProd.priceTiers?.slice(1) || [])
        ],
        images: editImages.length > 0 ? editImages : editingProd.images
      };

      await api.updateProduct(updated.id, updated);
      onProductUpdated?.(updated);
      setEditingProd(null);
      showToast(`Updated "${updated.title}" on your storefront.`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to update product.', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Delete confirmation modal
  const [prodToDelete, setProdToDelete] = useState<Product | null>(null);
  const handleConfirmDelete = async () => {
    if (!prodToDelete) return;
    const target = prodToDelete;
    setProdToDelete(null);
    await api.deleteProduct(target.id);
    onProductDeleted?.(target.id);
    showToast(`Removed "${target.title}" from your storefront.`);
  };

  // ---------------------------------------------------------------------------
  // STOREFRONT BRANDING & PROFILE FORM STATE
  // ---------------------------------------------------------------------------
  const [brandCompanyName, setBrandCompanyName] = useState(vendorProfile.companyName);
  const [brandTagline, setBrandTagline] = useState(vendorProfile.tagline || '');
  const [brandDescription, setBrandDescription] = useState(vendorProfile.description || '');
  const [brandCity, setBrandCity] = useState(vendorProfile.city || '');
  const [brandCountry, setBrandCountry] = useState(vendorProfile.country || '');
  const [brandPhone, setBrandPhone] = useState(vendorProfile.contactPhone || vendorProfile.whatsapp || '');
  const [brandEmail, setBrandEmail] = useState(vendorProfile.contactEmail || currentUser?.email || '');
  const [brandPorts, setBrandPorts] = useState((vendorProfile.portsOfDispatch || []).join(', '));
  const [brandPaymentTerms, setBrandPaymentTerms] = useState((vendorProfile.acceptedPaymentTerms || []).join(', '));
  const [brandIncoterms, setBrandIncoterms] = useState<Incoterm[]>(
    (vendorProfile.supportedIncotermsList as Incoterm[]) || ['FOB', 'CIF']
  );
  const [brandLogoUrl, setBrandLogoUrl] = useState(vendorProfile.logoUrl || '');
  const [brandBannerUrl, setBrandBannerUrl] = useState(vendorProfile.bannerUrl || '');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBrandCompanyName(vendorProfile.companyName);
    setBrandTagline(vendorProfile.tagline || '');
    setBrandDescription(vendorProfile.description || '');
    setBrandCity(vendorProfile.city || '');
    setBrandCountry(vendorProfile.country || '');
    setBrandPhone(vendorProfile.contactPhone || vendorProfile.whatsapp || '');
    setBrandEmail(vendorProfile.contactEmail || currentUser?.email || '');
    setBrandPorts((vendorProfile.portsOfDispatch || []).join(', '));
    setBrandPaymentTerms((vendorProfile.acceptedPaymentTerms || []).join(', '));
    setBrandIncoterms((vendorProfile.supportedIncotermsList as Incoterm[]) || ['FOB', 'CIF']);
    setBrandLogoUrl(vendorProfile.logoUrl || '');
    setBrandBannerUrl(vendorProfile.bannerUrl || '');
  }, [vendorProfile, currentUser]);

  const handleUploadBrandingImage = async (file: File, target: 'LOGO' | 'BANNER') => {
    const check = validateMediaFile(file, target);
    if (!check.valid) {
      showToast(check.error || 'Invalid image file.', 'error');
      return;
    }
    try {
      const url = await fileToDataUrl(file);
      if (target === 'LOGO') {
        setBrandLogoUrl(url);
        showToast(`Company Logo updated (${check.formattedSize}). Click "Save Storefront Profile" to publish.`);
      } else {
        setBrandBannerUrl(url);
        showToast(`Storefront Banner updated (${check.formattedSize}). Click "Save Storefront Profile" to publish.`);
      }
    } catch {
      showToast('Failed to process uploaded image.', 'error');
    }
  };

  const handleToggleIncoterm = (term: Incoterm) => {
    setBrandIncoterms(prev => (prev.includes(term) ? prev.filter(t => t !== term) : [...prev, term]));
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    try {
      const portsArray = brandPorts
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
      const termsArray = brandPaymentTerms
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const updated: DetailedVendorProfile = {
        ...vendorProfile,
        id: storefrontId,
        companyName: brandCompanyName.trim() || vendorProfile.companyName,
        tradeName: brandCompanyName.trim() || vendorProfile.tradeName,
        tagline: brandTagline.trim(),
        description: brandDescription.trim(),
        city: brandCity.trim() || vendorProfile.city,
        country: brandCountry.trim() || vendorProfile.country,
        contactPhone: brandPhone.trim() || vendorProfile.contactPhone,
        whatsapp: brandPhone.trim() || vendorProfile.whatsapp,
        contactEmail: brandEmail.trim() || vendorProfile.contactEmail,
        portsOfDispatch: portsArray.length > 0 ? portsArray : vendorProfile.portsOfDispatch,
        acceptedPaymentTerms: termsArray.length > 0 ? termsArray : vendorProfile.acceptedPaymentTerms,
        supportedIncotermsList: brandIncoterms.length > 0 ? brandIncoterms : ['FOB', 'CIF'],
        logoUrl: brandLogoUrl || vendorProfile.logoUrl,
        bannerUrl: brandBannerUrl || vendorProfile.bannerUrl
      };

      saveCustomVendorProfile(updated);
      setVendorProfile(updated);

      if (currentUser?.id || currentUser?.email) {
        void bigrockApi.updateProfile({
          id: currentUser.id,
          email: currentUser.email,
          company_name: updated.companyName,
          country: updated.country,
          phone: updated.contactPhone
        }).catch(() => {});
      }

      showToast('Storefront branding, trade terms & company info saved live.');
    } finally {
      setIsSavingBranding(false);
    }
  };

  // ---------------------------------------------------------------------------
  // CERTIFICATES & FACTORY GALLERY STATE
  // ---------------------------------------------------------------------------
  const [isMediaStudioModalOpen, setIsMediaStudioModalOpen] = useState(false);
  const [certName, setCertName] = useState('');
  const [certNumber, setCertNumber] = useState('');
  const [certAuthority, setCertAuthority] = useState('');
  const certFileInputRef = useRef<HTMLInputElement>(null);

  const [tourTitle, setTourTitle] = useState('');
  const [tourDept, setTourDept] = useState('');
  const factoryInputRef = useRef<HTMLInputElement>(null);

  const handleQuickCertUpload = async (file: File) => {
    const check = validateMediaFile(file, 'CERTIFICATE');
    if (!check.valid) {
      showToast(check.error || 'Invalid certificate file.', 'error');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const newCert: ComplianceCertificate = {
        id: `cert-${Date.now()}`,
        name: certName.trim() || file.name.replace(/\.[^/.]+$/, ''),
        certificateNumber: certNumber.trim() || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        issuingAuthority: certAuthority.trim() || 'Accredited Audit Authority',
        category: 'QUALITY',
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: '2028-12-31',
        documentUrl: dataUrl,
        thumbnailUrl: isPdf
          ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80'
          : dataUrl,
        type: isPdf ? 'PDF' : 'IMAGE',
        verified: true
      };
      const updated: DetailedVendorProfile = {
        ...vendorProfile,
        complianceCertificates: [newCert, ...(vendorProfile.complianceCertificates || [])]
      };
      saveCustomVendorProfile(updated);
      setVendorProfile(updated);
      setCertName('');
      setCertNumber('');
      setCertAuthority('');
      showToast(`Certificate "${newCert.name}" added to your storefront.`);
    } catch {
      showToast('Failed to upload certificate.', 'error');
    }
  };

  const handleRemoveCertificate = (certId: string) => {
    const updated: DetailedVendorProfile = {
      ...vendorProfile,
      complianceCertificates: (vendorProfile.complianceCertificates || []).filter(c => c.id !== certId)
    };
    saveCustomVendorProfile(updated);
    setVendorProfile(updated);
    showToast('Certificate removed from storefront.');
  };

  const handleQuickFactoryPhoto = async (file: File) => {
    const check = validateMediaFile(file, 'FACTORY');
    if (!check.valid) {
      showToast(check.error || 'Invalid image.', 'error');
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      const newTour: FactoryTourImage = {
        id: `tour-${Date.now()}`,
        title: tourTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        department: tourDept.trim() || 'Facility & Operations',
        imageUrl: dataUrl,
        caption: 'Verified company operational facility & inspection site.'
      };
      const updated: DetailedVendorProfile = {
        ...vendorProfile,
        factoryDetails: {
          ...(vendorProfile.factoryDetails || { factorySizeSqM: 25000, productionLines: 6 }),
          tourGallery: [newTour, ...(vendorProfile.factoryDetails?.tourGallery || [])]
        }
      };
      saveCustomVendorProfile(updated);
      setVendorProfile(updated);
      setTourTitle('');
      setTourDept('');
      showToast(`Facility photo "${newTour.title}" added to storefront.`);
    } catch {
      showToast('Failed to upload photo.', 'error');
    }
  };

  const handleRemoveFactoryPhoto = (photoId: string) => {
    const updated: DetailedVendorProfile = {
      ...vendorProfile,
      factoryDetails: {
        ...(vendorProfile.factoryDetails || { factorySizeSqM: 25000, productionLines: 6 }),
        tourGallery: (vendorProfile.factoryDetails?.tourGallery || []).filter(t => t.id !== photoId)
      }
    };
    saveCustomVendorProfile(updated);
    setVendorProfile(updated);
    showToast('Facility photo removed.');
  };

  const handleCopyStorefrontLink = async () => {
    try {
      await navigator.clipboard.writeText(publicStorefrontUrl);
      setCopiedUrl(true);
      showToast('Public storefront link copied to clipboard.');
      window.setTimeout(() => setCopiedUrl(false), 2500);
    } catch {
      showToast('Share URL: ' + publicStorefrontUrl);
    }
  };

  return (
    <div id="my-storefront-studio-hub" className="space-y-5">
      {/* Inline Notification Banner */}
      {toast && (
        <div
          className={`px-4 py-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-slate-500 hover:text-slate-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Storefront Overview & 1-Click Actions Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
            <SafeImage
              src={vendorProfile.logoUrl}
              alt={vendorProfile.companyName}
              type="logo"
              isThumbnail
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
              <span className="font-semibold text-blue-700 flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                My Storefront Workspace
              </span>
              <span aria-hidden="true">·</span>
              <span>{vendorProfile.city}, {vendorProfile.country}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums text-slate-600">{storefrontProducts.length} Live Listings</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate">
              {vendorProfile.companyName}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="font-mono truncate max-w-xs sm:max-w-md">{publicStorefrontUrl}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Add Product to Storefront</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenStorefront(storefrontId)}
            className="h-9 px-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Preview Public Storefront</span>
          </button>

          <button
            type="button"
            onClick={handleCopyStorefrontLink}
            className="h-9 px-3.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            {copiedUrl ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            )}
            <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
          </button>

          {onOpenCreateRfq && (
            <button
              type="button"
              onClick={onOpenCreateRfq}
              className="h-9 px-3.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Post Buy RFQ</span>
            </button>
          )}
        </div>
      </div>

      {/* Storefront Sub-Navigation */}
      <div className="bg-white border border-slate-200 rounded-xl p-1.5 overflow-x-auto no-scrollbar">
        <div className="flex items-center justify-between gap-2 min-w-max">
          <div className="flex items-center gap-1">
            {[
              { id: 'PRODUCTS' as const, label: `Storefront Products (${storefrontProducts.length})`, icon: Package },
              { id: 'BRANDING' as const, label: 'Branding, Logo & Company Info', icon: Building2 },
              { id: 'CERTIFICATES' as const, label: 'Certificates & Facility Media', icon: FileCheck }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = section === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSection(tab.id)}
                  className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent('tradeheaven_open_share', {
                  detail: {
                    type: 'STOREFRONT',
                    id: storefrontId,
                    title: vendorProfile.companyName,
                    subtitle: `${vendorProfile.city}, ${vendorProfile.country}`
                  }
                })
              );
            }}
            className="h-9 px-3 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Storefront</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* SECTION 1: STOREFRONT PRODUCTS                                        */}
      {/* ===================================================================== */}
      {section === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                placeholder="Search your storefront listings..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              {existingCategories.length > 0 && (
                <select
                  value={productCategoryFilter}
                  onChange={e => setProductCategoryFilter(e.target.value)}
                  className="h-9 bg-slate-50 border border-slate-200 rounded-lg px-2.5 text-xs font-medium text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Categories ({storefrontProducts.length})</option>
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="h-9 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
              <Package className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">
                {storefrontProducts.length === 0
                  ? 'No Products Listed on Your Storefront Yet'
                  : 'No Products Match Your Search'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add your wholesale commodities, industrial equipment, or finished goods here so verified global buyers can discover your storefront and request quotes.
              </p>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add First Product to Storefront</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(prod => {
                const unitPrice = prod.priceTiers?.[0]?.priceUsd ?? prod.fobPriceUsd ?? 0;
                const hasCustomPriceLabel = Boolean(prod.priceRangeUsd && prod.priceRangeUsd.trim());
                return (
                  <div
                    key={prod.id}
                    className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="relative h-44 bg-slate-100 overflow-hidden border-b border-slate-100">
                        <SafeImage
                          src={prod.images?.[0]}
                          alt={prod.title}
                          productId={prod.id}
                          productTitle={prod.title}
                          category={prod.category}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-4 space-y-2">
                        <div className="text-[11px] font-semibold text-blue-700 truncate">
                          {prod.category}
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {prod.title}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap tabular-nums">
                          <span>MOQ: {prod.moq} {prod.moqUnit}</span>
                          <span aria-hidden="true">·</span>
                          <span>Lead: {prod.leadTimeDays}d</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate max-w-[140px]">{prod.portOfDispatch}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase">Price</div>
                        <div className="text-sm font-bold text-slate-900 tabular-nums truncate">
                          {hasCustomPriceLabel ? prod.priceRangeUsd : `${formatPrice(unitPrice)} / ${prod.moqUnit}`}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditProduct(prod)}
                          className="h-8 px-2.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Edit product details & image"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setProdToDelete(prod)}
                          className="h-8 w-8 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 flex items-center justify-center cursor-pointer"
                          title="Remove listing from storefront"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SECTION 2: STOREFRONT BRANDING, LOGO, BANNER & COMPANY INFO           */}
      {/* ===================================================================== */}
      {section === 'BRANDING' && (
        <form onSubmit={handleSaveBranding} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Storefront Branding, Trade Terms &amp; Company Profile
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Customize how buyers see your company header, logo, cover banner, accepted payment terms, and dispatch ports.
              </p>
            </div>
            <button
              type="submit"
              disabled={isSavingBranding}
              className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingBranding ? 'Saving...' : 'Save Storefront Profile'}</span>
            </button>
          </div>

          {/* Banner & Logo Uploaders */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                16:9 Storefront Cover Banner
              </label>
              <div className="relative h-44 rounded-xl border border-dashed border-slate-300 bg-slate-100 overflow-hidden group">
                {brandBannerUrl ? (
                  <img
                    src={brandBannerUrl}
                    alt="Storefront Banner Preview"
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-slate-950/45 flex flex-col items-center justify-center p-4 text-white text-center">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="h-9 px-3.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Cover Banner</span>
                  </button>
                  <span className="text-[11px] text-slate-200 mt-1.5">JPG, PNG, WebP up to 5MB</span>
                </div>
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadBrandingImage(f, 'BANNER');
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Company Logo (1:1)
              </label>
              <div className="h-44 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 flex flex-col items-center justify-center text-center gap-2.5">
                <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <SafeImage
                    src={brandLogoUrl}
                    alt="Company Logo Preview"
                    type="logo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="h-8 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Upload Logo</span>
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadBrandingImage(f, 'LOGO');
                    e.target.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Company / Storefront Name *</label>
              <input
                type="text"
                required
                value={brandCompanyName}
                onChange={e => setBrandCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Tagline / Specialty Headline</label>
              <input
                type="text"
                value={brandTagline}
                onChange={e => setBrandTagline(e.target.value)}
                placeholder="e.g. Verified Bulk Commodity & Industrial Equipment Supplier"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="block font-semibold text-slate-700">About Company &amp; Export Capabilities</label>
              <textarea
                rows={3}
                value={brandDescription}
                onChange={e => setBrandDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">City</label>
              <input
                type="text"
                value={brandCity}
                onChange={e => setBrandCity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Country</label>
              <input
                type="text"
                value={brandCountry}
                onChange={e => setBrandCountry(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Contact Phone / WhatsApp</label>
              <input
                type="text"
                value={brandPhone}
                onChange={e => setBrandPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Public Inquiry Email</label>
              <input
                type="email"
                value={brandEmail}
                onChange={e => setBrandEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Dispatch Ports (comma separated)</label>
              <input
                type="text"
                value={brandPorts}
                onChange={e => setBrandPorts(e.target.value)}
                placeholder="e.g. Port of Sydney, Port of Houston, Rotterdam"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-slate-700">Accepted Payment Terms (comma separated)</label>
              <input
                type="text"
                value={brandPaymentTerms}
                onChange={e => setBrandPaymentTerms(e.target.value)}
                placeholder="e.g. SBLC Only, L/C at Sight, Trade Protection Escrow"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block font-semibold text-slate-700">Supported Incoterms</label>
              <div className="flex flex-wrap gap-2">
                {ALL_INCOTERMS.map(term => {
                  const selected = brandIncoterms.includes(term);
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleToggleIncoterm(term)}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => onOpenStorefront(storefrontId)}
              className="h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Live Storefront</span>
            </button>

            <button
              type="submit"
              disabled={isSavingBranding}
              className="h-9 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingBranding ? 'Saving Changes...' : 'Save & Publish Storefront Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ===================================================================== */}
      {/* SECTION 3: CERTIFICATES & FACILITY PHOTOS                             */}
      {/* ===================================================================== */}
      {section === 'CERTIFICATES' && (
        <div className="space-y-5">
          {/* Upload Compliance Certificate */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Compliance &amp; Registration Certificates ({(vendorProfile.complianceCertificates || []).length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add ISO, ASIC/EIN business registration, SGS, or export licenses to boost buyer trust.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaStudioModalOpen(true)}
                className="h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap self-start"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Advanced Media Studio</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                value={certName}
                onChange={e => setCertName(e.target.value)}
                placeholder="Certificate Name (e.g. ISO 9001:2015)"
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                value={certNumber}
                onChange={e => setCertNumber(e.target.value)}
                placeholder="License / Registration No."
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={certAuthority}
                  onChange={e => setCertAuthority(e.target.value)}
                  placeholder="Issuing Body (e.g. SGS / ASIC)"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => certFileInputRef.current?.click()}
                  className="h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                </button>
                <input
                  ref={certFileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) void handleQuickCertUpload(f);
                    e.target.value = '';
                  }}
                />
              </div>
            </div>

            {(vendorProfile.complianceCertificates || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {(vendorProfile.complianceCertificates || []).map(cert => (
                  <div key={cert.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={cert.thumbnailUrl || cert.documentUrl}
                        alt={cert.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{cert.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{cert.certificateNumber}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCertificate(cert.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                      title="Remove certificate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Factory / Operations Photos */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Factory className="w-4 h-4 text-blue-600" />
                Facility &amp; Warehouse Tour Photos ({(vendorProfile.factoryDetails?.tourGallery || []).length})
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload photos of your warehouse, terminal, production floor, or inspection operations.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <input
                type="text"
                value={tourTitle}
                onChange={e => setTourTitle(e.target.value)}
                placeholder="Station / Site Title"
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                value={tourDept}
                onChange={e => setTourDept(e.target.value)}
                placeholder="Department / Location"
                className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none"
              />
              <button
                type="button"
                onClick={() => factoryInputRef.current?.click()}
                className="h-9 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Upload Facility Photo</span>
              </button>
              <input
                ref={factoryInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                className="hidden"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) void handleQuickFactoryPhoto(f);
                  e.target.value = '';
                }}
              />
            </div>

            {(vendorProfile.factoryDetails?.tourGallery || []).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                {(vendorProfile.factoryDetails?.tourGallery || []).map(img => (
                  <div key={img.id} className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex flex-col">
                    <div className="h-32 bg-slate-200 overflow-hidden">
                      <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">{img.title}</div>
                        <div className="text-[11px] text-slate-500 truncate">{img.department}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFactoryPhoto(img.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer shrink-0"
                        title="Remove photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: ADD PRODUCT TO STOREFRONT                                      */}
      {/* ===================================================================== */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setIsAddModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Add Product to Your Storefront</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publishes directly to {vendorProfile.companyName}&apos;s public storefront &amp; marketplace catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. EN590 10PPM Ultra-Low Sulfur Diesel / Bulk Commodity"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  >
                    {DEFAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">FOB Dispatch Port / Origin</label>
                  <input
                    type="text"
                    value={newPort}
                    onChange={e => setNewPort(e.target.value)}
                    placeholder="e.g. Port of Sydney / Rotterdam / Houston"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Unit Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newPriceUsd}
                    onChange={e => setNewPriceUsd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Or Custom Price Label</label>
                  <input
                    type="text"
                    value={newPriceLabel}
                    onChange={e => setNewPriceLabel(e.target.value)}
                    placeholder="e.g. As per Platts"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">MOQ Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newMoq}
                    onChange={e => setNewMoq(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Unit (e.g. MT, Units)</label>
                  <input
                    type="text"
                    value={newMoqUnit}
                    onChange={e => setNewMoqUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-800 mb-1">Product Description &amp; Specifications</label>
                  <textarea
                    rows={2}
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    placeholder="Key grades, purity specs, packaging, certifications, and delivery terms..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium resize-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLeadTime}
                    onChange={e => setNewLeadTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-800">
                  Product Photo (Upload, Paste URL, or Pick Automatically)
                </label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <label className="h-9 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap">
                    {isUploadingNewImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingNewImg ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingNewImg}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const check = validateUploadFile(file, 'IMAGE');
                        if (!check.valid) {
                          showToast(check.error || 'Invalid image.', 'error');
                          e.target.value = '';
                          return;
                        }
                        setIsUploadingNewImg(true);
                        try {
                          const compressed = await compressAndResizeImage(file);
                          setNewImageUrl(compressed.dataUrl);
                          setNewHasManualImage(true);
                          setNewAutoMatched(false);
                          const uploaded = await bigrockApi.uploadFile(file, 'listings');
                          if (uploaded.success && uploaded.publicUrl) {
                            setNewImageUrl(uploaded.publicUrl);
                          }
                        } catch (err: any) {
                          showToast(err?.message || 'Upload failed.', 'error');
                        } finally {
                          setIsUploadingNewImg(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={e => {
                      const val = e.target.value;
                      setNewImageUrl(val);
                      setNewHasManualImage(isManuallyUploadedImageUrl(val));
                      if (val.trim()) setNewAutoMatched(false);
                    }}
                    placeholder="https://... (optional — auto-matched if empty)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>

                <VisualProductImagePicker
                  productName={newTitle}
                  category={newCategory}
                  hasManualImage={newHasManualImage}
                  selectedImages={newHasManualImage && newImageUrl.trim() ? [newImageUrl.trim()] : newGallery}
                  isAutoMatched={!newHasManualImage && newAutoMatched}
                  maxSelect={4}
                  compact
                  onSelectImages={(urls, isAuto) => {
                    setNewGallery(urls);
                    setNewAutoMatched(isAuto);
                    if (urls.length > 0 && newHasManualImage) {
                      setNewImageUrl('');
                      setNewHasManualImage(false);
                    }
                  }}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-9 px-4 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{isSubmittingNew ? 'Publishing...' : 'Publish to Storefront'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: EDIT STOREFRONT PRODUCT                                        */}
      {/* ===================================================================== */}
      {editingProd && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setEditingProd(null);
          }}
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92dvh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-bold text-base">Edit Storefront Product</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{editingProd.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProd(null)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="p-5 sm:p-6 space-y-4 text-xs text-slate-700 overflow-y-auto flex-1">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Category</label>
                  <select
                    value={editCategory}
                    onChange={e => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  >
                    {Array.from(new Set([editCategory, ...DEFAULT_CATEGORIES])).filter(Boolean).map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Dispatch Port</label>
                  <input
                    type="text"
                    value={editPort}
                    onChange={e => setEditPort(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Unit Price (USD)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editPriceUsd}
                    onChange={e => setEditPriceUsd(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Custom Price Label</label>
                  <input
                    type="text"
                    value={editPriceLabel}
                    onChange={e => setEditPriceLabel(e.target.value)}
                    placeholder="e.g. As per Platts"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">MOQ</label>
                  <input
                    type="number"
                    min="1"
                    value={editMoq}
                    onChange={e => setEditMoq(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={editLeadTime}
                    onChange={e => setEditLeadTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-slate-800">Product Image</label>
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                  <label className="h-9 px-3 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold border border-blue-200 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap">
                    {isUploadingEditImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    <span>{isUploadingEditImg ? 'Uploading...' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingEditImg}
                      onChange={async e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const check = validateUploadFile(file, 'IMAGE');
                        if (!check.valid) {
                          showToast(check.error || 'Invalid image.', 'error');
                          e.target.value = '';
                          return;
                        }
                        setIsUploadingEditImg(true);
                        try {
                          const compressed = await compressAndResizeImage(file);
                          setEditImages(prev => [compressed.dataUrl, ...prev.slice(0, 3)]);
                          setEditHasManualImage(true);
                          setEditAutoMatched(false);
                          const uploaded = await bigrockApi.uploadFile(file, 'listings');
                          if (uploaded.success && uploaded.publicUrl) {
                            setEditImages(prev => [uploaded.publicUrl!, ...prev.slice(1)]);
                          }
                        } catch (err: any) {
                          showToast(err?.message || 'Upload failed.', 'error');
                        } finally {
                          setIsUploadingEditImg(false);
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={editImages[0] || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setEditImages(val.trim() ? [val.trim(), ...editImages.slice(1)] : []);
                      setEditHasManualImage(isManuallyUploadedImageUrl(val));
                      if (val.trim()) setEditAutoMatched(false);
                    }}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 outline-none text-slate-900 font-medium"
                  />
                </div>

                <VisualProductImagePicker
                  productName={editTitle}
                  category={editCategory}
                  hasManualImage={editHasManualImage}
                  selectedImages={editImages}
                  isAutoMatched={!editHasManualImage && editAutoMatched}
                  maxSelect={4}
                  compact
                  onSelectImages={(urls, isAuto) => {
                    setEditImages(urls);
                    setEditAutoMatched(isAuto);
                    if (urls.length > 0 && editHasManualImage) {
                      setEditHasManualImage(false);
                    }
                  }}
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProd(null)}
                  className="h-9 px-4 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: CONFIRM DELETE PRODUCT                                         */}
      {/* ===================================================================== */}
      {prodToDelete && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={e => {
            if (e.target === e.currentTarget) setProdToDelete(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Remove Product from Storefront?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">&quot;{prodToDelete.title}&quot;</strong> from your storefront catalog?
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setProdToDelete(null)}
                className="h-9 px-4 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                className="h-9 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FULL MEDIA STUDIO MODAL (Advanced JSON & Reordering)                  */}
      {/* ===================================================================== */}
      {isMediaStudioModalOpen && (
        <MediaManagementStudio
          isOpen={isMediaStudioModalOpen}
          onClose={() => setIsMediaStudioModalOpen(false)}
          vendorProfile={vendorProfile}
          products={storefrontProducts}
          onSaveProfile={updated => {
            setVendorProfile(updated);
            showToast('Media Studio changes saved to storefront.');
          }}
        />
      )}
    </div>
  );
};

export default MyStorefrontStudioTab;
