import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Building2, 
  FileText, 
  HelpCircle, 
  Upload, 
  FileSpreadsheet, 
  ClipboardPaste, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Copy, 
  Plus, 
  Download, 
  Send, 
  ShieldCheck, 
  RefreshCw, 
  ArrowRight, 
  UserCheck, 
  Sparkles,
  Info,
  Check,
  X
} from 'lucide-react';

export type EntityCategory = 'BUYER_LEAD' | 'SUPPLIER_PROFILE' | 'RFQ' | 'GENERAL_INQUIRY';
export type InputMode = 'SPREADSHEET' | 'UPLOADER' | 'SMART_PASTE';

export interface RowValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface BulkEntityRecord {
  id: string;
  // Common / Buyer
  companyName?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  targetProduct?: string;
  requiredQuantity?: string;
  budget?: string;
  priority?: 'HOT' | 'WARM' | 'COLD';
  
  // Supplier specific
  category?: string;
  starRating?: number;
  productShowcaseLimit?: number;
  assignedManager?: string;

  // RFQ specific
  rfqTitle?: string;
  targetPrice?: string;
  volumeUnit?: string;
  portOfDestination?: string;
  incoterm?: string;
  expiryDate?: string;

  // General Inquiry specific
  subject?: string;
  message?: string;
  inquiryType?: string;
  status?: string;

  // Meta
  assignedIem?: string;
  isSynced?: boolean;
}

const INITIAL_IEM_MANAGERS = [
  'IEM Sarah Jenkins (Global Accounts)',
  'IEM Michael Chang (APAC Manufacturing)',
  'IEM David Vance (EMEA Trade)',
  'IEM Elena Rostova (Americas Sourcing)',
  'IEM Omar Al-Farsi (MENA Procurement)'
];

