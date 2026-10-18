import { describe, expect, it } from 'vitest';
import {
  MAX_TEXT_PROFILE_KEYS,
  getLanguageProfile,
  mixProfiles,
  normalizeProfile,
  profileFromText,
  weightedAverage,
} from './frequency';

const sum = (p: Record<string, number>) =>
  Object.values(p).reduce((acc, value) => acc + value, 0);

describe('frequency profiles', () => {
  const en = getLanguageProfile('en');
  const ru = getLanguageProfile('ru');

  it('normalizes en and ru profiles to sum 1', () => {
    expect(Math.abs(sum(en) - 1)).toBeLessThan(1e-9);
    expect(Math.abs(sum(ru) - 1)).toBeLessThan(1e-9);
  });

  it('mix ratio 1 returns exactly the first profile', () => {
    expect(mixProfiles(en, ru, 1)).toEqual(getLanguageProfile('en'));
  });

  it('mix ratio 0 returns exactly the second profile', () => {
    expect(mixProfiles(en, ru, 0)).toEqual(getLanguageProfile('ru'));
  });

  it('mix ratio 0.5 halves weights of disjoint keys', () => {
    const mixed = mixProfiles(en, ru, 0.5);
    expect(mixed.e).toBeCloseTo(en.e! / 2, 12);
    expect(mixed['а']).toBeCloseTo(ru['а']! / 2, 12);
    expect(Math.abs(sum(mixed) - 1)).toBeLessThan(1e-9);
  });

  it('clamps ratio above 1', () => {
    expect(mixProfiles(en, ru, 1.5)).toEqual(getLanguageProfile('en'));
  });

  it('builds a profile from text keeping spaces', () => {
    expect(profileFromText('aab ')).toEqual({ a: 0.5, b: 0.25, ' ': 0.25 });
  });

  it('ignores line breaks and tabs', () => {
    expect(profileFromText('a\nb\r\n\tab')).toEqual({ a: 0.5, b: 0.5 });
  });

  it('counts an emoji as a single key', () => {
    const profile = profileFromText('😀😀a');
    expect(Object.keys(profile).sort()).toEqual(['a', '😀']);
    expect(profile['😀']).toBeCloseTo(2 / 3, 12);
  });

  it('keeps at most 64 keys for texts with many distinct characters', () => {
    const text = Array.from({ length: 100 }, (_, i) =>
      String.fromCodePoint(0x4e00 + i),
    ).join('');
    const profile = profileFromText(text);
    expect(Object.keys(profile)).toHaveLength(MAX_TEXT_PROFILE_KEYS);
    expect(Math.abs(sum(profile) - 1)).toBeLessThan(1e-9);
  });

  it('breaks count ties by first occurrence', () => {
    const text =
      Array.from({ length: 70 }, (_, i) =>
        String.fromCodePoint(0x4e00 + i),
      ).join('') + 'Z';
    expect(profileFromText(text)['Z']).toBeUndefined();
  });

  it('throws on empty, whitespace-line-break-only text', () => {
    expect(() => profileFromText('')).toThrow('Empty frequency profile');
    expect(() => profileFromText('\n\r\t')).toThrow('Empty frequency profile');
  });

  it('keeps plain spaces as a valid profile', () => {
    expect(profileFromText('  ')).toEqual({ ' ': 1 });
  });

  it('drops non-positive and non-finite weights, throws when empty', () => {
    expect(
      normalizeProfile({ a: 1, b: -1, c: NaN, d: Infinity, e: 0 }),
    ).toEqual({ a: 1 });
    expect(() => normalizeProfile({ a: -1, b: NaN })).toThrow(
      'Empty frequency profile',
    );
  });

  it('computes weighted average of widths', () => {
    expect(
      weightedAverage({ a: 0.5, b: 0.5 }, (c) => (c === 'a' ? 10 : 20)),
    ).toBe(15);
  });
});
