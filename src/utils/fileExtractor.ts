/**
 * File extraction utilities for PDF, DOCX, PPTX
 * Extracts raw text from various document formats
 */

export async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set worker source
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const textParts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    textParts.push(pageText);
  }

  return textParts.join('\n\n');
}

export async function extractTextFromDOCX(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

export async function extractTextFromPPTX(file: File): Promise<string> {
  // PPTX files are ZIP archives containing XML
  // We'll extract text from slide XML files
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(file);

  const slideTexts: string[] = [];
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/ppt\/slides\/slide\d+\.xml/))
    .sort();

  for (const slidePath of slideFiles) {
    const content = await zip.file(slidePath)?.async('text');
    if (content) {
      // Extract text between XML tags
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g);
      if (textMatches) {
        const slideText = textMatches
          .map(match => match.replace(/<\/?a:t>/g, ''))
          .join(' ');
        slideTexts.push(slideText);
      }
    }
  }

  return slideTexts.join('\n\n');
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return extractTextFromPDF(file);
    case 'docx':
    case 'doc':
      return extractTextFromDOCX(file);
    case 'pptx':
    case 'ppt':
      return extractTextFromPPTX(file);
    case 'txt':
    case 'md':
      return file.text();
    default:
      throw new Error(`Unsupported file type: .${extension}`);
  }
}

export function getFileTypeLabel(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf': return 'PDF Document';
    case 'docx': return 'Word Document';
    case 'doc': return 'Word Document';
    case 'pptx': return 'PowerPoint';
    case 'ppt': return 'PowerPoint';
    case 'txt': return 'Text File';
    case 'md': return 'Markdown';
    default: return 'Document';
  }
}

export function getAcceptedFileTypes(): string {
  return '.pdf,.docx,.doc,.pptx,.ppt,.txt,.md';
}
