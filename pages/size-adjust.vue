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
      <br>
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust"
        target="_blank"
        class="text-slate-300 hover:underline"
      >
        MDN
      </a>
    </Blockquote>

    <pre class="mt-5">
@font-face {
  font-family: local-font;
  src: local(Local Font);
  size-adjust: 125%;
}
    </pre>

    <hr class="my-5">

    <h2 class="text-2xl text-slate-200 font-medium">
      Example
    </h2>

    <div class="mt-4">
      <h3 class="text-lg text-slate-200 font-medium mb-3">
        Settings
      </h3>

      Size-adjust: <b>{{ sizeAdjust }}%</b>

      <br>

      <input
        v-model="sizeAdjust"
        class="w-full"
        type="range"
        min="0"
        max="200"
        step="0.1"
      >

      <br>

      <label class="flex items-center p-2">
        <input
          v-model="layering"
          type="checkbox"
          class="mr-2"
        >

        Layering
      </label>

      <br>

      <textarea
        v-model="text"
        rows="10"
        placeholder="Example text"
        class="w-full mt-4 p-4 bg-slate-800 rounded-md"
      ></textarea>
    </div>

    <div class="mt-4">
      <h3 class="text-lg text-slate-200 font-medium mb-3">
        Preview
      </h3>

      <FontFace
        fontFamily="Arial-sized"
        :sizeAdjust="sizeAdjust"
      />

      <div
        v-if="layering"
        class="relative h-96"
      >
        <div class="size-adjust-preview__text size-adjust-preview__text_raw absolute top-0 opacity-70">
          {{ text }}
        </div>

        <div class="size-adjust-preview__text size-adjust-preview__text_sized absolute top-0 opacity-30">
          {{ text }}
        </div>
      </div>

      <div
        v-else
        class="flex size-adjust-preview"
      >
        <div class="flex-1">
          <h4 class="text-lg text-slate-200 font-medium mb-3">
            Original
          </h4>

          <div class="size-adjust-preview__text size-adjust-preview__text_raw">
            {{ text }}
          </div>
        </div>

        <div class="flex-1">
          <h4 class="text-lg text-slate-200 font-medium mb-3">
            Sized
          </h4>

          <div class="size-adjust-preview__text size-adjust-preview__text_sized">
            {{ text }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const sizeAdjust = ref(100);
const layering = ref(true);
const text =
  ref(`Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum tellus ligula, lacinia sed velit eu, sodales rutrum enim. Duis ultricies commodo risus, eu dictum ipsum faucibus id. In ut pulvinar lorem, vel mattis risus. Quisque in malesuada orci. Nulla viverra sed elit non vulputate. Integer placerat magna in nulla vulputate, vel eleifend sem sollicitudin. In sit amet arcu tristique, fermentum sapien nec, aliquet risus. In hac habitasse platea dictumst. Etiam non sollicitudin metus.

Praesent et turpis ex. Integer eget dolor risus. Donec placerat turpis eu turpis tempus, a maximus turpis suscipit. Sed sagittis malesuada hendrerit. Nullam consectetur a est a faucibus. Vivamus hendrerit pellentesque quam. Aliquam erat volutpat. Praesent ut tortor a nibh rhoncus vulputate a nec nibh. Nullam ut feugiat magna.`);
</script>

<style scoped lang="stylus">
.size-adjust-preview {
  &__text {
    &_raw {
      font-family: Arial;
    }

    &_sized {
      font-family: Arial-sized;
    }
  }
}
</style>
