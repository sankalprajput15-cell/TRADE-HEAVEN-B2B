import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { ActiveView } from '../../types';
import { 
  SlidersHorizontal, 
  Eye, 
  Sparkles, 
  FileEdit, 
  Download, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  X,
  Layout,
  DollarSign,
  Briefcase,
  ShieldCheck,
  Phone,
  Settings,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

interface Props {
  onNavigate: (view: ActiveView) => void;
}

export const FloatingLiveEditorBar: React.FC<Props> = ({ onNavigate }) => {
  const { 
    isLiveEditMode, 
    toggleLiveEditMode, 
    openQuickEdit, 
    resetToDefaults, 
    exportContentJson,
    currentUser 
  } = useSiteContent();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const handleExport = () => {
    const jsonStr = exportContentJson();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonStr);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `trade-heaven-site-config-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleReset = async () => {
    if (window.confirm('Reset all website copy and banners to factory defaults?')) {
      await resetToDefaults(currentUser);
    }
  };

  return (
    <div id="floating-live-editor-bar" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex flex-col items-start gap-2 animate-fadeIn font-sans pointer-events-none">
      
      {/* Expanded Quick Actions Drawer */}
      {isExpanded && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-3xl p-4 sm:p-5 shadow-2xl w-80 sm:w-96 space-y-4 animate-scaleUp mb-1">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <SlidersHorizontal className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-black text-white text-xs">Visual Site Editor Tools</h4>
                <p className="text-[10px] text-slate-400">Click any button below to edit that section</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Edit Mode Switch */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span>On-Screen Edit Buttons</span>
              </span>
              <p className="text-[10px] text-slate-400">Highlights editable sections on the page</p>
            </div>
            <button
              type="button"
              onClick={toggleLiveEditMode}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLiveEditMode 
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-900 font-black' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {isLiveEditMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          {/* Quick Edit Specific Sections */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
              Quick Section Editors
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => {
                  openQuickEdit('HERO');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <Layout className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Hero &amp; Specialist</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openQuickEdit('STATS');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <DollarSign className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Trade Stats</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openQuickEdit('H2H');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <Briefcase className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate">H2H Advantage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openQuickEdit('ESCROW');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span className="truncate">Escrow Security</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openQuickEdit('CONTACT');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">WhatsApp &amp; Desk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  openQuickEdit('FOOTER');
                  setIsExpanded(false);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
              >
                <FileEdit className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate">Footer &amp; Mission</span>
              </button>
            </div>
          </div>

          {/* Master CMS & Backup Links */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                onNavigate('CMS_MANAGEMENT');
                setIsExpanded(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Open Master CMS</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Export JSON Configuration"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 transition-colors cursor-pointer"
              title="Reset to factory defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating Pill Button */}
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 cursor-pointer select-none active:scale-95"
        >
          <span className="relative flex h-3 w-3">
            {isLiveEditMode && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isLiveEditMode ? 'bg-amber-400' : 'bg-blue-500'}`}></span>
          </span>

          <span className="text-xs font-bold flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-400" />
            <span>Edit Website</span>
            {isLiveEditMode && (
              <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono text-[9px]">ACTIVE</span>
            )}
          </span>

          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          )}
        </button>
      </div>
    </div>
  );
};
