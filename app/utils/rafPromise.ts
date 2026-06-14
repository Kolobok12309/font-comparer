export default (cb = () => {}) =>
  new Promise<void>((res) =>
    requestAnimationFrame(() => {
      cb();

      res();
    }),
  );