const SAMPLE_DATA: Record<EntityCategory, BulkEntityRecord[]> = {
  BUYER_LEAD: [
    { id: 'b-1', companyName: 'Apex Global Logistics & Sourcing', contactPerson: 'Marcus Vance', email: 'm.vance@apexglobal.com', phone: '+1-415-892-3321', country: 'United States', targetProduct: 'Solar Inverters 10kW', requiredQuantity: '500 units', budget: '$120,000', priority: 'HOT', assignedIem: 'IEM Sarah Jenkins' },
    { id: 'b-2', companyName: 'Bavarian Auto Components GmbH', contactPerson: 'Greta Schmidt', email: 'schmidt@bavarian-auto.de', phone: '+49-89-4412-90', country: 'Germany', targetProduct: 'CNC Aluminum Castings', requiredQuantity: '2,500 pcs', budget: '€85,000', priority: 'WARM', assignedIem: 'IEM David Vance' },
    { id: 'b-3', companyName: 'Tokyo Retail Enterprises', contactPerson: 'Kenji Sato', email: 'k-sato@tokyoretail.jp', phone: '+81-3-5521-8840', country: 'Japan', targetProduct: 'Organic Cotton Apparel', requiredQuantity: '10,000 units', budget: '$45,000', priority: 'HOT', assignedIem: 'IEM Michael Chang' },
    { id: 'b-4', companyName: 'Dubai Horizon Trading FZE', contactPerson: 'Tariq Al-Mansoor', email: 'tariq@horizon-dubai.ae', phone: '+971-4-332-9911', country: 'United Arab Emirates', targetProduct: 'Refined Sunflower Oil', requiredQuantity: '20 Metric Tons', budget: '$30,000', priority: 'COLD', assignedIem: 'IEM Omar Al-Farsi' },
    { id: 'b-5', companyName: 'São Paulo Importadora Ltda', contactPerson: 'Camila Silva', email: 'csilva@spimport.com.br', phone: '+55-11-3099-4411', country: 'Brazil', targetProduct: 'Medical Nitrile Gloves', requiredQuantity: '50,000 boxes', budget: '$150,000', priority: 'HOT', assignedIem: 'IEM Elena Rostova' }
  ],
  SUPPLIER_PROFILE: [
    { id: 's-1', companyName: 'Zhejiang Precision Machinery Co.', contactPerson: 'Chen Wei', email: 'export@zjprecision.cn', phone: '+86-571-8899-2211', country: 'China', category: 'Industrial Machinery', starRating: 5, productShowcaseLimit: 50, assignedIem: 'IEM Michael Chang' },
    { id: 's-2', companyName: 'Vanguard Steel & Alloy Works', contactPerson: 'Rajesh Patel', email: 'sales@vanguardsteel.in', phone: '+91-22-6644-1122', country: 'India', category: 'Metals & Metallurgy', starRating: 4, productShowcaseLimit: 30, assignedIem: 'IEM Sarah Jenkins' },
    { id: 's-3', companyName: 'Nordic Timber & Pulp AB', contactPerson: 'Lars Lindqvist', email: 'orders@nordictimber.se', phone: '+46-8-555-1234', country: 'Sweden', category: 'Forestry & Paper', starRating: 5, productShowcaseLimit: 40, assignedIem: 'IEM David Vance' },
    { id: 's-4', companyName: 'Andean Agro-Export S.A.C.', contactPerson: 'Sofia Mendoza', email: 'smendoza@andeanagro.pe', phone: '+51-1-442-9900', country: 'Peru', category: 'Agriculture & Foods', starRating: 4, productShowcaseLimit: 25, assignedIem: 'IEM Elena Rostova' }
  ],
  RFQ: [
    { id: 'r-1', rfqTitle: 'High-Efficiency Monocrystalline Solar Panels 550W', targetPrice: '$110 / panel', volumeUnit: '2,000 Panels', portOfDestination: 'Port of Rotterdam, Netherlands', incoterm: 'CIF', expiryDate: '2026-09-30', companyName: 'EcoPower Solutions BV', contactPerson: 'Jan van Dijk', email: 'jan@ecopower.nl', assignedIem: 'IEM David Vance' },
    { id: 'r-2', rfqTitle: 'Lithium-Ion Battery Cell 3.2V 100Ah for EV Storage', targetPrice: '$45 / cell', volumeUnit: '5,000 Cells', portOfDestination: 'Port of Long Beach, USA', incoterm: 'FOB', expiryDate: '2026-10-15', companyName: 'VoltDrive Systems Inc', contactPerson: 'Sarah Connor', email: 'sconnor@voltdrive.us', assignedIem: 'IEM Sarah Jenkins' },
    { id: 'r-3', rfqTitle: 'Seamless Carbon Steel Pipes API 5L Gr. B', targetPrice: '$820 / Ton', volumeUnit: '450 Metric Tons', portOfDestination: 'Jebel Ali Port, UAE', incoterm: 'CFR', expiryDate: '2026-09-15', companyName: 'Gulf Pipeline Contractors', contactPerson: 'Nasser Al-Sabah', email: 'nasser@gulfpipes.kw', assignedIem: 'IEM Omar Al-Farsi' }
  ],
  GENERAL_INQUIRY: [
    { id: 'g-1', subject: 'Custom Customs Clearance Inquiry for ASEAN shipments', contactPerson: 'Li Ming', companyName: 'Shanghai Express Logistics', email: 'ming@shanghaiexpress.cn', phone: '+86-21-6000-1111', message: 'Seeking official advisory on customs expedited clearance for electronic parts entering Rotterdam.', inquiryType: 'Customs & Regulatory', status: 'Pending Review' },
    { id: 'g-2', subject: 'Trade Assurance Escrow limit increase request', contactPerson: 'Arthur Pendelton', companyName: 'Global Trade Partners UK', email: 'arthur@gtpuk.co.uk', phone: '+44-20-7946-0912', message: 'We wish to elevate our escrow threshold to $500,000 for upcoming bulk agricultural shipments.', inquiryType: 'Trade Finance', status: 'In Review' }
  ]
};

