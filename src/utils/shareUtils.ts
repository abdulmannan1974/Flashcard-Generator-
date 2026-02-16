import { Flashcard, DeckStats, StudyResult } from '../types';

/**
 * Generate a shareable HTML page with deck content and results
 */
export function generateShareableHTML(
  cards: Flashcard[],
  stats: DeckStats | null,
  results: StudyResult[],
  deckTitle: string
): string {
  const cardsJSON = JSON.stringify(cards);
  const statsJSON = stats ? JSON.stringify(stats) : 'null';
  const resultsJSON = JSON.stringify(results);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blood🩸Doctor Flashcards - ${deckTitle}</title>
  <meta name="description" content="${cards.length} medical flashcards by Dr Abdul Mannan FRCPath FCPS" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Inter', sans-serif; }
    .card-flip { perspective: 1000px; }
    .card-flip-inner { transition: transform 0.6s; transform-style: preserve-3d; }
    .card-flip-inner.flipped { transform: rotateY(180deg); }
    .card-front, .card-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
    .card-back { transform: rotateY(180deg); position: absolute; inset: 0; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <header class="bg-white border-b border-gray-200 py-4 px-6">
    <div class="max-w-3xl mx-auto flex items-center justify-between">
      <div class="flex items-baseline gap-1">
        <span class="text-xl font-black text-gray-900">Blood</span>
        <span class="text-xl">🩸</span>
        <span class="text-xl font-black text-gray-900">Doctor</span>
        <span class="ml-2 text-xs font-bold text-red-600 uppercase tracking-widest">Flashcards</span>
      </div>
      <div class="text-xs text-gray-400">
        ${cards.length} Cards | Dr Abdul Mannan FRCPath FCPS
      </div>
    </div>
  </header>

  <main class="max-w-3xl mx-auto p-6">
    <h1 class="text-2xl font-black text-gray-800 mb-2">${deckTitle}</h1>
    <p class="text-sm text-gray-500 mb-8">${cards.length} flashcards for haematology study</p>

    <div id="cards-container" class="space-y-3"></div>
  </main>

  <footer class="text-center py-8 text-xs text-gray-400">
    <p>Blood🩸Doctor Flashcards | Dr Abdul Mannan FRCPath FCPS</p>
    <p class="mt-1">blooddoctor.co@gmail.com</p>
  </footer>

  <script>
    const cards = ${cardsJSON};
    const container = document.getElementById('cards-container');

    const diffColors = {
      basic: { dot: '#22c55e', bg: '#f0fdf4', text: '#15803d' },
      intermediate: { dot: '#f59e0b', bg: '#fffbeb', text: '#b45309' },
      advanced: { dot: '#ef4444', bg: '#fef2f2', text: '#b91c1c' },
    };

    cards.forEach((card, i) => {
      const dc = diffColors[card.difficulty || 'intermediate'];
      const div = document.createElement('div');
      div.className = 'bg-white border border-gray-100 rounded-2xl overflow-hidden';
      div.innerHTML = \`
        <div class="p-4 cursor-pointer select-none" onclick="this.nextElementSibling.classList.toggle('hidden')">
          <div class="flex items-center gap-3">
            <span class="text-xs font-black text-gray-300 w-7 text-center">\${i + 1}</span>
            <span style="background:\${dc.dot}" class="w-2 h-2 rounded-full shrink-0"></span>
            <span class="text-sm font-semibold text-gray-700 flex-1">\${card.question.replace(/<[^>]*>/g, '')}</span>
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
        <div class="hidden p-6 border-t border-gray-100 space-y-4">
          <div>
            <span class="text-xs font-black text-red-500 uppercase tracking-widest">Question</span>
            <span style="background:\${dc.bg};color:\${dc.text}" class="ml-2 text-xs font-bold px-2 py-0.5 rounded-full">\${card.difficulty || 'intermediate'}</span>
            <div class="mt-2 text-base text-gray-800 leading-relaxed font-medium">\${card.question}</div>
          </div>
          <hr class="border-gray-100" />
          <div>
            <span class="text-xs font-black text-green-500 uppercase tracking-widest">Answer</span>
            <div class="mt-2 text-base text-gray-600 leading-relaxed">\${card.answer}</div>
          </div>
        </div>
      \`;
      container.appendChild(div);
    });
  </script>
</body>
</html>`;
}

/**
 * Download HTML file
 */
export function downloadShareableHTML(
  cards: Flashcard[],
  stats: DeckStats | null,
  results: StudyResult[],
  deckTitle: string
): void {
  const html = generateShareableHTML(cards, stats, results, deckTitle);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `blood-doctor-flashcards-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy share link (data URL)
 */
export function copyDeckToClipboard(cards: Flashcard[]): void {
  const plainText = cards
    .map((card, i) => `${i + 1}. Q: ${card.question.replace(/<[^>]*>/g, '')}\n   A: ${card.answer.replace(/<[^>]*>/g, '')}`)
    .join('\n\n');

  const header = `Blood🩸Doctor Flashcards\nDr Abdul Mannan FRCPath FCPS\n${cards.length} Cards\n${'='.repeat(40)}\n\n`;
  navigator.clipboard.writeText(header + plainText);
}
