import React, { useState, useEffect } from 'react';
import { UserRole, Currency, EscrowTransaction, RfqRequirement, Product, AuthUser } from '../../types';
import { CURRENCY_RATES, MOCK_ESCROWS, MOCK_RFQS, MOCK_PRODUCTS } from '../../data/mockData';
import { OFFICIAL_WHATSAPP_DATA } from '../common/TradeHeavenSocialBar';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Package, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  Building, 
  Layers, 
  Download,
  ExternalLink,
  MessageCircle,
  CreditCard,
  PlusCircle,
  Settings,
  Mail,
  Bell,
  Check,
  RefreshCw,
  Eye,
  X,
  Send,
  Activity
} from 'lucide-react';

interface Props {
  currentUser: AuthUser | null;
  currentUserRole: UserRole;
  selectedCurrency: Currency;
  rfqs?: RfqRequirement[];
  onOpenCreateRfq: () => void;
  onOpenStorefront: (companyId: string) => void;
}

const AVAILABLE_CATEGORIES = [
  'Agriculture, Spices & Food Commodities',
  'Automotive Parts & Transportation',
  'Chemicals, Polymers & Resins',
  'Construction, Hardware & Building Materials',
  'Electronics & Component PCB',
  'Industrial Machinery & Automation',
  'Medical, Healthcare & PPE',
  'Packaging, Printing & Paper',
  'Renewable Energy & Solar',
  'Textiles, Fabrics & Apparel'
];

interface SimulationLog {
  id: string;
  timestamp: string;
  title: string;
  category: string;
  matched: boolean;
  destination: string;
  email: string;
  quantity: string;
  incoterm: string;
  price: string;
}

