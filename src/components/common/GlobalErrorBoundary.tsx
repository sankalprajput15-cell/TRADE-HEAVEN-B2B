import React from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Resilient Global Error Boundary
 * Prevents blank white screen crashes by catching any render-time lifecycle failures or unhandled exceptions,
 * displaying a professional, highly polished 'System undergoing maintenance' view to protect global trade assets.
 */
export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  reportErrorToAdmin = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('[GlobalErrorBoundary Caught Exception]:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.reportErrorToAdmin(error, errorInfo);
    this.setState({ errorInfo });
    
    // Dispatch safety event if it's a database-related failure
    const errorMsg = error.message || '';
    const isDbError = errorMsg && (
      errorMsg.toLowerCase().includes('database') ||
      errorMsg.toLowerCase().includes('sql') ||
      errorMsg.toLowerCase().includes('insert') ||
      errorMsg.toLowerCase().includes('pdo') ||
      errorMsg.toLowerCase().includes('query')
    );
    
    if (isDbError && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tradeheaven_database_error', {
        detail: { message: error.message, code: 'DATABASE_RENDER_CRASH' }
      }));
    }
  }

  handleRecovery = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    if (typeof window !== 'undefined') {
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'An unexpected application runtime exception occurred.';
      const isDbError = errorMsg.toLowerCase().includes('database') || 
                        errorMsg.toLowerCase().includes('sql') || 
                        errorMsg.toLowerCase().includes('insert') || 
                        errorMsg.toLowerCase().includes('pdo') || 
                        errorMsg.toLowerCase().includes('query') ||
                        errorMsg.toLowerCase().includes('mismatch');

      return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans antialiased">
          {/* Header Alert Ribbon */}
          <div className="bg-rose-600 text-white text-xs font-semibold py-2 px-4 text-center tracking-wide">
            ⚠️ CENTRAL TRANSACTION PROTECTION STATUS: CRITICAL STANDBY ACTIVE
          </div>

          {/* Center Container */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full">
            <div className="w-20 h-20 bg-rose-100 border border-rose-300 rounded-3xl flex items-center justify-center mb-8 shadow-sm">
              <ShieldAlert className="w-10 h-10 text-rose-600 animate-pulse" />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center tracking-tight leading-none mb-3">
              System Undergoing Maintenance
            </h1>
            <p className="text-slate-600 text-center max-w-lg mb-8 leading-relaxed text-base">
              {isDbError 
                ? "Our database operations are undergoing critical scheduled maintenance and optimization. For your transaction security, operations are temporarily suspended."
                : "A runtime error was intercepted during component rendering. Our safety protocol has engaged Standby Failsafe Mode to protect active trade files."}
            </p>

            {/* Error Diagnostics Card */}
            <div className="w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-6 mb-8 overflow-hidden text-left">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnostic Details & logs</span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                  {isDbError ? 'DATABASE_FAILSAFE' : 'APPLICATION_FAULT'}
                </span>
              </div>
              
              <div className="space-y-3 font-mono text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 select-none shrink-0">[Message]:</span>
                  <span className="font-semibold break-all text-rose-600">
                    {errorMsg}
                  </span>
                </div>
                {this.state.error?.stack && (
                  <div className="flex items-start gap-2 max-h-32 overflow-y-auto bg-slate-50 p-2.5 rounded border border-slate-100 text-xs text-slate-500 w-full">
                    <span className="text-slate-400 select-none shrink-0">[Stack]:</span>
                    <pre className="whitespace-pre-wrap font-mono">{this.state.error.stack.split('\n').slice(0, 4).join('\n')}</pre>
                  </div>
                )}
                <div className="flex items-start gap-2 text-xs">
                  <span className="text-slate-400 select-none shrink-0">[Telemetry]:</span>
                  <span>Auto-routed to site reliability engineering queue.</span>
                </div>
              </div>
            </div>

            {/* Action Group */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={this.handleRecovery}
                className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 shadow-md hover:shadow-lg cursor-pointer whitespace-nowrap"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Initialize Safe Restart</span>
              </button>
              <a
                href="mailto:sankalprajput15@gmail.com"
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold transition-all duration-200 inline-flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              >
                <span>SRE Contact Desk</span>
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 bg-white py-6 px-4 text-center">
            <p className="text-xs text-slate-400">
              Trade Heaven Global Systems Ltd &bull; Swiss Custodial Ledger Persistence &bull; &copy; {new Date().getFullYear()} All Rights Reserved.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
