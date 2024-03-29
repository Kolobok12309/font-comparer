import { getRandomString } from './random';

export const calculateNearArg = async (
  targetValue: number,
  src: number,
  execFunc: (src: number) => number | Promise<number>,
  assumption: number = 0,
): Promise<number> => {
  const minTarget = targetValue - targetValue * assumption;
  const maxTarget = targetValue + targetValue * assumption;
  const checkValue = (v: number) => v >= minTarget && v <= maxTarget;

  let step: number = 1;
  let direction: number = 1;

  let startValue = await execFunc(src);
  // console.log('target', targetValue, startValue);
  if (checkValue(startValue)) return +src.toFixed(2);
  if (startValue > targetValue) {
    direction = -1;
  }

  let iterations: number = 0;
  let prevDiv = Math.abs(targetValue - startValue);
  while (step >= 0.01 && iterations++ < 1000 && src > 0) {
    src += step * direction;

    const value = await execFunc(src);
    const div = Math.abs(targetValue - value);

    // console.log(`in:${src} out:${value}`);
    if (checkValue(value)) {
      // console.log(`Jackpot on ${iterations} iteration`);
      return +src.toFixed(2);
    }

    if (
      (value > targetValue && direction === 1) ||
      (value < targetValue && direction === -1)
    ) {
      // console.log('anomaly', prevDiv, div, step);
      // Check what value more near, prev or current
      if (div > prevDiv) {
        // rollback prev src
        // and not change prevDiv
        src -= step * direction;
        // Change direction if current
      } else {
        direction *= -1;
        prevDiv = div;
      }

      step *= 0.1;
    } else {
      prevDiv = div;
    }
  }

  // console.log('out', src, iterations);

  return +src.toFixed(2);
};

const createContainersAndFontFace = async (
  targetFontFamily: string,
  fallbackFontFamily: string,
  text: string,
) => {
  const fontStyle = document.createElement('style');
  const fontName = `font-${getRandomString()}-fallback`;
  fontStyle.id = fontName;
  fontStyle.textContent = `
  @font-face {
    font-family: '${fontName}';
    src: local("${fallbackFontFamily}");
  }`;

  document.head.appendChild(fontStyle);

  const fontFace = document.styleSheets[fontName as any]
    .cssRules[0] as CSSFontFaceRule;

  const container = document.createElement('div');
  container.style.opacity = '0';

  const mainContainer = document.createElement('span');
  mainContainer.style.fontFamily = `"${targetFontFamily}"`;

  const fallbackContainer = document.createElement('span');
  fallbackContainer.style.fontFamily = `"${fontName}"`;

  mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
    'nowrap';
  mainContainer.style.lineHeight = fallbackContainer.style.lineHeight =
    'normal';
  mainContainer.style.display = fallbackContainer.style.display =
    'inline-block';

  container.appendChild(mainContainer);
  container.appendChild(document.createElement('br'));
  container.appendChild(fallbackContainer);

  mainContainer.textContent = fallbackContainer.textContent = text;

  await rafPromise(() => {
    document.body.appendChild(container);
  });

  return {
    mainContainer,
    fallbackContainer,
    fontFace,
    cleanup: () => {
      container.remove();
      fontStyle.remove();
    },
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
  lineHeightOpts: number;
}> => {
  const { mainContainer, fallbackContainer, fontFace, cleanup } =
    await createContainersAndFontFace(
      targetFontFamily,
      fallbackFontFamily,
      text,
    );

  await rafPromise(() => {
    fontFace.style.sizeAdjust = '100%';
    fontFace.style.ascentOverride = '100%';
    fontFace.style.descentOverride = '0%';
    fontFace.style.lineGapOverride = '0%';
  });

  console.time('load-font');
  await document.fonts.ready;
  console.timeEnd('load-font');

  const startWidth = mainContainer.getBoundingClientRect()['width'];
  const srcWidth = fallbackContainer.getBoundingClientRect()['width'];
  const sizeAdjust = await calculateNearArg(
    startWidth,
    (startWidth / srcWidth) * 100,
    async (v) => {
      await rafPromise(() => {
        fontFace.style.sizeAdjust = `${v}%`;
      });

      return fallbackContainer.getBoundingClientRect()['width'];
    },
    assumption,
  );

  await rafPromise(() => {
    mainContainer.textContent = fallbackContainer.textContent = text
      .split('')
      .join('\n');
    mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
      'pre-line';
  });

  await sleep(20);

  const startHeight = mainContainer.getBoundingClientRect()['height'];
  const srcHeight = fallbackContainer.getBoundingClientRect()['height'];
  const ascentOverride = await calculateNearArg(
    startHeight,
    (startHeight / srcHeight) * 100,
    async (v) => {
      await rafPromise(() => {
        fontFace.style.ascentOverride = `${v}%`;
      });

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise(() => {
    cleanup();
  });

  return {
    sizeAdjust,
    lineHeightOpts: ascentOverride,
  };
};

export const calculateSeparateOverrideProperties = async (
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

  console.time('load-font');
  await document.fonts.ready;
  console.timeEnd('load-font');

  const targetHeight = mainContainer.getBoundingClientRect()['height'];

  const ascentOverride = await calculateNearArg(
    targetHeight,
    100,
    async (v) => {
      await rafPromise(() => {
        fontFace.style.ascentOverride = `${v}%`;
      });

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise(() => {
    fontFace.style.ascentOverride = null;
  });

  const descentOverride = await calculateNearArg(
    targetHeight,
    // Avg value
    20,
    async (v) => {
      await rafPromise(() => {
        fontFace.style.descentOverride = `${v}%`;
      });

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise(() => {
    fontFace.style.descentOverride = null;
  });

  const lineGapOverride = await calculateNearArg(
    targetHeight,
    // Avg value
    5,
    async (v) => {
      await rafPromise(() => {
        fontFace.style.lineGapOverride = `${v}%`;
      });

      return fallbackContainer.getBoundingClientRect()['height'];
    },
    assumption,
  );

  await rafPromise(() => {
    fontFace.style.lineGapOverride = null;
    cleanup();
  });

  return {
    ascentOverride,
    descentOverride,
    lineGapOverride,
  };
};