export const BuyerSupplierDashboard: React.FC<Props> = ({
  currentUser,
  currentUserRole,
  selectedCurrency,
  rfqs = MOCK_RFQS,
  onOpenCreateRfq,
  onOpenStorefront
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'RFQS' | 'SETTINGS' | 'DOCUMENTS'>('OVERVIEW');
  const handleDownloadTemplate = (title: string) => {
    const link = document.createElement('a');
    link.href = 'data:application/pdf;base64,JVBERi0xLjAKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqIDIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iaiAzIDAgb2JqPDwvVHlwZS9QYWdlL01lZGlhQm94WzAgMCAzIDNdPj5lbmRvYmoKeHJlZgowIDQKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTAgMDAwMDAgbgowMDAwMDAwMDUzIDAwMDAwIG4KMDAwMDAwMDEwMiAwMDAwMCBuCnRyYWlsZXI8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoxNDkKJUVPRgo=';
    link.download = title.replace(/\s+/g, '_') + '_Template.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const curr = (CURRENCY_RATES || []).find(c => c && c.code === selectedCurrency) || CURRENCY_RATES?.[0] || { code: 'USD', symbol: '$', rateToUSD: 1 };

  // Settings State loaded from localStorage or defaults
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('th_alerts_enabled') !== 'false';
  });
  const [alertEmail, setAlertEmail] = useState<string>(() => {
    return localStorage.getItem('th_alert_email') || currentUser?.email || 'procurement@tradeheaven.net';
  });
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('th_alert_categories');
    return saved ? JSON.parse(saved) : [
      'Renewable Energy & Solar',
      'Industrial Machinery & Automation',
      'Electronics & Component PCB',
      'Chemicals, Polymers & Resins'
    ];
  });
  const [frequency, setFrequency] = useState<'INSTANT' | 'DAILY' | 'WEEKLY'>(() => {
    return (localStorage.getItem('th_alert_frequency') as any) || 'INSTANT';
  });

  // Simulated Email Logs list
  const [simulationLogs, setSimulationLogs] = useState<SimulationLog[]>(() => {
    const saved = localStorage.getItem('th_alert_simulation_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<SimulationLog | null>(null);
  const [testScenarioRunning, setTestScenarioRunning] = useState(false);
  const [liveNotificationToast, setLiveNotificationToast] = useState<{
    show: boolean;
    title: string;
    category: string;
    email: string;
  }>({ show: false, title: '', category: '', email: '' });

  // Update email if currentUser changes and alertEmail was default
  useEffect(() => {
    if (currentUser?.email && alertEmail === 'procurement@tradeheaven.net') {
      setAlertEmail(currentUser.email);
    }
  }, [currentUser]);

  // Keep localStorage in sync with user state dynamically
  useEffect(() => {
    localStorage.setItem('th_alerts_enabled', String(alertsEnabled));
  }, [alertsEnabled]);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('th_alerts_enabled', String(alertsEnabled));
    localStorage.setItem('th_alert_email', alertEmail);
    localStorage.setItem('th_alert_categories', JSON.stringify(selectedCategories));
    localStorage.setItem('th_alert_frequency', frequency);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleToggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSelectAllCategories = () => {
    setSelectedCategories(AVAILABLE_CATEGORIES);
  };

  const handleDeselectAllCategories = () => {
    setSelectedCategories([]);
  };

  // Listen to window event 'tradeheaven_rfq_created' to simulate live incoming alerts
  useEffect(() => {
    const handleLiveRfq = (e: Event) => {
      const customEvent = e as CustomEvent<RfqRequirement>;
      const newRfq = customEvent.detail;
      if (!newRfq) return;

      const isEnabled = localStorage.getItem('th_alerts_enabled') !== 'false';
      const savedEmail = localStorage.getItem('th_alert_email') || currentUser?.email || 'procurement@tradeheaven.net';
      const categoriesJson = localStorage.getItem('th_alert_categories');
      const savedCategories: string[] = categoriesJson ? JSON.parse(categoriesJson) : AVAILABLE_CATEGORIES;

      const isMatch = savedCategories.includes(newRfq.category);

      if (isEnabled && isMatch) {
        const logItem: SimulationLog = {
          id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toLocaleTimeString(),
          title: newRfq.productName,
          category: newRfq.category,
          matched: true,
          destination: newRfq.destinationPort,
          email: savedEmail,
          quantity: `${newRfq.targetQuantity} ${newRfq.quantityUnit}`,
          incoterm: newRfq.preferredIncoterm,
          price: `$${newRfq.targetPriceUsd}`
        };

        setSimulationLogs(prev => {
          const updated = [logItem, ...prev].slice(0, 30);
          localStorage.setItem('th_alert_simulation_logs', JSON.stringify(updated));
          return updated;
        });

        // Trigger dynamic interactive visual alert toast
        setLiveNotificationToast({
          show: true,
          title: newRfq.productName,
          category: newRfq.category,
          email: savedEmail
        });
        setTimeout(() => {
          setLiveNotificationToast(prev => ({ ...prev, show: false }));
        }, 7000);
      }
    };

    window.addEventListener('tradeheaven_rfq_created', handleLiveRfq);
    return () => window.removeEventListener('tradeheaven_rfq_created', handleLiveRfq);
  }, [currentUser]);

  // Run Sourcing Trigger Simulation Test
  const handleTriggerSimulationTest = () => {
    if (selectedCategories.length === 0) {
      alert("Please select at least one matching category first to test alerts!");
      return;
    }

    setTestScenarioRunning(true);

    setTimeout(() => {
      // Pick a random category from the user's selected list
      const matchedCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
      
      // Select mock data templates
      const templates: Record<string, Array<{title: string; quantity: string; port: string; price: string; incoterm: string}>> = {
        'Renewable Energy & Solar': [
          { title: '400kW C&I Hybrid Solar Inverter System with Smart BMS', quantity: '12 Sets', port: 'Port of Hamburg, Germany', price: '$8,400', incoterm: 'DDP' },
          { title: 'Premium N-Type TopCon Glass-Glass Solar Modules 450W', quantity: '2,400 Pcs', port: 'Rotterdam Port, Netherlands', price: '$42', incoterm: 'CIF' }
        ],
        'Industrial Machinery & Automation': [
          { title: 'High-Speed CNC Laser Metal Tube Cutter 3000W', quantity: '1 Unit', port: 'Port of Los Angeles, USA', price: '$48,000', incoterm: 'FOB' },
          { title: 'Automatic Corrugated Carton Packaging production Line', quantity: '2 Sets', port: 'Genoa Port, Italy', price: '$124,000', incoterm: 'CIF' }
        ],
        'Electronics & Component PCB': [
          { title: 'Rigid-Flex Multilayer Printed Circuit Boards for Automotive Radar', quantity: '50,000 Pcs', port: 'Shenzhen Port, China', price: '$1.45', incoterm: 'EXW' },
          { title: 'IoT Wireless Smart Gateway Modules (Zigbee/BLE/5G)', quantity: '5,000 Pcs', port: 'Singapore Changi Port', price: '$18.50', incoterm: 'FOB' }
        ],
        'Chemicals, Polymers & Resins': [
          { title: 'Virgin Food-Grade PET Resin Chips (Polyethylene Terephthalate)', quantity: '240 Metric Tons', port: 'Port of Houston, USA', price: '$1,120', incoterm: 'CIF' },
          { title: 'Eco-Friendly High-Purity Liquid Epoxy Resin', quantity: '48 Barrels', port: 'Antwerp Port, Belgium', price: '$3,400', incoterm: 'CIF' }
        ],
        'Agriculture, Spices & Food Commodities': [
          { title: 'Organic Premium Grade Ceylon Cinnamon Quills', quantity: '12 Metric Tons', port: 'Port of Melbourne, Australia', price: '$6,200', incoterm: 'FOB' },
          { title: 'Extra Virgin Cold-Pressed Spanish Olive Oil (Bulk IBC Tanks)', quantity: '40 IBC Tanks', port: 'Port of Montreal, Canada', price: '$4,150', incoterm: 'DDP' }
        ],
        'Automotive Parts & Transportation': [
          { title: 'High-Performance Semi-Metallic Disc Brake Pads (All Models)', quantity: '12,000 Sets', port: 'Port of Miami, USA', price: '$4.80', incoterm: 'FOB' },
          { title: 'Traction LiFePO4 Electric Bus Battery Pack 150kWh', quantity: '5 Units', port: 'Port of Oslo, Norway', price: '$32,000', incoterm: 'CIF' }
        ],
        'Construction, Hardware & Building Materials': [
          { title: 'Premium Hot-Dip Galvanized Steel Scaffold Pipes 48mm', quantity: '15,000 Meters', port: 'Port of Jebel Ali, Dubai', price: '$3.10', incoterm: 'CIF' },
          { title: 'Double-Glazed Aluminum Frame Curtain Wall Systems', quantity: '4,500 Sqm', port: 'Port of Dublin, Ireland', price: '$85', incoterm: 'DDP' }
        ],
        'Medical, Healthcare & PPE': [
          { title: 'Nitrile Examination Gloves Powder-Free Blue (Bulk Cartons)', quantity: '5,000 Cartons', port: 'Port of Boston, USA', price: '$14.20', incoterm: 'CIF' },
          { title: 'High-Resolution Portable Ultrasound Diagnostic System', quantity: '15 Units', port: 'Rio de Janeiro Port, Brazil', price: '$7,200', incoterm: 'FOB' }
        ],
        'Packaging, Printing & Paper': [
          { title: 'Biodegradable Craft Paper Shopping Bags with Twisted Handles', quantity: '100,000 Pcs', port: 'Port of Vancouver, Canada', price: '$0.12', incoterm: 'DDP' },
          { title: 'White Cardboard Gift Cosmetic Boxes with Spot UV Embossing', quantity: '50,000 Pcs', port: 'Port of London, UK', price: '$0.35', incoterm: 'CIF' }
        ],
        'Textiles, Fabrics & Apparel': [
          { title: '100% Organic Aegean Ring Spun Cotton Denim 13oz', quantity: '20,000 Meters', port: 'Paris Orly Logistics Center, France', price: '$3.85', incoterm: 'DDP' },
          { title: 'Seamless High-Stretch Recycled Spandex Yoga Sets', quantity: '8,000 Sets', port: 'Port of Auckland, New Zealand', price: '$7.40', incoterm: 'FOB' }
        ]
      };

      const selectedTemplateList = templates[matchedCategory] || [
        { title: 'Bulk High-Grade B2B Wholesale Sourcing Order', quantity: '5,000 Units', port: 'Global Port Hub', price: '$15.00', incoterm: 'CIF' }
      ];

      const template = selectedTemplateList[Math.floor(Math.random() * selectedTemplateList.length)];

      const mockLog: SimulationLog = {
        id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toLocaleTimeString(),
        title: template.title,
        category: matchedCategory,
        matched: true,
        destination: template.port,
        email: alertEmail,
        quantity: template.quantity,
        incoterm: template.incoterm,
        price: template.price
      };

      setSimulationLogs(prev => {
        const updated = [mockLog, ...prev].slice(0, 30);
        localStorage.setItem('th_alert_simulation_logs', JSON.stringify(updated));
        return updated;
      });

      setSelectedLogForPreview(mockLog);
      setTestScenarioRunning(false);
    }, 1200);
  };

  const handleClearLogs = () => {
    setSimulationLogs([]);
    localStorage.removeItem('th_alert_simulation_logs');
  };

  const formatPrice = (usd: number) => {
    const converted = usd * curr.rateToUSD;
    return `${curr.symbol}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div id="buyer-supplier-dashboard" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Enterprise B2B Trade &amp; trade protection Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            {currentUserRole === 'SUPPLIER' ? 'Manufacturer & Exporter Console' : 'Global Procurement & Sourcing Dashboard'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-normal">
            Track live Swiss trade protection milestones, active RFQ bids, factory production progress, and commercial Proforma Invoices (P/I).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateRfq}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New RFQ</span>
          </button>
          <a
            href={OFFICIAL_WHATSAPP_DATA.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-3 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Trade Desk WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total trade protection Value</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {formatPrice(349000)}
          </div>
          <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> 100% Capital Guaranteed
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Active RFQ Inquiries</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            18 Tenders
          </div>
          <div className="text-[11px] text-blue-600 font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> 6 pending factory quotes
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Verified Orders In-Transit</span>
            <Package className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            4 Shipments
          </div>
          <div className="text-[11px] text-purple-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> SGS Pre-Shipment Passed
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>KYC Compliance Status</span>
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            Level 3 (Verified)
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Audit ID: TH-CORP-98421
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'OVERVIEW'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Active Contracts ({MOCK_ESCROWS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('RFQS')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'RFQS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Sourcing Requirements ({MOCK_RFQS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'SETTINGS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>RFQ Sourcing Alerts &amp; Settings</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-blue-100 text-blue-800 font-black animate-pulse">
            NEW
          </span>
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`pb-3 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Document Library</span>
        </button>
      </div>

      {/* Tab Content: Escrows */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MOCK_ESCROWS.map(tp => (
              <div
                key={tp.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 hover:border-blue-400 transition-all"
              >
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                        {tp.id}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{tp.incoterm} • {tp.portOfDestination}</span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">
                      {tp.productTitle}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {tp.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500">Total Contract Value:</span>
                    <div className="font-mono font-bold text-slate-900 text-sm mt-0.5">
                      {formatPrice(tp.totalAmountUsd)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500">Trade Protection Deposit (Held):</span>
                    <div className="font-mono font-bold text-emerald-600 text-sm mt-0.5">
                      {formatPrice(tp.depositAmountUsd)}
                    </div>
                  </div>
                </div>

                {/* Milestones Stepper */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Release Milestones
                  </div>
                  <div className="space-y-1.5">
                    {tp.milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                          m.status === 'RELEASED'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                            : m.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 border-amber-200 text-amber-950'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className={`w-3.5 h-3.5 ${
                            m.status === 'RELEASED' ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                          <span className="font-semibold text-xs">{m.title} ({m.percentage}%)</span>
                        </div>
                        <span className="font-mono font-bold text-xs">{formatPrice(m.amountUsd)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Supplier: <strong>{tp.supplierCompany}</strong></span>
                  <button className="text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                    <span>View Proforma P/I</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content: RFQs */}
      {activeTab === 'RFQS' && (
        <div className="space-y-3">
          {(rfqs && rfqs.length > 0 ? rfqs : MOCK_RFQS).map(rfq => (
            <div
              key={rfq.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeIn"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {rfq.id}
                  </span>
                  <span className="text-xs text-blue-600 font-bold">{rfq.category}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{rfq.destinationPort}</span>
                </div>
                <h4 className="font-bold text-sm text-slate-900">
                  {rfq.productName}
                </h4>
                <div className="text-xs text-slate-600">
                  Volume Target: <strong>{rfq.targetQuantity.toLocaleString()} {rfq.quantityUnit}</strong> • Incoterm: <strong>{rfq.preferredIncoterm}</strong>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {rfq.quotesCount} Factory Bids
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content: SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          {/* Settings Setup Form */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-start justify-between border-b border-slate-100 pb-5">
              <div className="space-y-1.5">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600" />
                  <span>RFQ Category Match Alerts</span>
                </h3>
                <p className="text-xs text-slate-500 max-w-xl font-normal leading-relaxed">
                  Stay ahead of global demand. Set up real-time email triggers and daily digests whenever procurement officers publish verified wholesale RFQs corresponding to your industrial capacity.
                </p>
              </div>

              {/* Fully functional toggle switch */}
              <button
                type="button"
                onClick={() => {
                  setAlertsEnabled(!alertsEnabled);
                }}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  alertsEnabled ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    alertsEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Config Panel Content with beautiful disabled states when alerts are toggled off */}
            <form onSubmit={handleSaveSettings} className={`space-y-6 transition-all duration-300 ${!alertsEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
              
              {/* Alert Destination Email Input */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notification Alert Destination Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    disabled={!alertsEnabled}
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 bg-slate-50 hover:bg-slate-100 focus:bg-white text-xs text-slate-950 font-medium rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none transition-all"
                    placeholder="e.g., procurement@yourcompany.com"
                  />
                  <div className="absolute right-3 top-2 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Target</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-normal">
                  Alert dispatches will be delivered to this verified mailbox. Standard rates limits apply depending on your SaaS Tier.
                </p>
              </div>

              {/* Multi-select category options */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Sourcing Categories to Monitor
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!alertsEnabled}
                      onClick={handleSelectAllCategories}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300 text-xs">|</span>
                    <button
                      type="button"
                      disabled={!alertsEnabled}
                      onClick={handleDeselectAllCategories}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-600 cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        disabled={!alertsEnabled}
                        onClick={() => handleToggleCategory(cat)}
                        className={`flex items-center justify-between text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        {isChecked ? (
                          <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 font-normal">
                  You have matched <strong>{selectedCategories.length} out of {AVAILABLE_CATEGORIES.length}</strong> categories. New tenders outside this matching logic will not trigger email dispatches.
                </p>
              </div>

              {/* Frequency options */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Dispatch Frequency Interval
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { value: 'INSTANT', title: 'Instant Alert', desc: 'Notify me immediately' },
                    { value: 'DAILY', title: 'Daily Digest', desc: 'Single summary at 18:00' },
                    { value: 'WEEKLY', title: 'Weekly Digest', desc: 'Consolidated report' }
                  ].map((freqOption) => {
                    const isSelected = frequency === freqOption.value;
                    return (
                      <button
                        key={freqOption.value}
                        type="button"
                        disabled={!alertsEnabled}
                        onClick={() => setFrequency(freqOption.value as any)}
                        className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' 
                            : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs font-bold">{freqOption.title}</span>
                        <span className={`text-[9px] ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                          {freqOption.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit & Test dispatch bar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={!alertsEnabled}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer grow sm:grow-0"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Configuration</span>
                </button>

                <button
                  type="button"
                  onClick={handleTriggerSimulationTest}
                  disabled={testScenarioRunning || !alertsEnabled || selectedCategories.length === 0}
                  className="px-5 py-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {testScenarioRunning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Match...</span>
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4 text-blue-500 animate-pulse" />
                      <span>Simulate Live RFQ Trigger</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Alerts Off Banner */}
            {!alertsEnabled && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex gap-3 text-amber-900 text-xs animate-fadeIn">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold">Email Notifications Are Paused</h4>
                  <p className="text-slate-600 leading-relaxed font-normal">
                    You currently have category-matching emails turned off. You will not receive notifications when matching RFQs are published by buyers. Toggle the switch at the top right to reactivate.
                  </p>
                </div>
              </div>
            )}

            {/* Quick success message feedback */}
            {saveSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-slideUp">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Configuration preferences saved successfully to B2B Secure Local Storage!</span>
              </div>
            )}
          </div>

          {/* Sidebar Panel: Live Simulation & Mail Logs Tracker */}
          <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-lg">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold tracking-wider uppercase text-slate-300">Live Email Alert Logs</span>
                </div>
                {simulationLogs.length > 0 && (
                  <button
                    onClick={handleClearLogs}
                    className="text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer font-bold"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {simulationLogs.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <Mail className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    No simulated emails dispatched yet. Toggle email alerts on, verify your categories, and click the <strong className="text-blue-400 font-bold">Simulate Live RFQ Trigger</strong> button to fire an alert!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                  {simulationLogs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogForPreview(log)}
                      className="group p-3.5 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer space-y-2 text-left"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-slate-400 font-mono">
                          🕒 {log.timestamp}
                        </span>
                        <span className="text-[9px] font-black uppercase text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-900/60">
                          MATCH DISPATCHED
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors truncate">
                          {log.title}
                        </h4>
                        <div className="text-[10px] text-slate-400 truncate">
                          Category: <strong>{log.category}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>To: <span className="text-slate-300 truncate max-w-[120px] inline-block align-bottom font-mono">{log.email}</span></span>
                        <span className="text-blue-400 font-bold flex items-center gap-1 group-hover:underline">
                          <Eye className="w-3 h-3" /> Preview HTML
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sponsoring informational section */}
            <div className="pt-4 border-t border-slate-800 space-y-2">
              <div className="p-3.5 rounded-2xl bg-blue-950/50 border border-blue-900/30 text-blue-300 text-[11px] leading-relaxed font-normal">
                <span className="font-bold text-xs text-white block mb-0.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Instant B2B Mail Relays
                </span>
                Trade Heaven leverages localized SMTP clusters and instant webhooks. Sponsoring suppliers typically double their sales hit rates by responding to RFQs within the first 60 minutes of posting.
              </div>
            </div>
          </div>
        </div>
      )}

            {activeTab === 'DOCUMENTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          <div className="md:col-span-3 mb-2">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Standardized Document Library</h3>
            <p className="text-sm text-slate-500">Download official, globally recognized PDF templates for international trade transactions.</p>
          </div>

          {[
            {
              title: 'Commercial Invoice',
              desc: 'Standardized format for international customs declaration and valuation.',
              icon: <FileText className="w-6 h-6 text-blue-600" />
            },
            {
              title: 'Packing List',
              desc: 'Detailed itemized list of goods, weights, and packaging specs for freight forwarders.',
              icon: <Package className="w-6 h-6 text-indigo-600" />
            },
            {
              title: 'Bill of Lading (B/L)',
              desc: 'Official template for carrier receipt and contract of carriage.',
              icon: <Layers className="w-6 h-6 text-emerald-600" />
            }
          ].map((doc, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 mb-4">
                {doc.icon}
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{doc.title}</h4>
              <p className="text-xs text-slate-500 mb-6 flex-grow leading-relaxed">{doc.desc}</p>
              <button 
                onClick={() => handleDownloadTemplate(doc.title)} 
                className="mt-auto w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-sm font-bold transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Live Simulated Mail Client Popup / Preview Overlay */}
      {selectedLogForPreview && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-100 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Window title bar */}
            <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono font-bold text-slate-300 ml-2">Secure SMTP Mail Relay Inspector</span>
              </div>
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="w-8 h-8 rounded-full bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Header Info */}
            <div className="bg-slate-950 p-5 space-y-2 border-b border-slate-800 text-left text-xs font-mono">
              <div className="flex gap-4">
                <span className="text-slate-500 w-16 text-right select-none">From:</span>
                <span className="text-blue-400 font-bold">Trade Heaven RFQ Dispatcher &lt;alerts@tradeheaven.net&gt;</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500 w-16 text-right select-none">To:</span>
                <span className="text-slate-200">{selectedLogForPreview.email}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500 w-16 text-right select-none">Subject:</span>
                <span className="text-emerald-400 font-bold">⚡ [NEW MATCH] RFQ posted under category: "{selectedLogForPreview.category}"</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500 w-16 text-right select-none">Timestamp:</span>
                <span className="text-slate-400">{selectedLogForPreview.timestamp} (Simulated Dispatch)</span>
              </div>
            </div>

            {/* Email Body - Beautiful Rich HTML Render Simulation */}
            <div className="bg-slate-50 p-6 sm:p-8 overflow-y-auto text-left text-slate-800">
              <div className="bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto overflow-hidden shadow-xs">
                {/* Brand Header */}
                <div className="bg-slate-900 text-white p-5 text-center space-y-1">
                  <div className="font-black text-lg tracking-tight">TRADE HEAVEN</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Global Wholesale Sourcing Engine</div>
                </div>

                {/* Email Body Message */}
                <div className="p-6 space-y-5 text-sm">
                  <div className="space-y-1">
                    <h3 className="font-bold text-base text-slate-900">
                      Hello Verified Trade Partner,
                    </h3>
                    <p className="text-xs text-slate-600">
                      A brand-new wholesale sourcing tender has been posted by an verified buyer that matches your pre-registered category interest:
                    </p>
                  </div>

                  {/* Highlights block */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs leading-normal">
                    <div className="pb-2 border-b border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Product Name Required:</span>
                      <strong className="text-sm font-black text-slate-900">{selectedLogForPreview.title}</strong>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Category Filter:</span>
                        <strong className="text-slate-800 font-semibold">{selectedLogForPreview.category}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Procurement Volume:</span>
                        <strong className="text-slate-800 font-bold">{selectedLogForPreview.quantity}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Preferred Incoterm:</span>
                        <strong className="text-blue-700 font-bold">{selectedLogForPreview.incoterm}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Target Price limit:</span>
                        <strong className="text-slate-800 font-bold font-mono">{selectedLogForPreview.price}</strong>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Destination Port:</span>
                      <strong className="text-slate-800 font-semibold">{selectedLogForPreview.destination}</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-1">
                    <span className="font-bold block">🛡️ Trade Heaven Assurance &amp; trade protection Included</span>
                    <span>The buyer has opted into Trade Heaven&apos;s Swiss trade protection system. Sourcing funds are escrowed before manufacture, fully securing your cash flows.</span>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedLogForPreview(null);
                        setActiveTab('RFQS');
                      }}
                      className="inline-block px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-100 cursor-pointer"
                    >
                      Prepare Quotation Bid Now
                    </button>
                  </div>
                </div>

                {/* Email Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-200 text-center text-[10px] text-slate-400 space-y-1">
                  <span>© 2026 Trade Heaven AG. All rights reserved.</span>
                  <div className="flex justify-center gap-3">
                    <span className="underline">Unsubscribe</span>
                    <span>•</span>
                    <span className="underline">Modify Sourcing Alerts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-800 border-t border-slate-700 text-right">
              <button
                type="button"
                onClick={() => setSelectedLogForPreview(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Close Mail Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Incoming Alert Live Toast overlay */}
      {liveNotificationToast.show && (
        <div className="fixed bottom-6 right-6 bg-slate-900 text-white border border-slate-700 p-4.5 rounded-2xl shadow-2xl w-80 max-w-sm z-200 animate-slideUp flex gap-3 items-start">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm shadow-blue-500/20">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>
          <div className="space-y-1 text-left select-none">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Dynamic Email Dispatched!</span>
              <button 
                onClick={() => setLiveNotificationToast(prev => ({ ...prev, show: false }))} 
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <h4 className="font-extrabold text-xs text-white truncate max-w-[200px]">
              {liveNotificationToast.title}
            </h4>
            <p className="text-[10px] text-slate-400 leading-normal font-normal">
              Matched: <strong className="text-slate-300 font-semibold">{liveNotificationToast.category}</strong>. Sent to <span className="text-blue-300 underline font-mono">{liveNotificationToast.email}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
