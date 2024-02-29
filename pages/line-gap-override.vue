<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      Line-gap-override
    </PageHeader>

    <Blockquote>
      The <b>line-gap-override</b> CSS descriptor for the <b>@font-face</b> at-rule defines the line-gap metric for the font. The line-gap metric is the font recommended line-gap or external leading.

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

    <pre class="mt-5">
@font-face {
  font-family: local-font;
  src: local(Local Font);
  line-gap-override: 125%;
}
    </pre>
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
</style>
