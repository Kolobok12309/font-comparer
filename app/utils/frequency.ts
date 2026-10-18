import enTable from './consts/frequence-tables/en.json';
import ruTable from './consts/frequence-tables/ru.json';

export type FrequencyProfile = Record<string, number>;
export type LanguageProfileId = 'en' | 'ru';

export const MAX_TEXT_PROFILE_KEYS = 64;

const EMPTY_PROFILE_MESSAGE = 'Empty frequency profile';
// Если сумма уже равна 1 с такой точностью, повторное деление не делаем:
// так нормализация идемпотентна и mixProfiles(a, b, 1) точно равен a.
const NORMALIZED_EPSILON = 1e-12;

const languageTables: Record<LanguageProfileId, FrequencyProfile> = {
  en: enTable,
  ru: ruTable,
};

export function normalizeProfile(profile: FrequencyProfile): FrequencyProfile {
  const kept: FrequencyProfile = {};
  let sum = 0;
  for (const [key, weight] of Object.entries(profile)) {
    if (Number.isFinite(weight) && weight > 0) {
      kept[key] = weight;
      sum += weight;
    }
  }
  if (!(sum > 0) || !Number.isFinite(sum)) {
    throw new Error(EMPTY_PROFILE_MESSAGE);
  }
  if (Math.abs(sum - 1) <= NORMALIZED_EPSILON) return kept;
  for (const key of Object.keys(kept)) {
    kept[key] = kept[key]! / sum;
  }
  return kept;
}

export function getLanguageProfile(id: LanguageProfileId): FrequencyProfile {
  return normalizeProfile(languageTables[id]);
}

export function mixProfiles(
  a: FrequencyProfile,
  b: FrequencyProfile,
  ratioA: number,
): FrequencyProfile {
  const ratio = Math.min(1, Math.max(0, ratioA));
  const mixed: FrequencyProfile = {};
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    mixed[key] = ratio * (a[key] ?? 0) + (1 - ratio) * (b[key] ?? 0);
  }
  return normalizeProfile(mixed);
}

export function profileFromText(text: string): FrequencyProfile {
  // Map сохраняет порядок первого появления, а sort стабилен
  const counts = new Map<string, number>();
  for (const ch of Array.from(text)) {
    if (ch === '\n' || ch === '\r' || ch === '\t') continue;
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  }
  const top = [...counts.entries()]
    .sort((x, y) => y[1] - x[1])
    .slice(0, MAX_TEXT_PROFILE_KEYS);
  return normalizeProfile(Object.fromEntries(top));
}

export function weightedAverage(
  profile: FrequencyProfile,
  widthOf: (ch: string) => number,
): number {
  let total = 0;
  for (const [ch, weight] of Object.entries(profile)) {
    total += weight * widthOf(ch);
  }
  return total;
}
