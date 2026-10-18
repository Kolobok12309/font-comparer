import { describe, it, expect } from 'vitest';

import {
  CustomFontError,
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

describe('CustomFontError', () => {
  it('carries the code and is an Error', () => {
    const error = new CustomFontError('too-large');
    expect(error).toBeInstanceOf(Error);
    expect(error.code).toBe('too-large');
    expect(error.message).toBe('too-large');
    expect(error.name).toBe('CustomFontError');
  });
});
