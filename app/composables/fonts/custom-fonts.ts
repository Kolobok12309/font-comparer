import { computed, onMounted, ref } from 'vue';

import { checkFontExistByFamily } from '@/utils/checkFontExist';
import {
  deleteCustomFont,
  getAllCustomFonts,
  putCustomFont,
} from '@/utils/customFontsDb';
import type { StoredCustomFont } from '@/utils/customFontsDb';
import {
  CustomFontError,
  detectFontFormat,
  MAX_CUSTOM_FONTS,
  MAX_CUSTOM_FONTS_TOTAL_SIZE,
  MAX_FONT_FILE_SIZE,
  resolveFamilyName,
} from '@/utils/fontFile';
import type { FontFileFormat } from '@/utils/fontFile';

export interface CustomFontEntry {
  id: string;
  family: string;
  fileName: string;
  format: FontFileFormat;
  size: number;
  url: string | null;
  face: FontFace | null;
  broken: boolean;
}

const fonts = ref<CustomFontEntry[]>([]);
const pending = ref(true);
let initPromise: Promise<void> | null = null;
export const lastRename = ref<{ from: string; to: string } | null>(null);

export const getCustomFont = (family: string): CustomFontEntry | undefined =>
  fonts.value.find((font) => font.family === family);

export const getCustomFontUrl = (family: string): string | null =>
  getCustomFont(family)?.url ?? null;

const register = async (record: StoredCustomFont) => {
  const url = URL.createObjectURL(record.data);
  try {
    const face = new FontFace(JSON.stringify(record.family), `url("${url}")`);
    // Chromium воспринимает кавычки конструктора как часть имени.
    face.family = record.family;
    await face.load();
    document.fonts.add(face);
    const { id, family, fileName, format, size } = record;
    fonts.value.push({
      id,
      family,
      fileName,
      format,
      size,
      url,
      face,
      broken: false,
    });
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
};

export const initCustomFonts = (): Promise<void> => {
  if (!import.meta.client) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    try {
      const records = await getAllCustomFonts();
      for (const record of records) {
        try {
          await register(record);
        } catch (error) {
          console.error(error);
          const { id, family, fileName, format, size } = record;
          fonts.value.push({
            id,
            family,
            fileName,
            format,
            size,
            url: null,
            face: null,
            broken: true,
          });
        }
      }
    } finally {
      pending.value = false;
    }
  })();
  return initPromise;
};

const isTaken = (name: string, extra: string[], excludeId?: string) => {
  const lowerName = name.toLowerCase();
  return (
    fonts.value.some(
      (font) =>
        font.id !== excludeId && font.family.toLowerCase() === lowerName,
    ) ||
    extra.some((family) => family.toLowerCase() === lowerName) ||
    // При смене только регистра canvas видит собственный зарегистрированный face.
    (!fonts.value.some(
      (font) =>
        font.id === excludeId && font.family.toLowerCase() === lowerName,
    ) &&
      checkFontExistByFamily(name))
  );
};

const release = (entry: CustomFontEntry) => {
  if (entry.face) document.fonts.delete(entry.face);
  if (entry.url) URL.revokeObjectURL(entry.url);
  fonts.value = fonts.value.filter((font) => font.id !== entry.id);
};

const add = async (file: File, takenNames: string[]): Promise<string> => {
  await initCustomFonts();
  if (file.size > MAX_FONT_FILE_SIZE) throw new CustomFontError('too-large');
  if (
    fonts.value.length >= MAX_CUSTOM_FONTS ||
    fonts.value.reduce((total, font) => total + font.size, 0) + file.size >
      MAX_CUSTOM_FONTS_TOTAL_SIZE
  ) {
    throw new CustomFontError('quota-exceeded');
  }
  const format = detectFontFormat(
    new Uint8Array(await file.slice(0, 4).arrayBuffer()),
  );
  if (!format) throw new CustomFontError('unsupported-format');

  let name: string | null = null;
  if (format !== 'woff2') {
    const { parse } = await import('opentype.js');
    try {
      const font = parse(await file.arrayBuffer());
      name =
        font.getEnglishName('preferredFamily') ||
        font.getEnglishName('fontFamily') ||
        null;
    } catch {
      name = null;
    }
  }
  const family = resolveFamilyName(name, file.name, (name) =>
    isTaken(name, takenNames),
  );
  const record: StoredCustomFont = {
    id: crypto.randomUUID(),
    family,
    fileName: file.name,
    format,
    size: file.size,
    data: file,
    addedAt: Date.now(),
  };
  try {
    await register(record);
  } catch {
    throw new CustomFontError('invalid-font');
  }
  try {
    await putCustomFont(record);
  } catch {
    const entry = getCustomFont(family);
    if (entry) release(entry);
    throw new CustomFontError('storage-failed');
  }
  return family;
};

const rename = async (
  id: string,
  newName: string,
  takenNames: string[] = [],
): Promise<void> => {
  await initCustomFonts();
  const entry = fonts.value.find((font) => font.id === id);
  if (!entry || entry.broken || !entry.url) return;
  const family = newName.trim();
  if (!family || isTaken(family, takenNames, id)) {
    throw new CustomFontError('name-taken');
  }
  if (family === entry.family) return;
  let record: StoredCustomFont | undefined;
  try {
    record = (await getAllCustomFonts()).find((font) => font.id === id);
  } catch {
    throw new CustomFontError('storage-failed');
  }
  if (!record) throw new CustomFontError('storage-failed');

  const face = new FontFace(JSON.stringify(family), `url("${entry.url}")`);
  face.family = family;
  try {
    await face.load();
  } catch {
    throw new CustomFontError('invalid-font');
  }
  try {
    await putCustomFont({ ...record, family });
  } catch {
    throw new CustomFontError('storage-failed');
  }
  if (entry.face) document.fonts.delete(entry.face);
  document.fonts.add(face);
  const from = entry.family;
  entry.family = family;
  entry.face = face;
  lastRename.value = { from, to: family };
};

const remove = async (id: string): Promise<void> => {
  await initCustomFonts();
  const entry = fonts.value.find((font) => font.id === id);
  if (!entry) return;
  try {
    await deleteCustomFont(id);
  } catch {
    throw new CustomFontError('storage-failed');
  }
  release(entry);
};

export const useCustomFonts = () => {
  onMounted(initCustomFonts);
  return {
    fonts: computed((): readonly CustomFontEntry[] => fonts.value),
    names: computed(() =>
      fonts.value.filter((font) => !font.broken).map((font) => font.family),
    ),
    pending,
    lastRename,
    add,
    rename,
    remove,
  };
};
