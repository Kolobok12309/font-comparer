import { getRandomString } from './random';
import { calculateNearArg, createContainersAndFontFace } from './common';

const calculateAscentDescentFromSum = async (
  targetFontFamily: string,
  fallbackFontFamily: string,
  text: string,
  fontFace: CSSFontFaceRule,
  overrideSum: number,
) => {
  const size = '40px';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  // document.body.appendChild(canvas);

  ctx.font = `${size} "${targetFontFamily}"`;
  const targetMeasure = ctx.measureText(text);
  console.log(targetMeasure);

  // fontFace.style.sizeAdjust = '100%';
  // fontFace.style.ascentOverride = '100%';
  // fontFace.style.descentOverride = '0%';
  ctx.font = `${size} ${fontFace.style.fontFamily}`;
  let currentFallbackMeasure = ctx.measureText(text);
  console.log(currentFallbackMeasure);

  // const sizeAdjust = await calculateNearArg(
  //   targetMeasure.width,
  //   overrideSum,
  //   async (v) => {
  //     await rafPromise();

  //     fontFace.style.sizeAdjust = `${v}%`;

  //     return ctx.measureText(text).width;
  //   },
  //   0,
  // );

  const ascentOverride = await calculateNearArg(
    targetMeasure.fontBoundingBoxAscent,
    overrideSum,
    async (v) => {
      await rafPromise();

      fontFace.style.ascentOverride = `${v}%`;

      return ctx.measureText(text).fontBoundingBoxAscent;
    },
    0,
  );

  const descentOverride = await calculateNearArg(
    targetMeasure.fontBoundingBoxDescent,
    overrideSum - ascentOverride,
    async (v) => {
      await rafPromise();

      fontFace.style.descentOverride = `${v}%`;

      return ctx.measureText(text).fontBoundingBoxDescent;
    },
    0,
  );

  console.log(ctx.measureText(text));

  // console.log('sizeAdjust', sizeAdjust);
  // const ascentOverride = overrideSum;
  console.log('ascent', ascentOverride);
  // const descentOverride = overrideSum - ascentOverride;
  console.log('descent', descentOverride);

  canvas.remove();

  return {
    ascentOverride,
    descentOverride,
  };
};

/**
 * Calculate sizeAdjust and sum of overrides
 *
 * @param targetFontFamily
 * @param fallbackFontFamily
 * @param text
 * @param assumption
 * @returns
 */
export const calculateRootProperties = async (
  targetFontFamily: string,
  fallbackFontFamily: string,
  text: string,
  assumption: number = 0,
): Promise<{
  sizeAdjust: number;
  ascentOverride: number;
  descentOverride: number;
  lineGapOverride: number;
}> => {
  const { mainContainer, fallbackContainer, fontFace, cleanup } =
    await createContainersAndFontFace(
      targetFontFamily,
      fallbackFontFamily,
      text,
    );

  mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
    'nowrap';
  mainContainer.style.lineHeight = fallbackContainer.style.lineHeight =
    'normal';
  mainContainer.style.display = fallbackContainer.style.display =
    'inline-block';

  // Сперва вычисляется sizeAdjust, единственный параметр который влияет на ширину текста
  await rafPromise();

  // Обнуляем все параметры
  fontFace.style.sizeAdjust = '100%';
  fontFace.style.ascentOverride = '100%';
  fontFace.style.descentOverride = '0%';
  fontFace.style.lineGapOverride = '0%';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  const size = '40px';

  console.time('load-font');
  await document.fonts.ready;
  console.timeEnd('load-font');

  ctx.font = `${size} "${targetFontFamily}"`;
  const targetMeasure = ctx.measureText(text);
  console.log(targetMeasure);

  ctx.font = `${size} ${fontFace.style.fontFamily}`;
  const startMeasure = ctx.measureText(text);
  console.log(startMeasure);

  await rafPromise();

  const sizeAdjust = await calculateNearArg(
    targetMeasure.width,
    (targetMeasure.width / startMeasure.width) * 100,
    async (v) => {
      await rafPromise();

      fontFace.style.sizeAdjust = `${v}%`;
      console.log('sizeAdjust', v, ctx.measureText(text).width);

      return ctx.measureText(text).width;
    },
    0,
  );
  fontFace.style.sizeAdjust = `${sizeAdjust}%`;

  console.log(
    'size-adjust res',
    sizeAdjust,
    ctx.measureText(text),
    targetMeasure,
  );
  await rafPromise();

  const ascentOverride = await calculateNearArg(
    targetMeasure.fontBoundingBoxAscent,
    100,
    async (v) => {
      await rafPromise();

      fontFace.style.ascentOverride = `${v}%`;
      console.log('ascent', v, ctx.measureText(text).fontBoundingBoxAscent);

      return ctx.measureText(text).fontBoundingBoxAscent;
    },
    0,
  );
  fontFace.style.ascentOverride = `${ascentOverride}%`;

  console.log(
    'ascent-override res',
    ascentOverride,
    ctx.measureText(text),
    targetMeasure,
  );
  await rafPromise();

  const descentOverride = await calculateNearArg(
    targetMeasure.fontBoundingBoxDescent,
    // Не 0 чтобы не сломать условие внутри calculateNearArg "src > 0"
    0.001,
    async (v) => {
      await rafPromise();

      fontFace.style.descentOverride = `${v}%`;
      console.log('descent', v, ctx.measureText(text).fontBoundingBoxDescent);

      return ctx.measureText(text).fontBoundingBoxDescent;
    },
    0,
  );
  fontFace.style.descentOverride = `${descentOverride}%`;

  console.log(
    'descent res',
    descentOverride,
    ctx.measureText(text),
    targetMeasure,
  );
  // const startWidth = mainContainer.getBoundingClientRect()['width'];
  // const srcWidth = fallbackContainer.getBoundingClientRect()['width'];
  // const sizeAdjust = await calculateNearArg(
  //   startWidth,
  //   (startWidth / srcWidth) * 100,
  //   async (v) => {
  //     await rafPromise();

  //     fontFace.style.sizeAdjust = `${v}%`;

  //     return fallbackContainer.getBoundingClientRect()['width'];
  //   },
  //   assumption,
  // );

  // Теперь выводим текст в столбик с максимальными переносами
  // чтобы получить параметры для ascent-overrid, descent-override, line-gap-override
  // На высоту влияет их сумма
  // mainContainer.textContent = fallbackContainer.textContent = text
  //   .split('')
  //   .join('\n');
  // mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
  //   'pre-line';

  // await sleep(20);

  // const startHeight = mainContainer.getBoundingClientRect()['height'];
  // const srcHeight = fallbackContainer.getBoundingClientRect()['height'];
  // const overrideSum = await calculateNearArg(
  //   startHeight,
  //   (startHeight / srcHeight) * 100,
  //   async (v) => {
  //     await rafPromise();

  //     fontFace.style.ascentOverride = `${v}%`;

  //     return fallbackContainer.getBoundingClientRect()['height'];
  //   },
  //   assumption,
  // );

  await rafPromise();

  // const { ascentOverride, descentOverride } =
  //   await calculateAscentDescentFromSum(
  //     targetFontFamily,
  //     fallbackFontFamily,
  //     text,
  //     fontFace,
  //     overrideSum,
  //   );

  cleanup();

  return {
    sizeAdjust,
    ascentOverride,
    descentOverride,
    lineGapOverride: 0,
  };
};
