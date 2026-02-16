import { Flashcard } from '../types';

const SYSTEM_PROMPT = `You are a world-class medical flashcard creator specialising in haematology, built for Dr Abdul Mannan FRCPath FCPS (Blood Doctor).

Your job: Create exactly 50 high-quality flashcards from the provided medical content. These flashcards are for haematology trainees, junior consultants, and exam preparation (FRCPath, FCPS, MRCP).

RULES FOR FLASHCARD CREATION:
1. Extract 50 distinct question-answer pairs from the content.
2. Cover all major concepts, facts, diagnostic criteria, treatment protocols, and clinical pearls.
3. Include a mix of:
   - Basic recall questions (definitions, normal values, classifications)
   - Clinical application questions (diagnosis, management, when to investigate)
   - Advanced reasoning questions (differential diagnosis, treatment escalation, complications)
4. Each card must be medically accurate and self-contained.
5. Use British English spelling (haemoglobin, haematology, organisation).
6. Include relevant lab values, scoring systems, staging criteria where applicable.
7. If content has fewer than 50 distinct concepts, create questions at different Bloom's taxonomy levels for the same concept.

DIFFICULTY TAGGING:
- Tag each card: [BASIC], [INTERMEDIATE], or [ADVANCED]
- BASIC: Definitions, normal values, simple recall
- INTERMEDIATE: Clinical scenarios, diagnostic criteria, treatment choices
- ADVANCED: Complex management, rare complications, evidence-based decisions

STRICT FORMATTING:
- One flashcard per line.
- Format: [DIFFICULTY] Question | Answer
- Use <b></b> for bold emphasis on key terms.
- Use <br> for line breaks within a field. NO actual newlines inside a card.
- Wrap math in \\( ... \\) for inline or \\[ ... \\] for block.
- Use <br> numbered lists for multi-part answers.
- NO header row. Just the cards.

QUALITY CHECKS:
- Every answer must be factually correct.
- No duplicate questions.
- No vague or ambiguous answers.
- All drug doses must be accurate.
- All diagnostic criteria must match current guidelines (BSH, ASH, ISTH, WHO, NICE).

Example:
[BASIC] What is the normal platelet count range? | The normal platelet count is <b>150-400 x 10<sup>9</sup>/L</b>. Values below 150 are thrombocytopenia, above 400 are thrombocytosis.
[INTERMEDIATE] A 65-year-old presents with WBC 85 x 10<sup>9</sup>/L, splenomegaly, and basophilia. What is the most likely diagnosis and which test confirms it? | Most likely diagnosis: <b>Chronic Myeloid Leukaemia (CML)</b>.<br>Confirmatory test: <b>BCR-ABL1 fusion gene</b> by RT-PCR or FISH for t(9;22) Philadelphia chromosome.
[ADVANCED] When should you consider allogeneic stem cell transplant in CML? | Consider allo-SCT in CML when:<br>1. Failure of 2 or more TKIs<br>2. T315I mutation (resistant to all TKIs except ponatinib)<br>3. Blast crisis transformation<br>4. Young patients with matched donor and high-risk Sokal/ELTS score<br>5. Intolerance to all available TKIs

Return EXACTLY 50 flashcards. Be exhaustive and accurate.`;

export class ClaudeService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFlashcards(input: string): Promise<{ cards: Flashcard[]; raw: string }> {
    // Truncate input to fit within context window
    const truncatedInput = input.substring(0, 80000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 16000,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Process the following medical content and generate exactly 50 high-quality haematology flashcards:\n\n${truncatedInput}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = (errorData as any)?.error?.message || `API request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    const data = await response.json();

    // Extract text from Claude's response
    let rawText = '';
    if (data.content && Array.isArray(data.content)) {
      rawText = data.content
        .filter((block: any) => block.type === 'text')
        .map((block: any) => block.text)
        .join('\n');
    }

    const cards = this.parseRawResponse(rawText);
    return { cards, raw: rawText };
  }

  async validateFlashcards(cards: Flashcard[]): Promise<Flashcard[]> {
    return cards.filter(card => {
      const hasQuestion = card.question && card.question.trim().length > 10;
      const hasAnswer = card.answer && card.answer.trim().length > 10;
      return hasQuestion && hasAnswer;
    });
  }

  private parseRawResponse(rawText: string): Flashcard[] {
    const lines = rawText.split('\n').filter(line => line.trim() && line.includes('|'));

    return lines.map((line, index) => {
      // Extract difficulty tag
      const difficultyMatch = line.match(/^\[?(BASIC|INTERMEDIATE|ADVANCED)\]?\s*/i);
      const difficulty = difficultyMatch
        ? (difficultyMatch[1].toLowerCase() as 'basic' | 'intermediate' | 'advanced')
        : 'intermediate';

      // Remove difficulty tag from the line
      const cleanLine = line.replace(/^\[?(BASIC|INTERMEDIATE|ADVANCED)\]?\s*/i, '');

      const [question, ...answerParts] = cleanLine.split('|');
      const answer = answerParts.join('|').trim();

      return {
        id: `card-${index}-${Date.now()}`,
        question: question.trim(),
        answer: answer.trim(),
        difficulty,
      };
    }).filter(card => card.question.length > 5 && card.answer.length > 5);
  }
}
