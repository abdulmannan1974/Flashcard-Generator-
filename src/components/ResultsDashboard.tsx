import React from 'react';
import { DeckStats, StudyResult, Flashcard } from '../types';
import {
  Trophy,
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Share2,
  Download,
} from 'lucide-react';
import BloodDoctorLogo from './BloodDoctorLogo';

interface ResultsDashboardProps {
  stats: DeckStats;
  results: StudyResult[];
  cards: Flashcard[];
  onRestart: () => void;
  onShare: () => void;
  deckTitle: string;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  stats,
  results,
  cards,
  onRestart,
  onShare,
  deckTitle,
}) => {
  const getGrade = (pct: number): { label: string; color: string; emoji: string } => {
    if (pct >= 90) return { label: 'Outstanding', color: 'text-green-600', emoji: '🏆' };
    if (pct >= 75) return { label: 'Very Good', color: 'text-blue-600', emoji: '🌟' };
    if (pct >= 60) return { label: 'Good', color: 'text-amber-600', emoji: '👍' };
    if (pct >= 40) return { label: 'Needs Review', color: 'text-orange-600', emoji: '📖' };
    return { label: 'Keep Studying', color: 'text-red-600', emoji: '💪' };
  };

  const grade = getGrade(stats.percentageKnew);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Cards the user didn't know
  const missedCards = results
    .filter(r => !r.knew)
    .map(r => cards.find(c => c.id === r.cardId))
    .filter(Boolean) as Flashcard[];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-fade-in" id="results-dashboard">
      {/* Score Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="blood-gradient p-8 text-center text-white">
          <BloodDoctorLogo size="sm" />
          <div className="mt-4 mb-2">
            <span className="text-6xl">{grade.emoji}</span>
          </div>
          <h2 className="text-3xl font-black">{Math.round(stats.percentageKnew)}%</h2>
          <p className="text-white/80 font-semibold text-lg mt-1">{grade.label}</p>
          <p className="text-white/60 text-sm mt-2">{deckTitle}</p>
        </div>

        <div className="grid grid-cols-4 divide-x divide-gray-100">
          <div className="p-5 text-center">
            <Trophy size={20} className="mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-black text-gray-800">{stats.knewCount}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Knew</p>
          </div>
          <div className="p-5 text-center">
            <XCircle size={20} className="mx-auto text-red-400 mb-2" />
            <p className="text-2xl font-black text-gray-800">{stats.didNotKnowCount}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Missed</p>
          </div>
          <div className="p-5 text-center">
            <Clock size={20} className="mx-auto text-blue-400 mb-2" />
            <p className="text-2xl font-black text-gray-800">{formatTime(stats.totalTimeSpent)}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Time</p>
          </div>
          <div className="p-5 text-center">
            <TrendingUp size={20} className="mx-auto text-green-400 mb-2" />
            <p className="text-2xl font-black text-gray-800">{formatTime(stats.averageTimePerCard)}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Per Card</p>
          </div>
        </div>
      </div>

      {/* Missed Cards Review */}
      {missedCards.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Target size={18} className="text-red-500" />
              Cards to Review ({missedCards.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {missedCards.map((card, idx) => (
              <div key={card.id} className="p-4 hover:bg-red-50/30 transition-colors">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-black text-red-400 bg-red-50 w-6 h-6 rounded-full flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="space-y-2 flex-1">
                    <div
                      className="text-sm font-semibold text-gray-700"
                      dangerouslySetInnerHTML={{ __html: card.question }}
                    />
                    <div
                      className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3"
                      dangerouslySetInnerHTML={{ __html: card.answer }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRestart}
          className="flex-1 py-4 px-6 bg-blood-600 text-white rounded-xl font-bold text-sm hover:bg-blood-700 transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <RotateCcw size={18} />
          Study Again
        </button>
        <button
          onClick={onShare}
          className="flex-1 py-4 px-6 bg-venous-600 text-white rounded-xl font-bold text-sm hover:bg-venous-700 transition-colors flex items-center justify-center gap-2 shadow-md"
        >
          <Share2 size={18} />
          Share Results
        </button>
      </div>

      {/* Footer */}
      <div className="text-center py-4">
        <p className="text-xs text-gray-400">
          Blood🩸Doctor Flashcards | Dr Abdul Mannan FRCPath FCPS
        </p>
        <p className="text-[10px] text-gray-300 mt-1">blooddoctor.co@gmail.com</p>
      </div>
    </div>
  );
};

export default ResultsDashboard;
