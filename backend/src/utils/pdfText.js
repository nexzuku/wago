import { createRequire } from 'module';

const _require = createRequire(import.meta.url);

// pdf-parse ships an internal entry point that skips the package's debug
// harness (v1's index.js reads a sample file from disk when required directly).
let pdfParse = null;
try {
  pdfParse = _require('pdf-parse/lib/pdf-parse.js');
} catch (err) {
  console.warn('pdf-parse unavailable, falling back to raw PDF scanning:', err.message);
}

// Last-resort extractor for when pdf-parse can't handle a file.
// Only recovers text from uncompressed content streams — most real-world PDFs
// use FlateDecode, so this yields nothing for them. It exists so a malformed
// file degrades instead of throwing.
function extractRawPdfText(buffer) {
  const raw = buffer.toString('latin1');
  const textParts = [];

  // Text lives inside BT...ET (begin/end text object) blocks
  const btRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = btRegex.exec(raw)) !== null) {
    const strMatch = match[1].match(/\(([^)\\]*(?:\\.[^)\\]*)*)\)/g);
    if (!strMatch) continue;
    const text = strMatch
      .map(s => s.slice(1, -1)
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\\\\/g, '\\')
        .replace(/\\(.)/g, '$1'))
      .join(' ');
    if (text.trim().length > 3) textParts.push(text);
  }

  if (textParts.length === 0) {
    const readable = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (readable.length > 50) textParts.push(readable.substring(0, 5000));
  }

  return textParts.join('\n');
}

/**
 * Extract plain text from a PDF buffer.
 * Uses pdf-parse (handles compressed content streams, which is the common case)
 * and falls back to raw stream scanning if that fails.
 *
 * @param {Buffer} buffer - raw PDF bytes
 * @returns {Promise<string>} extracted text, '' when nothing could be read
 */
export async function extractPdfText(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) return '';

  if (pdfParse) {
    try {
      const data = await pdfParse(buffer);
      const text = (data?.text || '').trim();
      if (text.length > 0) return text;
    } catch (err) {
      console.warn('pdf-parse extraction failed, trying raw fallback:', err.message);
    }
  }

  return extractRawPdfText(buffer).trim();
}

export default extractPdfText;
