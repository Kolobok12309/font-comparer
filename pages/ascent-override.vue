<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      Ascent-override
    </PageHeader>

    <Blockquote>
      The ascent-override CSS descriptor for the @font-face at-rule defines the ascent metric for the font. The ascent metric is the height above the baseline that CSS uses to lay out line boxes in an inline formatting context.

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

    <pre class="mt-5">
@font-face {
  font-family: local-font;
  src: local(Local Font);
  ascent-override: 125%;
}
    </pre>
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
</style>
