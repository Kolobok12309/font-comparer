import { describe, it, expect } from 'vitest';

import {
  CustomFontError,
  cssString,
  detectFontFormat,
  resolveFamilyName,
  stripCustomSuffix,
} from './fontFile';

const ascii = (text: string) =>
  new Uint8Array([...text].map((char) => char.charCodeAt(0)));

describe('detectFontFormat', () => {
  it('detects each signature', () => {
    expect(detectFontFormat(ascii('wOF2'))).toBe('woff2');
    expect(detectFontFormat(ascii('wOFF'))).toBe('woff');
    expect(detectFontFormat(new Uint8Array([0, 1, 0, 0, 9, 9]))).toBe('ttf');
    expect(detectFontFormat(ascii('true'))).toBe('ttf');
    expect(detectFontFormat(ascii('OTTO'))).toBe('otf');
  });

  it('returns null for short, empty and unknown input', () => {
    expect(detectFontFormat(new Uint8Array([0, 1, 0]))).toBeNull();
    expect(detectFontFormat(new Uint8Array())).toBeNull();
    expect(detectFontFormat(new Uint8Array([1, 2, 3, 4, 5, 6]))).toBeNull();
    expect(detectFontFormat(ascii('ttcf'))).toBeNull();
  });
});

describe('resolveFamilyName', () => {
  const free = () => false;

  it('uses the trimmed parsed name', () => {
    expect(resolveFamilyName('  Roboto ', 'x.ttf', free)).toBe('Roboto');
  });

  it('falls back to the file name without the last extension', () => {
    expect(resolveFamilyName(null, 'My Font.Bold.woff2', free)).toBe(
      'My Font.Bold',
    );
    expect(resolveFamilyName('   ', 'Fancy.otf', free)).toBe('Fancy');
    expect(resolveFamilyName(undefined, '.woff2', free)).toBe('Custom font');
    expect(resolveFamilyName('  ', '  .ttf', free)).toBe('Custom font');
  });

  it('adds a (custom) suffix on collision', () => {
    const isTaken = (n: string) => n.toLowerCase() === 'arial';
    expect(resolveFamilyName('Arial', 'a.ttf', isTaken)).toBe('Arial (custom)');
  });

  it('increments the counter while names are taken', () => {
    const taken = new Set(['arial', 'arial (custom)']);
    const isTaken = (n: string) => taken.has(n.toLowerCase());
    expect(resolveFamilyName('arial', 'a.ttf', isTaken)).toBe(
      'arial (custom 2)',
    );
  });

  it('keeps going when the name already ends with (custom)', () => {
    const isTaken = (n: string) => n === 'Foo (custom)';
    expect(resolveFamilyName('Foo (custom)', 'a.ttf', isTaken)).toBe(
      'Foo (custom) (custom)',
    );
  });
});

describe('stripCustomSuffix', () => {
  it('removes the suffix', () => {
    expect(stripCustomSuffix('Arial (custom 2)')).toBe('Arial');
    expect(stripCustomSuffix('Arial (custom)')).toBe('Arial');
  });

  it('leaves other names unchanged', () => {
    expect(stripCustomSuffix('Arial')).toBe('Arial');
    expect(stripCustomSuffix('Arial (custom) Bold')).toBe(
      'Arial (custom) Bold',
    );
  });
});

describe('cssString', () => {
  it('keeps ordinary names unchanged inside the requested quotes', () => {
    expect(cssString('Arial-Arial (custom)')).toBe('"Arial-Arial (custom)"');
    expect(cssString('Arial', "'")).toBe("'Arial'");
    expect(cssString('')).toBe('""');
  });

  it('escapes only the enclosing quote character', () => {
    expect(cssString('My "Q" Font')).toBe('"My \\22 Q\\22  Font"');
    expect(cssString("O'Brien", "'")).toBe("'O\\27 Brien'");
    expect(cssString("O'Brien")).toBe('"O\'Brien"');
    expect(cssString('My "Q" Font', "'")).toBe('\'My "Q" Font\'');
  });

  it('preserves backslashes including those adjacent to quotes', () => {
    expect(cssString('My\\Path Font')).toBe('"My\\5c Path Font"');
    expect(cssString('A\\"B')).toBe('"A\\5c \\22 B"');
    expect(cssString("A\\'B", "'")).toBe("'A\\5c \\27 B'");
  });

  it.each([
    ['form feed', 'A\fB', '"A\\c B"'],
    ['line feed', 'A\nB', '"A\\a B"'],
    ['carriage return', 'A\rB', '"A\\d B"'],
    ['CRLF', 'A\r\nB', '"A\\d \\a B"'],
    ['tab', 'A\tB', '"A\\9 B"'],
    ['first non-NUL control', 'A\u0001B', '"A\\1 B"'],
    ['last C0 control', 'A\u001fB', '"A\\1f B"'],
    ['DEL', 'A\u007fB', '"A\\7f B"'],
    ['control before a hex digit', '\fA', '"\\c A"'],
    ['control before a space', '\f A', '"\\c  A"'],
    ['literal backslash and n', '\\n', '"\\5c n"'],
  ])('preserves %s as the original code points', (_name, input, expected) => {
    expect(cssString(input)).toBe(expected);
  });

  it('keeps controls distinct with single quotes too', () => {
    expect(cssString('A\nFace\r\f\t', "'")).toBe("'A\\a Face\\d \\c \\9 '");
  });

  it('maps unrepresentable NUL to the CSS replacement character', () => {
    expect(cssString('A\0B')).toBe('"A\uFFFDB"');
  });
});

describe('CustomFontError', () => {
  it('carries the code and is an Error', () => {
    const error = new CustomFontError('too-large');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('too-large');
    expect(error.message).toBe('too-large');
    expect(error.name).toBe('CustomFontError');
  });
});
