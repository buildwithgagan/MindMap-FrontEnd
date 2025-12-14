import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorHandler } from "@/components/ErrorHandler";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: 'ZenZone',
  description: 'A minimalist social media experience inspired by Apple\'s design.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Catch extension errors before they crash the app
              (function() {
                const originalError = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  const errorMessage = message || (error && error.message) || '';
                  const extensionErrorPatterns = [
                    /Cannot set property (tron|solana|phantom) of #<Window>/i,
                    /Cannot redefine property: (solana|phantom|tron)/i,
                    /Failed to define property (solana|phantom|tron)/i,
                  ];
                  
                  const isExtensionError = extensionErrorPatterns.some(pattern => 
                    pattern.test(errorMessage)
                  );
                  
                  if (isExtensionError) {
                    // Suppress the error
                    return true;
                  }
                  
                  // Call original error handler if it exists
                  if (originalError) {
                    return originalError.call(this, message, source, lineno, colno, error);
                  }
                  
                  return false;
                };
                
                // Also catch unhandled promise rejections
                window.addEventListener('unhandledrejection', function(event) {
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
                    event.preventDefault();
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <ErrorBoundary>
          <ErrorHandler />
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
