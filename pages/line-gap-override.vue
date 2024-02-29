<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2"> Line-gap-override </PageHeader>

    <Blockquote>
      The <b>line-gap-override</b> CSS descriptor for the
      <b>@font-face</b> at-rule defines the line-gap metric for the font. The
      line-gap metric is the font recommended line-gap or external leading.

      <footer>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/line-gap-override"
          target="_blank"
          class="text-slate-300 hover:underline"
        >
          MDN
        </a>
      </footer>
    </Blockquote>

    <div class="mt-5">
      <h3 class="text-lg text-slate-200 font-medium mb-3">
        {{ t('noteTitle') }}
      </h3>

      {{ t('noteText1') }}
      <code class="p-1 rounded-md bg-slate-800">line-height</code>.
      {{ t('noteText2') }}
      <code class="p-1 rounded-md bg-slate-800">line-height</code>
      {{ t('noteText3') }}
      <code class="p-1 rounded-md bg-slate-800">normal</code>
    </div>

    <FontFaceCssPreview
      fontFamily="local-font"
      src="Local Font"
      lineGapOverride="125"
      class="mt-5"
    />

    <hr class="my-5" />

    <FontPreviewSettings
      v-model:lineGapOverride="lineGapOverride"
      changeLineGapOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:text="text"
      class="mt-4"
    />

    <FontPreview
      :lineGapOverride="lineGapOverride"
      :ghost="ghost"
      :text="text"
      :border="border"
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';

const lineGapOverride = ref(0);
const ghost = ref(true);
const border = ref(true);
const text = ref(defaultText);

const { t } = useI18n({
  useScope: 'local',
});
</script>

<i18n lang="json">
{
  "en": {
    "noteTitle": "Simple description",
    "noteText1": "Default value for",
    "noteText2": "Enabled if",
    "noteText3": "not set or with value"
  },
  "ru": {
    "noteTitle": "Упрощенное описание",
    "noteText1": "Дефолтное значение для",
    "noteText2": "Чтобы увидеть необходимо не указывать",
    "noteText3": "или указывать значение"
  }
}
</i18n>
