<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      Size-adjust
    </PageHeader>

    <Blockquote>
      The <b>size-adjust</b> CSS descriptor for the <b>@font-face</b> at-rule defines a multiplier for glyph outlines and metrics associated with this font. This makes it easier to harmonize the designs of various fonts when rendered at the same font size.
      <br>
      The <b>size-adjust</b> descriptor behaves in a similar fashion to the <b>font-size-adjust</b> property. It calculates an adjustment per font by matching ex heights.

      <footer>
        <a
          href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust"
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
      sizeAdjust="125"
      class="mt-5"
    />

    <hr class="my-5">

    <FontPreviewSettings
      v-model:sizeAdjust="sizeAdjust"
      changeSizeAdjust
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:text="text"
      class="mt-4"
    />

    <FontPreview
      :sizeAdjust="sizeAdjust"
      :ghost="ghost"
      :border="border"
      :text="text"
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';

const sizeAdjust = ref(100);
const ghost = ref(true);
const border = ref(true);
const text = ref(defaultText);
</script>

