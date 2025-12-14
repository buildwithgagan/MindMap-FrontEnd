"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a browser extension error we should ignore
    const errorMessage = error.message || '';
    const extensionErrorPatterns = [
      /Cannot set property (tron|solana|phantom) of #<Window>/i,
      /Cannot redefine property: (solana|phantom|tron)/i,
      /Failed to define property (solana|phantom|tron)/i,
    ];

    const isExtensionError = extensionErrorPatterns.some(pattern => 
      pattern.test(errorMessage)
    );

    // If it's an extension error, don't show error state
    if (isExtensionError) {
      return { hasError: false, error: null };
    }

    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if this is a browser extension error
    const errorMessage = error.message || '';
    const extensionErrorPatterns = [
      /Cannot set property (tron|solana|phantom) of #<Window>/i,
      /Cannot redefine property: (solana|phantom|tron)/i,
      /Failed to define property (solana|phantom|tron)/i,
    ];

    const isExtensionError = extensionErrorPatterns.some(pattern => 
      pattern.test(errorMessage)
    );

    // Only log non-extension errors
    if (!isExtensionError) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Show fallback UI for real errors
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
