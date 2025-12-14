/**
 * Suppress browser extension errors that we can't control
 * These errors come from crypto wallet extensions (Phantom, Solana, Tron, etc.)
 * trying to inject properties into the window object
 */
export function suppressExtensionErrors() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  // Suppress specific extension-related errors
  const extensionErrorPatterns = [
    /Cannot redefine property: (solana|phantom)/i,
    /Cannot set property (tron|solana|phantom) of #<Window>/i,
    /Failed to define property (solana|phantom)/i,
  ];

  console.error = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const shouldSuppress = extensionErrorPatterns.some(pattern => pattern.test(message));
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    const shouldSuppress = extensionErrorPatterns.some(pattern => pattern.test(message));
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
}
