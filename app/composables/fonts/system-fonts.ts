import { ref, onMounted } from 'vue';

import { checkFontExistByFamily } from '@/utils/checkFontExist';
import type { FallbackFont, QueryLocalFontsFont } from '@/types';

const getFontsByQueryLocalFonts = async (): Promise<QueryLocalFontsFont[]> => {
  if (!('queryLocalFonts' in window))
    throw new Error('"queryLocalFonts" not supported');

  // @ts-expect-error
  return window.queryLocalFonts();
};

let fallbackFontsIsChecked = false;
const fallbackFonts: FallbackFont[] = [];
const getPopularSystemFonts = async (): Promise<FallbackFont[]> => {
  if (fallbackFontsIsChecked) return fallbackFonts;

  const predefinedSystemFonts =
    await import('@/utils/consts/system-fonts.json').then((v) => v?.default);

  for (let font of predefinedSystemFonts) {
    // Если кол-во шрифтов увеличится, стоит добавить wait
    // чтобы не прерывать основной поток
    const isFontSupported = checkFontExistByFamily(font);

    if (isFontSupported) fallbackFonts.push({ family: font });
  }

  fallbackFontsIsChecked = true;
  return fallbackFonts;
};

export const useSystemFonts = () => {
  const pending = ref(true);
  const list = ref([] as Array<QueryLocalFontsFont> | Array<FallbackFont>);
  onMounted(async () => {
    try {
      list.value = await getFontsByQueryLocalFonts();

      pending.value = false;
    } catch (err) {
      console.error(err);

      list.value = await getPopularSystemFonts();

      pending.value = false;
    }
  });

  const uniqFonts = computed(() => {
    const set = new Set<string>();

    list.value.forEach(({ family }) => set.add(family));

    return [...set];
  });

  return {
    pending,
    list,
    uniqFonts,
  };
};
