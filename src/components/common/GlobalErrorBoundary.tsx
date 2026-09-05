import React from 'react';

interface Props {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Resilient Global Error Boundary
 * Intercepts any unexpected rendering or runtime exceptions and directly diverts
 * back to the marketplace Home Page without disrupting the user experience with maintenance pages.
 */
export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[GlobalErrorBoundary] Intercepted runtime exception - diverting to Home:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo?.componentStack
    });

    // Notify parent to reset view to HOMEPAGE
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.error('[GlobalErrorBoundary] onReset handler error:', e);
      }
    }

    // Clean URL query parameters and redirect to home if needed
    if (typeof window !== 'undefined') {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('view')) {
          url.searchParams.delete('view');
          window.history.replaceState({}, '', url.pathname);
        }
      } catch {}
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // If we encountered an error, auto-reset state on next tick to allow rendering the home view smoothly
    if (this.state.hasError && !prevState.hasError) {
      if (this.props.onReset) {
        this.props.onReset();
      }
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 50);
    }
  }

  handleRecovery = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({
      hasError: false,
      error: null
    });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('view');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  render() {
    if (this.state.hasError) {
      // Direct auto-divert to home
      return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50">
          <div className="w-12 h-12 rounded-xl bg-white border-2 border-slate-900 shadow-sm flex items-center justify-center p-1 mb-4 animate-pulse">
            <svg viewBox="0 0 512 512" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" fill="#FFFFFF" />
              <g fill="#000000">
                <path d="M 66 136 H 246 V 186 H 181 V 376 H 131 V 186 H 66 Z" />
                <path d="M 266 136 H 316 V 231 H 396 V 136 H 446 V 376 H 396 V 281 H 316 V 376 H 266 Z" />
              </g>
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800 mb-1">Redirecting to Marketplace Home...</p>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            We refreshed the active view to ensure an uninterrupted trading experience.
          </p>
          <button
            onClick={this.handleRecovery}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
          >
            Return to Home Now
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

