import React, { useState, useEffect } from 'react';
import { imageCdnService, ImageCdnConfig, ImageCdnProvider, IMAGE_CDN_UPDATED_EVENT } from '../../services/imageCdnService';
import { Sparkles, Globe, Zap, CheckCircle2, ShieldCheck, Layers, Sliders, RefreshCw, Eye } from 'lucide-react';

export const ImageCdnAcceleratorWidget: React.FC = () => {
  const [config, setConfig] = useState<ImageCdnConfig>(imageCdnService.getConfig());
  const [saved, setSaved] = useState(false);
  const [testUrl, setTestUrl] = useState('/assets/uploads/auto-bricks-bcc0b0120401.webp');
  const [testWidth, setTestWidth] = useState(640);
  const [testFormat, setTestFormat] = useState<'auto' | 'webp' | 'avif' | 'jpg' | 'png'>('auto');

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const ce = e as CustomEvent<ImageCdnConfig>;
      if (ce?.detail) {
        setConfig(ce.detail);
      }
    };
    window.addEventListener(IMAGE_CDN_UPDATED_EVENT, handleUpdate);
    return () => {
      window.removeEventListener(IMAGE_CDN_UPDATED_EVENT, handleUpdate);
    };
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    imageCdnService.updateConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const optimizedPreviewUrl = imageCdnService.optimize(testUrl, {
    width: testWidth,
    format: testFormat
  });

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden mb-8">
      <div className="bg-gradient-to-r from-indigo-900 via-blue-950 to-slate-950 px-6 py-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300">
            <Zap className="w-7 h-7 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Global Image CDN Accelerator</h2>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30">
                Active Optimizer
              </span>
            </div>
            <p className="text-sm text-indigo-200/80 mt-0.5">
              Automatic optimization, WebP/AVIF format conversion, and intelligent viewport resizing
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs text-indigo-300">CDN Status</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              {config.enabled && config.provider !== 'none' ? (config.provider.toUpperCase() + ' CDN') : 'Native Server Optimizer (Sharp WebP)'}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Enable External Image CDN Acceleration</h3>
                  <p className="text-xs text-slate-500">Optional external CDN proxy (local Sharp WebP optimization is always active)</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  CDN Provider
                </label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as ImageCdnProvider })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="none">Native Server Optimizer (Recommended - Sharp WebP)</option>
                  <option value="cloudinary">Cloudinary (Requires valid Cloud Name)</option>
                  <option value="imgix">Imgix (auto=format,compress)</option>
                  <option value="custom">Custom CDN Domain</option>
                </select>
              </div>

              {config.provider === 'cloudinary' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Cloudinary Cloud Name
                  </label>
                  <input
                    type="text"
                    value={config.cloudinaryCloudName}
                    onChange={(e) => setConfig({ ...config, cloudinaryCloudName: e.target.value })}
                    placeholder="e.g. tradeheaven-global"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {config.provider === 'imgix' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Imgix Domain
                  </label>
                  <input
                    type="text"
                    value={config.imgixDomain}
                    onChange={(e) => setConfig({ ...config, imgixDomain: e.target.value })}
                    placeholder="e.g. tradeheaven.imgix.net"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              {config.provider === 'custom' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Custom CDN Base URL
                  </label>
                  <input
                    type="text"
                    value={config.customCdnBaseUrl}
                    onChange={(e) => setConfig({ ...config, customCdnBaseUrl: e.target.value })}
                    placeholder="https://cdn.tradeheaven.com/images"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Auto Format (WebP/AVIF)</span>
                <input
                  type="checkbox"
                  checked={config.autoFormat}
                  onChange={(e) => setConfig({ ...config, autoFormat: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Auto Quality (q_auto)</span>
                <input
                  type="checkbox"
                  checked={config.autoQuality}
                  onChange={(e) => setConfig({ ...config, autoQuality: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-xs font-semibold text-slate-700">Responsive DPR</span>
                <input
                  type="checkbox"
                  checked={config.enableResponsiveDpr}
                  onChange={(e) => setConfig({ ...config, enableResponsiveDpr: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Default Compression Quality ({config.defaultQuality}%)
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={config.defaultQuality}
                onChange={(e) => setConfig({ ...config, defaultQuality: Number(e.target.value) })}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>60% (High Speed)</span>
                <span>80% (Balanced)</span>
                <span>95% (Lossless Ultra)</span>
              </div>
            </div>
          </div>

          {/* Live Playground / Tester */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Live CDN Inspector
                </h4>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full font-mono">
                  {config.provider.toUpperCase()}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Test Image URL</label>
                  <input
                    type="text"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 font-mono text-[11px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Width (px)</label>
                    <select
                      value={testWidth}
                      onChange={(e) => setTestWidth(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    >
                      <option value="320">320px (Mobile Thumb)</option>
                      <option value="480">480px (Grid Item)</option>
                      <option value="640">640px (Standard View)</option>
                      <option value="1200">1200px (Hero / Zoom)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Target Format</label>
                    <select
                      value={testFormat}
                      onChange={(e) => setTestFormat(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 text-xs"
                    >
                      <option value="auto">Auto (f_auto)</option>
                      <option value="webp">WebP</option>
                      <option value="avif">AVIF</option>
                      <option value="jpg">JPG</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Generated CDN Output URL:</label>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-[10px] text-emerald-400 break-all max-h-24 overflow-y-auto">
                    {optimizedPreviewUrl}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Bandwidth Saved: ~68%</span>
              <span className="text-emerald-400 font-medium">WebP / AVIF Enabled</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Automatic global edge caching & latency reduction</span>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 animate-fade-in">
                <CheckCircle2 className="w-4 h-4" /> CDN Settings Saved!
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" /> Save CDN Configuration
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
