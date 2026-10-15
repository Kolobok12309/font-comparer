/**
 * Функция для вычисления значений src путем подбора наиболее близкого значения
 * к target
 */
export const calculateNearArg = async (
  /**
   * Значение к которому будет стремиться src
   */
  targetValue: number,

  /**
   * Исходное значение которое будет передаваться в execFunc
   */
  src: number,

  /**
   * Обработчик, получает src, возвращает target
   */
  execFunc: (src: number) => number | Promise<number>,

  /**
   * Погрешность
   *
   * @example 0.1 = 10%
   */
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

export const createContainersAndFontFace = async (
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

  container.appendChild(mainContainer);
  container.appendChild(document.createElement('br'));
  container.appendChild(fallbackContainer);

  mainContainer.textContent = fallbackContainer.textContent = text;

  await rafPromise();
  document.body.appendChild(container);

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
