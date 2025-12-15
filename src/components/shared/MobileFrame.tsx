import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileFrame({ children, className = '' }: MobileFrameProps) {
  return (
    <div className={`relative mx-auto ${className}`}>
      {/* Phone Frame */}
      <div className="relative bg-black rounded-[2.5rem] p-2 shadow-2xl">
        {/* Screen Bezel */}
        <div className="bg-black rounded-[2rem] p-1">
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>
          {/* Screen */}
          <div className="relative bg-white rounded-[1.75rem] overflow-hidden aspect-[9/19.5] min-h-[500px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

