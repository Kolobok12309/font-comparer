<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2"> Ascent-override </PageHeader>

    <Blockquote>
      The ascent-override CSS descriptor for the @font-face at-rule defines the
      ascent metric for the font. The ascent metric is the height above the
      baseline that CSS uses to lay out line boxes in an inline formatting
      context.

      <footer>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/ascent-override"
          target="_blank"
          class="text-slate-300 hover:underline"
        >
          MDN
        </a>
      </footer>
    </Blockquote>

    <FontFaceCssPreview
      fontFamily="local-font"
      src="Local Font"
      ascentOverride="125"
      class="mt-5"
    />

    <hr class="my-5" />

    <FontPreviewSettings
      v-model:ascentOverride="ascentOverride"
      changeAscentOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:text="text"
      class="mt-4"
    />

    <FontPreview
      :ascentOverride="ascentOverride"
      :ghost="ghost"
      :border="border"
      :text="text"
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';

const ascentOverride = ref(90);
const ghost = ref(true);
const border = ref(true);
const text = ref(defaultText);
</script>
