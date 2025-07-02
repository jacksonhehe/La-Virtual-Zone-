import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Sentry.captureException(error, { extra: errorInfo });
    this.setState({ hasError: true, error });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          {this.state.error && (
            <p className="mb-4 text-sm opacity-75">{this.state.error.message}</p>
          )}
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
