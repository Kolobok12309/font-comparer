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
      v-model:text="text"
      class="mt-4"
    />

    <FontPreview
      :descentOverride="descentOverride"
      :ghost="ghost"
      :border="border"
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
const text = ref(defaultText);
</script>
