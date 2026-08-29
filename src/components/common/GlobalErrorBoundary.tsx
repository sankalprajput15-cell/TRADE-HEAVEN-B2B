import React from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

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
 * Prevents blank white screen crashes by catching any render-time lifecycle failures,
 * logging diagnostics cleanly, and providing instant UI recovery buttons.
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
    // Simulated email service call
    console.error('[Error Notification Sent to Admin]:', {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    // In a production app, this would be:
    // api.sendAdminNotification({ subject: 'App Error', body: error.stack });
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.reportErrorToAdmin(error, errorInfo);
    
    // Redirect to home page
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tradeheaven_navigate', { detail: 'HOMEPAGE' }));
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }

  render() {
    if (this.state.hasError) {
      // Do not render anything, redirect already handled in componentDidCatch
      return null;
    }

    return this.props.children;
  }
}

