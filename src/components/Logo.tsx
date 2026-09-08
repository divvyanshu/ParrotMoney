import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly }: LogoProps) {
  const [logoError, setLogoError] = React.useState(false);
  const [iconError, setIconError] = React.useState(false);

  // If we want icon-only representation and have an icon image asset
  if (iconOnly && !iconError) {
    return (
      <div className={cn("relative shrink-0 select-none overflow-hidden h-12 w-12 bg-[#10B981]/5 rounded-xl border border-[#10B981]/10 flex items-center justify-center", className)}>
        <img
          src="/logo-icon.png"
          alt="ParrotMoney"
          className="absolute top-0 left-0 h-12 max-w-none origin-left object-cover object-left"
          style={{ width: 'auto', transform: 'scale(1.42)', transformOrigin: 'left center' }}
          onError={() => setIconError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // If we want full logo and have the full logo image asset loaded
  if (!iconOnly && !logoError) {
    return (
      <div className={cn("flex items-center shrink-0 select-none", className)}>
        <img
          src="/logo.png"
          alt="ParrotMoney Logo"
          className="h-12 w-auto object-contain"
          onError={() => setLogoError(true)}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Fallback high-fidelity SVG/typography rendering in case the files are not uploaded yet
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg 
        width="44" 
        height="44" 
        viewBox="0 0 120 120" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 select-none animate-fade-in"
      >
        <defs>
          <linearGradient id="featherLeftGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="featherMiddleGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#34D399" />
          </linearGradient>
          <linearGradient id="parrotBodyGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#065F46" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Outer stylized feathers resembling the uploaded brand mark */}
        <path 
          d="M 35 85 C 10 65, 5 35, 10 15 C 20 35, 30 60, 50 78 Z" 
          fill="url(#featherLeftGrad)" 
        />
        <path 
          d="M 50 90 C 30 70, 20 40, 25 10 C 35 35, 45 61, 65 80 Z" 
          fill="url(#featherMiddleGrad)" 
        />
        <path 
          d="M 65 80 C 50 60, 45 40, 60 25 C 58 40, 68 62, 85 70 C 88 60, 83 50, 75 35 C 90 45, 95 61, 98 75 C 78 95, 60 100, 65 80 Z" 
          fill="url(#parrotBodyGrad)" 
        />

        {/* Head and Beak holding notes */}
        <circle cx="88" cy="38" r="16" fill="url(#parrotBodyGrad)" />
        <path d="M 98 32 C 108 32, 118 36, 120 44 C 112 46, 102 48, 98 46 Z" fill="#059669" />
        <circle cx="92" cy="34" r="2.5" fill="white" />
        <circle cx="92.5" cy="34" r="1" fill="#047857" />

        {/* Currency stack outline in beak */}
        <g transform="translate(108, 38) rotate(-15)">
          <rect x="0" y="0" width="8" height="18" rx="1.5" fill="#A7F3D0" stroke="#047857" strokeWidth="1" />
          <text x="4" y="11" fontFamily="sans-serif" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">₹</text>
        </g>
      </svg>
      
      {!iconOnly && (
        <div className="flex items-center tracking-tight select-none">
          <span className="text-3xl font-black text-[#10B981] font-display">parrot</span>
          <span className="text-3xl font-medium text-[#0071BC] font-sans">money</span>
        </div>
      )}
    </div>
  );
}

