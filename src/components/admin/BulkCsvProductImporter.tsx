import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Package, 
  ArrowRight,
  FileText,
  Check,
  HelpCircle
} from 'lucide-react';

interface ImportedProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  minOrder: string;
  unit: string;
  supplierCompany: string;
  country: string;
  description: string;
  imageUrl: string;
  certifications: string[];
  status: 'valid' | 'error';
  errorMessage?: string;
}

const SAMPLE_CSV = `Title,Category,Price,MinOrder,Unit,SupplierCompany,Country,Description,ImageUrl,Certifications
"Refined Petroleum EN590 10ppm","Energy & Fuels",680,50000,"Metric Tons","Vostok Energy Corp SA","Russia","Ultra-low sulfur gasoil for export","https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800","ISO 9001, GOST"
"Thermal Coal FOB Nakhodka","Energy & Fuels",95,10000,"Metric Tons","Siberian Mineral Resources","Russia","High calorie thermal coal for power generation","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","ASTM, SGS Certified"
"Industrial Grade Urea 46% Nitrogen","Chemicals",320,500,"Metric Tons","Global Agri-Chem Ltd","Oman","Prilled nitrogen fertilizer for bulk agriculture","https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800","REACH, ISO 14001"
"Virgin HDPE Film Grade Granules","Polymers & Plastics",1150,25,"Metric Tons","PetroGlobal Polymers","United Arab Emirates","High-density polyethylene for blown film extrusion","https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800","FDA, ISO 9001"`;

export const BulkCsvProductImporter: React.FC<{
  onImportSuccess: (count: number) => void;
}> = ({ onImportSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [parsedProducts, setParsedProducts] = useState<ImportedProduct[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<{ success: number; errors: number } | null>(null);

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'trade_heaven_product_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsvData = (text: string) => {
    if (!text.trim()) {
      setParsedProducts([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return;

    // Simple robust CSV parser handling quoted fields with commas
    const parseLine = (line: string) => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headers = parseLine(lines[0]);
    const results: ImportedProduct[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseLine(line);
      
      const title = values[0] || '';
      const category = values[1] || 'General';
      const price = parseFloat(values[2]) || 0;
      const minOrder = values[3] || '1 Unit';
      const unit = values[4] || 'Units';
      const supplierCompany = values[5] || 'Verified Global Supplier';
      const country = values[6] || 'Global';
      const description = values[7] || title;
      const imageUrl = values[8] || 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800';
      const certsRaw = values[9] || '';
      const certifications = certsRaw ? certsRaw.split(',').map(s => s.trim()).filter(Boolean) : ['ISO 9001'];

      let status: 'valid' | 'error' = 'valid';
      let errorMessage = '';

      if (!title) {
        status = 'error';
        errorMessage = 'Missing product title';
      } else if (price <= 0) {
        status = 'error';
        errorMessage = 'Invalid price value';
      }

      results.push({
        id: `IMP-${Date.now()}-${i}`,
        title,
        category,
        price,
        minOrder,
        unit,
        supplierCompany,
        country,
        description,
        imageUrl,
        certifications,
        status,
        errorMessage
      });
    }

    setParsedProducts(results);
    setImportSummary(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCsvData(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_CSV);
    parseCsvData(SAMPLE_CSV);
  };

  const handleExecuteImport = () => {
    const validRows = parsedProducts.filter(p => p.status === 'valid');
    if (validRows.length === 0) return;

    setIsImporting(true);
    setTimeout(() => {
      // Save to localStorage so product catalog picks them up
      try {
        const existingCustom = JSON.parse(localStorage.getItem('trade_heaven_custom_products') || '[]');
        const updatedCustom = [...validRows, ...existingCustom];
        localStorage.setItem('trade_heaven_custom_products', JSON.stringify(updatedCustom));
      } catch (err) {
        console.error('Failed to save imported products to local storage', err);
      }

      setIsImporting(false);
      setImportSummary({ success: validRows.length, errors: parsedProducts.length - validRows.length });
      onImportSuccess(validRows.length);
    }, 1000);
  };

  const validCount = parsedProducts.filter(p => p.status === 'valid').length;
  const errorCount = parsedProducts.filter(p => p.status === 'error').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-blue-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Supplier Catalog Onboarding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Bulk CSV Product Importer</h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Upload spreadsheets or paste comma-separated values to instantly onboard thousands of wholesale products, OEM commodities, and factory specifications.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs sm:text-sm text-white flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download CSV Template</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
            >
              <FileText className="w-4 h-4" />
              <span>Load Sample CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload and Paste Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload CSV File</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select a .csv file exported from your ERP or supplier database.
            </p>
            <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-blue-50/50 transition-all text-center group">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 mb-1">Click to browse CSV file</span>
              <span className="text-[11px] text-slate-400">Supports up to 50MB CSV files</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Required Columns:</span>
              <span className="text-slate-700 font-bold">Title, Category, Price, MinOrder, Unit, Supplier, Country, Description, ImageUrl</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Paste CSV Raw Data</span>
            </h3>
            {csvText && (
              <button
                onClick={() => { setCsvText(''); setParsedProducts([]); setImportSummary(null); }}
                className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
          <textarea
            value={csvText}
            onChange={(e) => {
              setCsvText(e.target.value);
              parseCsvData(e.target.value);
            }}
            placeholder="Paste your CSV rows here (including header row)..."
            rows={7}
            className="w-full rounded-2xl border border-slate-300 p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          ></textarea>
        </div>
      </div>

      {/* Preview Section */}
      {parsedProducts.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Import Preview & Validation</h3>
              <p className="text-xs text-slate-500">
                Found <span className="font-bold text-slate-900">{parsedProducts.length}</span> total rows ({validCount} valid ready to import, {errorCount} errors).
              </p>
            </div>
            <div className="flex items-center gap-3">
              {importSummary ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully imported {importSummary.success} products!</span>
                </div>
              ) : (
                <button
                  onClick={handleExecuteImport}
                  disabled={isImporting || validCount === 0}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                >
                  {isImporting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Importing Products...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Import {validCount} Products Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price (USD)</th>
                  <th className="py-3 px-4">Min. Order</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Country</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {parsedProducts.map((p, index) => (
                  <tr key={index} className={`hover:bg-slate-50/80 ${p.status === 'error' ? 'bg-red-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      {p.status === 'valid' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-800 text-[11px] font-bold" title={p.errorMessage}>
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{p.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">{p.category}</span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-600">${p.price.toLocaleString()}</td>
                    <td className="py-3 px-4">{p.minOrder} {p.unit}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{p.supplierCompany}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600">
                        📍 {p.country}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
