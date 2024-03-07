<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      {{ t('title') }}
    </PageHeader>

    <hr class="my-5" />

    <FontPreviewSettings
      v-model:src="fontFamily"
      changeSrc
      v-model:ascentOverride="ascentOverride"
      changeAscentOverride
      v-model:descentOverride="descentOverride"
      changeDescentOverride
      v-model:lineGapOverride="lineGapOverride"
      changeLineGapOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:size="size"
      v-model:text="text"
      class="mt-4"
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
        Last result <b>ascent-override</b>: {{ lastCalc.ascentOverride }}, <b>descent-override</b>: {{ lastCalc.descentOverride }}, <b>line-gap-override</b>: {{ lastCalc.lineGapOverride }}
      </span>
    </div>

    <FontPreview
      :target="fontFamily"
      :src="fontFamily"
      :ascentOverride="ascentOverride"
      :descentOverride="descentOverride"
      :lineGapOverride="lineGapOverride"
      :ghost="ghost"
      :border="border"
      :size="size"
      :text="text"
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';
import { calculateSeparateOverrideProperties } from '#imports';

const { t } = useI18n({
  useScope: 'local',
});

const fontFamily = ref('Arial');

const ascentOverride = ref(90);
const descentOverride = ref(20);
const lineGapOverride = ref(3);
const ghost = ref(true);
const border = ref(true);
const size = ref(true);
const text = ref(defaultText);

const lastCalc = ref<{
  ascentOverride: number;
  descentOverride: number;
  lineGapOverride: number;
} | null>(null);
watch(fontFamily, () => {
  lastCalc.value = null;
});
const pending = ref(false);

const onClick = async () => {
  pending.value = true;

  console.time(`calculate properties for ${fontFamily.value}`);
  const res = await calculateSeparateOverrideProperties(
    fontFamily.value,
    text.value,
  );
  console.timeEnd(`calculate properties for ${fontFamily.value}`);

  pending.value = false;
  lastCalc.value = res;

  ascentOverride.value = res.ascentOverride;
  descentOverride.value = res.descentOverride;
  lineGapOverride.value = res.lineGapOverride;
  console.log(`res ${fontFamily.value}`, res);
};
onMounted(async () => {
  await onClick();
});
</script>

<i18n lang="json">
{
  "en": {
    "title": "Analyze default properties of font",
    "calc": "Calculate"
  },
  "ru": {
    "title": "Анализ стандартных свойств шрифта",
    "calc": "Вычислить"
  }
}
</i18n>
