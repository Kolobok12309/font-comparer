import type { Ref } from 'vue';
import { reactive } from 'vue';

export default <T extends HTMLElement>(elRef: Ref<T | null>) => {
  const sizes = reactive({
    width: 0,
    height: 0,
  });
  // Not production code, but tolerable here
  let observer: ResizeObserver;

  watch(elRef, (el, oldEl) => {
    if (!el || oldEl) {
      if (observer && oldEl) observer.unobserve(oldEl);
      return;
    }

    sizes.width = el.offsetWidth;
    sizes.height = el.offsetHeight;

    if (!observer) {
      observer = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const borderBoxSize = entry.borderBoxSize[0];

          sizes.width = +borderBoxSize.inlineSize.toFixed(2);
          sizes.height = +borderBoxSize.blockSize.toFixed(2);
        });
      });
    }

    observer.observe(el);
  });

  return sizes;
};
