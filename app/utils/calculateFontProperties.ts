import { getRandomString } from './random';
import { calculateNearArg, createContainersAndFontFace } from './common';
import { cssString } from './fontFile';
import {
  getLanguageProfile,
  mixProfiles,
  normalizeProfile,
  profileFromText,
  weightedAverage,
} from './frequency';
import type { FrequencyProfile } from './frequency';

export const CHAR_REPEAT = 1000;

type UncoveredCharacters = { target: string[]; fallback: string[] };

export class FrequencyCoverageError extends Error {
  constructor(public uncovered: UncoveredCharacters) {
    super('No profile characters are covered by both fonts');
    this.name = 'FrequencyCoverageError';
  }
}

const createCharWidthMeasurer = async (
  targetFontFamily: string,
  fallbackFontFace: CSSFontFaceRule,
  profile: FrequencyProfile,
) => {
  const container = document.createElement('div');
  container.style.cssText =
    'position:absolute;visibility:hidden;left:-99999px;top:0';
  const uncovered: UncoveredCharacters = { target: [], fallback: [] };
  const targetFamily = cssString(targetFontFamily);
  const fallbackFamily = fallbackFontFace.style.fontFamily;
  const chars = Object.keys(profile).join('');

  try {
    // Загружаем все unicode-range подмножества до проверки покрытия.
    await Promise.all([
      document.fonts.load(`40px ${targetFamily}`, chars),
      document.fonts.load(`40px ${fallbackFamily}`, chars),
    ]).catch(console.error);

    const spans = Object.fromEntries(
      Object.entries(profile).map(([char, weight]) => {
        const createSpan = (family: string) => {
          const span = document.createElement('span');
          span.style.cssText =
            'display:inline-block;white-space:pre;line-height:normal;' +
            'font-size:40px;font-kerning:none;font-variant-ligatures:none;' +
            'letter-spacing:normal;word-spacing:normal';
          span.style.fontFamily = family;
          span.textContent = char.repeat(CHAR_REPEAT);
          container.appendChild(span);
          return span;
        };
        return [
          char,
          {
            weight,
            target: createSpan(`${targetFamily}, monospace`),
            fallback: createSpan(`${fallbackFamily}, monospace`),
            targetSerif: createSpan(`${targetFamily}, serif`),
            fallbackSerif: createSpan(`${fallbackFamily}, serif`),
            missingMono: createSpan('"__definitely_missing__", monospace'),
            missingSerif: createSpan('"__definitely_missing__", serif'),
          },
        ] as const;
      }),
    );
    document.body.appendChild(container);
    await rafPromise();

    const covered: FrequencyProfile = {};
    for (const [char, probes] of Object.entries(spans)) {
      const missingMono = probes.missingMono.getBoundingClientRect().width;
      const missingSerif = probes.missingSerif.getBoundingClientRect().width;
      // Обе цепочки должны совпасть с sentinel: одного generic недостаточно.
      const missingTarget =
        Math.abs(probes.target.getBoundingClientRect().width - missingMono) <=
          0.01 &&
        Math.abs(
          probes.targetSerif.getBoundingClientRect().width - missingSerif,
        ) <= 0.01;
      const missingFallback =
        Math.abs(probes.fallback.getBoundingClientRect().width - missingMono) <=
          0.01 &&
        Math.abs(
          probes.fallbackSerif.getBoundingClientRect().width - missingSerif,
        ) <= 0.01;
      if (missingTarget) uncovered.target.push(char);
      if (missingFallback) uncovered.fallback.push(char);
      if (!missingTarget && !missingFallback) covered[char] = probes.weight;
    }
    if (!Object.keys(covered).length) {
      throw new FrequencyCoverageError(uncovered);
    }
    const effectiveProfile = normalizeProfile(covered);
    console.log(
      'frequency measurer',
      Object.keys(effectiveProfile).length,
      uncovered,
    );
    // effectiveProfile содержит только ключи созданных выше spans.
    return {
      measureTarget: () =>
        weightedAverage(
          effectiveProfile,
          (char) =>
            spans[char]!.target.getBoundingClientRect().width / CHAR_REPEAT,
        ),
      measureFallback: () =>
        weightedAverage(
          effectiveProfile,
          (char) =>
            spans[char]!.fallback.getBoundingClientRect().width / CHAR_REPEAT,
        ),
      uncovered,
      cleanup: () => container.remove(),
    };
  } catch (error) {
    container.remove();
    throw error;
  }
};

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

  ctx.font = `${size} ${cssString(targetFontFamily)}`;
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
  options: { method?: 'text' | 'frequency'; profile?: FrequencyProfile } = {},
): Promise<{
  sizeAdjust: number;
  ascentOverride: number;
  descentOverride: number;
  lineGapOverride: number;
  method: 'text' | 'frequency';
  uncovered: UncoveredCharacters;
}> => {
  const method = options.method ?? 'text';
  let uncovered: UncoveredCharacters = { target: [], fallback: [] };
  if (method === 'frequency' && !options.profile) {
    throw new Error('Frequency profile required');
  }
  const { mainContainer, fallbackContainer, fontFace, cleanup } =
    await createContainersAndFontFace(
      targetFontFamily,
      fallbackFontFamily,
      text,
    );

  try {
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

    ctx.font = `${size} ${cssString(targetFontFamily)}`;
    const targetMeasure = ctx.measureText(text);
    console.log(targetMeasure);

    ctx.font = `${size} ${fontFace.style.fontFamily}`;
    const startMeasure = ctx.measureText(text);
    console.log(startMeasure);

    await rafPromise();

    let sizeAdjust: number;
    if (method === 'frequency' && options.profile) {
      console.time('frequency-size-adjust');
      try {
        const measurer = await createCharWidthMeasurer(
          targetFontFamily,
          fontFace,
          options.profile,
        );
        try {
          const target = measurer.measureTarget();
          const start = measurer.measureFallback();
          const seed =
            start > 0 && isFinite(start) ? (target / start) * 100 : 100;
          sizeAdjust = await calculateNearArg(
            target,
            seed,
            async (v) => {
              fontFace.style.sizeAdjust = `${v}%`;
              // CSS-дескриптор применяется перед следующим DOM-замером.
              await rafPromise();
              return measurer.measureFallback();
            },
            assumption,
          );
          fontFace.style.sizeAdjust = `${sizeAdjust}%`;
          uncovered = measurer.uncovered;
        } finally {
          measurer.cleanup();
        }
      } finally {
        console.timeEnd('frequency-size-adjust');
      }
    } else {
      sizeAdjust = await calculateNearArg(
        targetMeasure.width,
        (targetMeasure.width / startMeasure.width) * 100,
        async (v) => {
          await rafPromise();

          fontFace.style.sizeAdjust = `${v}%`;
          console.log('sizeAdjust', v, ctx.measureText(text).width);

          return ctx.measureText(text).width;
        },
        assumption,
      );
      fontFace.style.sizeAdjust = `${sizeAdjust}%`;
    }

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
      assumption,
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
      assumption,
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

    return {
      sizeAdjust,
      ascentOverride,
      descentOverride,
      lineGapOverride: 0,
      method,
      uncovered,
    };
  } finally {
    cleanup();
  }
};

declare global {
  interface CSSStyleDeclaration {
    sizeAdjust: string;
    ascentOverride: string | null;
    descentOverride: string | null;
    lineGapOverride: string | null;
  }

  interface Window {
    calculateRootProperties: typeof calculateRootProperties;
    getLanguageProfile: typeof getLanguageProfile;
    mixProfiles: typeof mixProfiles;
    profileFromText: typeof profileFromText;
  }
}

if (import.meta.client) {
  window.calculateRootProperties = calculateRootProperties;
  window.getLanguageProfile = getLanguageProfile;
  window.mixProfiles = mixProfiles;
  window.profileFromText = profileFromText;
}
