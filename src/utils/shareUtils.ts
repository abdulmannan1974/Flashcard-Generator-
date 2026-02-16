import { Flashcard, DeckStats, StudyResult } from '../types';

/**
 * Generate a fully interactive, self-contained shareable HTML flashcard deck.
 * No API key needed — all cards are baked in. Includes:
 * - 3D flip cards with tap/click/keyboard
 * - Timed study mode with countdown bar
 * - Knew / Didn't Know scoring
 * - Results dashboard with grade, stats, missed cards review
 * - Browse mode with search and filter
 * - Blood Doctor branding throughout
 */
export function generateShareableHTML(
  cards: Flashcard[],
  stats: DeckStats | null,
  results: StudyResult[],
  deckTitle: string
): string {
  const cardsJSON = JSON.stringify(cards);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Blood\u{1FA78}Doctor Flashcards \u2014 ${deckTitle}</title>
<meta name="description" content="${cards.length} interactive medical flashcards by Dr Abdul Mannan FRCPath FCPS | Blood Doctor"/>
<meta property="og:title" content="Blood Doctor Flashcards \u2014 ${deckTitle}"/>
<meta property="og:description" content="${cards.length} interactive haematology flashcards for exam preparation"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --blood:#D40000;--blood-dark:#B00000;--blood-light:#FEE2E2;
  --venous:#1D3557;--plasma:#FFD166;--platelet:#6A4C93;--neutrophil:#2A9D8F;
  --gray-50:#F9FAFB;--gray-100:#F3F4F6;--gray-200:#E5E7EB;--gray-300:#D1D5DB;
  --gray-400:#9CA3AF;--gray-500:#6B7280;--gray-600:#4B5563;--gray-700:#374151;
  --gray-800:#1F2937;--gray-900:#111827;
}
body{font-family:'Inter',system-ui,-apple-system,sans-serif;background:var(--gray-50);color:var(--gray-800);min-height:100vh;display:flex;flex-direction:column}
button{cursor:pointer;font-family:inherit;border:none;outline:none}
button:focus-visible{outline:2px solid var(--blood);outline-offset:2px}

