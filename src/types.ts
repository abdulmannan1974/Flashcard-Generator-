export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  EXTRACTING = 'EXTRACTING',
  GENERATING = 'GENERATING',
  VALIDATING = 'VALIDATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export enum StudyMode {
  BROWSE = 'BROWSE',
  STUDY = 'STUDY',
  RESULTS = 'RESULTS',
}

export interface StudyResult {
  cardId: string;
  knew: boolean;
  timeSpent: number;
}

export interface DeckStats {
  totalCards: number;
  knewCount: number;
  didNotKnowCount: number;
  averageTimePerCard: number;
  totalTimeSpent: number;
  percentageKnew: number;
}

export type InputSource = 'text' | 'pdf' | 'docx' | 'pptx' | 'notion';

export interface FileUploadState {
  file: File | null;
  source: InputSource;
  extractedText: string;
  isExtracting: boolean;
  error: string | null;
  fileName: string;
}
