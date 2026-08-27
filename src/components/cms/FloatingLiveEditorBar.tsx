import React, { useState } from 'react';
import { useSiteContent } from '../../context/SiteContentContext';
import { ActiveView } from '../../types';
import { 
  SlidersHorizontal, 
  Eye, 
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
  ExternalLink,
  ShieldAlert,
  Lock,
  Landmark,
  LayoutDashboard,
  Database,
  Crown,
  FileText,
  MessageSquare,
  ArrowUpRight,
  Building2
} from 'lucide-react';

interface Props {
  onNavigate: (view: ActiveView) => void;
  currentView?: ActiveView;
  onOpenBackendManager?: () => void;
}

export const FloatingLiveEditorBar: React.FC<Props> = ({ 
  onNavigate, 
  currentView,
  onOpenBackendManager 
}) => {
  const { 
    isLiveEditMode, 
    toggleLiveEditMode, 
    openQuickEdit, 
    resetToDefaults, 
    exportContentJson,
    currentUser,
    isUserAuthorized
  } = useSiteContent();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'WORKSPACES' | 'VISUAL_EDITOR'>('WORKSPACES');

  // Check admin authorization: VISIBLE & ACCESSIBLE ONLY BY ADMIN / CREATOR
  const auth = isUserAuthorized(currentUser);
  const isAdmin = auth.isAuthorized;

  if (!isAdmin || isDismissed) {
    return null;
  }

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

  const isWorkspaceActive = currentView === 'CLIENT_ADMIN' || currentView === 'DASHBOARD' || currentView === 'CMS_MANAGEMENT';

  return (
    <div id="floating-live-editor-bar" className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-40 flex flex-col items-start gap-2 animate-fadeIn font-sans pointer-events-none">
      
      {/* Expanded Quick Actions & Workspace Hub */}
      {isExpanded && (
        <div className="pointer-events-auto bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white rounded-3xl p-4 sm:p-5 shadow-2xl w-84 sm:w-96 space-y-4 animate-scaleUp mb-1 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-black text-white text-xs">Admin Workspace &amp; Editor</h4>
                <p className="text-[10px] text-amber-400/90 font-medium">Logged in as {currentUser?.name || 'Administrator'}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1 rounded-lg hover:bg-slate-800"
              title="Close Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Sub Tab Switcher */}
          <div className="flex rounded-xl bg-slate-800 p-1 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => setActiveSubTab('WORKSPACES')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === 'WORKSPACES'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Admin Workspaces</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubTab('VISUAL_EDITOR')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeSubTab === 'VISUAL_EDITOR'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Live Visual CMS</span>
            </button>
          </div>

          {activeSubTab === 'WORKSPACES' ? (
            /* Workspaces & Control Panels */
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">
                Direct Workspace Access
              </span>
              
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('CLIENT_ADMIN');
                    setIsExpanded(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer flex items-center justify-between ${
                    currentView === 'CLIENT_ADMIN'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 ring-1 ring-amber-500/50'
                      : 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Admin Control &amp; Treasury
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Zero-trust roles, trade protection vault releases, client tiers
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-300 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('CMS_MANAGEMENT');
                    setIsExpanded(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer flex items-center justify-between ${
                    currentView === 'CMS_MANAGEMENT'
                      ? 'bg-blue-500/20 border-blue-500 text-blue-200 ring-1 ring-blue-500/50'
                      : 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                        Full Site CMS Studio
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Edit copy, hero banners, WhatsApp numbers, categories
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-blue-300 shrink-0" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('DASHBOARD');
                    setIsExpanded(false);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all group cursor-pointer flex items-center justify-between ${
                    currentView === 'DASHBOARD'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50'
                      : 'bg-slate-800/90 border-slate-700 hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        Exporter &amp; Buyer Workspace
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Live milestones, factory orders, trade protection tracking
                      </div>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-300 shrink-0" />
                </button>

                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('VENDOR_PROFILE');
                      setIsExpanded(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-left transition-colors cursor-pointer col-span-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-200">
                          Vendor Profile &amp; Media Studio
                        </div>
                        <p className="text-[10px] text-slate-400">B2B profile, 16:9 banner, ISO certs, factory tour</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-blue-400 shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('RFQ_HUB');
                      setIsExpanded(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>RFQ Trade Hub</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Manage live bids</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('NEGOTIATION_ROOM');
                      setIsExpanded(false);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-left transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                      <MessageSquare className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span>Trade Chat</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">Live contracts</p>
                  </button>
                </div>

                {onOpenBackendManager && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsExpanded(false);
                      onOpenBackendManager();
                    }}
                    className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-left transition-colors cursor-pointer flex items-center justify-between mt-1"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Database State &amp; JSON Engine</span>
                    </div>
                    <span className="text-[9px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                      BACKUP
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Visual Live Editor */
            <div className="space-y-3">
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
                      openQuickEdit('trade protection');
                      setIsExpanded(false);
                    }}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">trade protection Security</span>
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
            </div>
          )}

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

      {/* Unified Single Floating Admin Workspace & Editor Hub Button */}
      <div className="pointer-events-auto flex items-center">
        <button
          type="button"
          onClick={() => setIsExpanded(prev => !prev)}
          className={`group flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 cursor-pointer select-none active:scale-95 border ${
            isExpanded
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black ring-2 ring-amber-300 ring-offset-2 ring-offset-slate-950'
              : currentView === 'CLIENT_ADMIN' || currentView === 'CMS_MANAGEMENT'
                ? 'bg-slate-900/95 text-amber-300 border-amber-500/60 ring-2 ring-amber-500/30'
                : 'bg-slate-900/95 hover:bg-slate-800 text-white border-amber-500/40 ring-1 ring-amber-500/20'
          }`}
          title="Open Admin Workspace, Treasury & Live Visual Editor"
        >
          {/* Status Indicator / Icon */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2.5 w-2.5">
              {isLiveEditMode && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              )}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isLiveEditMode ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
            </span>

            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              isExpanded 
                ? 'bg-slate-950 text-amber-400' 
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              <Crown className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold tracking-tight">
            <span>Admin Workspace &amp; Editor</span>
            {isLiveEditMode && (
              <span className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                LIVE
              </span>
            )}
          </div>

          {isExpanded ? (
            <ChevronDown className={`w-3.5 h-3.5 ${isExpanded ? 'text-slate-950' : 'text-slate-400 group-hover:text-white'}`} />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
          )}
        </button>
      </div>
    </div>
  );
};

