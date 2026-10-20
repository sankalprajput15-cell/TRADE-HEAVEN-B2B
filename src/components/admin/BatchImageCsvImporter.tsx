import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  RefreshCw, 
  Image as ImageIcon, 
  Check,
  FileText
} from 'lucide-react';
import { MOCK_PRODUCTS } from '../../data/mockData';
import { productImageManagerService } from '../../services/productImageManagerService';

interface ImageBatchRow {
  sku: string;
  productTitle: string;
  primaryImageUrl: string;
  galleryUrls: string[];
  status: 'matched' | 'unmatched' | 'error';
  matchedProductId?: string;
  matchedCurrentName?: string;
  matchedExistingImage?: string;
  errorMessage?: string;
}

const SAMPLE_IMAGE_CSV = `SKU,ProductTitle,PrimaryImageUrl,GalleryImageUrls
"TH-EN-590","Refined Petroleum EN590 10ppm","https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800,https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800"
"TH-COAL-01","Thermal Coal FOB Nakhodka","https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800","https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800"
"TH-CHEM-UREA","Industrial Grade Urea 46%","https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800","https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800"
"TH-PLAST-HDPE","Virgin HDPE Film Grade Granules","https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800","https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800"`;

export const BatchImageCsvImporter: React.FC<{
  onUpdateSuccess: (count: number) => void;
}> = ({ onUpdateSuccess }) => {
  const [csvText, setCsvText] = useState('');
  const [batchRows, setBatchRows] = useState<ImageBatchRow[]>([]);
  const [selectedRowIndices, setSelectedRowIndices] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [summary, setSummary] = useState<{ updated: number } | null>(null);

  const toggleRowSelection = (idx: number) => {
    setSelectedRowIndices(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAllRows = () => {
    if (selectedRowIndices.size === batchRows.length && batchRows.length > 0) {
      setSelectedRowIndices(new Set());
    } else {
      setSelectedRowIndices(new Set(batchRows.map((_, i) => i)));
    }
  };

  const handleDeleteSelectedRows = async () => {
    if (selectedRowIndices.size === 0) return;
    const selectedRows = batchRows.filter((_, idx) => selectedRowIndices.has(idx));
    const matchedIds = selectedRows
      .map(r => r.matchedProductId || r.sku)
      .filter(Boolean);
    const matchedTitles = selectedRows
      .map(r => r.matchedCurrentName || r.productTitle)
      .filter(Boolean);

    if (matchedIds.length > 0) {
      await productImageManagerService.deleteBulkProductImageAssociations(matchedIds, matchedTitles);
    }

    setBatchRows(prev => prev.filter((_, idx) => !selectedRowIndices.has(idx)));
    setSelectedRowIndices(new Set());
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_IMAGE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'trade_heaven_image_batch_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCsv = (text: string) => {
    setSelectedRowIndices(new Set());
    if (!text.trim()) {
      setBatchRows([]);
      return;
    }

    const lines = text.split(/\r?\n/);
    if (lines.length < 2) return;

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

    const results: ImageBatchRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = parseLine(line);

      const sku = values[0] || `SKU-${i}`;
      const productTitle = values[1] || '';
      const primaryImageUrl = values[2] || '';
      const galleryRaw = values[3] || '';
      const galleryUrls = galleryRaw ? galleryRaw.split(',').map(s => s.trim()).filter(Boolean) : [primaryImageUrl];

      // Match against existing catalog products
      const foundProduct = MOCK_PRODUCTS.find(p => 
        p.id.toLowerCase() === sku.toLowerCase() || 
        (productTitle && p.title.toLowerCase().includes(productTitle.toLowerCase())) ||
        (productTitle && productTitle.toLowerCase().includes(p.title.toLowerCase()))
      );

      let status: 'matched' | 'unmatched' | 'error' = 'matched';
      let errorMessage = '';

      if (!primaryImageUrl) {
        status = 'error';
        errorMessage = 'Missing primary image URL';
      } else if (!foundProduct) {
        status = 'unmatched';
        errorMessage = 'No exact product SKU/title match found in catalog (will be registered as new media mapping)';
      }

      results.push({
        sku,
        productTitle: foundProduct ? foundProduct.title : productTitle,
        primaryImageUrl,
        galleryUrls,
        status,
        matchedProductId: foundProduct?.id,
        matchedCurrentName: foundProduct?.title,
        matchedExistingImage: foundProduct?.images?.[0],
        errorMessage
      });
    }

    setBatchRows(results);
    setSummary(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvText(content);
        parseCsv(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    setCsvText(SAMPLE_IMAGE_CSV);
    parseCsv(SAMPLE_IMAGE_CSV);
  };

  const handleExecuteBatch = async () => {
    const validRows = batchRows.filter(r => r.status !== 'error');
    if (validRows.length === 0) return;

    setIsProcessing(true);
    try {
      for (const row of validRows) {
        if (row.matchedProductId) {
          await productImageManagerService.setProductImage(
            row.matchedProductId,
            row.primaryImageUrl,
            row.galleryUrls
          );
        }
        if (row.sku) {
          await productImageManagerService.setProductImage(
            row.sku,
            row.primaryImageUrl,
            row.galleryUrls
          );
        }
      }
    } catch (err) {
      console.error('Failed to save batch image overrides', err);
    }

    setIsProcessing(false);
    setSummary({ updated: validRows.length });
    onUpdateSuccess(validRows.length);
  };

  const matchedCount = batchRows.filter(r => r.status === 'matched').length;
  const unmatchedCount = batchRows.filter(r => r.status === 'unmatched').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header card */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-teal-500/25 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Catalog Media Operations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Batch Product Image URL CSV Importer</h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
              Batch-upload product image URLs, primary thumbnails, and gallery arrays mapped by SKU or Product Title to accelerate catalog merchandising.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 font-bold text-xs sm:text-sm text-white flex items-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download Image CSV Template</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-xs sm:text-sm text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-600/30"
            >
              <FileText className="w-4 h-4" />
              <span>Load Sample Image CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload and Paste Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-600" />
              <span>Upload Image CSV</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select CSV containing SKU, Title, Primary URL, and comma-separated Gallery URLs.
            </p>
            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-teal-50/50 transition-all text-center group">
              <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-slate-700 mb-1">Click to browse image CSV</span>
              <span className="text-[11px] text-slate-400">CSV format with header row</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-2 font-medium">
              <span>Columns:</span>
              <span className="text-slate-700 font-bold">SKU, ProductTitle, PrimaryImageUrl, GalleryImageUrls</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Paste CSV Raw Data</span>
            </h3>
            {csvText && (
              <button
                onClick={() => { setCsvText(''); setBatchRows([]); setSummary(null); }}
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
              parseCsv(e.target.value);
            }}
            placeholder="Paste your image batch CSV rows here..."
            rows={7}
            className="w-full rounded-2xl border border-slate-300 p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50"
          ></textarea>
        </div>
      </div>

      {/* Preview Section */}
      {batchRows.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Batch Image Mapping & Preview</h3>
              <p className="text-xs text-slate-500">
                Found <span className="font-bold text-slate-900">{batchRows.length}</span> rows ({matchedCount} matched catalog items, {unmatchedCount} new mappings).
              </p>
            </div>
            <div className="flex items-center gap-3">
              {summary ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Successfully updated {summary.updated} product image URLs!</span>
                </div>
              ) : (
                <button
                  onClick={handleExecuteBatch}
                  disabled={isProcessing || batchRows.length === 0}
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-teal-600/30"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Image URLs...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Apply {batchRows.length} Image Mappings</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Visual Confirmation Preview Grid (Existing Image + Product ID vs New Image) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={batchRows.length > 0 && selectedRowIndices.size === batchRows.length}
                    onChange={toggleSelectAllRows}
                    className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                  />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800">
                    Select All ({selectedRowIndices.size}/{batchRows.length} Selected) — Pre-Update Visual Confirmation Preview Grid
                  </span>
                </label>
              </div>
              <button
                type="button"
                onClick={handleDeleteSelectedRows}
                disabled={selectedRowIndices.size === 0}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-extrabold transition-all cursor-pointer shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected ({selectedRowIndices.size})</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {batchRows.map((row, idx) => {
                const isSelected = selectedRowIndices.has(idx);
                return (
                <div
                  key={`csv-grid-${idx}`}
                  onClick={() => toggleRowSelection(idx)}
                  className={`border rounded-2xl overflow-hidden flex flex-col justify-between shadow-2xs cursor-pointer transition-all ${
                    isSelected
                      ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20'
                      : 'border-slate-200 bg-slate-50 hover:border-teal-300'
                  }`}
                >
                  <div>
                    <div className="bg-slate-900 text-white px-3.5 py-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRowSelection(idx)}
                          onClick={e => e.stopPropagation()}
                          className="w-3.5 h-3.5 rounded border-slate-400 text-red-600 focus:ring-red-500 cursor-pointer shrink-0"
                        />
                        <span className="font-mono text-xs font-black text-amber-300 truncate">
                          ID: {row.matchedProductId || row.sku}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          row.status === 'matched'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {row.status === 'matched' ? 'Matched ID' : 'New ID'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-200 h-32 bg-slate-100">
                      <div className="relative h-full overflow-hidden">
                        {row.matchedExistingImage ? (
                          <img
                            src={row.matchedExistingImage}
                            alt={row.productTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400 p-2 text-center">
                            No Existing Image
                          </div>
                        )}
                        <span className="absolute bottom-1.5 left-1.5 bg-slate-900/85 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          Existing
                        </span>
                      </div>

                      <div className="relative h-full overflow-hidden">
                        <img
                          src={row.primaryImageUrl}
                          alt="New CSV Image"
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800';
                          }}
                        />
                        <span className="absolute bottom-1.5 right-1.5 bg-teal-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                          New Image
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 space-y-0.5">
                    <div className="text-xs font-bold text-slate-900 truncate" title={row.productTitle}>
                      {row.productTitle || row.sku}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 truncate">
                      SKU/ID: {row.sku} · {row.galleryUrls.length} gallery img(s)
                    </div>
                  </div>
                </div>
              );
              })}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SKU / ID</th>
                  <th className="py-3 px-4">Product Title</th>
                  <th className="py-3 px-4">Primary Thumbnail Preview</th>
                  <th className="py-3 px-4">Gallery Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {batchRows.map((row, index) => (
                  <tr key={index} className={`hover:bg-slate-50/80 ${row.status === 'error' ? 'bg-red-50/50' : ''}`}>
                    <td className="py-3 px-4">
                      {row.status === 'matched' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Matched
                        </span>
                      )}
                      {row.status === 'unmatched' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-[11px] font-bold">
                          ℹ️ New Mapping
                        </span>
                      )}
                      {row.status === 'error' && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-red-100 text-red-800 text-[11px] font-bold" title={row.errorMessage}>
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{row.sku}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 max-w-xs truncate">{row.productTitle}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={row.primaryImageUrl} 
                          alt="preview" 
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 bg-slate-100"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800'; }}
                        />
                        <span className="text-[11px] text-slate-500 truncate max-w-[200px] font-mono">{row.primaryImageUrl}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">
                      {row.galleryUrls.length} image(s)
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
