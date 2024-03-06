<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      {{ t('title') }}
    </PageHeader>

    <hr class="my-5" />

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
      v-model:size="size"
      v-model:text="text"
      class="mt-4"
    />

    <details>
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
      :size="size"
      :text="text"
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';

const { t } = useI18n({
  useScope: 'local',
});

const target = ref('Arial');
const src = ref('Arial');
const sizeAdjust = ref(100);
const ascentOverride = ref(90);
const descentOverride = ref(20);
const lineGapOverride = ref(3);
const ghost = ref(true);
const border = ref(true);
const size = ref(true);
const text = ref(defaultText);
</script>

<i18n lang="json">
{
  "en": {
    "title": "Full preview"
  },
  "ru": {
    "title": "Превью всех свойств"
  }
}
</i18n>
