import React from 'react';

interface SCTLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  inverted?: boolean;
}

export const SCTLogo: React.FC<SCTLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  inverted = false,
}) => {
  const sizeMap = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16',
    xl: 'h-20',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <img
        src="/src/assets/images/sct_official_logo.svg"
        alt="Special Children's Trust Official Logo"
        className={`${sizeMap[size]} w-auto object-contain transition-transform`}
        style={{ aspectRatio: '5 / 4' }}
      />
      {showSubtitle && (
        <div className="flex flex-col">
          <span
            className={`font-black text-sm sm:text-base tracking-tight leading-tight ${
              inverted ? 'text-white' : 'text-[#162365]'
            }`}
          >
            SPECIAL CHILDREN'S TRUST
          </span>
          <span className="text-[11px] font-bold text-[#EAB308] uppercase tracking-wider">
            HR Management System
          </span>
        </div>
      )}
    </div>
  );
};
