import React, { useState, useRef, useCallback } from 'react';
import {
  Flashcard,
  GenerationStatus,
  StudyMode,
  StudyResult,
  DeckStats,
  InputSource,
} from './types';
import { GeminiService } from './utils/geminiService';
import { downloadShareableHTML, copyDeckToClipboard } from './utils/shareUtils';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import CardBrowser from './components/CardBrowser';
import StudyCard from './components/StudyCard';
import ResultsDashboard from './components/ResultsDashboard';
import BloodDoctorLogo from './components/BloodDoctorLogo';
import {
  BookOpen,
  Play,
  RefreshCw,
  AlertCircle,
  Trash2,
  Download,
  Copy,
  Settings,
  Stethoscope,
  Sparkles,
  FileText,
  GraduationCap,
} from 'lucide-react';

const App: React.FC = () => {
  // API Key
  const [apiKey, setApiKey] = useState(process.env.GEMINI_API_KEY || '');
  const [showApiInput, setShowApiInput] = useState(!process.env.GEMINI_API_KEY);

  // Cards state
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [rawOutput, setRawOutput] = useState('');
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [deckTitle, setDeckTitle] = useState('Haematology Study Deck');

  // Study mode
  const [studyMode, setStudyMode] = useState<StudyMode>(StudyMode.BROWSE);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [studyResults, setStudyResults] = useState<StudyResult[]>([]);
  const [timePerCard, setTimePerCard] = useState(30);
  const [cardStartTime, setCardStartTime] = useState(Date.now());

  // Settings
  const [showSettings, setShowSettings] = useState(false);

  const geminiServiceRef = useRef<GeminiService | null>(null);

  const getService = useCallback(() => {
    if (!geminiServiceRef.current && apiKey) {
      geminiServiceRef.current = new GeminiService(apiKey);
    }
    return geminiServiceRef.current;
  }, [apiKey]);

  // Handle text extracted from file upload
  const handleTextExtracted = async (text: string, source: InputSource, fileName: string) => {
    const service = getService();
    if (!service) {
      setError('Please enter your Gemini API key first.');
      setShowApiInput(true);
      return;
    }

    setDeckTitle(fileName.replace(/\.[^/.]+$/, '') || 'Haematology Study Deck');
    setStatus(GenerationStatus.EXTRACTING);
    setError(null);

    try {
      // Truncate very long texts to stay within model context
      const truncatedText = text.substring(0, 50000);

      setStatus(GenerationStatus.GENERATING);
      const result = await service.generateFlashcards(truncatedText);

      setStatus(GenerationStatus.VALIDATING);
      const validatedCards = await service.validateFlashcards(result.cards);

      setCards(validatedCards);
      setRawOutput(result.raw);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setError(err.message || 'Failed to generate flashcards. Please check your API key and try again.');
      setStatus(GenerationStatus.ERROR);
    }
  };

  // Study mode handlers
  const startStudy = () => {
    setStudyMode(StudyMode.STUDY);
    setCurrentCardIndex(0);
    setStudyResults([]);
    setCardStartTime(Date.now());
  };

  const handleKnew = () => {
    const timeSpent = (Date.now() - cardStartTime) / 1000;
    setStudyResults(prev => [
      ...prev,
      { cardId: cards[currentCardIndex].id, knew: true, timeSpent },
    ]);
  };

  const handleDidNotKnow = () => {
    const timeSpent = (Date.now() - cardStartTime) / 1000;
    setStudyResults(prev => [
      ...prev,
      { cardId: cards[currentCardIndex].id, knew: false, timeSpent },
    ]);
  };

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setCardStartTime(Date.now());
    } else {
      setStudyMode(StudyMode.RESULTS);
    }
  };

  const handlePrev = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
      setCardStartTime(Date.now());
    }
  };

  // Calculate stats
  const calculateStats = (): DeckStats => {
    const knewCount = studyResults.filter(r => r.knew).length;
    const didNotKnowCount = studyResults.filter(r => !r.knew).length;
    const totalTime = studyResults.reduce((sum, r) => sum + r.timeSpent, 0);

    return {
      totalCards: studyResults.length,
      knewCount,
      didNotKnowCount,
      averageTimePerCard: studyResults.length > 0 ? totalTime / studyResults.length : 0,
      totalTimeSpent: totalTime,
      percentageKnew: studyResults.length > 0 ? (knewCount / studyResults.length) * 100 : 0,
    };
  };

  const handleClear = () => {
    setCards([]);
    setRawOutput('');
    setStatus(GenerationStatus.IDLE);
    setError(null);
    setStudyMode(StudyMode.BROWSE);
    setStudyResults([]);
    setCurrentCardIndex(0);
  };

  const handleShare = () => {
    const stats = studyMode === StudyMode.RESULTS ? calculateStats() : null;
    downloadShareableHTML(cards, stats, studyResults, deckTitle);
  };

  const handleCopyAll = () => {
    copyDeckToClipboard(cards);
    alert('All flashcards copied to clipboard!');
  };

  const handleDownloadTxt = () => {
    const text = cards
      .map((c, i) => `${i + 1}. Q: ${c.question.replace(/<[^>]*>/g, '')}\nA: ${c.answer.replace(/<[^>]*>/g, '')}`)
      .join('\n\n');
    const blob = new Blob([`Blood Doctor Flashcards\nDr Abdul Mannan FRCPath FCPS\n${'='.repeat(40)}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blood-doctor-flashcards-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isProcessing = [GenerationStatus.EXTRACTING, GenerationStatus.GENERATING, GenerationStatus.VALIDATING].includes(status);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header onShareDeck={handleShare} hasCards={cards.length > 0} />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
        {/* API Key Input */}
        {showApiInput && (
          <div className="max-w-xl mx-auto mb-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Settings size={18} className="text-blood-600" />
              <h3 className="font-bold text-gray-800">Gemini API Key</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Enter your Google Gemini API key to power flashcard generation. Get yours at{' '}
              <a href="https://ai.google.dev" target="_blank" rel="noopener" className="text-blood-600 underline">
                ai.google.dev
              </a>
            </p>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  geminiServiceRef.current = null;
                }}
                placeholder="Enter your Gemini API key..."
                className="flex-1 p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blood-100 focus:border-blood-500 text-sm outline-none"
              />
              <button
                onClick={() => { if (apiKey) setShowApiInput(false); }}
                disabled={!apiKey}
                className="px-5 py-3 bg-blood-600 text-white rounded-xl font-semibold text-sm hover:bg-blood-700 transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        )}

        {/* Study Mode: Active Study */}
        {studyMode === StudyMode.STUDY && cards.length > 0 && (
          <div className="py-4">
            <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
              <h2 className="font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap size={20} className="text-blood-600" />
                {deckTitle}
              </h2>
              <button
                onClick={() => setStudyMode(StudyMode.BROWSE)}
                className="text-xs text-gray-400 hover:text-blood-600 font-semibold transition-colors"
              >
                Exit Study
              </button>
            </div>
            <StudyCard
              card={cards[currentCardIndex]}
              index={currentCardIndex}
              total={cards.length}
              timePerCard={timePerCard}
              onKnew={handleKnew}
              onDidNotKnow={handleDidNotKnow}
              onNext={handleNext}
              onPrev={handlePrev}
            />
          </div>
        )}

        {/* Results Dashboard */}
        {studyMode === StudyMode.RESULTS && (
          <ResultsDashboard
            stats={calculateStats()}
            results={studyResults}
            cards={cards}
            onRestart={startStudy}
            onShare={handleShare}
            deckTitle={deckTitle}
          />
        )}

        {/* Browse / Generation Mode */}
        {studyMode === StudyMode.BROWSE && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Input Section */}
            <div className="lg:col-span-5 space-y-6">
              {/* Upload Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Stethoscope size={20} className="text-blood-600" />
                  <h2 className="font-bold text-gray-800">Source Content</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Upload a PDF, Word document, PowerPoint, or paste text from any medical source.
                  50 high-quality flashcards will be generated automatically.
                </p>

                <FileUpload
                  onTextExtracted={handleTextExtracted}
                  disabled={isProcessing}
                />

                {/* Generate / Clear buttons */}
                {cards.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleClear}
                      className="w-full py-3 px-4 rounded-xl border border-gray-200 text-gray-500 font-semibold text-sm hover:bg-gray-50 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 size={16} />
                      Clear Deck
                    </button>
                  </div>
                )}
              </div>

              {/* Timer Settings */}
              {cards.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
                    <Settings size={16} className="text-gray-400" />
                    Study Settings
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">
                        Time per card: {timePerCard}s
                      </label>
                      <input
                        type="range"
                        min={10}
                        max={120}
                        step={5}
                        value={timePerCard}
                        onChange={(e) => setTimePerCard(Number(e.target.value))}
                        className="w-full accent-blood-600"
                      />
                      <div className="flex justify-between text-[10px] text-gray-300">
                        <span>10s</span>
                        <span>120s</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 animate-slide-up">
                  <AlertCircle size={18} className="text-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-700">{error}</p>
                </div>
              )}
            </div>

            {/* Right: Output Section */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col min-h-[600px]">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-blood-600 text-white px-3 py-1 rounded-full text-xs font-black">
                      {cards.length}
                    </div>
                    <h2 className="font-bold text-gray-800">Study Deck</h2>
                  </div>

                  {cards.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={startStudy}
                        className="flex items-center gap-2 py-2 px-4 bg-blood-600 text-white rounded-xl hover:bg-blood-700 transition-all font-bold text-xs shadow-sm"
                      >
                        <Play size={14} />
                        Start Study
                      </button>
                      <button
                        onClick={handleCopyAll}
                        className="p-2 text-gray-400 hover:text-blood-600 hover:bg-blood-50 rounded-xl transition-all"
                        title="Copy all cards"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={handleShare}
                        className="p-2 text-gray-400 hover:text-blood-600 hover:bg-blood-50 rounded-xl transition-all"
                        title="Download as HTML"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow p-5 overflow-y-auto no-scrollbar">
                  {status === GenerationStatus.IDLE && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-6 py-20">
                      <div className="w-20 h-20 bg-blood-50 rounded-3xl flex items-center justify-center">
                        <FileText size={36} className="text-blood-300" />
                      </div>
                      <div className="text-center max-w-xs">
                        <h3 className="text-gray-800 font-bold mb-2">Upload Your Content</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">
                          Upload a PDF, Word document, or PowerPoint to generate 50 medical flashcards
                          designed for FRCPath, FCPS, and MRCP exam preparation.
                        </p>
                      </div>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 py-20">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-blood-100 border-t-blood-600 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Sparkles size={20} className="text-blood-600" />
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-800 font-bold text-lg">
                          {status === GenerationStatus.EXTRACTING && 'Extracting text...'}
                          {status === GenerationStatus.GENERATING && 'Generating flashcards...'}
                          {status === GenerationStatus.VALIDATING && 'Validating quality...'}
                        </p>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mt-2">
                          Creating medical-grade study cards
                        </p>
                      </div>
                    </div>
                  )}

                  {cards.length > 0 && !isProcessing && (
                    <CardBrowser cards={cards} />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center space-y-3">
          <BloodDoctorLogo size="sm" />
          <div className="text-xs text-gray-400 space-y-1">
            <p className="font-semibold text-gray-500">
              Dr Abdul Mannan FRCPath FCPS | Consultant Haematologist
            </p>
            <p>Director, Bangor Haemophilia Centre | Thrombosis Lead, BCUHB</p>
            <p>blooddoctor.co@gmail.com</p>
          </div>
          <div className="flex justify-center gap-4 mt-3">
            <div className="w-6 h-6 rounded-lg bg-blood-50 border border-blood-100" />
            <div className="w-6 h-6 rounded-lg bg-venous-50 border border-blue-100" />
            <div className="w-6 h-6 rounded-lg bg-amber-50 border border-amber-100" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
