import React, { useState } from 'react';
import { Flashcard } from '../types';
import { ChevronDown, ChevronUp, Copy, Check, Search, Filter } from 'lucide-react';

interface CardBrowserProps {
  cards: Flashcard[];
}

const CardBrowser: React.FC<CardBrowserProps> = ({ cards }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  const filteredCards = cards.filter(card => {
    const matchesSearch = !searchTerm ||
      card.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || card.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleCopy = (card: Flashcard, e: React.MouseEvent) => {
    e.stopPropagation();
    const plainText = `Q: ${card.question.replace(/<[^>]*>/g, '')}\nA: ${card.answer.replace(/<[^>]*>/g, '')}`;
    navigator.clipboard.writeText(plainText);
    setCopiedId(card.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const diffColors = {
    basic: { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
    intermediate: { dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
    advanced: { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search cards..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blood-100 focus:border-blood-500 text-sm outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blood-100 focus:border-blood-500 text-sm outline-none transition-all"
          >
            <option value="all">All Levels</option>
            <option value="basic">Basic</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span>{filteredCards.length} of {cards.length} cards</span>
        <div className="flex gap-2">
          {['basic', 'intermediate', 'advanced'].map(d => {
            const count = cards.filter(c => c.difficulty === d).length;
            const dc = diffColors[d as keyof typeof diffColors];
            return (
              <span key={d} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${dc.dot}`} />
                {count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Card List */}
      <div className="space-y-2 max-h-[65vh] overflow-y-auto no-scrollbar pr-1">
        {filteredCards.map((card, idx) => {
          const isExpanded = expandedId === card.id;
          const dc = diffColors[card.difficulty || 'intermediate'];

          return (
            <div
              key={card.id}
              className={`group border rounded-2xl overflow-hidden transition-all ${
                isExpanded
                  ? 'border-blood-200 bg-white shadow-sm'
                  : 'border-gray-100 bg-gray-50/50 hover:border-blood-100 hover:bg-white'
              }`}
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : card.id)}
                className="flex items-center gap-3 p-4 cursor-pointer select-none"
              >
                <span className="text-xs font-black text-gray-300 w-7 tabular-nums text-center">
                  {cards.indexOf(card) + 1}
                </span>
                <span className={`w-2 h-2 rounded-full ${dc.dot} shrink-0`} />
                <div className="flex-grow min-w-0">
                  <h3 className="text-sm font-semibold text-gray-700 line-clamp-1 group-hover:text-blood-600 transition-colors">
                    {card.question.replace(/<[^>]*>/g, '')}
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleCopy(card, e)}
                    className="p-1.5 text-gray-300 hover:text-blood-600 hover:bg-blood-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    {copiedId === card.id ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <div className="text-gray-400 bg-white p-1 rounded-md border border-gray-100">
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="p-6 bg-white border-t border-gray-100 space-y-5 animate-slide-up">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black text-blood-500 uppercase tracking-widest">
                        Question
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${dc.bg} ${dc.text}`}>
                        {card.difficulty}
                      </span>
                    </div>
                    <div
                      className="text-base text-gray-800 leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{ __html: card.question }}
                    />
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div>
                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest block mb-2">
                      Answer
                    </span>
                    <div
                      className="text-base text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: card.answer }}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardBrowser;
