# Blood🩸Doctor Flashcards

**Professional Medical Flashcard Generator for Haematology Trainees**

By **Dr Abdul Mannan FRCPath FCPS** | Consultant Haematologist
Director, Bangor Haemophilia Centre | Thrombosis Lead, BCUHB

## What It Does

Upload any medical document and get 50 high-quality flashcards automatically generated using Google Gemini AI. Designed for FRCPath, FCPS, and MRCP exam preparation.

## Features

- **Multi-format input**: PDF, Word (DOCX), PowerPoint (PPTX), plain text, Notion links
- **50 flashcards per document**: Basic, Intermediate, and Advanced difficulty levels
- **Study mode**: Timed flashcard review with flip-to-reveal answers
- **Scoring system**: Track what you knew vs. what needs review
- **Results dashboard**: Performance summary with missed cards highlighted
- **Shareable HTML output**: Download self-contained HTML files to share with colleagues
- **Medical-grade quality**: Cards validated for accuracy with British English spelling
- **Blood Doctor branding**: Professional medical education identity

## Tech Stack

- React 19 + TypeScript
- Vite build system
- Tailwind CSS
- Google Gemini AI (flashcard generation)
- PDF.js (PDF extraction)
- Mammoth.js (Word extraction)
- JSZip (PowerPoint extraction)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/abdulmannan-blooddoctor/blood-doctor-flashcards.git
cd blood-doctor-flashcards

# Install dependencies
npm install

# Add your Gemini API key
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Start development server
npm run dev
```

## Usage

1. Open the app in your browser
2. Enter your Gemini API key (get one at https://ai.google.dev)
3. Upload a PDF, Word doc, PowerPoint, or paste text
4. Wait for 50 flashcards to be generated
5. Browse cards or start a timed study session
6. Review your results and share with colleagues

## Keyboard Shortcuts (Study Mode)

| Key | Action |
|-----|--------|
| Space | Flip card |
| 1 | Mark as "Knew it" |
| 2 | Mark as "Didn't know" |
| Arrow keys | Navigate cards |

## Contact

- Email: blooddoctor.co@gmail.com
- Created by: Dr Abdul Mannan FRCPath FCPS

## License

MIT License
