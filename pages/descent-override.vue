<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2"> Descent-override </PageHeader>

    <Blockquote>
      The <b>descent-override</b> CSS descriptor for the
      <b>@font-face</b> at-rule defines the descent metric for the font. The
      descent metric is the height below the baseline that CSS uses to lay out
      line boxes in an inline formatting context.

      <footer>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/descent-override"
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

      {{ t('noteText') }}
    </div>

    <FontFaceCssPreview
      fontFamily="local-font"
      src="Local Font"
      descentOverride="125"
      class="mt-5"
    />

    <hr class="my-5" />

    <FontPreviewSettings
      v-model:descentOverride="descentOverride"
      changeDescentOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:size="size"
      v-model:text="text"
      class="mt-4"
    />

    <FontPreview
      :descentOverride="descentOverride"
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

const descentOverride = ref(20);
const ghost = ref(true);
const border = ref(true);
const size = ref(true);
const text = ref(defaultText);

const { t } = useI18n({
  useScope: 'local',
});
</script>

<i18n lang="json">
{
  "en": {
    "noteTitle": "Simple description",
    "noteText": ""
  },
  "ru": {
    "noteTitle": "Упрощенное описание",
    "noteText": ""
  }
}
</i18n>
