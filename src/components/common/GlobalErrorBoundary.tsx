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
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
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

