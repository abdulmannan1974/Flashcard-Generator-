import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard } from '../types';
import { RotateCcw, ChevronLeft, ChevronRight, Clock, Award } from 'lucide-react';

interface StudyCardProps {
  card: Flashcard;
  index: number;
  total: number;
  timePerCard: number;
  onKnew: () => void;
  onDidNotKnow: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const StudyCard: React.FC<StudyCardProps> = ({
  card,
  index,
  total,
  timePerCard,
  onKnew,
  onDidNotKnow,
  onNext,
  onPrev,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timePerCard);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Reset state when card changes
  useEffect(() => {
    setIsFlipped(false);
    setTimeLeft(timePerCard);
    setHasAnswered(false);
  }, [card.id, timePerCard]);

  // Timer countdown
  useEffect(() => {
    if (hasAnswered || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [hasAnswered, timeLeft]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleKnew = () => {
    setHasAnswered(true);
    onKnew();
  };

  const handleDidNotKnow = () => {
    setHasAnswered(true);
    onDidNotKnow();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight' && hasAnswered) {
        onNext();
      } else if (e.key === 'ArrowLeft') {
        onPrev();
      } else if (e.key === '1' && isFlipped) {
        handleKnew();
      } else if (e.key === '2' && isFlipped) {
        handleDidNotKnow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, hasAnswered]);

  const difficultyColors = {
    basic: { bg: 'bg-green-100', text: 'text-green-700', label: 'Basic' },
    intermediate: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Intermediate' },
    advanced: { bg: 'bg-red-100', text: 'text-red-700', label: 'Advanced' },
  };

  const diff = difficultyColors[card.difficulty || 'intermediate'];
  const timerPercent = (timeLeft / timePerCard) * 100;
  const timerColor = timerPercent > 50 ? 'bg-green-500' : timerPercent > 20 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress and Timer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-gray-600">
            {index + 1} <span className="text-gray-300">/</span> {total}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${diff.bg} ${diff.text}`}>
            {diff.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={14} className="text-gray-400" />
          <span className="text-xs font-mono font-bold text-gray-500">
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${timerColor} rounded-full transition-all duration-100 ease-linear`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="card-flip cursor-pointer"
        onClick={handleFlip}
        style={{ minHeight: '360px' }}
      >
        <div className={`card-flip-inner w-full ${isFlipped ? 'flipped' : ''}`} style={{ minHeight: '360px' }}>
          {/* Front - Question */}
          <div className="card-front w-full bg-white rounded-3xl shadow-lg border border-gray-100 p-8 flex flex-col justify-center" style={{ minHeight: '360px' }}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blood-50 rounded-full">
                <span className="w-2 h-2 rounded-full bg-blood-500" />
                <span className="text-[10px] font-bold text-blood-600 uppercase tracking-widest">
                  Question
                </span>
              </div>

              <div
                className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: card.question }}
              />

              <p className="text-xs text-gray-400 flex items-center justify-center gap-2">
                <RotateCcw size={12} />
                Tap or press Space to reveal answer
              </p>
            </div>
          </div>

          {/* Back - Answer */}
          <div className="card-back w-full bg-venous-600 rounded-3xl shadow-lg p-8 flex flex-col justify-center" style={{ minHeight: '360px' }}>
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full">
                <Award size={12} className="text-plasma-400" />
                <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                  Answer
                </span>
              </div>

              <div
                className="text-base md:text-lg font-medium text-white/95 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: card.answer }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={index === 0}
          className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
        </button>

        {isFlipped && !hasAnswered && (
          <div className="flex-1 flex gap-3">
            <button
              onClick={handleDidNotKnow}
              className="flex-1 py-3.5 px-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm hover:bg-red-100 transition-all"
            >
              Did Not Know
            </button>
            <button
              onClick={handleKnew}
              className="flex-1 py-3.5 px-4 rounded-xl border-2 border-green-200 bg-green-50 text-green-600 font-bold text-sm hover:bg-green-100 transition-all"
            >
              Knew It
            </button>
          </div>
        )}

        {hasAnswered && (
          <div className="flex-1 flex justify-center">
            <button
              onClick={onNext}
              className="py-3.5 px-8 rounded-xl bg-blood-600 text-white font-bold text-sm hover:bg-blood-700 transition-all shadow-md"
            >
              {index < total - 1 ? 'Next Card' : 'View Results'}
            </button>
          </div>
        )}

        {!isFlipped && !hasAnswered && (
          <div className="flex-1 text-center">
            <p className="text-xs text-gray-400">Tap the card to reveal the answer</p>
          </div>
        )}

        <button
          onClick={onNext}
          disabled={index >= total - 1 && !hasAnswered}
          className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="flex justify-center gap-6 text-[10px] text-gray-300 font-mono">
        <span>Space: Flip</span>
        <span>1: Knew</span>
        <span>2: Didn't know</span>
        <span>Arrow: Navigate</span>
      </div>
    </div>
  );
};

export default StudyCard;