export const BulkEntityCrmModule: React.FC = () => {
  const [entityCategory, setEntityCategory] = useState<EntityCategory>('BUYER_LEAD');
  const [inputMode, setInputMode] = useState<InputMode>('SPREADSHEET');
  const [records, setRecords] = useState<BulkEntityRecord[]>(SAMPLE_DATA['BUYER_LEAD']);
  const [globalIem, setGlobalIem] = useState<string>('IEM Sarah Jenkins (Global Accounts)');
  const [rawPasteText, setRawPasteText] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessCount, setSubmitSuccessCount] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // When entity category changes, switch records
  useEffect(() => {
    setRecords(SAMPLE_DATA[entityCategory] || []);
    setSubmitSuccessCount(null);
  }, [entityCategory]);

  // Validation function for a record
  const validateRecord = (rec: BulkEntityRecord, category: EntityCategory): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (category === 'BUYER_LEAD') {
      if (!rec.companyName?.trim()) errs.companyName = 'Company name is required';
      if (!rec.contactPerson?.trim()) errs.contactPerson = 'Contact person required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
      if (!rec.country?.trim()) errs.country = 'Country required';
    } else if (category === 'SUPPLIER_PROFILE') {
      if (!rec.companyName?.trim()) errs.companyName = 'Company name required';
      if (!rec.category?.trim()) errs.category = 'Category required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
    } else if (category === 'RFQ') {
      if (!rec.rfqTitle?.trim()) errs.rfqTitle = 'RFQ title required';
      if (!rec.companyName?.trim()) errs.companyName = 'Buyer company required';
      if (!rec.portOfDestination?.trim()) errs.portOfDestination = 'Destination port required';
    } else if (category === 'GENERAL_INQUIRY') {
      if (!rec.subject?.trim()) errs.subject = 'Subject required';
      if (!rec.contactPerson?.trim()) errs.contactPerson = 'Name required';
      if (!rec.email?.includes('@')) errs.email = 'Valid email required';
    }
    return errs;
  };

  const validationResults = records.map(r => {
    const errs = validateRecord(r, entityCategory);
    return { isValid: Object.keys(errs).length === 0, errors: errs };
  });

  const totalRows = records.length;
  const validCount = validationResults.filter(v => v.isValid).length;
  const errorCount = totalRows - validCount;

  // Handlers for record updates
  const handleUpdateCell = (index: number, field: keyof BulkEntityRecord, value: any) => {
    const updated = [...records];
    updated[index] = { ...updated[index], [field]: value };
    setRecords(updated);
  };

  const handleAddRow = () => {
    const newId = `rec-${Date.now()}`;
    const emptyRec: BulkEntityRecord = { id: newId, assignedIem: globalIem };
    if (entityCategory === 'BUYER_LEAD') {
      emptyRec.companyName = '';
      emptyRec.contactPerson = '';
      emptyRec.email = '';
      emptyRec.country = '';
      emptyRec.priority = 'WARM';
    } else if (entityCategory === 'SUPPLIER_PROFILE') {
      emptyRec.companyName = '';
      emptyRec.category = '';
      emptyRec.starRating = 4;
      emptyRec.productShowcaseLimit = 25;
    } else if (entityCategory === 'RFQ') {
      emptyRec.rfqTitle = '';
      emptyRec.companyName = '';
      emptyRec.volumeUnit = '';
      emptyRec.portOfDestination = '';
    } else {
      emptyRec.subject = '';
      emptyRec.contactPerson = '';
      emptyRec.email = '';
    }
    setRecords([emptyRec, ...records]);
  };

  const handleDeleteRow = (index: number) => {
    setRecords(records.filter((_, idx) => idx !== index));
  };

  const handleCloneRow = (index: number) => {
    const target = records[index];
    const cloned: BulkEntityRecord = { ...target, id: `rec-${Date.now()}` };
    const updated = [...records];
    updated.splice(index + 1, 0, cloned);
    setRecords(updated);
  };

  const handleApplyGlobalIem = () => {
    const updated = records.map(r => ({ ...r, assignedIem: globalIem }));
    setRecords(updated);
    showToast(`Assigned ${globalIem} to all ${records.length} records successfully.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Smart Paste parser
  const handleParseSmartPaste = () => {
    if (!rawPasteText.trim()) return;
    const lines = rawPasteText.split('\n').filter(l => l.trim().length > 0);
    const parsed: BulkEntityRecord[] = [];
    lines.forEach((line, idx) => {
      const parts = line.split('\t').length > 1 ? line.split('\t') : line.split(',');
      if (parts.length >= 2) {
        parsed.push({
          id: `paste-${Date.now()}-${idx}`,
          companyName: parts[0]?.trim() || 'Imported Co',
          contactPerson: parts[1]?.trim() || 'Contact',
          email: parts[2]?.trim() || 'import@tradeheaven.org',
          phone: parts[3]?.trim() || '+1-800-555-0199',
          country: parts[4]?.trim() || 'Global',
          targetProduct: parts[5]?.trim() || 'General Cargo',
          assignedIem: globalIem
        });
      }
    });
    if (parsed.length > 0) {
      setRecords([...parsed, ...records]);
      setInputMode('SPREADSHEET');
      setRawPasteText('');
      showToast(`Successfully parsed and added ${parsed.length} records from raw paste.`);
    } else {
      showToast('Could not parse paste data. Please use Tab or Comma delimited format.');
    }
  };

  // File Upload simulation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSubmitting(true);
    setTimeout(() => {
      // simulate CSV parse
      const mockImported: BulkEntityRecord[] = [
        { id: `file-1`, companyName: `${file.name.split('.')[0]} Enterprise`, contactPerson: 'Arthur Pendelton', email: 'arthur@enterprise.com', phone: '+1-212-555-0144', country: 'United Kingdom', targetProduct: 'Industrial Automation Units', requiredQuantity: '100 units', budget: '£75,000', priority: 'HOT', assignedIem: globalIem },
        { id: `file-2`, companyName: 'Pacific Rim Importers Ltd', contactPerson: 'Mei Lin', email: 'mlin@pacificrim.hk', phone: '+852-2810-0011', country: 'Hong Kong', targetProduct: 'Consumer Electronics', requiredQuantity: '5,000 pcs', budget: '$220,000', priority: 'HOT', assignedIem: globalIem },
        { id: `file-3`, companyName: 'Mediterranean Freight & Trading', contactPerson: 'Giannis Papadopoulos', email: 'gpap@medfreight.gr', phone: '+30-210-555-4321', country: 'Greece', targetProduct: 'Extra Virgin Olive Oil Bulk', requiredQuantity: '50 Metric Tons', budget: '€110,000', priority: 'WARM', assignedIem: globalIem }
      ];
      setRecords([...mockImported, ...records]);
      setIsSubmitting(false);
      setInputMode('SPREADSHEET');
      showToast(`Successfully imported 3 verified rows from ${file.name}`);
    }, 800);
  };

  // Export Sample CSV
  const handleExportSampleTemplate = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (entityCategory === 'BUYER_LEAD') {
      csvContent += "Company Name,Contact Person,Email,Phone,Country,Target Product,Required Quantity,Budget,Priority\n";
      csvContent += "Apex Global,Marcus Vance,m.vance@apex.com,+14158923321,USA,Solar Inverters,500 units,$120000,HOT\n";
    } else if (entityCategory === 'SUPPLIER_PROFILE') {
      csvContent += "Company Name,Category,Email,Phone,Country,Star Rating,Showcase Limit\n";
      csvContent += "Zhejiang Machinery,Industrial Machinery,export@zj.cn,+865718899,China,5,50\n";
    } else if (entityCategory === 'RFQ') {
      csvContent += "RFQ Title,Buyer Company,Contact Email,Volume Unit,Target Price,Port of Destination,Incoterm\n";
      csvContent += "Solar Panels 550W,EcoPower BV,jan@ecopower.nl,2000 Panels,$110,Rotterdam,CIF\n";
    } else {
      csvContent += "Subject,Contact Person,Company,Email,Phone,Inquiry Type,Message\n";
      csvContent += "Customs Clearance,Li Ming,Shanghai Express,ming@shanghai.cn,+86216000,Customs,Advisory needed\n";
    }
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trade_heaven_${entityCategory.toLowerCase()}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded official CSV sample template for ${entityCategory}.`);
  };

  // Submit to CRM / Marketplace
  const handlePushToCrm = () => {
    if (validCount === 0) {
      showToast('No valid records to submit. Please check validation errors.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccessCount(validCount);
      showToast(`Successfully synchronized ${validCount} ${entityCategory} records into Trade Heaven CRM & Marketplace database!`);
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-bounce">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Enterprise CRM &amp; Bulk Import Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Bulk Lead &amp; Entity Management
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              Instantly parse, validate, assign, and push multi-row batches of B2B buyer inquiries, verified suppliers, RFQs, and trade records into the Trade Heaven global marketplace database.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportSampleTemplate}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/15 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export CSV Template</span>
            </button>
            <button
              onClick={handlePushToCrm}
              disabled={isSubmitting || validCount === 0}
              className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <Send className="w-4 h-4 text-slate-950" />
              )}
              <span>Push {validCount} Records to CRM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Banner if pushed */}
      {submitSuccessCount !== null && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-black text-emerald-950">Batch Synchronization Successful!</h3>
              <p className="text-xs text-emerald-800">
                Successfully pushed {submitSuccessCount} records of type <span className="font-bold underline">{entityCategory}</span> into the Trade Heaven live database and assigned managers.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSubmitSuccessCount(null)}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-950 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Entity Selector & Mode Switcher Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          
          {/* Entity Category Selector */}
          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              1. Select Target Entity Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'BUYER_LEAD', label: 'Buyer Leads', icon: Users },
                { id: 'SUPPLIER_PROFILE', label: 'Suppliers', icon: Building2 },
                { id: 'RFQ', label: 'RFQs', icon: FileText },
                { id: 'GENERAL_INQUIRY', label: 'Inquiries', icon: HelpCircle }
              ].map(cat => {
                const Icon = cat.icon;
                const isSelected = entityCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setEntityCategory(cat.id as EntityCategory)}
                    className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-md ring-2 ring-slate-950/20'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Input Mode Selector */}
          <div className="space-y-2 w-full lg:w-auto">
            <label className="text-xs font-black text-slate-500 uppercase tracking-wider">
              2. Choose Input Method
            </label>
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200">
              {[
                { id: 'SPREADSHEET', label: 'Spreadsheet Grid', icon: FileSpreadsheet },
                { id: 'UPLOADER', label: 'CSV / Excel Upload', icon: Upload },
                { id: 'SMART_PASTE', label: 'Smart Paste', icon: ClipboardPaste }
              ].map(mode => {
                const Icon = mode.icon;
                const isSelected = inputMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setInputMode(mode.id as InputMode)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-950 shadow-xs font-black'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Global IEM Manager Assignment Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-800 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900">Global IEM Manager &amp; Account Assignment</h4>
              <p className="text-[11px] text-slate-600">Assign all current batch records to a dedicated International Export Manager.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={globalIem}
              onChange={(e) => setGlobalIem(e.target.value)}
              className="px-3 py-2 rounded-xl bg-white border border-amber-300 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 w-full sm:w-64"
            >
              {INITIAL_IEM_MANAGERS.map(mgr => (
                <option key={mgr} value={mgr}>{mgr}</option>
              ))}
            </select>
            <button
              onClick={handleApplyGlobalIem}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-colors shrink-0 cursor-pointer"
            >
              Apply to All
            </button>
          </div>
        </div>

      </div>

      {/* Main Content View based on Input Mode */}
      {inputMode === 'UPLOADER' && (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mx-auto flex items-center justify-center">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-slate-900">Upload CSV, XLS, or XLSX Spreadsheet</h3>
              <p className="text-xs text-slate-500">Drag and drop your file here, or click browse to auto-parse and stage records.</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx, .xls, .txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Browse Files on Computer
            </button>
            <p className="text-[11px] text-slate-400">Supported formats: .CSV, .XLSX, .XLS. Maximum batch size: 500 rows.</p>
          </div>
        </div>
      )}

      {inputMode === 'SMART_PASTE' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">Smart Paste from Excel / Google Sheets</h3>
              <p className="text-xs text-slate-500">Paste your tab-separated spreadsheet rows directly below. Columns will be auto-mapped.</p>
            </div>
            <button
              onClick={handleParseSmartPaste}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Parse &amp; Load Records</span>
            </button>
          </div>
          <textarea
            rows={8}
            value={rawPasteText}
            onChange={(e) => setRawPasteText(e.target.value)}
            placeholder={`Company Name\tContact Person\tEmail\tPhone\tCountry\tTarget Product\nApex Global\tMarcus Vance\tm.vance@apex.com\t+14158923321\tUSA\tSolar Inverters\nBavarian Auto\tGreta Schmidt\tschmidt@bavarian.de\t+4989441290\tGermany\tCNC Castings`}
            className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {inputMode === 'SPREADSHEET' && (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
          
          {/* Table Control Bar */}
          <div className="p-6 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-black text-slate-900">Staging Grid &amp; Inline Editor</h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-bold">Total: {totalRows}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">Valid: {validCount}</span>
                {errorCount > 0 && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">Errors: {errorCount}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* Spreadsheet Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-black tracking-wider border-b border-slate-200">
                  <th className="p-3 w-12 text-center">#</th>
                  {entityCategory === 'BUYER_LEAD' && (
                    <>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Contact Person</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone / WhatsApp</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Target Product</th>
                      <th className="p-3">Budget</th>
                      <th className="p-3">Priority</th>
                    </>
                  )}
                  {entityCategory === 'SUPPLIER_PROFILE' && (
                    <>
                      <th className="p-3">Company Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Country</th>
                      <th className="p-3">Star Rating</th>
                      <th className="p-3">Showcase Limit</th>
                    </>
                  )}
                  {entityCategory === 'RFQ' && (
                    <>
                      <th className="p-3">RFQ Title</th>
                      <th className="p-3">Buyer Company</th>
                      <th className="p-3">Contact Email</th>
                      <th className="p-3">Volume / Unit</th>
                      <th className="p-3">Target Price</th>
                      <th className="p-3">Destination Port</th>
                      <th className="p-3">Incoterm</th>
                    </>
                  )}
                  {entityCategory === 'GENERAL_INQUIRY' && (
                    <>
                      <th className="p-3">Subject</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Inquiry Type</th>
                      <th className="p-3">Status</th>
                    </>
                  )}
                  <th className="p-3">Assigned IEM</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec, index) => {
                  const valRes = validationResults[index];
                  return (
                    <tr key={rec.id} className={`hover:bg-slate-50/80 transition-colors ${!valRes.isValid ? 'bg-rose-50/30' : ''}`}>
                      <td className="p-3 text-center font-mono text-slate-400 font-bold">
                        {index + 1}
                      </td>

                      {entityCategory === 'BUYER_LEAD' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                              placeholder="Company Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.contactPerson || ''}
                              onChange={(e) => handleUpdateCell(index, 'contactPerson', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Contact Person"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border ${valRes.errors.email ? 'border-rose-400 bg-rose-50' : 'border-slate-200'} focus:bg-white focus:ring-1 focus:ring-blue-500`}
                              placeholder="Email Address"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.phone || ''}
                              onChange={(e) => handleUpdateCell(index, 'phone', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                              placeholder="Phone / WhatsApp"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.country || ''}
                              onChange={(e) => handleUpdateCell(index, 'country', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Country"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.targetProduct || ''}
                              onChange={(e) => handleUpdateCell(index, 'targetProduct', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500"
                              placeholder="Commodity / Product"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.budget || ''}
                              onChange={(e) => handleUpdateCell(index, 'budget', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
                              placeholder="Budget USD"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.priority || 'WARM'}
                              onChange={(e) => handleUpdateCell(index, 'priority', e.target.value)}
                              className={`px-2 py-1.5 rounded-lg text-[11px] font-black border ${
                                rec.priority === 'HOT' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                                rec.priority === 'WARM' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                                'bg-slate-100 text-slate-700 border-slate-300'
                              }`}
                            >
                              <option value="HOT">HOT</option>
                              <option value="WARM">WARM</option>
                              <option value="COLD">COLD</option>
                            </select>
                          </td>
                        </>
                      )}

                      {entityCategory === 'SUPPLIER_PROFILE' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white font-medium"
                              placeholder="Supplier Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.category || ''}
                              onChange={(e) => handleUpdateCell(index, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white"
                              placeholder="Industry Category"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 focus:bg-white"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.phone || ''}
                              onChange={(e) => handleUpdateCell(index, 'phone', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Phone"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.country || ''}
                              onChange={(e) => handleUpdateCell(index, 'country', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Country"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.starRating || 4}
                              onChange={(e) => handleUpdateCell(index, 'starRating', Number(e.target.value))}
                              className="px-2 py-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px]"
                            >
                              <option value="3">3 Star Vetted</option>
                              <option value="4">4 Star Verified</option>
                              <option value="5">5 Star Elite</option>
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={rec.productShowcaseLimit || 25}
                              onChange={(e) => handleUpdateCell(index, 'productShowcaseLimit', Number(e.target.value))}
                              className="w-20 px-2 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-center"
                            />
                          </td>
                        </>
                      )}

                      {entityCategory === 'RFQ' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.rfqTitle || ''}
                              onChange={(e) => handleUpdateCell(index, 'rfqTitle', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium"
                              placeholder="Requirement Title"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Buyer Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.volumeUnit || ''}
                              onChange={(e) => handleUpdateCell(index, 'volumeUnit', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Volume (e.g. 2000 Units)"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.targetPrice || ''}
                              onChange={(e) => handleUpdateCell(index, 'targetPrice', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-[11px]"
                              placeholder="Target Price"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.portOfDestination || ''}
                              onChange={(e) => handleUpdateCell(index, 'portOfDestination', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Destination Port"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={rec.incoterm || 'CIF'}
                              onChange={(e) => handleUpdateCell(index, 'incoterm', e.target.value)}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 font-bold text-[11px]"
                            >
                              <option value="CIF">CIF</option>
                              <option value="FOB">FOB</option>
                              <option value="EXW">EXW</option>
                              <option value="DDP">DDP</option>
                            </select>
                          </td>
                        </>
                      )}

                      {entityCategory === 'GENERAL_INQUIRY' && (
                        <>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.subject || ''}
                              onChange={(e) => handleUpdateCell(index, 'subject', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 font-medium"
                              placeholder="Inquiry Subject"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.contactPerson || ''}
                              onChange={(e) => handleUpdateCell(index, 'contactPerson', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Contact Name"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.companyName || ''}
                              onChange={(e) => handleUpdateCell(index, 'companyName', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Company"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="email"
                              value={rec.email || ''}
                              onChange={(e) => handleUpdateCell(index, 'email', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Email"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={rec.inquiryType || ''}
                              onChange={(e) => handleUpdateCell(index, 'inquiryType', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                              placeholder="Type"
                            />
                          </td>
                          <td className="p-2">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                              {rec.status || 'Pending'}
                            </span>
                          </td>
                        </>
                      )}

                      {/* Assigned IEM Column */}
                      <td className="p-2">
                        <select
                          value={rec.assignedIem || globalIem}
                          onChange={(e) => handleUpdateCell(index, 'assignedIem', e.target.value)}
                          className="w-36 px-2 py-1 rounded-lg bg-slate-100 text-[11px] font-bold text-slate-700 border border-slate-200 truncate"
                        >
                          {INITIAL_IEM_MANAGERS.map(m => (
                            <option key={m} value={m}>{m.split(' ')[0]} {m.split(' ')[1]}</option>
                          ))}
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleCloneRow(index)}
                            title="Clone Row"
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRow(index)}
                            title="Delete Row"
                            className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer Batch Summary Bar */}
          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span className="font-bold">Batch Summary:</span>
              <span>Total Rows: <strong className="text-slate-900 font-mono">{totalRows}</strong></span>
              <span>Valid Records: <strong className="text-emerald-700 font-mono">{validCount}</strong></span>
              {errorCount > 0 && (
                <span className="text-rose-600 flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{errorCount} rows have validation warnings</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleAddRow}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-300 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Another Row</span>
              </button>
              <button
                onClick={handlePushToCrm}
                disabled={isSubmitting || validCount === 0}
                className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-4 h-4 text-slate-950" />
                )}
                <span>Push {validCount} Records to Database</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
