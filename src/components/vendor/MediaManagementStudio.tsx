import React, { useState, useRef, useEffect } from 'react';
import { 
  DetailedVendorProfile, 
  ComplianceCertificate, 
  FactoryTourImage,
  Product
} from '../../types';
import { 
  validateMediaFile, 
  fileToDataUrl, 
  reorderArray,
  formatBytes,
  saveCustomVendorProfile
} from '../../utils/mediaUploadUtils';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Check, 
  AlertCircle, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Plus, 
  Save, 
  Download, 
  ShieldCheck, 
  Factory, 
  RefreshCw,
  FolderOpen,
  Layers,
  FileCheck,
  Building2
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vendorProfile: DetailedVendorProfile;
  products: Product[];
  onSaveProfile: (updatedProfile: DetailedVendorProfile) => void;
}

export const MediaManagementStudio: React.FC<Props> = ({
  isOpen,
  onClose,
  vendorProfile,
  products,
  onSaveProfile
}) => {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'CERTIFICATES' | 'FACTORY_QA' | 'PRODUCT_GALLERY' | 'JSON_EXCHANGE'>('BRANDING');
  
  // Local state for media elements
  const [logoUrl, setLogoUrl] = useState(vendorProfile.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(vendorProfile.bannerUrl);
  const [tagline, setTagline] = useState(vendorProfile.tagline || '');
  const [description, setDescription] = useState(vendorProfile.description || '');
  
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>(
    vendorProfile.complianceCertificates || []
  );

  const [tourGallery, setTourGallery] = useState<FactoryTourImage[]>(
    vendorProfile.factoryDetails?.tourGallery || []
  );

  // New certificate inputs
  const [newCertName, setNewCertName] = useState('');
  const [newCertNumber, setNewCertNumber] = useState('');
  const [newCertAuthority, setNewCertAuthority] = useState('');
  const [newCertCategory, setNewCertCategory] = useState<'QUALITY' | 'SAFETY' | 'REGISTRATION' | 'FOOD_AGRICULTURE'>('QUALITY');
  const [newCertExpiry, setNewCertExpiry] = useState('2027-12-31');

  // New factory photo inputs
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourDept, setNewTourDept] = useState('');
  const [newTourCaption, setNewTourCaption] = useState('');

  // Status & Feedback
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<string | null>(null);

  // File Input Refs
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const certFileInputRef = useRef<HTMLInputElement>(null);
  const factoryFileInputRef = useRef<HTMLInputElement>(null);
  const jsonImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vendorProfile) {
      setLogoUrl(vendorProfile.logoUrl);
      setBannerUrl(vendorProfile.bannerUrl);
      setTagline(vendorProfile.tagline || '');
      setDescription(vendorProfile.description || '');
      setCertificates(vendorProfile.complianceCertificates || []);
      setTourGallery(vendorProfile.factoryDetails?.tourGallery || []);
    }
  }, [vendorProfile]);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  // Generic File Upload Handler
  const handleSingleFileUpload = async (
    file: File,
    category: 'LOGO' | 'BANNER'
  ) => {
    clearMessages();
    const validation = validateMediaFile(file, category);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      if (category === 'LOGO') {
        setLogoUrl(dataUrl);
        setSuccessMessage(`Company Logo updated successfully (${validation.formattedSize})`);
      } else {
        setBannerUrl(dataUrl);
        setSuccessMessage(`Cover Banner updated successfully (${validation.formattedSize})`);
      }
    } catch (err) {
      setErrorMessage('Failed to read and process image file.');
    }
  };

  // Upload New Certificate
  const handleUploadCertificate = async (file: File) => {
    clearMessages();
    const validation = validateMediaFile(file, 'CERTIFICATE');
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid certificate file.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      const newCert: ComplianceCertificate = {
        id: `cert-${Date.now()}`,
        name: newCertName.trim() || file.name.replace(/\.[^/.]+$/, ''),
        certificateNumber: newCertNumber.trim() || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
        issuingAuthority: newCertAuthority.trim() || 'Global Accreditation Board',
        category: newCertCategory,
        issueDate: new Date().toISOString().split('T')[0],
        expiryDate: newCertExpiry || '2027-12-31',
        documentUrl: dataUrl,
        thumbnailUrl: isPdf ? 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80' : dataUrl,
        type: isPdf ? 'PDF' : 'IMAGE',
        verified: true,
        fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2))
      };

      setCertificates(prev => [newCert, ...prev]);
      setNewCertName('');
      setNewCertNumber('');
      setNewCertAuthority('');
      setSuccessMessage(`Compliance Certificate "${newCert.name}" added successfully.`);
    } catch (err) {
      setErrorMessage('Failed to process certificate file.');
    }
  };

  // Upload New Factory Photo
  const handleUploadFactoryPhoto = async (file: File) => {
    clearMessages();
    const validation = validateMediaFile(file, 'FACTORY');
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid factory image.');
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      const newImage: FactoryTourImage = {
        id: `tour-${Date.now()}`,
        title: newTourTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
        department: newTourDept.trim() || 'Manufacturing & Assembly Bay',
        imageUrl: dataUrl,
        caption: newTourCaption.trim() || 'Automated production and precision quality control unit.'
      };

      setTourGallery(prev => [newImage, ...prev]);
      setNewTourTitle('');
      setNewTourDept('');
      setNewTourCaption('');
      setSuccessMessage(`Factory tour image added successfully.`);
    } catch (err) {
      setErrorMessage('Failed to process factory photo.');
    }
  };

  // Reordering Helpers
  const moveItem = <T,>(list: T[], index: number, direction: 'UP' | 'DOWN', setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const updated = reorderArray(list, index, targetIndex);
    setter(updated);
  };

  // Save All Changes to Profile
  const handleSaveChanges = () => {
    const updated: DetailedVendorProfile = {
      ...vendorProfile,
      logoUrl,
      bannerUrl,
      tagline,
      description,
      complianceCertificates: certificates,
      factoryDetails: {
        ...(vendorProfile.factoryDetails || { factorySizeSqM: 35000, productionLines: 8 }),
        tourGallery: tourGallery
      }
    };

    saveCustomVendorProfile(updated);
    onSaveProfile(updated);
    setSuccessMessage('Vendor Profile & Media Assets saved and synced live!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  // Export as JSON Schema
  const handleExportJson = () => {
    const dataToExport = {
      ...vendorProfile,
      logoUrl,
      bannerUrl,
      tagline,
      description,
      complianceCertificates: certificates,
      factoryDetails: {
        ...(vendorProfile.factoryDetails || {}),
        tourGallery: tourGallery
      },
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${vendorProfile.companyName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_profile.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('Profile JSON schema exported successfully.');
  };

  // Import JSON Schema
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.companyName || parsed.id)) {
          if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
          if (parsed.bannerUrl) setBannerUrl(parsed.bannerUrl);
          if (parsed.tagline) setTagline(parsed.tagline);
          if (parsed.description) setDescription(parsed.description);
          if (Array.isArray(parsed.complianceCertificates)) setCertificates(parsed.complianceCertificates);
          if (parsed.factoryDetails?.tourGallery) setTourGallery(parsed.factoryDetails.tourGallery);
          
          setSuccessMessage('Profile and media assets imported successfully from JSON.');
        } else {
          setErrorMessage('Invalid profile JSON structure.');
        }
      } catch (err) {
        setErrorMessage('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl sm:rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl relative text-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Vendor Media &amp; Profile Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-300">
                  Live Management
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Upload 1:1 logos, 16:9 banners, ISO/CE/FDA certificates, and factory QA photos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveChanges}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Apply &amp; Save Live</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
              title="Close Studio"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-800 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shrink-0 animate-in slide-in-from-top-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="flex-1">{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Studio Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-white overflow-x-auto no-scrollbar gap-1 pt-2 shrink-0">
          <button
            onClick={() => { setActiveTab('BRANDING'); clearMessages(); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'BRANDING'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Logo &amp; Cover Banner</span>
          </button>

          <button
            onClick={() => { setActiveTab('CERTIFICATES'); clearMessages(); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'CERTIFICATES'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ISO &amp; Compliance Certificates ({certificates.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('FACTORY_QA'); clearMessages(); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'FACTORY_QA'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Factory className="w-3.5 h-3.5" />
            <span>Factory &amp; QC Tour Photos ({tourGallery.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('JSON_EXCHANGE'); clearMessages(); }}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'JSON_EXCHANGE'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>JSON Schema Import/Export</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: BRANDING (LOGO & BANNER) */}
          {activeTab === 'BRANDING' && (
            <div className="space-y-6">
              {/* Cover Banner Dropzone */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Cover Banner (16:9 Aspect Ratio, Max 5MB)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    JPG, PNG, WebP supported
                  </span>
                </div>

                <div 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging('BANNER'); }}
                  onDragLeave={() => setIsDragging(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(null);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleSingleFileUpload(file, 'BANNER');
                  }}
                  className={`relative h-48 sm:h-56 w-full rounded-2xl border-2 border-dashed overflow-hidden transition-all flex flex-col items-center justify-center group ${
                    isDragging === 'BANNER' 
                      ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-100' 
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  {bannerUrl && bannerUrl.trim() ? (
                    <img
                      src={bannerUrl.trim()}
                      alt="Cover Banner Preview"
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-800 flex items-center justify-center">
                      <Building2 className="w-12 h-12 text-slate-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 group-hover:bg-slate-950/60 transition-colors flex flex-col items-center justify-center p-4 text-white text-center">
                    <Upload className="w-8 h-8 mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                    <p className="text-xs font-bold">
                      Drag &amp; drop new 16:9 banner image here
                    </p>
                    <p className="text-[11px] text-slate-200 mt-0.5">
                      or click to browse local files
                    </p>
                    <button
                      type="button"
                      onClick={() => bannerInputRef.current?.click()}
                      className="mt-3 px-4 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-900 font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      Browse Banner File
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleSingleFileUpload(file, 'BANNER');
                    }}
                  />
                </div>
              </div>

              {/* Logo & Quick Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                {/* 1:1 Logo Dropzone */}
                <div className="md:col-span-4 space-y-2">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    Company Logo (1:1 Ratio)
                  </label>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging('LOGO'); }}
                    onDragLeave={() => setIsDragging(null)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(null);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleSingleFileUpload(file, 'LOGO');
                    }}
                    className={`h-40 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center relative overflow-hidden transition-all ${
                      isDragging === 'LOGO'
                        ? 'border-blue-500 bg-blue-50/50'
                        : 'border-slate-300 bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    {logoUrl && logoUrl.trim() ? (
                      <img
                        src={logoUrl.trim()}
                        alt="Logo Preview"
                        referrerPolicy="no-referrer"
                        className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-md mb-2 bg-white"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl border border-slate-200 bg-white flex items-center justify-center mb-2 text-slate-400 shadow-sm">
                        <Building2 className="w-8 h-8" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 underline cursor-pointer"
                    >
                      Upload New Logo (Max 5MB)
                    </button>
                    <input
                      type="file"
                      ref={logoInputRef}
                      accept=".jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSingleFileUpload(file, 'LOGO');
                      }}
                    />
                  </div>
                </div>

                {/* Company Tagline & Summary */}
                <div className="md:col-span-8 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Company Tagline / Core Manufacturing Specialty
                    </label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Aerospace-Grade Precision Forged Alloy Wheels & Turbochargers"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Company Bio &amp; Export Mission Overview
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Detail manufacturing capabilities, primary facilities, and export markets..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPLIANCE CERTIFICATES */}
          {activeTab === 'CERTIFICATES' && (
            <div className="space-y-6">
              {/* Add New Certificate Upload Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  Upload New ISO / CE / FDA / Quality Certificate (PDF, JPG, PNG - Max 10MB)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Certificate Name</label>
                    <input
                      type="text"
                      value={newCertName}
                      onChange={(e) => setNewCertName(e.target.value)}
                      placeholder="e.g. IATF 16949:2016"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Certificate Number</label>
                    <input
                      type="text"
                      value={newCertNumber}
                      onChange={(e) => setNewCertNumber(e.target.value)}
                      placeholder="e.g. IATF-US-0482910"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Issuing Authority</label>
                    <input
                      type="text"
                      value={newCertAuthority}
                      onChange={(e) => setNewCertAuthority(e.target.value)}
                      placeholder="e.g. TÜV SÜD / SGS"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Category</label>
                    <select
                      value={newCertCategory}
                      onChange={(e) => setNewCertCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                    >
                      <option value="QUALITY">Quality Management (ISO/IATF)</option>
                      <option value="SAFETY">Safety &amp; Conformity (CE/UL)</option>
                      <option value="REGISTRATION">Business Registration</option>
                      <option value="FOOD_AGRICULTURE">Food / Agriculture / Halal</option>
                    </select>
                  </div>
                </div>

                {/* Upload Button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Max size: 10MB. Document will be verified and displayed with interactive lightbox.
                  </span>
                  <button
                    type="button"
                    onClick={() => certFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Certificate File (.pdf, .jpg, .png)</span>
                  </button>
                  <input
                    type="file"
                    ref={certFileInputRef}
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadCertificate(file);
                    }}
                  />
                </div>
              </div>

              {/* Current Certificates Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Active Trust &amp; Compliance Certificates ({certificates.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {certificates.map((cert, index) => (
                    <div
                      key={cert.id || index}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="relative h-32 rounded-xl overflow-hidden bg-slate-100 mb-3 border border-slate-100">
                          <img
                            src={cert.thumbnailUrl || cert.documentUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400'}
                            alt={cert.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase shadow-xs flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Verified
                          </div>
                          <button
                            onClick={() => setPreviewModalUrl(cert.documentUrl)}
                            className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 text-xs shadow-md cursor-pointer"
                            title="View Full Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="font-bold text-xs text-slate-900 line-clamp-2">
                          {cert.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          No: {cert.certificateNumber}
                        </div>
                        <div className="text-[10px] text-slate-600 mt-0.5">
                          Issuer: <strong>{cert.issuingAuthority}</strong>
                        </div>
                      </div>

                      {/* Management Controls (Move Up, Down, Delete) */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            disabled={index === 0}
                            onClick={() => moveItem(certificates, index, 'UP', setCertificates)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            disabled={index === certificates.length - 1}
                            onClick={() => moveItem(certificates, index, 'DOWN', setCertificates)}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            setCertificates(prev => prev.filter((_, i) => i !== index));
                            setSuccessMessage(`Certificate "${cert.name}" removed.`);
                          }}
                          className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                          title="Delete Certificate"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-bold">Remove</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FACTORY & QC PHOTOS */}
          {activeTab === 'FACTORY_QA' && (
            <div className="space-y-6">
              {/* Upload Factory Photo Form */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Factory className="w-4 h-4 text-blue-600" />
                  Add Production Floor &amp; QA Testing Lab Photos
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Station / Bay Title</label>
                    <input
                      type="text"
                      value={newTourTitle}
                      onChange={(e) => setNewTourTitle(e.target.value)}
                      placeholder="e.g. 5-Axis CNC Precision Milling Bay"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Department</label>
                    <input
                      type="text"
                      value={newTourDept}
                      onChange={(e) => setNewTourDept(e.target.value)}
                      placeholder="e.g. Machining &amp; Metrology"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Equipment / QA Caption</label>
                    <input
                      type="text"
                      value={newTourCaption}
                      onChange={(e) => setNewTourCaption(e.target.value)}
                      placeholder="e.g. DMG MORI 5-axis high-speed milling"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">
                    Max size: 5MB per photo. Helps international buyers verify factory scale.
                  </span>
                  <button
                    type="button"
                    onClick={() => factoryFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Factory Image</span>
                  </button>
                  <input
                    type="file"
                    ref={factoryFileInputRef}
                    accept=".jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadFactoryPhoto(file);
                    }}
                  />
                </div>
              </div>

              {/* Factory Photos Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {tourGallery.map((img, index) => (
                  <div
                    key={img.id || index}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-all space-y-2 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-36 rounded-xl overflow-hidden bg-slate-100 mb-2 border border-slate-100">
                        <img
                          src={img.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600'}
                          alt={img.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setPreviewModalUrl(img.imageUrl)}
                          className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-900 text-xs shadow-md cursor-pointer"
                          title="Zoom Photo"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="font-bold text-xs text-slate-900 line-clamp-1">{img.title}</div>
                      <div className="text-[10px] text-blue-600 font-semibold">{img.department}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 mt-1">{img.caption}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => moveItem(tourGallery, index, 'UP', setTourGallery)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={index === tourGallery.length - 1}
                          onClick={() => moveItem(tourGallery, index, 'DOWN', setTourGallery)}
                          className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          setTourGallery(prev => prev.filter((_, i) => i !== index));
                          setSuccessMessage('Factory photo removed.');
                        }}
                        className="text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: JSON SCHEMA EXCHANGE */}
          {activeTab === 'JSON_EXCHANGE' && (
            <div className="space-y-6 p-2">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-blue-600" />
                  Client Profile JSON Data Schema Interchange
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Export the complete vendor profile and media data structure as standard JSON compliant with the <code>client_profile_schema.json</code> specification, or import an external vendor profile dataset.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>Export Profile Schema (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => jsonImportRef.current?.click()}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-300 shadow-xs transition-all cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Import JSON File</span>
                  </button>
                  <input
                    type="file"
                    ref={jsonImportRef}
                    accept=".json"
                    className="hidden"
                    onChange={handleImportJson}
                  />
                </div>
              </div>

              {/* Live JSON Preview Box */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Live JSON Representation (Read-Only Preview):
                </label>
                <div className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs rounded-2xl max-h-64 overflow-y-auto border border-slate-800">
                  <pre>
                    {JSON.stringify({
                      companyId: vendorProfile.id,
                      companyName: vendorProfile.companyName,
                      tier: vendorProfile.tier,
                      logoUrl: logoUrl.substring(0, 40) + '...',
                      bannerUrl: bannerUrl.substring(0, 40) + '...',
                      tagline,
                      certificatesCount: certificates.length,
                      factoryTourCount: tourGallery.length,
                      lastUpdated: new Date().toISOString()
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lightbox / Zoom Preview Modal */}
        {previewModalUrl && (
          <div 
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-150"
            onClick={() => setPreviewModalUrl(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2">
              <button
                onClick={() => setPreviewModalUrl(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              {previewModalUrl && previewModalUrl.trim() ? (
                <img
                  src={previewModalUrl}
                  alt="Enlarged Document Preview"
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-[85vh] object-contain rounded-xl"
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
