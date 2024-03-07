<template>
  <div>
    <FontPreviewSettings
      v-model:target="target"
      changeTarget
      v-model:src="src"
      changeSrc
      v-model:sizeAdjust="sizeAdjust"
      changeSizeAdjust
      v-model:ascentOverride="ascentOverride"
      changeAscentOverride
      v-model:descentOverride="descentOverride"
      changeDescentOverride
      v-model:lineGapOverride="lineGapOverride"
      changeLineGapOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:text="text"
    />

    <div class="flex items-center mt-4">
      <button
        class="bg-indigo-500 text-slate-200 py-2 px-4 rounded-sm disabled:opacity-75"
        :disabled="pending"
        @click="onClick"
      >
        {{ t('calc') }}
      </button>

      <span
        v-if="lastCalc"
        class="ml-4"
      >
        Last result <b>size-adjust</b>: {{ lastCalc.sizeAdjust }},
        <b>(ascent-override + descent-override + line-gap-override)</b>:
        {{ lastCalc.lineHeightOpts }}
      </span>
    </div>

    <details class="mt-4">
      <summary class="cursor-pointer">Css <b>@font-face</b></summary>

      <FontFaceCssPreview
        :fontFamily="`${target}-${src}`"
        :src="src"
        :sizeAdjust="sizeAdjust"
        :ascentOverride="ascentOverride"
        :descentOverride="descentOverride"
        :lineGapOverride="lineGapOverride"
      />
    </details>

    <FontPreview
      :target="target"
      :src="src"
      :sizeAdjust="sizeAdjust"
      :ascentOverride="ascentOverride"
      :descentOverride="descentOverride"
      :lineGapOverride="lineGapOverride"
      :ghost="ghost"
      :border="border"
      :text="text"
      size
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';
import {
  calculateRootProperties,
  calculateSeparateOverrideProperties,
} from '~/utils/calculateFontProperties';

const { t } = useI18n({
  useScope: 'local',
});

const target = ref('Montserrat');
const targetIsChanged = ref(false);
watch(target, () => {
  targetIsChanged.value = true;
});

const src = ref('Arial');
const assumption = ref(0);
const text = ref(defaultText);

const sizeAdjust = ref(100);
const ascentOverride = ref(100);
const descentOverride = ref(0);
const lineGapOverride = ref(0);
const ghost = ref(false);
const border = ref(false);

const lastCalc = ref<{
  sizeAdjust: number;
  lineHeightOpts: number;
} | null>(null);
watch([target, src], () => {
  lastCalc.value = null;
});
const pending = ref(false);

const onClick = async () => {
  pending.value = true;

  console.time(`calculate text for ${target.value}:${src.value}`);
  const res = await calculateRootProperties(
    target.value,
    src.value,
    text.value,
    assumption.value,
  );
  console.timeEnd(`calculate text for ${target.value}:${src.value}`);

  pending.value = false;
  lastCalc.value = res;

  sizeAdjust.value = res.sizeAdjust;
  ascentOverride.value = res.lineHeightOpts;
  descentOverride.value = 0;
  lineGapOverride.value = 0;
  console.log(`res ${target.value}:${src.value}`, res);
};
onMounted(async () => {
  try {
    await fontLoadPromise(target.value, targetIsChanged);

    await onClick();
  } catch (err) {
    if ((err as Error)?.message === 'Canceled') return;

    throw err;
  }
});
</script>

<i18n lang="json">
{
  "en": {
    "calc": "Calculate"
  },
  "ru": {
    "calc": "Вычислить"
  }
}
</i18n>
