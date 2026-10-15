import { calculateNearArg, createContainersAndFontFace } from '../common';

export const analyzeFontByDom = async (
  fontFamily: string,
  text: string,
  assumption: number = 0,
) => {
  const { mainContainer, fallbackContainer, fontFace, cleanup } =
    await createContainersAndFontFace(
      fontFamily,
      fontFamily,
      text.split('').join('\n'),
    );

  mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
    'pre-line';
  mainContainer.style.lineHeight = fallbackContainer.style.lineHeight =
    'normal';
  mainContainer.style.display = fallbackContainer.style.display =
    'inline-block';

  console.time('load-font');
  await document.fonts.ready;
  console.timeEnd('load-font');

  const targetHeight = mainContainer.getBoundingClientRect()['height'];
  console.log(
    'target',
    targetHeight,
    fallbackContainer.getBoundingClientRect()['height'],
  );

  const ascentOverride = await calculateNearArg(
    targetHeight,
    100,
    async (v) => {
      await rafPromise();
      fontFace.style.ascentOverride = `${v}%`;

      console.log(
        'ascent',
        fallbackContainer.getBoundingClientRect()['height'],
        v,
      );

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise();
  fontFace.style.ascentOverride = null;

  const descentOverride = await calculateNearArg(
    targetHeight,
    // Avg value
    20,
    async (v) => {
      await rafPromise();
      fontFace.style.descentOverride = `${v}%`;

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise();
  fontFace.style.descentOverride = null;

  const lineGapOverride = await calculateNearArg(
    targetHeight,
    // Avg value
    5,
    async (v) => {
      await rafPromise();
      fontFace.style.lineGapOverride = `${v}%`;

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise();
  fontFace.style.lineGapOverride = null;
  cleanup();

  return {
    ascentOverride,
    descentOverride,
    lineGapOverride,
  };
};

if (process.client) {
  window.analyzeFontByDom = analyzeFontByDom;
}
