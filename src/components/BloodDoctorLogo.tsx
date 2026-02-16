import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

const BloodDoctorLogo: React.FC<LogoProps> = ({ size = 'md', showTagline = false }) => {
  const sizes = {
    sm: { text: 'text-lg', drop: 'text-xl', tag: 'text-[9px]' },
    md: { text: 'text-2xl', drop: 'text-2xl', tag: 'text-[10px]' },
    lg: { text: 'text-4xl', drop: 'text-4xl', tag: 'text-xs' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-baseline gap-0.5">
        <span className={`${s.text} font-black tracking-tight text-gray-900`}>
          Blood
        </span>
        <span className={s.drop} role="img" aria-label="blood drop">🩸</span>
        <span className={`${s.text} font-black tracking-tight text-gray-900`}>
          Doctor
        </span>
      </div>
      {showTagline && (
        <div className="ml-2 flex flex-col">
          <span className={`${s.tag} font-bold text-blood-600 uppercase tracking-widest`}>
            Flashcards
          </span>
          <span className={`${s.tag} font-medium text-gray-400 uppercase tracking-widest`}>
            Dr Abdul Mannan
          </span>
        </div>
      )}
    </div>
  );
};

export default BloodDoctorLogo;
