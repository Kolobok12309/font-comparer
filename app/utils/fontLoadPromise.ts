export default async (
  fontFamily: string,
  cancelled: Ref<boolean>,
): Promise<void> => {
  // @ts-ignore
  let fontFaces = [...(await document.fonts.ready)];

  while (!fontFaces.find(({ family }) => fontFamily === family)) {
    if (cancelled.value) throw new Error('Canceled');

    await sleep(50);
    // @ts-ignore
    fontFaces = [...(await document.fonts.ready)];
  }
};
