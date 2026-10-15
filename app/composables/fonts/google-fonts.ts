import { ref, onMounted } from 'vue';

import type { GoogleFont } from '@/types';

const waitForFont = async ({
  family,
  stretch,
  weight,
  style,
}: LoadGoogleFontOptions) => {
  const checker = (font: FontFace) => {
    if (font.family !== family) return false;
    if (stretch && font.stretch !== stretch) return false;
    if (weight && font.weight !== weight) return false;
    if (style && font.style !== style) return false;

    return true;
  };

  // @ts-ignore
  let fontFaces = [...(await document.fonts.ready)];

  while (!fontFaces.some(checker)) {
    await sleep(50);
    // @ts-ignore
    fontFaces = [...(await document.fonts.ready)];
  }
};

export const useGoogleFonts = () => {
  const pending = ref(true);
  const list = ref([] as GoogleFont[]);
  onMounted(async () => {
    list.value = await import('@/utils/consts/google-fonts-array.json').then(
      (v) => v?.default,
    );
    pending.value = false;
  });

  const load = async (font: LoadGoogleFontOptions) => {
    const { family, stretch, weight, style } = font;
    const linkId = `google-font-${family}-${stretch}-${weight}-${style}`;

    if (document.getElementById(linkId)) {
      return waitForFont(font);
    }

    let url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    )}`;
    const fontParams: Record<string, string | number> = {};

    if (style === 'italic') fontParams.ital = 1;
    if (weight) fontParams.wght = weight;
    if (Object.keys(fontParams).length) {
      url += `:${Object.keys(fontParams)}@${Object.values(fontParams)}`;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.id = linkId;
    document.head.appendChild(link);

    return waitForFont(font);
  };

  return {
    pending,
    list,
    load,
  };
};

export interface LoadGoogleFontOptions {
  family: string;
  stretch?: string;
  weight?: string;
  style?: 'normal' | 'italic';
}
