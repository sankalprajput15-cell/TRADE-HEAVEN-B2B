import React, { useState } from 'react';
import { 
  Crop, 
  Check, 
  X, 
  RotateCw, 
  RotateCcw,
  RefreshCw,
  ZoomIn, 
  ZoomOut,
  Sparkles,
  Layers,
  ShieldCheck,
  Sliders,
  Sun
} from 'lucide-react';
import {
  ImageEditFilters,
  DEFAULT_IMAGE_EDIT_FILTERS
} from '../../services/productImageManagerService';

interface ImageEditingOverlayProps {
  imageSrc: string;
  imageName: string;
  initialRotation?: number;
  initialFilters?: Partial<ImageEditFilters>;
  onSave: (
    editedDataUrl: string,
    finalRotationDegrees: number,
    finalFilters: ImageEditFilters
  ) => void;
  onClose: () => void;
}

export const ImageEditingOverlay: React.FC<ImageEditingOverlayProps> = ({
  imageSrc,
  imageName,
  initialRotation = 0,
  initialFilters,
  onSave,
  onClose
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(
    (((Math.round(initialRotation / 90) * 90) % 360) + 360) % 360
  );
  const [grayscale, setGrayscale] = useState<number>(
    initialFilters?.grayscale ?? DEFAULT_IMAGE_EDIT_FILTERS.grayscale
  );
  const [sepia, setSepia] = useState<number>(
    initialFilters?.sepia ?? DEFAULT_IMAGE_EDIT_FILTERS.sepia
  );
  const [brightness, setBrightness] = useState<number>(
    initialFilters?.brightness ?? DEFAULT_IMAGE_EDIT_FILTERS.brightness
  );
  const [contrast, setContrast] = useState<number>(
    initialFilters?.contrast ?? DEFAULT_IMAGE_EDIT_FILTERS.contrast
  );
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [aspectRatio, setAspectRatio] = useState<'free' | '1:1' | '16:9' | '4:3'>('free');
  const [isBrandedBackgroundApplied, setIsBrandedBackgroundApplied] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);

  const rotateByIncrement = (delta: number) => {
    setRotation(prev => (((prev + delta) % 360) + 360) % 360);
  };

  const resetAllFilters = () => {
    setGrayscale(0);
    setSepia(0);
    setBrightness(100);
    setContrast(100);
  };

  const applyFilterPreset = (
    preset: 'original' | 'grayscale' | 'sepia' | 'bright' | 'contrast' | 'vintage'
  ) => {
    if (preset === 'original') {
      resetAllFilters();
    } else if (preset === 'grayscale') {
      setGrayscale(100);
      setSepia(0);
      setBrightness(102);
      setContrast(108);
    } else if (preset === 'sepia') {
      setGrayscale(0);
      setSepia(100);
      setBrightness(102);
      setContrast(105);
    } else if (preset === 'bright') {
      setGrayscale(0);
      setSepia(0);
      setBrightness(118);
      setContrast(108);
    } else if (preset === 'contrast') {
      setGrayscale(0);
      setSepia(0);
      setBrightness(100);
      setContrast(130);
    } else if (preset === 'vintage') {
      setGrayscale(15);
      setSepia(65);
      setBrightness(105);
      setContrast(106);
    }
  };

  const hasCustomFilters =
    grayscale > 0 || sepia > 0 || brightness !== 100 || contrast !== 100;

  const liveCssFilter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocalPoint({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleApplyTradeHeavenStudioBackground = () => {
    setIsProcessingAi(true);
    setTimeout(() => {
      setIsBrandedBackgroundApplied(true);
      setBrightness(110);
      setContrast(105);
      setIsProcessingAi(false);
    }, 600);
  };

  const handleApplyEdits = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const natW = img.naturalWidth || img.width || 800;
      const natH = img.naturalHeight || img.height || 800;
      const normalizedRot = (((Math.round(rotation / 90) * 90) % 360) + 360) % 360;
      const isSwapped = normalizedRot === 90 || normalizedRot === 270;

      if (aspectRatio === 'free') {
        const maxDim = 1400;
        let baseW = natW;
        let baseH = natH;
        if (baseW > maxDim || baseH > maxDim) {
          if (baseW >= baseH) {
            baseH = Math.round((baseH * maxDim) / baseW);
            baseW = maxDim;
          } else {
            baseW = Math.round((baseW * maxDim) / baseH);
            baseH = maxDim;
          }
        }
        canvas.width = isSwapped ? baseH : baseW;
        canvas.height = isSwapped ? baseW : baseH;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          if (isBrandedBackgroundApplied) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(0.5, '#f1f5f9');
            gradient.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.save();
          ctx.filter = liveCssFilter;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((normalizedRot * Math.PI) / 180);
          ctx.scale(zoom, zoom);
          ctx.drawImage(img, -baseW / 2, -baseH / 2, baseW, baseH);
          ctx.restore();

          if (isBrandedBackgroundApplied) {
            ctx.fillStyle = '#2563eb';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText('TRADE HEAVEN VERIFIED STUDIO', Math.max(12, canvas.width - 210), canvas.height - 20);
          }
        }
      } else {
        canvas.width = 800;
        canvas.height = aspectRatio === '16:9' ? 450 : aspectRatio === '4:3' ? 600 : 800;

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          if (isBrandedBackgroundApplied) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#f8fafc');
            gradient.addColorStop(0.5, '#f1f5f9');
            gradient.addColorStop(1, '#e2e8f0');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.save();
          ctx.filter = liveCssFilter;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((normalizedRot * Math.PI) / 180);
          ctx.scale(zoom, zoom);
          const scaleToCover = Math.max(
            canvas.width / (isSwapped ? natH : natW),
            canvas.height / (isSwapped ? natW : natH)
          );
          const drawW = natW * scaleToCover;
          const drawH = natH * scaleToCover;
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();

          if (isBrandedBackgroundApplied) {
            ctx.fillStyle = '#2563eb';
            ctx.font = 'bold 12px Inter, sans-serif';
            ctx.fillText('TRADE HEAVEN VERIFIED STUDIO', canvas.width - 210, canvas.height - 20);
          }
        }
      }

      const editedUrl = canvas.toDataURL('image/png', 1.0);
      onSave(editedUrl, normalizedRot, {
        grayscale,
        sepia,
        brightness,
        contrast
      });
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* HEADER */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Sliders className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm tracking-wide">
                Product Image Editor: Filters (Grayscale, Sepia, Brightness/Contrast) &amp; 90° Rotation
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xl">
                {imageName} · Orientation: <strong className="text-amber-300 font-mono">{rotation}°</strong> ·{' '}
                Grayscale: <strong className="text-blue-300 font-mono">{grayscale}%</strong> ·{' '}
                Sepia: <strong className="text-amber-200 font-mono">{sepia}%</strong> ·{' '}
                Brightness: <strong className="text-emerald-300 font-mono">{brightness}%</strong> ·{' '}
                Contrast: <strong className="text-indigo-300 font-mono">{contrast}%</strong>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WORKSPACE */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-900/5">
          
          {/* PREVIEW CONTAINER */}
          <div className="flex-1 p-5 flex flex-col items-center justify-between relative overflow-hidden bg-slate-950/90">
            <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
              <div 
                className={`relative overflow-hidden shadow-2xl rounded-xl border border-slate-700 bg-slate-900 cursor-crosshair transition-all flex items-center justify-center ${
                  aspectRatio === '1:1' ? 'w-72 h-72 sm:w-88 sm:h-88' :
                  aspectRatio === '16:9' ? 'w-full max-w-lg aspect-video' :
                  aspectRatio === '4:3' ? 'w-full max-w-md aspect-[4/3]' : 'w-72 h-72 sm:w-88 sm:h-88'
                } ${isBrandedBackgroundApplied ? 'bg-gradient-to-b from-slate-50 to-slate-200 ring-4 ring-blue-500/30' : ''}`}
                onClick={handleCanvasClick}
              >
                <img 
                  src={imageSrc} 
                  alt="Editing Preview" 
                  className="max-w-full max-h-full object-contain transition-all duration-150 relative z-10"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    filter: liveCssFilter,
                    objectPosition: `${focalPoint.x}% ${focalPoint.y}%`
                  }}
                />

                {/* ORIENTATION & FILTER STATUS BADGES */}
                <div className="absolute top-2.5 left-2.5 flex flex-wrap items-center gap-1.5 z-20">
                  <span className="bg-slate-950/85 text-amber-300 font-mono text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-700 flex items-center gap-1">
                    <RotateCw className="w-3 h-3 text-blue-400" />
                    <span>{rotation}°</span>
                  </span>
                  {grayscale > 0 && (
                    <span className="bg-slate-800/90 text-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-slate-600">
                      Grayscale {grayscale}%
                    </span>
                  )}
                  {sepia > 0 && (
                    <span className="bg-amber-950/90 text-amber-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-700">
                      Sepia {sepia}%
                    </span>
                  )}
                  {(brightness !== 100 || contrast !== 100) && (
                    <span className="bg-blue-950/90 text-blue-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-700">
                      B:{brightness}% C:{contrast}%
                    </span>
                  )}
                </div>

                {/* TRADE HEAVEN BRANDED STUDIO BACKDROP OVERLAY */}
                {isBrandedBackgroundApplied && (
                  <div className="absolute bottom-2 right-2 bg-blue-600/90 text-white text-[9px] font-extrabold px-2 py-1 rounded shadow-md z-20 flex items-center gap-1 backdrop-blur-sm">
                    <ShieldCheck className="w-3 h-3 text-amber-300" />
                    TRADE HEAVEN STUDIO
                  </div>
                )}

                {/* PROCESSING OVERLAY */}
                {isProcessingAi && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-30">
                    <Sparkles className="w-8 h-8 text-blue-400 animate-spin mb-2" />
                    <span className="text-xs font-extrabold">Replacing background with Trade Heaven Studio AI...</span>
                  </div>
                )}
              </div>
            </div>

            {/* QUICK 90° ROTATION & FILTER PRESET BAR BELOW CANVAS */}
            <div className="mt-4 bg-slate-900/95 border border-slate-700 rounded-xl p-2.5 flex flex-wrap items-center justify-center gap-2 shadow-lg z-20 w-full max-w-2xl">
              <button
                type="button"
                onClick={() => rotateByIncrement(-90)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Rotate 90° Counter-Clockwise (Left)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                type="button"
                onClick={() => rotateByIncrement(90)}
                className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                title="Rotate 90° Clockwise (Right)"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                type="button"
                onClick={() => rotateByIncrement(180)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                title="Rotate 180°"
              >
                <span>180°</span>
              </button>

              <span className="h-4 w-px bg-slate-700 mx-0.5" />

              <button
                type="button"
                onClick={() => applyFilterPreset('original')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  !hasCustomFilters
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Original
              </button>

              <button
                type="button"
                onClick={() => applyFilterPreset('grayscale')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  grayscale === 100 && sepia === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                Grayscale
              </button>

              <button
                type="button"
                onClick={() => applyFilterPreset('sepia')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  sepia === 100 && grayscale === 0
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-200'
                }`}
              >
                Sepia
              </button>

              <button
                type="button"
                onClick={() => applyFilterPreset('bright')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  brightness === 118
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-blue-200'
                }`}
              >
                Bright Studio
              </button>
            </div>
          </div>

          {/* CONTROLS PANEL */}
          <div className="w-full lg:w-96 bg-white border-l border-slate-200 p-5 flex flex-col gap-4 overflow-y-auto">
            
            {/* IMAGE FILTERS & BRIGHTNESS / CONTRAST ADJUSTMENTS */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Filters &amp; Tone Adjustments</span>
                </label>
                {hasCustomFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-[10px] font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                )}
              </div>

              {/* Filter Preset Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => applyFilterPreset('original')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    !hasCustomFilters
                      ? 'bg-slate-900 border-slate-900 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Original
                </button>
                <button
                  type="button"
                  onClick={() => applyFilterPreset('grayscale')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    grayscale === 100 && sepia === 0
                      ? 'bg-slate-800 border-slate-800 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Grayscale
                </button>
                <button
                  type="button"
                  onClick={() => applyFilterPreset('sepia')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    sepia === 100 && grayscale === 0
                      ? 'bg-amber-700 border-amber-700 text-white'
                      : 'bg-white border-slate-200 text-amber-900 hover:bg-amber-50'
                  }`}
                >
                  Sepia
                </button>
                <button
                  type="button"
                  onClick={() => applyFilterPreset('bright')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    brightness === 118
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Bright +
                </button>
                <button
                  type="button"
                  onClick={() => applyFilterPreset('contrast')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    contrast === 130
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  High Contrast
                </button>
                <button
                  type="button"
                  onClick={() => applyFilterPreset('vintage')}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                    sepia === 65 && grayscale === 15
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Warm Vintage
                </button>
              </div>

              {/* Grayscale Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">Grayscale</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-slate-900">{grayscale}%</span>
                    <button
                      type="button"
                      onClick={() => setGrayscale(g => (g === 100 ? 0 : 100))}
                      className="px-1.5 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-[9px] font-bold text-slate-700 cursor-pointer"
                    >
                      {grayscale === 100 ? 'Off' : '100%'}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={grayscale}
                  onChange={e => setGrayscale(Number(e.target.value))}
                  className="w-full accent-slate-800 cursor-pointer h-1.5"
                />
              </div>

              {/* Sepia Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">Sepia Tone</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-amber-800">{sepia}%</span>
                    <button
                      type="button"
                      onClick={() => setSepia(s => (s === 100 ? 0 : 100))}
                      className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-[9px] font-bold text-amber-900 cursor-pointer"
                    >
                      {sepia === 100 ? 'Off' : '100%'}
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sepia}
                  onChange={e => setSepia(Number(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-1.5"
                />
              </div>

              {/* Brightness Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">Brightness</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-600">{brightness}%</span>
                    {brightness !== 100 && (
                      <button
                        type="button"
                        onClick={() => setBrightness(100)}
                        className="text-[9px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        100%
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="2"
                  value={brightness}
                  onChange={e => setBrightness(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-1.5"
                />
              </div>

              {/* Contrast Slider */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-bold text-slate-700">Contrast</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-indigo-600">{contrast}%</span>
                    {contrast !== 100 && (
                      <button
                        type="button"
                        onClick={() => setContrast(100)}
                        className="text-[9px] font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        100%
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  step="2"
                  value={contrast}
                  onChange={e => setContrast(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5"
                />
              </div>
            </div>

            {/* 90-DEGREE INCREMENT ROTATION SECTION */}
            <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-blue-600" />
                  <span>90° Increment Rotation</span>
                </label>
                <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-xs font-mono font-black">
                  {rotation}°
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => rotateByIncrement(-90)}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                  <span>-90° CCW</span>
                </button>
                <button
                  type="button"
                  onClick={() => rotateByIncrement(90)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+90° CW</span>
                </button>
              </div>

              {/* Direct 90-degree angle presets */}
              <div className="grid grid-cols-4 gap-1.5">
                {([0, 90, 180, 270] as const).map(deg => (
                  <button
                    key={deg}
                    type="button"
                    onClick={() => setRotation(deg)}
                    className={`py-1 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      rotation === deg
                        ? 'bg-slate-900 border-slate-900 text-amber-300 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* ASPECT RATIO & ZOOM */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1.5">
                  Crop Ratio
                </label>
                <div className="grid grid-cols-2 gap-1">
                  {(['free', '1:1', '16:9', '4:3'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                        aspectRatio === ratio 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {ratio === 'free' ? 'Orig' : ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-700 uppercase">Zoom</label>
                  <span className="text-[11px] font-mono font-bold text-blue-600">{zoom.toFixed(1)}x</span>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="range" 
                    min="1" 
                    max="2.5" 
                    step="0.1" 
                    value={zoom} 
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600 cursor-pointer"
                  />
                  <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={handleApplyTradeHeavenStudioBackground}
                  disabled={isBrandedBackgroundApplied || isProcessingAi}
                  className={`w-full py-1.5 px-2 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all cursor-pointer ${
                    isBrandedBackgroundApplied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>{isBrandedBackgroundApplied ? 'Studio Active' : 'Studio Backdrop'}</span>
                </button>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-auto pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyEdits}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Filters &amp; Rotation
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};


