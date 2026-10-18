export const MAX_FONT_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_CUSTOM_FONTS = 10;
export const MAX_CUSTOM_FONTS_TOTAL_SIZE = 100 * 1024 * 1024;

export type FontFileFormat = 'woff2' | 'woff' | 'ttf' | 'otf';

const matches = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, i) => bytes[i] === byte);

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

export const detectFontFormat = (bytes: Uint8Array): FontFileFormat | null => {
  if (bytes.length < 4) return null;

  if (matches(bytes, ascii('wOF2'))) return 'woff2';
  if (matches(bytes, ascii('wOFF'))) return 'woff';
  if (matches(bytes, [0x00, 0x01, 0x00, 0x00]) || matches(bytes, ascii('true')))
    return 'ttf';
  if (matches(bytes, ascii('OTTO'))) return 'otf';

  return null;
};

export const resolveFamilyName = (
  parsedName: string | null | undefined,
  fileName: string,
  isTaken: (name: string) => boolean,
): string => {
  const parsed = parsedName?.trim();
  const stem = fileName.replace(/\.[^.]*$/, '').trim();
  const base = parsed || stem || 'Custom font';

  if (!isTaken(base)) return base;

  let candidate = `${base} (custom)`;
  for (let n = 2; isTaken(candidate); n++) {
    candidate = `${base} (custom ${n})`;
  }

  return candidate;
};

export const stripCustomSuffix = (name: string) =>
  name.replace(/\s\(custom(?: \d+)?\)$/, '');

export const cssString = (value: string, quote: '"' | "'" = '"'): string =>
  quote +
  value.replace(/[\u0000-\u001f\u007f\\'"]/g, (char) => {
    // CSS cannot represent NUL; its string value is U+FFFD instead.
    if (char === '\0') return '\uFFFD';
    if ((char === '"' || char === "'") && char !== quote) return char;
    return `\\${char.charCodeAt(0).toString(16)} `;
  }) +
  quote;

export type CustomFontErrorCode =
  | 'too-large'
  | 'quota-exceeded'
  | 'unsupported-format'
  | 'invalid-font'
  | 'storage-failed'
  | 'name-taken';

export class CustomFontError extends Error {
  code: CustomFontErrorCode;

  constructor(code: CustomFontErrorCode) {
    super(code);
    this.name = 'CustomFontError';
    this.code = code;
  }
}
