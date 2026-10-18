import { enAlphabet } from './consts';
import { cssString } from './fontFile';

export const checkFontExistByFamily = (family: string) => {
  const text = enAlphabet;
  const size = '72px';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  ctx.font = `${size} "__definitely_missing__", monospace`;
  const fallbackWidth = ctx.measureText(text).width;

  ctx.font = `${size} ${cssString(family)}, monospace`;
  const testWidth = ctx.measureText(text).width;

  canvas.remove();

  return testWidth !== fallbackWidth;
};

export const checkFontExistByWeight = async (
  family: string,
  weight: number,
) => {};
