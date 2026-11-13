import React, { useState, useEffect, useMemo } from 'react';
import { AuthUser, Currency, ActiveView, SupplierTier } from '../../types';
import { CURRENCY_RATES } from '../../data/mockData';
import {
  RANDY_10_PETROLEUM_BUYER_VISITS,
  MARK_JOHNSON_15_BUYER_VISITS
} from '../../data/detailedVendorProfiles';
import { SafeImage } from '../common/SafeImage';
import { api } from '../../services/apiService';
import {
  ShieldCheck,
  Package,
  FileText,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  Landmark,
  Search,
  Filter,
  ArrowUpRight,
  ExternalLink,
  MessageCircle,
  Edit,
  Trash2,
  Send,
  Eye,
  Building2,
  Globe,
  DollarSign,
  Award,
  Layers,
  ChevronRight,
  X,
  Check,
  Calendar,
  Lock,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

export interface SupplierProductItem {
  id: string;
  title: string;
  sku: string;
  category: string;
  priceUsd: number;
  moq: number;
  moqUnit: string;
  stockCount: number;
  inStock: boolean;
  leadTimeDays: number;
  images: string[];
  inquiryCount: number;
  fobPort: string;
  isVerifiedListing: boolean;
  specifications: Record<string, string>;
  createdAt: string;
}

export interface SupplierInquiryItem {
  id: string;
  buyerName: string;
  buyerCompany: string;
  buyerCountry: string;
  buyerEmail?: string;
  buyerPhone?: string;
  productTitle: string;
  quantityRequested: string;
  targetPriceUsd?: number;
  destinationPort: string;
  preferredIncoterm: string;
  inquiryDate: string;
  status: 'NEW' | 'OFFER_SENT' | 'IN_NEGOTIATION' | 'ORDER_CONFIRMED';
  buyerMessage: string;
  urgency: 'URGENT' | 'HIGH' | 'NORMAL';
}

export interface PendingRfqItem {
  id: string;
  rfqNumber: string;
  title: string;
  category: string;
  buyerCompany: string;
  buyerCountry: string;
  targetQuantity: string;
  budgetRangeUsd: string;
  targetIncoterm: string;
  destinationPort: string;
  paymentTerms: string;
  deadlineDate: string;
  daysRemaining: number;
  status: 'AWAITING_QUOTE' | 'QUOTED' | 'EXPIRED' | 'DECLINED';
  quotedPriceUsd?: number;
  quotedAt?: string;
  specsRequired: string[];
}

export interface VerifiedSupplierDedicatedDashboardProps {
  currentUser: AuthUser | null;
  selectedCurrency: Currency;
  onOpenStorefront?: (companyId: string) => void;
  onNavigate?: (view: ActiveView) => void;
  onOpenCreateRfq?: () => void;
}

export const VerifiedSupplierDedicatedDashboard: React.FC<VerifiedSupplierDedicatedDashboardProps> = ({
  currentUser,
  selectedCurrency,
  onOpenStorefront,
  onNavigate
}) => {
  const currencyRate = CURRENCY_RATES[selectedCurrency]?.rateToUSD || 1;
  const currencySymbol = CURRENCY_RATES[selectedCurrency]?.symbol || '$';

  const formatPrice = (priceUsd: number) => {
    const converted = priceUsd * currencyRate;
    return `${currencySymbol}${converted.toLocaleString(undefined, {
      minimumFractionDigits: converted < 10 ? 2 : 0,
      maximumFractionDigits: 2
    })}`;
  };

  // Active Main Navigation Tab
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'INQUIRIES' | 'PENDING_RFQS'>('PRODUCTS');
  const [productPendingDelete, setProductPendingDelete] = useState<SupplierProductItem | null>(null);

  // Supplier identity resolution
  const supplierEmail = (currentUser?.email || '').toLowerCase().trim();
  const companyName = currentUser?.companyName || 'Verified Global Supplier';
  const supplierId = currentUser?.id || 'comp-verified-supplier-01';

  // Dynamic Supplier Tier resolution (syncs with Admin tier changes & localStorage overrides)
  const resolveCurrentSupplierTier = () => {
    let tierStr = String(currentUser?.tier || currentUser?.plan || '').trim();
    let memStatus = String(currentUser?.membershipStatus || '').toLowerCase().trim();

    // 1. Check local supplier tier overrides
    try {
      const rawOverrides = localStorage.getItem('th_supplier_tier_overrides_v2');
      if (rawOverrides) {
        const parsed = JSON.parse(rawOverrides);
        const sid = String(currentUser?.id || '').toLowerCase().trim();
        const semail = String(currentUser?.email || '').toLowerCase().trim();
        const override = parsed[sid] || parsed[semail];
        if (override) {
          tierStr = override.tier || tierStr;
          memStatus = override.membershipStatus || memStatus;
        }
      }
    } catch {}

    // 2. Check active verified session store
    try {
      const sessionRaw = localStorage.getItem('th_verified_otp_session_v5_strict_admin');
      if (sessionRaw) {
        const parsed = JSON.parse(sessionRaw);
        if (parsed && (parsed.tier || parsed.membershipStatus)) {
          tierStr = parsed.tier || tierStr;
          memStatus = parsed.membershipStatus || memStatus;
        }
      }
    } catch {}

    const tLower = tierStr.toLowerCase();
    const isFree = memStatus === 'free' || tLower.includes('free');
    const isBasic = memStatus === 'basic' || tLower.includes('basic');
    const isPaid = memStatus === 'paid' || tLower.includes('vip') || tLower.includes('gold') || Boolean(currentUser?.isPremium);

    if (isFree) {
      return {
        label: 'Free Member',
        badgeClass: 'bg-slate-100 text-slate-800 border-slate-300',
        iconClass: 'text-slate-600',
        isFree: true,
        kycBadge: 'Free Tier Member'
      };
    }
    if (isBasic) {
      return {
        label: tierStr && tierStr.length > 5 ? tierStr : 'Basic Plan Exporter',
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
        iconClass: 'text-blue-700',
        isFree: false,
        kycBadge: 'Basic Plan Verified'
      };
    }
    if (isPaid) {
      return {
        label: tierStr && tierStr.length > 5 ? tierStr : 'Gold Verified Exporter',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        iconClass: 'text-amber-700',
        isFree: false,
        kycBadge: 'VIP Enterprise Supplier'
      };
    }
    return {
      label: tierStr || 'Verified Exporter',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      iconClass: 'text-emerald-700',
      isFree: false,
      kycBadge: 'KYC Level 3 Verified'
    };
  };

  const [resolvedTier, setResolvedTier] = useState(resolveCurrentSupplierTier);

  useEffect(() => {
    const handleSync = () => {
      setResolvedTier(resolveCurrentSupplierTier());
    };
    handleSync();
    window.addEventListener('tradeheaven_users_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('tradeheaven_users_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [currentUser]);

  // Modal States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProductItem | null>(null);
  const [activeInquiryForQuote, setActiveInquiryForQuote] = useState<SupplierInquiryItem | null>(null);
  const [activeRfqForQuote, setActiveRfqForQuote] = useState<PendingRfqItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Product Form State
  const [newProdTitle, setNewProdTitle] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Industrial Machinery');
  const [newProdPrice, setNewProdPrice] = useState('25000');
  const [newProdMoq, setNewProdMoq] = useState('1');
  const [newProdMoqUnit, setNewProdMoqUnit] = useState('Units');
  const [newProdPort, setNewProdPort] = useState('Port of Houston / Long Beach');
  const [newProdLeadTime, setNewProdLeadTime] = useState('14');
  const [newProdImageUrl, setNewProdImageUrl] = useState('');

  // Quote Submission Form State
  const [quoteUnitPrice, setQuoteUnitPrice] = useState('');
  const [quoteIncoterm, setQuoteIncoterm] = useState('CIF');
  const [quoteLeadTime, setQuoteLeadTime] = useState('15');
  const [quotePaymentTerms, setQuotePaymentTerms] = useState('Trade Protection Escrow / 30% T/T Advance + 70% B/L');
  const [quoteNotes, setQuoteNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // -------------------------------------------------------------
  // 1. PRODUCTS DATA INITIALIZATION & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const initialProducts = useMemo<SupplierProductItem[]>(() => {
    if (supplierEmail.includes('atlanticpowerequip') || supplierEmail.includes('mjohnson')) {
      return [
        {
          id: 'prod-mj-01',
          title: 'Caterpillar 3512B 1250 kW Standby / 1000 kW Prime Diesel Generator Set',
          sku: 'CAT-3512B-1250KW',
          category: 'Heavy Equipment & Generators',
          priceUsd: 185000,
          moq: 1,
          moqUnit: 'Unit',
          stockCount: 4,
          inStock: true,
          leadTimeDays: 7,
          images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 10,
          fobPort: 'Port of Philadelphia / New York',
          isVerifiedListing: true,
          specifications: {
            'Engine Model': 'CAT 3512B DITA',
            'Power Rating': '1250 kW / 1563 kVA',
            'Voltage Output': '480V / 277V 3-Phase 60Hz',
            'Fuel Type': 'Diesel #2',
            'Hours Logged': 'Zero Hours Rebuilt / Load Tested'
          },
          createdAt: '2026-10-15'
        },
        {
          id: 'prod-mj-02',
          title: 'Cummins QSK60-G6 2000 kW High-Output Containerized Power Module',
          sku: 'CUM-QSK60-2000KW',
          category: 'Heavy Equipment & Generators',
          priceUsd: 310000,
          moq: 1,
          moqUnit: 'Unit',
          stockCount: 2,
          inStock: true,
          leadTimeDays: 10,
          images: ['https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 7,
          fobPort: 'Port of Baltimore / Newark',
          isVerifiedListing: true,
          specifications: {
            'Engine Model': 'Cummins QSK60-G6',
            'Enclosure': '40ft ISO Sound-Attenuated Container',
            'Generator': 'Stamford LVSI804R',
            'Cooling': '50°C Ambient Radiator'
          },
          createdAt: '2026-10-18'
        },
        {
          id: 'prod-mj-03',
          title: 'Grove RT765E-2 65-Ton Rough Terrain Hydraulic Crane (4-Section Boom)',
          sku: 'GRV-RT765E-65T',
          category: 'Mobile Cranes & Earthmoving',
          priceUsd: 245000,
          moq: 1,
          moqUnit: 'Unit',
          stockCount: 2,
          inStock: true,
          leadTimeDays: 14,
          images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 5,
          fobPort: 'Port of New York / New Jersey',
          isVerifiedListing: true,
          specifications: {
            'Capacity': '65 US Tons (60 Tonnes)',
            'Main Boom': '110 ft (33.5 m) Full Power',
            'Engine': 'Cummins QSB 6.7L Tier 4F',
            'Drive': '4x4x4 All-Wheel Steer'
          },
          createdAt: '2026-10-20'
        }
      ];
    }

    if (supplierEmail.includes('midforkcap') || supplierEmail.includes('randy')) {
      return [
        {
          id: 'prod-rf-01',
          title: 'Ultra-Low Sulfur Diesel Fuel (EN 590 10 PPM) Euro 5/6 Standard',
          sku: 'EN590-10PPM-BULK',
          category: 'Petroleum & Refined Fuels',
          priceUsd: 615,
          moq: 50000,
          moqUnit: 'Metric Tons',
          stockCount: 500000,
          inStock: true,
          leadTimeDays: 5,
          images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 10,
          fobPort: 'Port of Rotterdam / Houston / Jurong',
          isVerifiedListing: true,
          specifications: {
            'Sulfur Content': '< 10 mg/kg (PPM)',
            'Density at 15°C': '820 - 845 kg/m³',
            'Flash Point': '> 55°C',
            'Cetane Index': '> 46'
          },
          createdAt: '2026-10-10'
        },
        {
          id: 'prod-rf-02',
          title: 'Aviation Kerosene Colonial Grade 54 / Jet Fuel A-1 (ASTM D1655)',
          sku: 'JET-A1-COL54-BULK',
          category: 'Petroleum & Refined Fuels',
          priceUsd: 78,
          moq: 1000000,
          moqUnit: 'Barrels',
          stockCount: 8000000,
          inStock: true,
          leadTimeDays: 7,
          images: ['https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 8,
          fobPort: 'Rotterdam / Houston Tank Farms',
          isVerifiedListing: true,
          specifications: {
            'Grade': 'Jet A-1 / Colonial Grade 54',
            'Freeze Point': '< -47°C',
            'Smoke Point': '> 25 mm',
            'Inspection': 'SGS / Saybolt Certified'
          },
          createdAt: '2026-10-12'
        }
      ];
    }

    if (supplierEmail.includes('ezekiahali') || supplierEmail.includes('ace')) {
      return [
        {
          id: 'prod-ace-01',
          title: 'North American Certified Structural Steel Billets & Rebars (ASTM A615)',
          sku: 'ACE-STL-BILLET-01',
          category: 'Metals & Construction',
          priceUsd: 580,
          moq: 500,
          moqUnit: 'Metric Tons',
          stockCount: 15000,
          inStock: true,
          leadTimeDays: 14,
          images: ['https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 11,
          fobPort: 'Port of Houston / Corpus Christi',
          isVerifiedListing: true,
          specifications: {
            'Grade': 'Grade 60 / ASTM A615',
            'Standard': 'AISI / ASTM / BS 4449',
            'Lengths': '6m / 12m standard bundles',
            'Traceability': 'Mill Test Certificate (MTC 3.1) included'
          },
          createdAt: '2026-10-14'
        },
        {
          id: 'prod-ace-02',
          title: 'Refined Canola & Soybean Industrial Bulk Cooking Oil (Non-GMO)',
          sku: 'ACE-OIL-SOY-BULK',
          category: 'Agriculture & Food Commodities',
          priceUsd: 940,
          moq: 100,
          moqUnit: 'Metric Tons',
          stockCount: 4200,
          inStock: true,
          leadTimeDays: 12,
          images: ['https://images.unsplash.com/photo-1471193945509-9ad0617afabf?w=800&auto=format&fit=crop&q=80'],
          inquiryCount: 9,
          fobPort: 'Port of New Orleans / Houston',
          isVerifiedListing: true,
          specifications: {
            'Free Fatty Acid': '< 0.05%',
            'Moisture & Impurities': '< 0.1%',
            'Packing': 'Flexitank 24,000L / Steel Drums',
            'Certifications': 'HACCP, ISO 22000, Kosher'
          },
          createdAt: '2026-10-18'
        }
      ];
    }

    // Default universal verified catalog for other suppliers
    return [
      {
        id: 'prod-gen-01',
        title: 'Industrial Heavy-Duty CNC Automated Lathe Center & Milling Unit',
        sku: 'IND-CNC-LATHE-850',
        category: 'Industrial Machinery',
        priceUsd: 42000,
        moq: 1,
        moqUnit: 'Set',
        stockCount: 8,
        inStock: true,
        leadTimeDays: 15,
        images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'],
        inquiryCount: 8,
        fobPort: 'Port of Los Angeles / Houston',
        isVerifiedListing: true,
        specifications: {
          'Spindle Speed': '6000 RPM',
          'Control System': 'Siemens 828D / Fanuc',
          'Axis Travel': 'X:850mm Y:550mm Z:550mm',
          'Warranty': '24 Months Comprehensive'
        },
        createdAt: '2026-10-20'
      },
      {
        id: 'prod-gen-02',
        title: 'High-Efficiency Tier-1 Solar PV Modules 580W Bifacial Dual Glass',
        sku: 'SOL-580W-BIFACIAL',
        category: 'Renewable Energy',
        priceUsd: 98,
        moq: 200,
        moqUnit: 'Pieces',
        stockCount: 12000,
        inStock: true,
        leadTimeDays: 10,
        images: ['https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80'],
        inquiryCount: 14,
        fobPort: 'Port of Long Beach / Savannah',
        isVerifiedListing: true,
        specifications: {
          'Max Power': '580 Watt',
          'Cell Type': 'N-Type TOPCon 182mm',
          'Efficiency': '22.6%',
          'Linear Warranty': '30 Years 87.4% Output'
        },
        createdAt: '2026-10-22'
      }
    ];
  }, [supplierEmail]);

  const [products, setProducts] = useState<SupplierProductItem[]>(() => {
    try {
      const saved = localStorage.getItem(`th_supplier_products_${supplierId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialProducts;
  });

  // Save products to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`th_supplier_products_${supplierId}`, JSON.stringify(products));
    } catch {}
  }, [products, supplierId]);

  // Product Filtering & Search
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('ALL');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        !productSearch ||
        p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());
      const matchCategory = productCategoryFilter === 'ALL' || p.category === productCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, productSearch, productCategoryFilter]);

  // Available categories in products
  const productCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return Array.from(set);
  }, [products]);

  // -------------------------------------------------------------
  // 2. RECEIVED INQUIRIES DATA & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const initialInquiries = useMemo<SupplierInquiryItem[]>(() => {
    if (supplierEmail.includes('atlanticpowerequip') || supplierEmail.includes('mjohnson')) {
      return MARK_JOHNSON_15_BUYER_VISITS.map((visit) => ({
        id: visit.id,
        buyerName: visit.buyerContact,
        buyerCompany: visit.buyerCompany,
        buyerCountry: visit.buyerCountry,
        buyerEmail: `${visit.buyerContact.toLowerCase().replace(/[^a-z]/g, '.')}@${visit.buyerCompany.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        productTitle: visit.equipmentModelInquired,
        quantityRequested: visit.quantityRequested,
        destinationPort: visit.deliveryTerms || 'Port of Discharge',
        preferredIncoterm: visit.deliveryTerms.includes('CIF') ? 'CIF' : visit.deliveryTerms.includes('FOB') ? 'FOB' : 'CIF',
        inquiryDate: visit.visitedAtLabel,
        status: (visit as any).quoteStatus === 'OFFER_SENT' ? 'OFFER_SENT' : 'NEW',
        buyerMessage: visit.buyerMessage,
        urgency: visit.urgency
      }));
    }

    if (supplierEmail.includes('midforkcap') || supplierEmail.includes('randy')) {
      return RANDY_10_PETROLEUM_BUYER_VISITS.map((visit) => ({
        id: visit.id,
        buyerName: visit.buyerContact,
        buyerCompany: visit.buyerCompany,
        buyerCountry: visit.buyerCountry,
        buyerEmail: `${visit.buyerContact.toLowerCase().replace(/[^a-z]/g, '.')}@${visit.buyerCompany.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        productTitle: visit.petroleumProduct,
        quantityRequested: visit.quantityRequested,
        destinationPort: visit.deliveryTerms || 'Port of Rotterdam / Houston',
        preferredIncoterm: visit.deliveryTerms.includes('CIF') ? 'CIF' : visit.deliveryTerms.includes('FOB') ? 'FOB' : 'FOB',
        inquiryDate: visit.visitedAtLabel,
        status: 'NEW',
        buyerMessage: visit.buyerMessage,
        urgency: visit.urgency
      }));
    }

    // Generic rich B2B buyer inquiries
    return [
      {
        id: 'inq-seed-01',
        buyerName: 'David H. Sterling (VP Procurement)',
        buyerCompany: 'Sterling Global Energy & Infrastructure GmbH',
        buyerCountry: 'Germany',
        buyerEmail: 'd.sterling@sterling-infra.de',
        buyerPhone: '+49 89 2441 8900',
        productTitle: products[0]?.title || 'Industrial Heavy Equipment',
        quantityRequested: '2 Units',
        targetPriceUsd: 38000,
        destinationPort: 'Port of Hamburg (DEHAM)',
        preferredIncoterm: 'CIF',
        inquiryDate: '2026-11-03 14:20 UTC',
        status: 'NEW',
        buyerMessage: 'We have an ongoing municipal project requiring 2 units with immediate dispatch. Please submit your proforma invoice with warranty terms.',
        urgency: 'URGENT'
      },
      {
        id: 'inq-seed-02',
        buyerName: 'Marcus T. Vance (Director)',
        buyerCompany: 'Nordic Minerals & Heavy Machinery AB',
        buyerCountry: 'Sweden',
        buyerEmail: 'm.vance@nordicminerals.se',
        buyerPhone: '+46 8 505 20400',
        productTitle: products[0]?.title || 'Industrial Heavy Equipment',
        quantityRequested: '1 Unit',
        targetPriceUsd: 40000,
        destinationPort: 'Port of Gothenburg (SEGOT)',
        preferredIncoterm: 'FOB',
        inquiryDate: '2026-11-02 09:15 UTC',
        status: 'NEW',
        buyerMessage: 'Requesting technical specification sheet and certified inspection report for export clearance.',
        urgency: 'HIGH'
      },
      {
        id: 'inq-seed-03',
        buyerName: 'Amina Al-Mansoor',
        buyerCompany: 'Gulf Integrated Logistics & Marine LLC',
        buyerCountry: 'United Arab Emirates',
        buyerEmail: 'amina@gulfintegrated.ae',
        buyerPhone: '+971 4 390 1200',
        productTitle: products[1]?.title || products[0]?.title || 'Export Quality Materials',
        quantityRequested: '500 Units',
        destinationPort: 'Jebel Ali Port (AEJEA), Dubai',
        preferredIncoterm: 'CIF',
        inquiryDate: '2026-11-01 18:40 UTC',
        status: 'OFFER_SENT',
        buyerMessage: 'Proforma offer received and currently with our treasury department for Trade Protection Escrow lock.',
        urgency: 'NORMAL'
      }
    ];
  }, [supplierEmail, products]);

  const [inquiries, setInquiries] = useState<SupplierInquiryItem[]>(() => {
    try {
      const saved = localStorage.getItem(`th_supplier_inquiries_${supplierId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialInquiries;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`th_supplier_inquiries_${supplierId}`, JSON.stringify(inquiries));
    } catch {}
  }, [inquiries, supplierId]);

  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<'ALL' | 'NEW' | 'OFFER_SENT' | 'IN_NEGOTIATION'>('ALL');
  const [inquirySearch, setInquirySearch] = useState('');

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchSearch =
        !inquirySearch ||
        inq.buyerCompany.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.buyerName.toLowerCase().includes(inquirySearch.toLowerCase()) ||
        inq.productTitle.toLowerCase().includes(inquirySearch.toLowerCase());
      const matchStatus = inquiryStatusFilter === 'ALL' || inq.status === inquiryStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [inquiries, inquirySearch, inquiryStatusFilter]);

  // -------------------------------------------------------------
  // 3. PENDING RFQ QUOTES DATA & LOCAL PERSISTENCE
  // -------------------------------------------------------------
  const initialPendingRfqs = useMemo<PendingRfqItem[]>(() => {
    if (supplierEmail.includes('atlanticpowerequip') || supplierEmail.includes('mjohnson')) {
      return [
        {
          id: 'rfq-mj-req-01',
          rfqNumber: 'RFQ-2026-CAN-88219',
          title: 'Supply of 10x Continuous 1000 kW - 1250 kW Heavy Diesel Generators for Mining Camp',
          category: 'Heavy Equipment & Generators',
          buyerCompany: 'Northern Boreal Mining & Power Corp.',
          buyerCountry: 'Canada (Vancouver / Calgary)',
          targetQuantity: '10 Generator Units',
          budgetRangeUsd: '$1,600,000 - $1,950,000 USD',
          targetIncoterm: 'CIF',
          destinationPort: 'Port of Vancouver (CAVAN)',
          paymentTerms: 'Trade Protection Certificate / 30% Advance + 70% against Shipping B/L',
          deadlineDate: '2026-11-15',
          daysRemaining: 11,
          status: 'AWAITING_QUOTE',
          specsRequired: [
            'CAT 3512B / Cummins QST30 Tier 2 or Tier 4F',
            'Sound-attenuated enclosure < 75 dBA at 7 meters',
            'Factory Load Test Certificate (100% / 110% overload test)',
            'Digital Automatic Voltage Regulator (AVR)'
          ]
        },
        {
          id: 'rfq-mj-req-02',
          rfqNumber: 'RFQ-2026-MEX-41092',
          title: 'Urgent Procurement: 2x 65-Ton All-Terrain Rough Terrain Hydraulic Mobile Cranes',
          category: 'Mobile Cranes & Earthmoving',
          buyerCompany: 'Consorcio Portuario de Veracruz S.A. de C.V.',
          buyerCountry: 'Mexico',
          targetQuantity: '2 Units',
          budgetRangeUsd: '$460,000 - $520,000 USD',
          targetIncoterm: 'FOB',
          destinationPort: 'Port of Veracruz / Tampico',
          paymentTerms: 'Irrevocable Confirmed L/C at Sight / Trade Heaven Escrow',
          deadlineDate: '2026-11-09',
          daysRemaining: 5,
          status: 'AWAITING_QUOTE',
          specsRequired: [
            'Grove RT765E-2 / Tadano GR-600XL equivalent',
            'Full OSHA / CE Load Moment Indicator (LMI)',
            '4-Wheel Drive & Crab Steering Operational',
            'Immediate loading capability within 10 days'
          ]
        },
        {
          id: 'rfq-mj-req-03',
          rfqNumber: 'RFQ-2026-AUS-51104',
          title: '3x 2000 kW Containerized Diesel Gensets for Backup Data Center Utility',
          category: 'Heavy Equipment & Generators',
          buyerCompany: 'Pacific Rim Cloud Infrastructure Pty Ltd',
          buyerCountry: 'Australia (Sydney / Melbourne)',
          targetQuantity: '3 Units',
          budgetRangeUsd: '$880,000 - $1,050,000 USD',
          targetIncoterm: 'CIF',
          destinationPort: 'Port of Sydney (AUSYD) / Port Botany',
          paymentTerms: 'Trade Heaven Swiss Escrow Vault (100% Funded)',
          deadlineDate: '2026-11-18',
          daysRemaining: 14,
          status: 'AWAITING_QUOTE',
          specsRequired: [
            '50Hz / 415V Dual Frequency Capable or dedicated 50Hz',
            'Auto Transfer Switch (ATS) Parallel Synchronizing Panel',
            'Emissions Compliance with AS/NZS Standards'
          ]
        }
      ];
    }

    if (supplierEmail.includes('midforkcap') || supplierEmail.includes('randy')) {
      return [
        {
          id: 'rfq-rf-req-01',
          rfqNumber: 'RFQ-2026-NLD-66301',
          title: 'Immediate Spot FOB Contract: 100,000 MT Ultra-Low Sulfur Diesel (EN590 10 PPM)',
          category: 'Petroleum & Refined Fuels',
          buyerCompany: 'Vitol / Trafigura Certified Offtaker Group',
          buyerCountry: 'Netherlands / Singapore',
          targetQuantity: '100,000 Metric Tons',
          budgetRangeUsd: '$59,000,000 - $63,000,000 USD',
          targetIncoterm: 'FOB',
          destinationPort: 'Port of Rotterdam (Tank-to-Tank / Tank-to-Vessel)',
          paymentTerms: 'MT103 against SGS Dip Test Authorization (DTA)',
          deadlineDate: '2026-11-08',
          daysRemaining: 4,
          status: 'AWAITING_QUOTE',
          specsRequired: [
            'Euro 5 / Euro 6 standard EN 590',
            'Fresh SGS / Saybolt report within 48 hours',
            'Tank Storage Agreement (TSA) proof in Rotterdam'
          ]
        },
        {
          id: 'rfq-rf-req-02',
          rfqNumber: 'RFQ-2026-USA-32119',
          title: 'Annual Contract Allocation: Aviation Kerosene Jet Fuel A-1 (Colonial Grade 54)',
          category: 'Petroleum & Refined Fuels',
          buyerCompany: 'Apex Aviation Fueling Services Corp.',
          buyerCountry: 'United States (Houston / Miami)',
          targetQuantity: '2,000,000 Barrels per Month',
          budgetRangeUsd: '$150M+ USD Monthly Allocation',
          targetIncoterm: 'FOB',
          destinationPort: 'Houston Ship Channel / Colonial Pipeline Injection',
          paymentTerms: 'SBLC MT760 / Trade Heaven Loss-Only Escrow Certificate',
          deadlineDate: '2026-11-14',
          daysRemaining: 10,
          status: 'AWAITING_QUOTE',
          specsRequired: [
            'ASTM D1655 / Def Stan 91-091 Certification',
            'Injection verification into pipeline batch schedule',
            'Official Refinery FCO / SCO required'
          ]
        }
      ];
    }

    // Default global B2B RFQs requiring supplier quotes
    return [
      {
        id: 'rfq-gen-req-01',
        rfqNumber: 'RFQ-2026-USA-99014',
        title: 'Tender: Wholesale Supply of Industrial Automation Machining Centers',
        category: 'Industrial Machinery',
        buyerCompany: 'Vanguard Industrial Fabrication Inc.',
        buyerCountry: 'United States (Ohio)',
        targetQuantity: '4 Units',
        budgetRangeUsd: '$140,000 - $180,000 USD',
        targetIncoterm: 'FOB',
        destinationPort: 'Port of Cleveland / Baltimore',
        paymentTerms: 'Trade Protection Escrow / 30% T/T Advance + 70% B/L',
        deadlineDate: '2026-11-12',
        daysRemaining: 8,
        status: 'AWAITING_QUOTE',
        specsRequired: [
          'High precision multi-axis CNC',
          'Full CE / UL electrical conformance',
          'English operation manual & training video'
        ]
      },
      {
        id: 'rfq-gen-req-02',
        rfqNumber: 'RFQ-2026-GBR-18492',
        title: 'Bulk Export: Commercial Solar Power Storage Batteries & Inverters',
        category: 'Renewable Energy',
        buyerCompany: 'Britannia Clean Energy Utilities Ltd',
        buyerCountry: 'United Kingdom',
        targetQuantity: '50 Industrial Battery Packs',
        budgetRangeUsd: '$320,000 - $410,000 USD',
        targetIncoterm: 'CIF',
        destinationPort: 'Port of Felixstowe / Southampton',
        paymentTerms: 'Irrevocable Confirmed L/C at Sight',
        deadlineDate: '2026-11-16',
        daysRemaining: 12,
        status: 'AWAITING_QUOTE',
        specsRequired: [
          'LiFePO4 battery chemistry with BMS',
          'UK Grid G99 / G100 compliance',
          '10-Year manufacturer performance guarantee'
        ]
      }
    ];
  }, [supplierEmail]);

  const [pendingRfqs, setPendingRfqs] = useState<PendingRfqItem[]>(() => {
    try {
      const saved = localStorage.getItem(`th_supplier_pending_rfqs_${supplierId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return initialPendingRfqs;
  });

  useEffect(() => {
    try {
      localStorage.setItem(`th_supplier_pending_rfqs_${supplierId}`, JSON.stringify(pendingRfqs));
    } catch {}
  }, [pendingRfqs, supplierId]);

  // RFQ filter & search
  const [rfqSearch, setRfqSearch] = useState('');
  const [rfqStatusFilter, setRfqStatusFilter] = useState<'ALL' | 'AWAITING_QUOTE' | 'QUOTED'>('ALL');

  const filteredRfqs = useMemo(() => {
    return pendingRfqs.filter((r) => {
      const matchSearch =
        !rfqSearch ||
        r.title.toLowerCase().includes(rfqSearch.toLowerCase()) ||
        r.buyerCompany.toLowerCase().includes(rfqSearch.toLowerCase()) ||
        r.rfqNumber.toLowerCase().includes(rfqSearch.toLowerCase());
      const matchStatus = rfqStatusFilter === 'ALL' || r.status === rfqStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [pendingRfqs, rfqSearch, rfqStatusFilter]);

  // -------------------------------------------------------------
  // HANDLERS: ADD PRODUCT, EDIT PRODUCT, QUOTE INQUIRY, QUOTE RFQ
  // -------------------------------------------------------------
  const handleCreateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdTitle.trim()) {
      showToast('Please enter a valid product title.');
      return;
    }

    const priceNum = parseFloat(newProdPrice) || 1000;
    const moqNum = parseInt(newProdMoq) || 1;
    const leadTimeNum = parseInt(newProdLeadTime) || 7;

    const newProd: SupplierProductItem = {
      id: `prod-${Date.now()}`,
      title: newProdTitle.trim(),
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      category: newProdCategory,
      priceUsd: priceNum,
      moq: moqNum,
      moqUnit: newProdMoqUnit,
      stockCount: 50,
      inStock: true,
      leadTimeDays: leadTimeNum,
      images: [
        newProdImageUrl.trim() ||
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80'
      ],
      inquiryCount: 0,
      fobPort: newProdPort.trim() || 'Port of Origin',
      isVerifiedListing: true,
      specifications: {
        'Quality Standard': 'ISO 9001:2015 Verified',
        'Inspection': 'SGS / Bureau Veritas Export Audited',
        'Dispatch Readiness': 'Immediate Export Packaging'
      },
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts((prev) => [newProd, ...prev]);
    setIsAddProductOpen(false);
    setNewProdTitle('');
    setNewProdImageUrl('');
    showToast(`✓ Published "${newProd.title}" to your active catalog.`);
  };

  const handleUpdateProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    setProducts((prev) =>
      prev.map((p) => (p.id === editingProduct.id ? editingProduct : p))
    );
    setEditingProduct(null);
    showToast(`✓ Updated listing details for "${editingProduct.title}".`);
  };

  const handleDeleteProduct = (prodId: string) => {
    const found = products.find((p) => p.id === prodId);
    if (found) {
      setProductPendingDelete(found);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== prodId));
      void api.deleteProduct(prodId);
      showToast('Product listing removed from your catalog.');
    }
  };

  const handleConfirmDeleteProduct = async () => {
    if (!productPendingDelete) return;
    const prod = productPendingDelete;
    setProductPendingDelete(null);
    setProducts((prev) => prev.filter((p) => p.id !== prod.id));
    await api.deleteProduct(prod.id);
    showToast('Product listing removed from your catalog.');
  };

  const handleOpenQuoteModalForInquiry = (inquiry: SupplierInquiryItem) => {
    setActiveInquiryForQuote(inquiry);
    setQuoteUnitPrice(inquiry.targetPriceUsd ? String(inquiry.targetPriceUsd) : '24000');
    setQuoteIncoterm(inquiry.preferredIncoterm || 'CIF');
    setQuoteLeadTime('12');
    setQuoteNotes(
      `Official Proforma Quote for ${inquiry.buyerCompany}. Guaranteed export clearance, SGS pre-shipment audit, and direct Swiss Escrow loss-only protection.`
    );
  };

  const handleSendQuoteForInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInquiryForQuote) return;

    setInquiries((prev) =>
      prev.map((inq) =>
        inq.id === activeInquiryForQuote.id
          ? { ...inq, status: 'OFFER_SENT' as const }
          : inq
      )
    );
    showToast(`✓ Official Proforma Quote dispatched to ${activeInquiryForQuote.buyerCompany}.`);
    setActiveInquiryForQuote(null);
  };

  const handleOpenQuoteModalForRfq = (rfq: PendingRfqItem) => {
    setActiveRfqForQuote(rfq);
    setQuoteUnitPrice('175000');
    setQuoteIncoterm(rfq.targetIncoterm || 'CIF');
    setQuoteLeadTime('10');
    setQuoteNotes(
      `Official Supplier Quotation submitted against Tender ${rfq.rfqNumber}. Full compliance with specifications, factory load testing, and comprehensive warranty.`
    );
  };

  const handleSendQuoteForRfq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRfqForQuote) return;

    const unitPriceNum = parseFloat(quoteUnitPrice) || 10000;

    setPendingRfqs((prev) =>
      prev.map((r) =>
        r.id === activeRfqForQuote.id
          ? {
              ...r,
              status: 'QUOTED' as const,
              quotedPriceUsd: unitPriceNum,
              quotedAt: new Date().toISOString()
            }
          : r
      )
    );
    showToast(`✓ Quotation submitted for ${activeRfqForQuote.rfqNumber} (${activeRfqForQuote.buyerCompany}).`);
    setActiveRfqForQuote(null);
  };

  // Summary Metrics
  const totalCatalogValue = useMemo(() => {
    return products.reduce((acc, p) => acc + p.priceUsd * Math.max(1, p.stockCount), 0);
  }, [products]);

  const newInquiriesCount = useMemo(() => {
    return inquiries.filter((i) => i.status === 'NEW').length;
  }, [inquiries]);

  const awaitingRfqsCount = useMemo(() => {
    return pendingRfqs.filter((r) => r.status === 'AWAITING_QUOTE').length;
  }, [pendingRfqs]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header / Verified Profile Hero */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5 text-blue-600 font-bold">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Verified Enterprise Supplier Console
                </span>
                <span aria-hidden="true">·</span>
                <span className="text-slate-600">{companyName}</span>
                <span aria-hidden="true">·</span>
                <span className={`font-bold px-2 py-0.5 rounded border ${resolvedTier.isFree ? 'text-slate-700 bg-slate-100 border-slate-300' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                  {resolvedTier.kycBadge}
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono text-slate-500">UID: {supplierId}</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {companyName}
                </h1>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black border ${resolvedTier.badgeClass}`}>
                  <Award className={`w-3.5 h-3.5 ${resolvedTier.iconClass}`} />
                  {resolvedTier.label}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                Dedicated management portal for active wholesale listings, real-time incoming buyer inquiries,
                and high-priority global RFQ tenders protected by Trade Heaven&apos;s Loss-Only Underwriting Escrow.
              </p>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsAddProductOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Add Product Listing</span>
              </button>

              {onOpenStorefront && (
                <button
                  type="button"
                  onClick={() => onOpenStorefront(supplierId)}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                  title="Preview how your company and catalog appear to global buyers"
                >
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>View Public Storefront</span>
                </button>
              )}

              {onNavigate && (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('TRADE_ASSURANCE_CERTIFICATE')}
                    className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    title="View your official Loss-Only Trade Assurance certificate"
                  >
                    <Award className="w-4 h-4 text-amber-700" />
                    <span>Assurance Certificate</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('SUPPLIER_WITHDRAWAL')}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
                    title="Manage bank payout accounts and withdraw trade proceeds"
                  >
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    <span>Bank Payouts</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Key Metric Highlights Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-slate-100">
            <div
              onClick={() => setActiveTab('PRODUCTS')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'PRODUCTS'
                  ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Active Listings</span>
                </span>
                <span className="font-mono text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200 font-bold">
                  Live
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{products.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Catalog value: <span className="font-bold text-slate-700">{formatPrice(totalCatalogValue)}</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('INQUIRIES')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'INQUIRIES'
                  ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Received Inquiries</span>
                </span>
                {newInquiriesCount > 0 && (
                  <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-black">
                    {newInquiriesCount} New
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{inquiries.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Avg response rate: <span className="font-bold text-emerald-700">99.4% (&lt; 2 hrs)</span>
              </div>
            </div>

            <div
              onClick={() => setActiveTab('PENDING_RFQS')}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                activeTab === 'PENDING_RFQS'
                  ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300'
                  : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Pending RFQ Quotes</span>
                </span>
                {awaitingRfqsCount > 0 && (
                  <span className="font-mono text-[11px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-black">
                    {awaitingRfqsCount} Action
                  </span>
                )}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">{pendingRfqs.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {awaitingRfqsCount} tender(s) awaiting your quote
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200">
              <div className="flex items-center justify-between text-indigo-900 text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Trade Assurance Vault</span>
                </span>
                <span className="text-[10px] bg-white text-indigo-700 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                  Active
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-indigo-950">$1,100,000</div>
              <div className="text-[11px] text-indigo-700 mt-0.5">
                Loss-Only Underwriting (Clause 3.1 &amp; 3.2)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-slate-200 mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('PRODUCTS')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'PRODUCTS'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Active Product Listings</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800">
                {products.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('INQUIRIES')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'INQUIRIES'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Received Buyer Inquiries</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                {inquiries.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PENDING_RFQS')}
              className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'PENDING_RFQS'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Pending RFQ Quotes</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                {pendingRfqs.length}
              </span>
            </button>
          </div>

          <div className="pb-3 text-xs text-slate-500 font-medium hidden sm:block">
            All records synchronized with Trade Heaven Database
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: ACTIVE PRODUCT LISTINGS                            */}
        {/* ========================================================= */}
        {activeTab === 'PRODUCTS' && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by title or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category:</span>
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Categories ({products.length})</option>
                    {productCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>New Listing</span>
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Package className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No products found</h3>
                <p className="text-xs text-slate-500">
                  Try adjusting your search criteria or add a new product listing.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create First Product Listing</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-sm transition-all flex flex-col"
                  >
                    {/* Product Image Header */}
                    <div className="relative h-48 bg-slate-100 overflow-hidden">
                      <SafeImage
                        src={prod.images[0]}
                        alt={prod.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                        {prod.sku}
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase flex items-center gap-1 shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Listing</span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wide">
                          {prod.category}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                          {prod.title}
                        </h3>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap pt-0.5">
                          <span>MOQ: {prod.moq} {prod.moqUnit}</span>
                          <span aria-hidden="true">·</span>
                          <span>Lead Time: {prod.leadTimeDays}d</span>
                          <span aria-hidden="true">·</span>
                          <span>FOB: {prod.fobPort}</span>
                        </div>
                      </div>

                      {/* Technical Specs Preview */}
                      {prod.specifications && Object.keys(prod.specifications).length > 0 && (
                        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1 font-mono">
                          {Object.entries(prod.specifications).slice(0, 3).map(([key, val]) => (
                            <div key={key} className="flex items-center justify-between gap-2">
                              <span className="text-slate-500 truncate">{key}:</span>
                              <span className="font-bold text-slate-800 truncate">{val}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Pricing and Action Footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[10px] text-slate-400 font-semibold uppercase">FOB Unit Price</div>
                          <div className="text-base font-black text-slate-900">
                            {formatPrice(prod.priceUsd)}
                            <span className="text-xs text-slate-500 font-normal"> / {prod.moqUnit}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingProduct(prod)}
                            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            title="Edit Product Price & Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: RECEIVED BUYER INQUIRIES                           */}
        {/* ========================================================= */}
        {activeTab === 'INQUIRIES' && (
          <div className="space-y-4">
            {/* Inquiry Filter Header */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inquiries by company, buyer, or product..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Filter:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      inquiryStatusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({inquiries.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('NEW')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      inquiryStatusFilter === 'NEW'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>New Inquiries</span>
                    {newInquiriesCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInquiryStatusFilter('OFFER_SENT')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      inquiryStatusFilter === 'OFFER_SENT'
                        ? 'bg-white text-blue-800 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Offer Dispatched
                  </button>
                </div>
              </div>
            </div>

            {/* Inquiries List */}
            {filteredInquiries.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Mail className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No inquiries match the current filter</h3>
                <p className="text-xs text-slate-500">
                  Switch the filter to &quot;All&quot; to review previously answered inquiries.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => (
                  <div
                    key={inq.id}
                    className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">{inq.buyerCompany}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-xs text-slate-500">{inq.buyerCountry}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-xs text-slate-600 font-medium">{inq.buyerName}</span>
                          {inq.urgency === 'URGENT' && (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
                              Urgent Tender
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-700 font-semibold flex items-center gap-1.5">
                          <span className="text-slate-500">Target Product:</span>
                          <span className="text-blue-700 font-bold">{inq.productTitle}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        {inq.status === 'NEW' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            <span>Awaiting Your Reply</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                            <Check className="w-3 h-3 text-blue-600" />
                            <span>Proforma Offer Dispatched</span>
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">{inq.inquiryDate}</span>
                      </div>
                    </div>

                    {/* Inquiry Message Box */}
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-0.5">Buyer Inquired Specifications:</span>
                      &quot;{inq.buyerMessage}&quot;
                    </div>

                    {/* Meta Specifications */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-3 text-slate-500 flex-wrap">
                        <span>Quantity: <strong className="text-slate-800">{inq.quantityRequested}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Destination: <strong className="text-slate-800">{inq.destinationPort}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Incoterm: <strong className="text-slate-800">{inq.preferredIncoterm}</strong></span>
                        {inq.targetPriceUsd && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span>Buyer Target: <strong className="text-emerald-700">{formatPrice(inq.targetPriceUsd)}</strong></span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenQuoteModalForInquiry(inq)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Proforma Invoice Quote</span>
                        </button>

                        <a
                          href={`https://wa.me/918532934479?text=${encodeURIComponent(
                            `Trade Heaven Verified Supplier Reply - In Reference to Buyer Inquiry ${inq.id} (${inq.buyerCompany}) for ${inq.productTitle}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Desk</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: PENDING RFQ QUOTES                                 */}
        {/* ========================================================= */}
        {activeTab === 'PENDING_RFQS' && (
          <div className="space-y-4">
            {/* RFQ Search & Filter Bar */}
            <div className="p-4 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search RFQs by tender ID, buyer, or product..."
                  value={rfqSearch}
                  onChange={(e) => setRfqSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Status:</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRfqStatusFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      rfqStatusFilter === 'ALL'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All Tenders ({pendingRfqs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfqStatusFilter('AWAITING_QUOTE')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                      rfqStatusFilter === 'AWAITING_QUOTE'
                        ? 'bg-white text-amber-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>Awaiting Quote</span>
                    {awaitingRfqsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-white">
                        {awaitingRfqsCount}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRfqStatusFilter('QUOTED')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      rfqStatusFilter === 'QUOTED'
                        ? 'bg-white text-emerald-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Quote Submitted
                  </button>
                </div>
              </div>
            </div>

            {/* Pending RFQ Cards */}
            {filteredRfqs.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">No RFQ requirements match your criteria</h3>
                <p className="text-xs text-slate-500">
                  Switch the filter to &quot;All&quot; to review tenders you have already quoted.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRfqs.map((rfq) => (
                  <div
                    key={rfq.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-2xs transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {rfq.rfqNumber}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="text-xs font-bold text-slate-700">{rfq.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-xs text-slate-500">{rfq.buyerCompany} ({rfq.buyerCountry})</span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 leading-snug">
                          {rfq.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {rfq.status === 'AWAITING_QUOTE' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Awaiting Quote ({rfq.daysRemaining} days left)</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Quote Submitted ({formatPrice(rfq.quotedPriceUsd || 0)})</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Target Quantity</div>
                        <div className="font-bold text-slate-900">{rfq.targetQuantity}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Buyer Budget Range</div>
                        <div className="font-bold text-emerald-700">{rfq.budgetRangeUsd}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Discharge Port</div>
                        <div className="font-bold text-slate-900">{rfq.destinationPort}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Required Incoterm</div>
                        <div className="font-bold text-slate-900">{rfq.targetIncoterm}</div>
                      </div>
                    </div>

                    {/* Required Specs Checklist */}
                    {rfq.specsRequired && rfq.specsRequired.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">
                          Mandatory Buyer Compliance Specs:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                          {rfq.specsRequired.map((spec, i) => (
                            <div key={i} className="flex items-center gap-2 text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate">{spec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-xs text-slate-500">
                        Payment Term Accepted: <strong className="text-slate-800">{rfq.paymentTerms}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        {rfq.status === 'AWAITING_QUOTE' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModalForRfq(rfq)}
                            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Submit Formal Quotation</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenQuoteModalForRfq(rfq)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Revise Submitted Quote</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: ADD PRODUCT LISTING                                */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Add New Verified Product Listing</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Publish to Trade Heaven B2B wholesale marketplace catalog.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddProductOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProductSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Caterpillar 3512B 1250 kW Standby Diesel Generator"
                  value={newProdTitle}
                  onChange={(e) => setNewProdTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Industry Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="Heavy Equipment & Generators">Heavy Equipment &amp; Generators</option>
                    <option value="Mobile Cranes & Earthmoving">Mobile Cranes &amp; Earthmoving</option>
                    <option value="Petroleum & Refined Fuels">Petroleum &amp; Refined Fuels</option>
                    <option value="Industrial Machinery">Industrial Machinery</option>
                    <option value="Metals & Construction">Metals &amp; Construction</option>
                    <option value="Agriculture & Food Commodities">Agriculture &amp; Food Commodities</option>
                    <option value="Renewable Energy">Renewable Energy</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">FOB Unit Price (USD) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="25000"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">MOQ Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdMoq}
                    onChange={(e) => setNewProdMoq(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Unit of Measure</label>
                  <input
                    type="text"
                    value={newProdMoqUnit}
                    onChange={(e) => setNewProdMoqUnit(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={newProdLeadTime}
                    onChange={(e) => setNewProdLeadTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">FOB Loading Port</label>
                <input
                  type="text"
                  placeholder="e.g. Port of Houston / Long Beach / New York"
                  value={newProdPort}
                  onChange={(e) => setNewProdPort(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Image URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://... (leave blank for high-res auto asset)"
                  value={newProdImageUrl}
                  onChange={(e) => setNewProdImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish to Verified Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT PRODUCT LISTING                               */}
      {/* ========================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">Edit Product Listing</h3>
                <p className="text-xs text-slate-400 mt-0.5">SKU: {editingProduct.sku}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateProductSubmit} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Unit Price (USD)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.priceUsd}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, priceUsd: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stockCount}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, stockCount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">FOB Dispatch Port</label>
                <input
                  type="text"
                  value={editingProduct.fobPort}
                  onChange={(e) => setEditingProduct({ ...editingProduct, fobPort: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DISPATCH PROFORMA QUOTE FOR INQUIRY                */}
      {/* ========================================================= */}
      {activeInquiryForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                  Proforma Invoice Dispatch
                </div>
                <h3 className="font-black text-base">{activeInquiryForQuote.buyerCompany}</h3>
                <p className="text-xs text-slate-300">
                  Target Product: {activeInquiryForQuote.productTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveInquiryForQuote(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuoteForInquiry} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center justify-between">
                <span>Inquired Quantity: <strong>{activeInquiryForQuote.quantityRequested}</strong></span>
                <span>Port: <strong>{activeInquiryForQuote.destinationPort}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Quote Price per Unit (USD) *</label>
                  <input
                    type="number"
                    required
                    value={quoteUnitPrice}
                    onChange={(e) => setQuoteUnitPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Incoterm Offered</label>
                  <select
                    value={quoteIncoterm}
                    onChange={(e) => setQuoteIncoterm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    <option value="FOB">FOB (Free on Board)</option>
                    <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                    <option value="CFR">CFR (Cost & Freight)</option>
                    <option value="DDP">DDP (Delivered Duty Paid)</option>
                    <option value="EXW">EXW (Ex Works)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Accepted Payment Terms</label>
                <input
                  type="text"
                  value={quotePaymentTerms}
                  onChange={(e) => setQuotePaymentTerms(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Proforma Terms &amp; Compliance Notes</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveInquiryForQuote(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Dispatch Official Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SUBMIT FORMAL RFQ QUOTE                            */}
      {/* ========================================================= */}
      {activeRfqForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-amber-950 to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-0.5">
                  Tender Response: {activeRfqForQuote.rfqNumber}
                </div>
                <h3 className="font-black text-base">{activeRfqForQuote.title}</h3>
                <p className="text-xs text-slate-300">
                  Buyer: {activeRfqForQuote.buyerCompany} ({activeRfqForQuote.buyerCountry})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveRfqForQuote(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendQuoteForRfq} className="p-5 space-y-3.5 text-xs text-slate-700">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
                <span>Target: <strong>{activeRfqForQuote.targetQuantity}</strong></span>
                <span>Budget: <strong>{activeRfqForQuote.budgetRangeUsd}</strong></span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Total Quotation Value (USD) *</label>
                  <input
                    type="number"
                    required
                    value={quoteUnitPrice}
                    onChange={(e) => setQuoteUnitPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Incoterm Offered</label>
                  <select
                    value={quoteIncoterm}
                    onChange={(e) => setQuoteIncoterm(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                  >
                    <option value="CIF">CIF (Port of Discharge)</option>
                    <option value="FOB">FOB (Loading Port)</option>
                    <option value="CFR">CFR (Cost & Freight)</option>
                    <option value="DDP">DDP (Door Delivery)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Estimated Lead Time (Days)</label>
                <input
                  type="number"
                  value={quoteLeadTime}
                  onChange={(e) => setQuoteLeadTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Quotation Notes &amp; Specification Compliance</label>
                <textarea
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRfqForQuote(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Formal Quotation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {productPendingDelete && (
        <div
          className="fixed inset-0 z-[120] bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProductPendingDelete(null);
          }}
        >
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900">Remove Product from Catalog?</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Are you sure you want to remove <strong className="text-slate-900">"{productPendingDelete.title}"</strong> from your verified catalog?
            </p>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setProductPendingDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDeleteProduct()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
