import React from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface BankLogoProps {
  bank: string | {
    id?: string;
    name?: string;
    logoUrl?: string;
    fallbackColor?: string;
    fallbackText?: string;
  };
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

export function BankLogo({ bank, className, size = 'md', showBorder = true }: BankLogoProps) {
  const bankName = typeof bank === 'string' ? bank : (bank.name || bank.id || '');
  const bankId = typeof bank === 'object' && bank.id ? bank.id.toLowerCase() : '';
  const normalized = (bankName || bankId).toLowerCase();

  const containerClass = cn(
    "relative rounded-xl overflow-hidden flex items-center justify-center shrink-0 transition-transform select-none bg-white",
    showBorder && "border border-slate-200/80 shadow-xs",
    sizeClasses[size] || 'w-10 h-10',
    className
  );

  // 1. SBI / State Bank of India
  if (normalized.includes('sbi') || normalized.includes('state bank')) {
    return (
      <div className={cn(containerClass, "p-1")} title="State Bank of India">
        <svg viewBox="33.78 175.84 34.28 34.35" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="m 50.918349,175.84129 c -9.463306,0 -17.134866,7.68936 -17.134866,17.17438 0,8.89234 6.742566,16.20584 15.381364,17.08514 v -12.47584 c -1.856724,-0.70824 -3.1795,-2.50666 -3.1795,-4.6093 0,-2.72076 2.212264,-4.93432 4.933002,-4.93432 2.719454,0 4.934266,2.21356 4.934266,4.93432 0,2.10264 -1.325316,3.90072 -3.18204,4.6093 v 12.47584 c 8.640066,-0.8793 15.382632,-8.1928 15.382632,-17.08514 0,-9.48502 -7.671564,-17.17438 -17.134858,-17.17438" fill="#0072bc" fillRule="nonzero" />
        </svg>
      </div>
    );
  }

  // 2. HDFC Bank
  if (normalized.includes('hdfc')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#004C8F]")} title="HDFC Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#004C8F" />
          <rect x="7" y="7" width="22" height="22" fill="#ED1C24" />
          <rect x="11" y="11" width="14" height="14" fill="#FFFFFF" />
          <rect x="14" y="7" width="8" height="22" fill="#004C8F" />
          <rect x="7" y="14" width="22" height="8" fill="#004C8F" />
          <rect x="15" y="15" width="6" height="6" fill="#ED1C24" />
        </svg>
      </div>
    );
  }

  // 3. ICICI Bank
  if (normalized.includes('icici')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#B02A30]")} title="ICICI Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#B02A30" />
          <circle cx="18" cy="18" r="11" stroke="#F58220" strokeWidth="2.5" fill="none" />
          <circle cx="18" cy="12" r="2" fill="#F58220" />
          <path d="M18 16V24" stroke="#F58220" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 4. Axis Bank
  if (normalized.includes('axis')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#97144D]")} title="Axis Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#97144D" />
          <path d="M18 7L27 27H20L18 21L16 27H9L18 7Z" fill="#FFFFFF" />
          <path d="M18 13L22 23H14L18 13Z" fill="#97144D" />
        </svg>
      </div>
    );
  }

  // 5. Kotak Mahindra Bank
  if (normalized.includes('kotak')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#003974]")} title="Kotak Mahindra Bank">
        <svg viewBox="0 0 34 30" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2.28,14.5C2.28,7.43,8.94,1.7,17.16,1.7s14.88,5.73,14.88,12.8-6.66,12.8-14.88,12.8S2.28,21.57,2.28,14.5Z" fill="#003974"/>
          <polygon points="15.35 5.83 18.81 4.69 18.83 23.38 15.34 24.55 15.35 5.83" fill="#ec1c24"/>
          <path d="M17.4,17.47c-1.5,1.81-2.95,3.66-5.67,3.66-3.84,0-5.66-3.71-5.66-6.82s1.42-6.51,5.17-6.51c1.62,0,3.19.99,4.12,2.04v2.53c-.78-.52-2.52-1.04-3.66-1.06-2.37-.04-4.47.99-4.43,3.33.03,1.61,1.62,2.71,3.21,2.71,2.44,0,3.91-2.22,5.14-3.91.34-.44,1.31-1.74,1.47-1.95,1.37-1.91,2.95-3.66,5.67-3.66,3.2,0,5,2.58,5.51,5.24h-1.44c-.58-.86-1.7-1.39-2.8-1.39-2.52,0-4.02,2.32-5.28,4.02,0,0-.98,1.33-1.33,1.76ZM28.35,15.79c-.32,2.67-1.82,5.37-5.1,5.38-1.91,0-3.4-1.31-4.44-2.91v-1.85c1.29.64,2.5,1.33,3.97,1.35,1.81.03,3.44-.67,4.12-1.97h1.45Z" fill="#ffffff"/>
        </svg>
      </div>
    );
  }

  // 6. Bank of Baroda
  if (normalized.includes('baroda') || normalized.includes('bob')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#F26522]")} title="Bank of Baroda">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#F26522" />
          <circle cx="18" cy="18" r="10" stroke="#FFFFFF" strokeWidth="2.5" fill="none" />
          <path d="M18 11C21.87 11 25 14.13 25 18H18V11Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 7. Federal Bank
  if (normalized.includes('federal')) {
    return (
      <div className={cn(containerClass, "p-1 bg-white")} title="Federal Bank">
        <svg viewBox="0 0 44 63" className="w-full h-full p-1" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(-0.38, -115.46)">
            <path d="m 3.41,161.93 8.54,-43.96 h 5.15 5.02 18.31 l -1.76,8.92 H 20.39 l -1.88,8.91 h 13.91 l -1.76,8.92 H 16.78 l -3.2,16.45 H 3.41 Z" fill="#004cbe" />
            <path d="m 45.0,177.54 1.16,-5.94 H 1.54 l -1.16,5.94 z" fill="#ff9c00" />
          </g>
        </svg>
      </div>
    );
  }

  // 8. Union Bank of India
  if (normalized.includes('union')) {
    return (
      <div className={cn(containerClass, "p-1 bg-white")} title="Union Bank of India">
        <svg viewBox="0 0 1085 975" className="w-full h-full p-0.5" xmlns="http://www.w3.org/2000/svg">
          <path d="m 772.82,0 51.35,0 c 4.3,1.32 8.86,0.74 13.25,1.51 58.41,5.68 116.33,23.22 165.79,55.27 19.93,12.88 38.1,28.39 54.55,45.46 12.61,14.27 24.68,29.15 34.48,45.53 6.34,9.7 11.24,20.22 16.44,30.56 15.04,32.25 24.03,67.17 27.58,102.53 0.98,5.71 0.53,11.55 1.55,17.26 0.54,6.94 0.07,13.92 0.22,20.89 -0.19,8.04 0.58,16.15 -0.77,24.12 -0.81,20.61 -3.97,41.05 -7.81,61.3 -2.12,12.07 -5.85,23.77 -8.25,35.78 -24.31,97.33 -48.66,194.66 -72.99,291.99 -3.99,18.03 -8.85,35.86 -13.19,53.81 -3,11.52 -5.91,23.37 -12.59,33.41 -4.9,7.87 -11.33,14.66 -18.4,20.61 -16.89,13.5 -38.66,19.82 -60.08,20.02 -9.11,-0.81 -18.29,-1.99 -26.96,-5.03 -9.06,-3.56 -18.18,-7.86 -24.77,-15.25 -9.56,-8.41 -14.74,-21.08 -15.52,-33.64 -1.05,-7.88 1.14,-15.75 3.09,-23.33 11.54,-46.14 23.06,-92.27 34.61,-138.4 5.03,-19.48 9.37,-39.12 14.38,-58.6 16.79,-67.2 33.62,-134.39 50.39,-201.59 4.07,-16.46 6.6,-33.27 7.79,-50.17 -0.3,-13.02 0.74,-26.1 -0.95,-39.04 -1.73,-16.18 -5.38,-32.25 -11.72,-47.29 -5.55,-14.6 -14.1,-27.92 -24.39,-39.63 -2.91,-4.41 -7.64,-6.99 -11.17,-10.81 -1.66,-1.68 -3.38,-3.31 -5.28,-4.7 -10.85,-8.26 -22.43,-15.8 -35.11,-20.93 -11.03,-5.43 -22.8,-9.24 -34.68,-12.31 -16.46,-4.71 -33.43,-7.76 -50.54,-8.55 -7.64,-1.38 -15.41,-0.52 -23.11,-0.81 -6.06,-0.29 -11.98,1.32 -18.03,1.14 -28.28,2.7 -56.27,9 -82.86,19.02 -17.61,6.13 -34.28,14.52 -50.68,23.3 -19.52,11.61 -38.47,24.4 -55.2,39.82 -5.78,5.88 -11.69,11.64 -17.48,17.52 -11.27,13.16 -21.88,27.25 -28.57,43.36 -7.22,23.52 -13.32,47.38 -19.95,71.07 -8.05,30.66 -16.32,61.25 -24.02,92 -9.29,34.78 -17.73,69.79 -27.57,104.43 -4.44,14.53 -8.92,29.06 -13.42,43.57 -2.06,7.95 -3.72,16.13 -7.53,23.48 -11.96,26.21 -37.93,44.95 -66.11,49.86 -19.19,3.73 -40.03,1.15 -56.74,-9.37 -4.86,-3.75 -10.14,-7.22 -13.67,-12.35 -7.4,-8.65 -11.58,-19.67 -13.09,-30.87 -0.21,-5.28 -2.29,-10.74 -0.01,-15.86 22.95,-75.21 41.18,-151.74 61.24,-227.75 11.16,-42.86 22.28,-85.74 34.77,-128.24 2.75,-10.41 7.29,-20.24 12.24,-29.77 13.48,-28.26 32.07,-53.84 52.92,-77.1 8.17,-8.15 16.31,-16.34 24.5,-24.48 13,-11.06 25.84,-22.39 39.96,-32.04 7.07,-5.82 15.18,-10.11 22.68,-15.33 29.97,-19 62.12,-34.44 95.48,-46.51 8.24,-2.74 16.26,-6.19 24.7,-8.34 17.73,-5.24 35.64,-9.96 53.86,-13.16 14.09,-2.95 28.44,-4.25 42.7,-6.2 4.22,-0.48 8.58,0.19 12.69,-1.17 z" fill="#00579c" />
          <path d="m 176.12,146.24 c 4.99,-0.17 9.9,-1.35 14.9,-1.28 13.04,1.19 26.29,3.11 38.23,8.82 8.16,4.39 16.32,9.6 21.35,17.63 7.21,9.14 7.71,21.65 5.43,32.62 -6.44,24.96 -12.28,50.09 -19.04,74.97 -7.5,30.14 -15.06,60.26 -22.58,90.39 -5.6,22.93 -11.9,45.67 -17.41,68.61 -6.51,26.14 -13.11,52.26 -19.59,78.41 -5.61,20.64 -10.58,41.45 -15.8,62.2 -5.91,22.3 -10.55,45.12 -10.88,68.26 -1.1,6.02 -0.84,12.13 0.06,18.16 0.37,24.2 5.81,48.3 15.88,70.31 4.89,8.89 9.7,17.91 16.21,25.77 5.02,5.63 9.58,11.75 15.55,16.45 6.61,5.09 12.78,10.84 20.14,14.89 7.7,4.9 15.9,8.92 24.15,12.81 18.59,7.31 37.84,13.02 57.53,16.44 18.35,2.63 36.95,4.43 55.48,2.95 46.44,-2.8 92.07,-16.13 133.27,-37.65 24.43,-12.38 46.83,-28.55 67.27,-46.72 11.57,-11.19 22.66,-22.99 31.55,-36.47 5.42,-8.24 11.24,-16.54 13.75,-26.22 24.4,-84.3 45.07,-169.61 67.67,-254.39 4.65,-16.73 10.25,-33.17 15.15,-49.83 4.66,-15.38 11.92,-30.22 22.68,-42.27 5.72,-7.67 13.59,-13.35 21.53,-18.51 17.06,-10.94 37.94,-15.1 57.99,-13.18 9.61,1.16 19.23,3.51 27.76,8.22 10.64,4.97 19.93,13.2 25.37,23.67 5.36,9.87 5.47,21.77 3.11,32.5 -15.23,50.71 -28.76,101.91 -41.82,153.21 -18.02,69.03 -35.35,138.25 -55.22,206.79 -1.71,6.2 -4.29,12.12 -7.03,17.93 -4.74,11.42 -10.94,22.15 -17.32,32.72 -11.33,18.5 -24.26,36.06 -39.08,51.92 -6.04,7.58 -13.48,13.87 -20.11,20.91 -13.27,12.13 -26.98,23.85 -41.54,34.44 -22.89,16.92 -47.59,31.26 -73.03,43.95 -11.8,5.27 -23.44,10.92 -35.54,15.48 -10.53,4.56 -21.6,7.65 -32.36,11.58 -16.64,5.4 -33.63,9.53 -50.68,13.35 -6.49,1.27 -13.05,2.09 -19.51,3.48 -9.94,1.78 -20.02,2.52 -29.99,4.06 -5.11,0.91 -10.42,-0.23 -15.41,1.38 l -51.36,0 c -1.91,-0.53 -3.85,-0.9 -5.82,-0.94 -7.35,-0.13 -14.55,-1.87 -21.88,-2.28 -22.18,-3 -44.2,-7.48 -65.51,-14.39 -24,-6.94 -46.87,-17.33 -68.82,-29.18 -15.82,-9.06 -30.74,-19.61 -44.89,-31.1 -4.37,-3.97 -9.17,-7.47 -13.17,-11.85 C 86.41,878.6 79.36,872.6 73.64,865.37 35.4,821.95 11.39,766.74 3.44,709.56 1.86,700.5 1.59,691.26 0,682.22 L 0,629.8 c 0.94,-3.49 0.85,-7.11 1.22,-10.66 2.68,-25.71 6.52,-51.43 13.56,-76.35 10.89,-42.84 21.17,-85.85 32.44,-128.59 8.57,-34.41 17.18,-68.81 25.8,-103.21 8.1,-30.21 15.25,-60.68 22.99,-90.99 2.04,-7.49 3.2,-15.31 6.64,-22.34 3.91,-8.03 8.09,-16.19 14.61,-22.44 3.22,-3.1 6.22,-6.42 9.6,-9.34 13.91,-11.38 31.51,-17.73 49.26,-19.64 z" fill="#da251c" />
        </svg>
      </div>
    );
  }

  // 9. IDFC First Bank
  if (normalized.includes('idfc')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#9E1B32]")} title="IDFC First Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#9E1B32" />
          <path d="M18 8L27 13V22L18 28L9 22V13L18 8Z" fill="#EAAA00" />
          <text x="18" y="21" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="9" fontFamily="sans-serif">1ST</text>
        </svg>
      </div>
    );
  }

  // 10. Standard Chartered
  if (normalized.includes('standard') || normalized.includes('scb') || normalized.includes('chartered')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#005EB8]")} title="Standard Chartered Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#005EB8" />
          <path d="M10 20C10 14 15 11 20 11C23 11 26 13 26 16C26 21 16 19 16 23C16 25 18 26 21 26C24 26 26 24 26 24" stroke="#00A54F" strokeWidth="3" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 11. HSBC
  if (normalized.includes('hsbc')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#DB0011]")} title="HSBC Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#DB0011" />
          <rect x="6" y="6" width="24" height="24" fill="#FFFFFF" />
          <polygon points="6,6 18,18 6,30" fill="#DB0011" />
          <polygon points="30,6 18,18 30,30" fill="#DB0011" />
        </svg>
      </div>
    );
  }

  // 12. PNB / Punjab National Bank / PNB Housing Finance
  if (normalized.includes('pnb') || normalized.includes('punjab national')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#A21D21]")} title="PNB Housing Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#A21D21" />
          <circle cx="18" cy="18" r="10" stroke="#FFC20E" strokeWidth="2.5" fill="none" />
          <text x="18" y="22" textAnchor="middle" fill="#FFFFFF" fontWeight="900" fontSize="10" fontFamily="sans-serif">PNB</text>
        </svg>
      </div>
    );
  }

  // 13. LIC Housing Finance
  if (normalized.includes('lic')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#004A8F]")} title="LIC Housing Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#004A8F" />
          <circle cx="18" cy="18" r="10" fill="#FFD200" />
          <path d="M18 11C18 11 15 15 15 17C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17C21 15 18 11 18 11Z" fill="#D32F2F" />
        </svg>
      </div>
    );
  }

  // 14. Bajaj Housing Finance
  if (normalized.includes('bajaj')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#004C97]")} title="Bajaj Housing Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#004C97" />
          <path d="M10 24L16 12H20L14 24H10Z" fill="#FFFFFF" />
          <path d="M17 24L23 12H27L21 24H17Z" fill="#00A3E0" />
        </svg>
      </div>
    );
  }

  // 15. Tata Capital
  if (normalized.includes('tata')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#005696]")} title="Tata Capital">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#005696" />
          <path d="M11 12H25M18 12V25" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  // 16. L&T Finance
  if (normalized.includes('l&t') || normalized.includes('lt finance') || normalized.includes('ltfs')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#005DAA]")} title="L&T Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#005DAA" />
          <circle cx="18" cy="18" r="11" fill="#FFFFFF" />
          <text x="18" y="22" textAnchor="middle" fill="#005DAA" fontWeight="900" fontSize="9" fontFamily="sans-serif">L&amp;T</text>
        </svg>
      </div>
    );
  }

  // 17. Piramal Finance / Piramal Capital
  if (normalized.includes('piramal')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#BE2026]")} title="Piramal Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#BE2026" />
          <circle cx="18" cy="12" r="3.5" fill="#FFFFFF" />
          <circle cx="24" cy="18" r="3.5" fill="#FFFFFF" />
          <circle cx="18" cy="24" r="3.5" fill="#FFFFFF" />
          <circle cx="12" cy="18" r="3.5" fill="#FFFFFF" />
          <circle cx="18" cy="18" r="2" fill="#BE2026" />
        </svg>
      </div>
    );
  }

  // 18. Aditya Birla Capital
  if (normalized.includes('aditya birla') || normalized.includes('birla')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#C32026]")} title="Aditya Birla Capital">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#C32026" />
          <path d="M8 25C9.5 20 13.5 16 18 16C22.5 16 26.5 20 28 25H8Z" fill="#F48120" />
          <path d="M11 25C12.5 21.5 15 19 18 19C21 19 23.5 21.5 25 25H11Z" fill="#FFC20E" />
          <circle cx="18" cy="12" r="3" fill="#FFC20E" />
        </svg>
      </div>
    );
  }

  // 19. Godrej Housing Finance / Capital
  if (normalized.includes('godrej')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#9E1B32]")} title="Godrej Housing Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#9E1B32" />
          <text x="18" y="25" textAnchor="middle" fill="#FFFFFF" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="20">G</text>
        </svg>
      </div>
    );
  }

  // 20. Shriram Finance
  if (normalized.includes('shriram')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#0A387E]")} title="Shriram Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#0A387E" />
          <circle cx="18" cy="18" r="11" fill="#E62B25" />
          <path d="M18 9L21 16H15L18 9Z" fill="#FFD700" />
          <path d="M13 14L15 20H11L13 14Z" fill="#FFD700" />
          <path d="M23 14L25 20H21L23 14Z" fill="#FFD700" />
        </svg>
      </div>
    );
  }

  // 21. Chola / Cholamandalam
  if (normalized.includes('chola')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#C4161C]")} title="Chola Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#C4161C" />
          <path d="M18 6L21 15L30 18L21 21L18 30L15 21L6 18L15 15Z" fill="#FBB03B" />
          <circle cx="18" cy="18" r="3" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 22. Home First Finance
  if (normalized.includes('home first') || normalized.includes('homefirst')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#0D2E5C]")} title="Home First Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#0D2E5C" />
          <path d="M18 8L7 18H12V28H24V18H29L18 8Z" fill="#F37023" />
          <path d="M15 28V20H21V28H15Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 23. Aavas Financiers
  if (normalized.includes('aavas')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#00796B]")} title="Aavas Financiers">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#00796B" />
          <path d="M18 8L9 16V26H15V21H21V26H27V16L18 8Z" fill="#FF9800" />
        </svg>
      </div>
    );
  }

  // 24. Muthoot Finance
  if (normalized.includes('muthoot')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#D32F2F]")} title="Muthoot Finance">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#D32F2F" />
          <circle cx="18" cy="14" r="5" fill="#FFD700" />
          <path d="M11 26C11 21 14 18 18 18C22 18 25 21 25 26H11Z" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 25. Canara Bank
  if (normalized.includes('canara')) {
    return (
      <div className={cn(containerClass, "p-1 bg-[#0091DF]")} title="Canara Bank">
        <svg viewBox="0 0 36 36" className="w-full h-full p-0.5" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="36" height="36" rx="6" fill="#0091DF" />
          <polygon points="18,8 28,26 8,26" fill="#FFCC00" />
          <circle cx="18" cy="20" r="4" fill="#0091DF" />
        </svg>
      </div>
    );
  }

  // 26. Custom fallback or letter badge
  const fallbackColor = typeof bank === 'object' && bank.fallbackColor ? bank.fallbackColor : 'bg-emerald-600';
  const shortText = (typeof bank === 'object' && bank.fallbackText) || bankName.slice(0, 3).toUpperCase() || 'LEND';

  return (
    <div className={cn(containerClass, "p-0.5")} title={bankName}>
      <div className={cn("w-full h-full rounded-lg flex items-center justify-center text-white font-black text-[10px] tracking-tight", fallbackColor)}>
        {shortText}
      </div>
    </div>
  );
}
