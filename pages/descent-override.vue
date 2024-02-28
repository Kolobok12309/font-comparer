<template>
  <div class="bg-slate-900 rounded-md p-6">
    <BackButton />

    <PageHeader class="mt-2">
      Descent-override
    </PageHeader>

    <Blockquote>
      The <b>descent-override</b> CSS descriptor for the <b>@font-face</b> at-rule defines the descent metric for the font. The descent metric is the height below the baseline that CSS uses to lay out line boxes in an inline formatting context.
      <br>
      <a
        href="https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/descent-override"
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
  descent-override: 125%;
}
    </pre>
  </div>
</template>

<script lang="ts" setup>
</script>

<style>
</style>
