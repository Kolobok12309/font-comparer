import { getRandomString } from './random';

export const resizeText = async (
  input: HTMLElement,
  target: HTMLElement,
  fontFace: CSSFontFaceRule,
  dimProperty: 'width' | 'height',
  cssProperty: 'sizeAdjust' | 'ascentOverride',
  unit: string,
  spacing: number,
  assumption: number = 0,
): Promise<number> => {
  await rafPromise();

  const baseDim = input.getBoundingClientRect()[dimProperty];
  const startDim = target.getBoundingClientRect()[dimProperty];

  const minDim = +(baseDim - baseDim * assumption).toFixed(2);
  const maxDim = +(baseDim + baseDim * assumption).toFixed(2);

  let increment: number = 1;
  let directionChanges: number = 0;
  let direction: number = 1;
  // console.log('baseDim', dimProperty, startDim, baseDim);
  if (startDim === baseDim) return +spacing.toFixed(2);
  if (startDim > baseDim) {
    direction = -1;
  }
  let iterations: number = 0;
  let prevDiv = Math.abs(baseDim - startDim);
  while (increment > 0.001 && iterations++ < 1000 && spacing > 0) {
    spacing = spacing + increment * direction;

    await rafPromise();

    fontFace.style[cssProperty] = `${spacing}${unit}`;
    const curDim = target.getBoundingClientRect()[dimProperty];
    const curDiv = Math.abs(baseDim - curDim);
    // console.log(
    //   dimProperty,
    //   baseDim,
    //   curDim,
    //   cssProperty,
    //   target.style[cssProperty],
    //   spacing,
    //   increment,
    //   direction,
    // );
    if (+curDim.toFixed(2) >= minDim && +curDim.toFixed(2) <= maxDim) {
      console.log(`Jackpot on ${iterations} iteration`);
      return +spacing.toFixed(2);
    }
    // console.log(
    //   'dir',
    //   curDim > baseDim,
    //   direction === 1,
    //   curDim < baseDim,
    //   direction === -1,
    // );

    if (
      (curDim > baseDim && direction == 1) ||
      (curDim < baseDim && direction == -1)
    ) {
      // console.log('Smallest increment');
      increment *= 0.1;

      // if (curDiv < prevDiv) {
      // console.log('Direction change');
      direction *= -1;
      directionChanges++;
      // }
    }

    prevDiv = curDiv;
  }
  return +spacing.toFixed(2);
};

export default async (
  targetFontFamily: string,
  fallbackFontFamily: string,
  text: string,
  assumption: number = 0,
): Promise<{
  sizeAdjust: number;
  lineHeightOpts: number;
}> => {
  const fontStyle = document.createElement('style');
  const fontName = `font-${getRandomString()}-fallback`;
  fontStyle.id = fontName;
  fontStyle.textContent = `
  @font-face {
    font-family: '${fontName}';
    src: local("${fallbackFontFamily}");
    size-adjust: 100%;
    ascent-override: 100%;
    descent-override: 0%;
    line-gap-override: 0%;
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

  mainContainer.innerText = fallbackContainer.innerText = text;

  await rafPromise();

  document.body.appendChild(container);

  console.time('load-font');
  await document.fonts.ready;
  console.timeEnd('load-font');

  const sizeAdjust = await resizeText(
    mainContainer,
    fallbackContainer,
    fontFace,
    'width',
    'sizeAdjust',
    '%',
    100,
    assumption,
  );

  await rafPromise();

  mainContainer.style.whiteSpace = fallbackContainer.style.whiteSpace =
    'pre-line';

  await sleep(20);

  const ascentOverride = await resizeText(
    mainContainer,
    fallbackContainer,
    fontFace,
    'height',
    'ascentOverride',
    '%',
    100,
    assumption,
  );

  container.remove();
  fontStyle.remove();

  return {
    sizeAdjust,
    lineHeightOpts: ascentOverride,
  };
};
