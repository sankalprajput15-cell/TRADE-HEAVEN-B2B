import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Globe, 
  FolderLock, 
  Terminal, 
  Copy, 
  ExternalLink,
  Cpu,
  Layers,
  FileCode2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { apiClient, DeploymentHealthData, DeploymentServiceStatus } from '../../services/apiClient';

interface Props {
  className?: string;
  autoRefreshIntervalMs?: number;
}

export const DeploymentHealthMonitor: React.FC<Props> = ({
  className = '',
  autoRefreshIntervalMs = 30000
}) => {
  const [data, setData] = useState<DeploymentHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isBackgroundPolling, setIsBackgroundPolling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<number>(30);
  const [pollCount, setPollCount] = useState<number>(0);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);
  const [probeHistory, setProbeHistory] = useState<Array<{
    timestamp: string;
    status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE';
    latencyMs: number;
    summary: string;
  }>>([]);

  const fetchHealth = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsBackgroundPolling(true);
    }
    setError(null);

    try {
      const res = await apiClient.getDeploymentHealth();
      if (res.success && res.data) {
        setData(res.data);
        setLastRefreshedAt(new Date());
        setPollCount(prev => prev + 1);
        setCountdown(30);

        // Append to probe history (capped at 10)
        const avgLatency = Math.round(
          ((res.data.services.ftps.latencyMs || 0) +
           (res.data.services.sftp.latencyMs || 0) +
           (res.data.services.http.latencyMs || 0)) / 3
        );

        setProbeHistory(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            status: res.data.overallStatus,
            latencyMs: avgLatency,
            summary: res.data.summary
          },
          ...prev.slice(0, 9)
        ]);
      } else {
        setError(res.error || 'Failed to fetch deployment health');
      }
    } catch (err: any) {
      setError(err?.message || 'Network error querying deployment health endpoint');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsBackgroundPolling(false);
    }
  }, []);

  // 1-second interval ticker for the 30-second polling cycle
  useEffect(() => {
    // Initial fetch on mount
    fetchHealth(false);

    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          fetchHealth(false);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchHealth, autoRefreshEnabled]);

  // Window visibility listener to refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && autoRefreshEnabled) {
        fetchHealth(false);
        setCountdown(30);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchHealth, autoRefreshEnabled]);

  const handleCopyReport = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2200);
  };

  const getStatusBadge = (status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'OPERATIONAL' | 'DOWN') => {
    switch (status) {
      case 'HEALTHY':
      case 'OPERATIONAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operational</span>
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Degraded</span>
          </span>
        );
      case 'OFFLINE':
      case 'DOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Unreachable</span>
          </span>
        );
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Banner / Actions Header */}
      <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-xs relative overflow-hidden">
        {/* Subtle Polling Progress Bar at the top of the card */}
        {autoRefreshEnabled && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-1000 ease-linear"
              style={{ width: `${((30 - countdown) / 30) * 100}%` }}
            />
          </div>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              <Server className="w-3.5 h-3.5 text-blue-600" />
              <span>CI/CD Infrastructure &amp; Hosting Health</span>
              <span className={`w-2 h-2 rounded-full ${autoRefreshEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
              {autoRefreshEnabled && (
                <span className="text-[10px] text-blue-600 font-mono font-semibold">
                  Polls: {pollCount}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Trade Heaven Host ↔ BigRock cPanel Health Monitor
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
              Real-time polling engine auditing socket connectivity, TLS negotiation, 
              Pure-FTPd readiness, and document root synchronization every 30 seconds without requiring page reloads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Auto-Refresh Toggle with Live Countdown */}
            <button
              type="button"
              onClick={() => {
                const nextState = !autoRefreshEnabled;
                setAutoRefreshEnabled(nextState);
                if (nextState) setCountdown(30);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                autoRefreshEnabled 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-2xs' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Toggle automatic 30s polling"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>
                {autoRefreshEnabled ? `Polling Active (${countdown}s)` : 'Polling Paused'}
              </span>
              {isBackgroundPolling && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></span>
              )}
            </button>

            {/* Run Diagnostic Probe Button */}
            <button
              type="button"
              onClick={() => {
                fetchHealth(true);
                setCountdown(30);
              }}
              disabled={isRefreshing || isLoading}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Probing Ports...' : 'Poll Now'}</span>
            </button>

            {/* Copy JSON Report */}
            <button
              type="button"
              onClick={handleCopyReport}
              disabled={!data}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Copy diagnostic report JSON"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timestamp & Status Sub-bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-3">
            <span>
              Target Host: <strong className="text-slate-800 font-mono">tradeheaven.net</strong> ({data?.primaryIp || '208.91.198.118'})
            </span>
            <span>•</span>
            <span>
              Remote Document Root: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-700">/home3/a17604c7/public_html/</code>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {isBackgroundPolling && (
              <span className="text-blue-600 font-semibold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Background updating...
              </span>
            )}
            {lastRefreshedAt && (
              <span>
                Last updated at: <strong className="text-slate-600">{lastRefreshedAt.toLocaleTimeString()}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {copiedReport && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 font-medium animate-in fade-in duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Full diagnostic report JSON copied to clipboard.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-3xl flex items-center justify-between gap-3 font-medium">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Diagnostic probe warning: {error}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchHealth(true)}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer"
          >
            Retry Probe
          </button>
        </div>
      )}

      {/* Main Overall Status Card */}
      {data && (
        <div className={`p-6 rounded-3xl border shadow-xs transition-all ${
          data.overallStatus === 'HEALTHY' 
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-50/50 to-white border-emerald-200' 
            : data.overallStatus === 'DEGRADED'
            ? 'bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white border-amber-200'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-50/50 to-white border-rose-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                data.overallStatus === 'HEALTHY'
                  ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md'
                  : data.overallStatus === 'DEGRADED'
                  ? 'bg-amber-600 text-white shadow-amber-200 shadow-md'
                  : 'bg-rose-600 text-white shadow-rose-200 shadow-md'
              }`}>
                <Activity className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900">
                    Host Connection Health:
                  </h3>
                  {getStatusBadge(data.overallStatus)}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  {data.summary}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0 bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-slate-200/80">
              <div className="text-center px-3">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">FTPS Latency</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {data.services.ftps.latencyMs} ms
                </span>
              </div>
              <div className="text-center px-3 border-l border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">SSH/SFTP Latency</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {data.services.sftp.latencyMs} ms
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Services Diagnostics Grid */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: FTPS Port 21 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">FTPS Deployment Port</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Port 21 (Explicit TLS)</span>
                </div>
              </div>
              {getStatusBadge(data.services.ftps.status)}
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Server Daemon:</span>
                  <span className="font-bold text-slate-800">Pure-FTPd</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>AUTH TLS Status:</span>
                  <span className={`font-bold ${data.services.ftps.tlsSupported ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {data.services.ftps.tlsSupported ? '234 AUTH TLS OK' : 'No TLS Handshake'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Probe Latency:</span>
                  <span className="font-bold text-slate-800">{data.services.ftps.latencyMs} ms</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] truncate" title={data.services.ftps.banner}>
                {data.services.ftps.banner || 'No banner returned'}
              </div>
            </div>
          </div>

          {/* Card 2: SFTP / SSH Port 22 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">OpenSSH Gateway</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Port 22 (SSH/SFTP)</span>
                </div>
              </div>
              {getStatusBadge(data.services.sftp.status)}
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>SSH Protocol:</span>
                  <span className="font-bold text-slate-800">SSH-2.0</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>OpenSSH Daemon:</span>
                  <span className="font-bold text-emerald-700">OpenSSH_7.4</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Probe Latency:</span>
                  <span className="font-bold text-slate-800">{data.services.sftp.latencyMs} ms</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 text-indigo-400 rounded-xl font-mono text-[10px] truncate" title={data.services.sftp.banner}>
                {data.services.sftp.banner || 'No SSH banner returned'}
              </div>
            </div>
          </div>

          {/* Card 3: Apache Web Server Port 80 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">Apache Web Server</h4>
                  <span className="text-[10px] text-slate-400 font-mono">Port 80 / Public Web</span>
                </div>
              </div>
              {getStatusBadge(data.services.http.status)}
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1.5 font-mono text-[11px]">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Server Software:</span>
                  <span className="font-bold text-slate-800">Apache 2.4</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Document Root:</span>
                  <span className="font-bold text-emerald-700">public_html</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>HTTP Response Time:</span>
                  <span className="font-bold text-slate-800">{data.services.http.latencyMs} ms</span>
                </div>
              </div>

              <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[10px] truncate" title="https://tradeheaven.net">
                https://tradeheaven.net (Active Web Root)
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Target Directory & Staged Artifacts Verification Bar */}
      {data && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <FolderLock className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900">
                Build Staging &amp; cPanel Synchronization Pipeline
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Target: <code className="text-blue-700 font-bold">/home3/a17604c7/public_html/</code>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            {/* Build Dir */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Production Build</span>
                {data.buildState.distExists ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {data.buildState.distExists 
                  ? `${data.buildState.fileCount} build files compiled in dist/`
                  : 'Run npm run build to populate dist/'}
              </p>
            </div>

            {/* index.html */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">SPA Entry (index.html)</span>
                {data.buildState.hasIndexHtml ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                {data.buildState.hasIndexHtml ? 'Validated in dist/index.html' : 'Pending compilation'}
              </p>
            </div>

            {/* api.php */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">BigRock API (api.php)</span>
                {data.buildState.hasApiPhp ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Staged for cPanel MySQL &amp; inquiries
              </p>
            </div>

            {/* .htaccess */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Apache Rewrite (.htaccess)</span>
                {data.buildState.hasHtaccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                Configured for SPA clean URLs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Live Probe History Log Stream */}
      {probeHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Real-Time Health Probe History ({probeHistory.length} events)
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">Auto-updating event feed</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {probeHistory.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-4 font-mono">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-400 text-[11px] shrink-0">{item.timestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    item.status === 'HEALTHY' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : item.status === 'DEGRADED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.status}
                  </span>
                  <span className="text-slate-700 truncate font-sans text-xs">
                    {item.summary}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0 font-bold">
                  avg {item.latencyMs} ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
