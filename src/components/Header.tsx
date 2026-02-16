import React from 'react';
import BloodDoctorLogo from './BloodDoctorLogo';
import { GraduationCap, Share2 } from 'lucide-react';

interface HeaderProps {
  onShareDeck?: () => void;
  hasCards: boolean;
}

const Header: React.FC<HeaderProps> = ({ onShareDeck, hasCards }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-4">
          <BloodDoctorLogo size="md" showTagline />
        </div>

        <nav className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <GraduationCap size={14} className="text-blood-600" />
            <span className="font-semibold text-gray-600">FRCPath | FCPS | MRCP</span>
          </div>

          {hasCards && onShareDeck && (
            <button
              onClick={onShareDeck}
              className="flex items-center gap-2 px-4 py-2 bg-blood-600 text-white rounded-lg hover:bg-blood-700 transition-colors text-sm font-semibold shadow-sm"
            >
              <Share2 size={16} />
              Share Deck
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
