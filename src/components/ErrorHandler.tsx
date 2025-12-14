"use client";

import { useEffect } from "react";
import { suppressExtensionErrors } from "@/lib/error-handler";

export function ErrorHandler() {
  useEffect(() => {
    // Suppress browser extension errors on mount
    suppressExtensionErrors();

    // Catch unhandled errors from browser extensions
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || event.error?.message || '';
      
      // Check if this is a browser extension error we want to suppress
      const extensionErrorPatterns = [
        /Cannot set property (tron|solana|phantom) of #<Window>/i,
        /Cannot redefine property: (solana|phantom|tron)/i,
        /Failed to define property (solana|phantom|tron)/i,
      ];

      const isExtensionError = extensionErrorPatterns.some(pattern => 
        pattern.test(errorMessage)
      );

      if (isExtensionError) {
        // Prevent the error from crashing the app
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    };

    // Catch unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason || '');
      
      const extensionErrorPatterns = [
        /Cannot set property (tron|solana|phantom) of #<Window>/i,
        /Cannot redefine property: (solana|phantom|tron)/i,
        /Failed to define property (solana|phantom|tron)/i,
      ];

      const isExtensionError = extensionErrorPatterns.some(pattern => 
        pattern.test(errorMessage)
      );

      if (isExtensionError) {
        // Prevent the unhandled rejection from showing
        event.preventDefault();
      }
    };

    // Add global error handlers
    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Cleanup
    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
}