/* Header */
.header{background:#fff;border-bottom:1px solid var(--gray-200);padding:1rem 1.5rem;position:sticky;top:0;z-index:50}
.header-inner{max-width:56rem;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem}
.logo{display:flex;align-items:baseline;gap:0.15rem}
.logo-text{font-size:1.25rem;font-weight:900;color:var(--gray-900)}
.logo-drop{font-size:1.25rem}
.logo-badge{margin-left:0.75rem;font-size:0.6rem;font-weight:800;color:var(--blood);text-transform:uppercase;letter-spacing:0.15em}
.header-meta{font-size:0.7rem;color:var(--gray-400);text-align:right}

/* Main container */
.main{max-width:56rem;margin:0 auto;padding:1.5rem;width:100%;flex:1}

/* Mode nav */
.mode-nav{display:flex;gap:0.5rem;margin-bottom:1.5rem;flex-wrap:wrap}
.mode-btn{padding:0.6rem 1.2rem;border-radius:0.75rem;font-size:0.8rem;font-weight:700;background:var(--gray-100);color:var(--gray-500);transition:all 0.2s}
.mode-btn:hover{background:var(--gray-200);color:var(--gray-700)}
.mode-btn.active{background:var(--blood);color:#fff}
.mode-btn.study-btn{background:var(--blood);color:#fff}
.mode-btn.study-btn:hover{background:var(--blood-dark)}

/* Deck title */
.deck-title{font-size:1.5rem;font-weight:900;color:var(--gray-800);margin-bottom:0.25rem}
.deck-subtitle{font-size:0.8rem;color:var(--gray-400);margin-bottom:1.5rem}

/* ============ BROWSE MODE ============ */
.search-bar{display:flex;gap:0.5rem;margin-bottom:1rem;flex-wrap:wrap}
.search-input{flex:1;min-width:200px;padding:0.7rem 1rem;border:1px solid var(--gray-200);border-radius:0.75rem;font-size:0.85rem;background:#fff;outline:none;transition:border 0.2s}
.search-input:focus{border-color:var(--blood)}
.filter-select{padding:0.7rem 1rem;border:1px solid var(--gray-200);border-radius:0.75rem;font-size:0.8rem;background:#fff;color:var(--gray-600);outline:none}
.card-count{font-size:0.7rem;color:var(--gray-400);margin-bottom:1rem;font-weight:600}

.browse-card{background:#fff;border:1px solid var(--gray-100);border-radius:1rem;overflow:hidden;margin-bottom:0.5rem;transition:box-shadow 0.2s}
.browse-card:hover{box-shadow:0 2px 8px rgba(0,0,0,0.06)}
.browse-header{padding:1rem;cursor:pointer;display:flex;align-items:center;gap:0.75rem;user-select:none}
.browse-num{font-size:0.7rem;font-weight:900;color:var(--gray-300);width:1.8rem;text-align:center;flex-shrink:0}
.diff-dot{width:0.5rem;height:0.5rem;border-radius:50%;flex-shrink:0}
.diff-basic{background:#22C55E}
.diff-intermediate{background:#F59E0B}
.diff-advanced{background:#EF4444}
.browse-q{font-size:0.85rem;font-weight:600;color:var(--gray-700);flex:1;line-height:1.4}
.browse-chevron{width:1rem;height:1rem;color:var(--gray-400);transition:transform 0.2s;flex-shrink:0}
.browse-card.open .browse-chevron{transform:rotate(180deg)}
.browse-body{display:none;padding:1.25rem;border-top:1px solid var(--gray-100)}
.browse-card.open .browse-body{display:block}
.browse-label{font-size:0.65rem;font-weight:800;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:0.5rem}
.browse-label.q-label{color:var(--blood)}
.browse-label.a-label{color:var(--neutrophil)}
.browse-content{font-size:0.9rem;line-height:1.6;color:var(--gray-700)}
.browse-divider{border:none;border-top:1px solid var(--gray-100);margin:1rem 0}
.diff-badge{font-size:0.6rem;font-weight:700;padding:0.15rem 0.5rem;border-radius:1rem;margin-left:0.5rem}
.badge-basic{background:#F0FDF4;color:#15803D}
.badge-intermediate{background:#FFFBEB;color:#B45309}
.badge-advanced{background:#FEF2F2;color:#B91C1C}

/* ============ STUDY MODE ============ */
.study-container{max-width:40rem;margin:0 auto}
.study-progress{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;font-size:0.75rem;color:var(--gray-400);font-weight:600}
.progress-bar-bg{width:100%;height:4px;background:var(--gray-100);border-radius:2px;margin-bottom:1.5rem;overflow:hidden}
.progress-bar-fill{height:100%;background:var(--blood);border-radius:2px;transition:width 0.3s}

/* Flip card */
.flip-container{perspective:1200px;width:100%;height:24rem;margin-bottom:1.5rem;cursor:pointer}
.flip-inner{position:relative;width:100%;height:100%;transition:transform 0.6s cubic-bezier(0.4,0,0.2,1);transform-style:preserve-3d}
.flip-inner.flipped{transform:rotateY(180deg)}
.flip-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:1.5rem;display:flex;flex-direction:column;overflow:auto}
.flip-front{background:linear-gradient(135deg,var(--blood) 0%,var(--blood-dark) 100%);color:#fff;padding:2rem;justify-content:center;align-items:center;text-align:center}
.flip-back{transform:rotateY(180deg);background:#fff;border:2px solid var(--gray-100);padding:2rem;justify-content:center}
.flip-front-label{font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;opacity:0.7;margin-bottom:1rem}
.flip-front-q{font-size:1.2rem;font-weight:700;line-height:1.5;max-height:80%;overflow-y:auto}
.flip-back-label{font-size:0.6rem;font-weight:800;text-transform:uppercase;letter-spacing:0.2em;color:var(--neutrophil);margin-bottom:0.75rem}
.flip-back-a{font-size:1rem;line-height:1.7;color:var(--gray-700);max-height:80%;overflow-y:auto}
.flip-hint{font-size:0.7rem;color:rgba(255,255,255,0.5);margin-top:1rem}

/* Timer bar */
.timer-bar-bg{width:100%;height:6px;background:var(--gray-100);border-radius:3px;margin-bottom:1.5rem;overflow:hidden}
.timer-bar-fill{height:100%;border-radius:3px;transition:width 0.1s linear}

/* Study buttons */
.study-actions{display:flex;gap:0.75rem}
.study-btn{flex:1;padding:1rem;border-radius:1rem;font-size:0.85rem;font-weight:700;transition:all 0.2s;display:flex;align-items:center;justify-content:center;gap:0.5rem}
.btn-knew{background:#F0FDF4;color:#15803D;border:2px solid #BBF7D0}
.btn-knew:hover{background:#DCFCE7;border-color:#86EFAC}
.btn-didnt{background:#FEF2F2;color:#B91C1C;border:2px solid #FECACA}
.btn-didnt:hover{background:#FEE2E2;border-color:#FCA5A5}
.nav-row{display:flex;gap:0.5rem;margin-top:1rem;justify-content:center}
.nav-btn{padding:0.5rem 1.5rem;border-radius:0.75rem;font-size:0.75rem;font-weight:600;background:var(--gray-100);color:var(--gray-500);transition:all 0.2s}
.nav-btn:hover{background:var(--gray-200);color:var(--gray-700)}
.nav-btn:disabled{opacity:0.3;cursor:not-allowed}
.keyboard-hints{text-align:center;margin-top:1rem;font-size:0.65rem;color:var(--gray-300);font-weight:500}
.kbd{display:inline-block;padding:0.1rem 0.4rem;background:var(--gray-100);border-radius:0.25rem;font-family:monospace;font-size:0.6rem;margin:0 0.1rem;color:var(--gray-500)}

/* ============ RESULTS MODE ============ */
.results-card{background:#fff;border-radius:1.5rem;overflow:hidden;border:1px solid var(--gray-100);box-shadow:0 4px 20px rgba(0,0,0,0.06)}
.results-header{background:linear-gradient(135deg,var(--blood) 0%,var(--blood-dark) 100%);color:#fff;padding:2rem;text-align:center}
.results-score{font-size:3.5rem;font-weight:900;line-height:1}
.results-grade{font-size:1.1rem;font-weight:700;margin-top:0.5rem;opacity:0.9}
.results-subtitle{font-size:0.7rem;opacity:0.6;margin-top:0.25rem}
.stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--gray-100);border-bottom:1px solid var(--gray-100)}
.stat-cell{background:#fff;padding:1rem;text-align:center}
.stat-value{font-size:1.25rem;font-weight:800;color:var(--gray-800)}
.stat-label{font-size:0.6rem;color:var(--gray-400);font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-top:0.25rem}
.missed-section{padding:1.5rem}
.missed-title{font-size:0.75rem;font-weight:800;color:var(--blood);text-transform:uppercase;letter-spacing:0.1em;margin-bottom:1rem}
.missed-card{padding:0.75rem;background:var(--blood-light);border-radius:0.75rem;margin-bottom:0.5rem}
.missed-q{font-size:0.8rem;font-weight:600;color:var(--gray-800);margin-bottom:0.25rem}
.missed-a{font-size:0.75rem;color:var(--gray-600);line-height:1.4}
.results-actions{padding:1.5rem;display:flex;gap:0.75rem;flex-wrap:wrap}
.results-btn{flex:1;padding:0.8rem 1.5rem;border-radius:0.75rem;font-size:0.8rem;font-weight:700;text-align:center;transition:all 0.2s}
.results-btn-primary{background:var(--blood);color:#fff}
.results-btn-primary:hover{background:var(--blood-dark)}
.results-btn-secondary{background:var(--gray-100);color:var(--gray-600)}
.results-btn-secondary:hover{background:var(--gray-200)}

/* Footer */
.footer{background:#fff;border-top:1px solid var(--gray-200);padding:1.5rem;text-align:center}
.footer p{font-size:0.7rem;color:var(--gray-400);line-height:1.6}
.footer .name{font-weight:600;color:var(--gray-500)}

/* Responsive */
@media(max-width:640px){
  .flip-container{height:20rem}
  .stats-grid{grid-template-columns:repeat(2,1fr)}
  .study-actions{flex-direction:column}
  .deck-title{font-size:1.2rem}
}
</style>
</head>
<body>

<div class="header">
  <div class="header-inner">
    <div class="logo">
      <span class="logo-text">Blood</span>
      <span class="logo-drop">\u{1FA78}</span>
      <span class="logo-text">Doctor</span>
      <span class="logo-badge">Flashcards</span>
    </div>
    <div class="header-meta">
      <div>${cards.length} Cards</div>
      <div>Dr Abdul Mannan FRCPath FCPS</div>
    </div>
  </div>
</div>

<div class="main" id="app"></div>

<div class="footer">
  <div class="logo" style="justify-content:center;margin-bottom:0.5rem">
    <span class="logo-text" style="font-size:1rem">Blood</span>
    <span class="logo-drop" style="font-size:1rem">\u{1FA78}</span>
    <span class="logo-text" style="font-size:1rem">Doctor</span>
  </div>
  <p class="name">Dr Abdul Mannan FRCPath FCPS | Consultant Haematologist</p>
  <p>Director, Bangor Haemophilia Centre | Thrombosis Lead, BCUHB</p>
  <p>blooddoctor.co@gmail.com</p>
</div>

<script>
const CARDS = ${cardsJSON};
const TITLE = ${JSON.stringify(deckTitle)};
const app = document.getElementById('app');
let mode = 'browse'; // browse | study | results
let currentIdx = 0;
let isFlipped = false;
let studyResults = [];
let cardStart = 0;
let timerInterval = null;
let timePerCard = 30;
let timerRemaining = 30;
let searchTerm = '';
let diffFilter = 'all';
let answeredCurrent = false;

function render() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  if (mode === 'browse') renderBrowse();
  else if (mode === 'study') renderStudy();
  else if (mode === 'results') renderResults();
}

function stripHTML(s) { return s ? s.replace(/<[^>]*>/g, '') : ''; }

function getGrade(pct) {
  if (pct >= 90) return 'Outstanding';
  if (pct >= 75) return 'Very Good';
  if (pct >= 60) return 'Good';
  if (pct >= 40) return 'Needs Review';
  return 'Keep Studying';
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.round(s % 60);
  return m > 0 ? m + 'm ' + sec + 's' : sec + 's';
}

// =========== BROWSE ===========
function renderBrowse() {
  const filtered = CARDS.filter(c => {
    const matchSearch = !searchTerm || stripHTML(c.question + c.answer).toLowerCase().includes(searchTerm.toLowerCase());
    const matchDiff = diffFilter === 'all' || c.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  app.innerHTML = \`
    <h1 class="deck-title">\${TITLE}</h1>
    <p class="deck-subtitle">\${CARDS.length} flashcards for haematology study</p>
    <div class="mode-nav">
      <button class="mode-btn active" onclick="setMode('browse')">Browse Cards</button>
      <button class="mode-btn study-btn" onclick="startStudy()">\\u25B6 Start Study</button>
    </div>
    <div class="search-bar">
      <input class="search-input" type="text" placeholder="Search cards..." value="\${searchTerm}" oninput="searchTerm=this.value;renderBrowse()"/>
      <select class="filter-select" onchange="diffFilter=this.value;renderBrowse()">
        <option value="all" \${diffFilter==='all'?'selected':''}>All Levels</option>
        <option value="basic" \${diffFilter==='basic'?'selected':''}>Basic</option>
        <option value="intermediate" \${diffFilter==='intermediate'?'selected':''}>Intermediate</option>
        <option value="advanced" \${diffFilter==='advanced'?'selected':''}>Advanced</option>
      </select>
    </div>
    <div class="card-count">Showing \${filtered.length} of \${CARDS.length} cards</div>
    <div id="browse-list"></div>
  \`;

  const list = document.getElementById('browse-list');
  filtered.forEach((card, i) => {
    const realIdx = CARDS.indexOf(card);
    const diff = card.difficulty || 'intermediate';
    const div = document.createElement('div');
    div.className = 'browse-card';
    div.id = 'bc-' + realIdx;
    div.innerHTML = \`
      <div class="browse-header" onclick="toggleBrowseCard(\${realIdx})">
        <span class="browse-num">\${realIdx + 1}</span>
        <span class="diff-dot diff-\${diff}"></span>
        <span class="browse-q">\${stripHTML(card.question)}</span>
        <svg class="browse-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
      </div>
      <div class="browse-body">
        <div>
          <span class="browse-label q-label">Question</span>
          <span class="diff-badge badge-\${diff}">\${diff}</span>
          <div class="browse-content" style="margin-top:0.5rem">\${card.question}</div>
        </div>
        <hr class="browse-divider"/>
        <div>
          <span class="browse-label a-label">Answer</span>
          <div class="browse-content" style="margin-top:0.5rem">\${card.answer}</div>
        </div>
      </div>
    \`;
    list.appendChild(div);
  });
}

function toggleBrowseCard(idx) {
  const el = document.getElementById('bc-' + idx);
  if (el) el.classList.toggle('open');
}

// =========== STUDY ===========
function startStudy() {
  mode = 'study';
  currentIdx = 0;
  isFlipped = false;
  studyResults = [];
  answeredCurrent = false;
  cardStart = Date.now();
  render();
}

function renderStudy() {
  const card = CARDS[currentIdx];
  const diff = card.difficulty || 'intermediate';
  const pct = ((currentIdx) / CARDS.length * 100).toFixed(0);
  timerRemaining = timePerCard;

  app.innerHTML = \`
    <div class="study-container">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
        <h2 style="font-weight:800;font-size:1rem;color:var(--gray-800)">\${TITLE}</h2>
        <button class="nav-btn" onclick="setMode('browse')" style="font-size:0.7rem">Exit Study</button>
      </div>
      <div class="study-progress">
        <span>Card \${currentIdx + 1} of \${CARDS.length}</span>
        <span class="diff-badge badge-\${diff}">\${diff}</span>
        <span>\${pct}% complete</span>
      </div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:\${pct}%"></div></div>
      <div class="timer-bar-bg"><div class="timer-bar-fill" id="timer-fill" style="width:100%;background:var(--neutrophil)"></div></div>
      <div class="flip-container" onclick="flipCard()" id="flip-container">
        <div class="flip-inner" id="flip-inner">
          <div class="flip-face flip-front">
            <div class="flip-front-label">Question \${currentIdx + 1}</div>
            <div class="flip-front-q">\${card.question}</div>
            <div class="flip-hint">Tap to reveal answer \u2022 Space bar</div>
          </div>
          <div class="flip-face flip-back">
            <div class="flip-back-label">Answer</div>
            <div class="flip-back-a">\${card.answer}</div>
          </div>
        </div>
      </div>
      <div class="study-actions" id="study-actions">
        <button class="study-btn btn-knew" onclick="markCard(true)" id="btn-knew">
          <span style="font-size:1.2rem">\\u2714</span> Knew It
        </button>
        <button class="study-btn btn-didnt" onclick="markCard(false)" id="btn-didnt">
          <span style="font-size:1.2rem">\\u2718</span> Didn't Know
        </button>
      </div>
      <div class="nav-row">
        <button class="nav-btn" onclick="prevCard()" \${currentIdx===0?'disabled':''}>\\u2190 Previous</button>
        <button class="nav-btn" onclick="nextCard()">Next \\u2192</button>
      </div>
      <div class="keyboard-hints">
        <kbd class="kbd">Space</kbd> flip &nbsp;
        <kbd class="kbd">1</kbd> knew &nbsp;
        <kbd class="kbd">2</kbd> didn't know &nbsp;
        <kbd class="kbd">\\u2190</kbd><kbd class="kbd">\\u2192</kbd> navigate
      </div>
    </div>
  \`;

  isFlipped = false;
  answeredCurrent = false;
  startTimer();
}

function flipCard() {
  isFlipped = !isFlipped;
  const inner = document.getElementById('flip-inner');
  if (inner) inner.classList.toggle('flipped', isFlipped);
}

function markCard(knew) {
  if (answeredCurrent) return;
  answeredCurrent = true;
  const timeSpent = (Date.now() - cardStart) / 1000;
  studyResults.push({ cardId: CARDS[currentIdx].id, knew, timeSpent });

  // Visual feedback
  const btn = knew ? document.getElementById('btn-knew') : document.getElementById('btn-didnt');
  if (btn) btn.style.transform = 'scale(1.05)';
  setTimeout(() => nextCard(), 400);
}

function nextCard() {
  if (!answeredCurrent) {
    // Auto-mark as didn't know if skipping
    const timeSpent = (Date.now() - cardStart) / 1000;
    studyResults.push({ cardId: CARDS[currentIdx].id, knew: false, timeSpent });
  }
  if (currentIdx < CARDS.length - 1) {
    currentIdx++;
    cardStart = Date.now();
    renderStudy();
  } else {
    mode = 'results';
    render();
  }
}

function prevCard() {
  if (currentIdx > 0) {
    // Remove last result if going back
    if (studyResults.length > 0 && studyResults[studyResults.length-1].cardId === CARDS[currentIdx].id) {
      studyResults.pop();
    }
    currentIdx--;
    cardStart = Date.now();
    renderStudy();
  }
}

function startTimer() {
  timerRemaining = timePerCard;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timerRemaining -= 0.1;
    const pct = Math.max(0, (timerRemaining / timePerCard) * 100);
    const fill = document.getElementById('timer-fill');
    if (fill) {
      fill.style.width = pct + '%';
      if (pct > 50) fill.style.background = 'var(--neutrophil)';
      else if (pct > 20) fill.style.background = 'var(--plasma)';
      else fill.style.background = 'var(--blood)';
    }
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      if (!answeredCurrent && !isFlipped) flipCard();
    }
  }, 100);
}

// =========== RESULTS ===========
function renderResults() {
  const knewCount = studyResults.filter(r => r.knew).length;
  const totalAnswered = studyResults.length;
  const didntKnow = totalAnswered - knewCount;
  const pct = totalAnswered > 0 ? Math.round((knewCount / totalAnswered) * 100) : 0;
  const totalTime = studyResults.reduce((s, r) => s + r.timeSpent, 0);
  const avgTime = totalAnswered > 0 ? totalTime / totalAnswered : 0;
  const grade = getGrade(pct);
  const missed = studyResults.filter(r => !r.knew).map(r => CARDS.find(c => c.id === r.cardId)).filter(Boolean);

  app.innerHTML = \`
    <div class="study-container">
      <div class="results-card">
        <div class="results-header">
          <div class="results-score">\${pct}%</div>
          <div class="results-grade">\${grade}</div>
          <div class="results-subtitle">\${TITLE}</div>
        </div>
        <div class="stats-grid">
          <div class="stat-cell">
            <div class="stat-value" style="color:#15803D">\${knewCount}</div>
            <div class="stat-label">Knew</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value" style="color:var(--blood)">\${didntKnow}</div>
            <div class="stat-label">Missed</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">\${fmtTime(totalTime)}</div>
            <div class="stat-label">Total Time</div>
          </div>
          <div class="stat-cell">
            <div class="stat-value">\${fmtTime(avgTime)}</div>
            <div class="stat-label">Per Card</div>
          </div>
        </div>
        \${missed.length > 0 ? \`
          <div class="missed-section">
            <div class="missed-title">\\u{1F4CB} Cards to Review (\${missed.length})</div>
            \${missed.map(c => \`
              <div class="missed-card">
                <div class="missed-q">\${stripHTML(c.question)}</div>
                <div class="missed-a">\${stripHTML(c.answer)}</div>
              </div>
            \`).join('')}
          </div>
        \` : ''}
        <div class="results-actions">
          <button class="results-btn results-btn-primary" onclick="startStudy()">\\u{1F504} Study Again</button>
          <button class="results-btn results-btn-secondary" onclick="setMode('browse')">\\u{1F4DA} Browse Cards</button>
        </div>
      </div>
    </div>
  \`;
}

// =========== NAV ===========
function setMode(m) {
  mode = m;
  render();
}

// =========== KEYBOARD ===========
document.addEventListener('keydown', (e) => {
  if (mode !== 'study') return;
  if (e.code === 'Space') { e.preventDefault(); flipCard(); }
  else if (e.key === '1') markCard(true);
  else if (e.key === '2') markCard(false);
  else if (e.key === 'ArrowRight') nextCard();
  else if (e.key === 'ArrowLeft') prevCard();
});

// =========== INIT ===========
render();
</script>
</body>
</html>`;
}

/**
 * Download the interactive HTML deck
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
  a.download = `blood-doctor-flashcards-${deckTitle.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Copy all cards as plain text
 */
export function copyDeckToClipboard(cards: Flashcard[]): void {
  const plainText = cards
    .map((card, i) => `${i + 1}. Q: ${card.question.replace(/<[^>]*>/g, '')}\n   A: ${card.answer.replace(/<[^>]*>/g, '')}`)
    .join('\n\n');

  const header = `Blood\u{1FA78}Doctor Flashcards\nDr Abdul Mannan FRCPath FCPS\n${cards.length} Cards\n${'='.repeat(40)}\n\n`;
  navigator.clipboard.writeText(header + plainText);
}
