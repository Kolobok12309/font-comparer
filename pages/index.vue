<template>
  <div class="bg-slate-900 rounded-md p-6">
    <PageHeader>Font comparer</PageHeader>

    <Blockquote>
      {{ t('utilDescription') }}

      <NuxtLink
        :to="localePath('/size-adjust')"
        class="text-slate-300 hover:underline"
        >size-adjust</NuxtLink
      >,

      <NuxtLink
        :to="localePath('/ascent-override')"
        class="text-slate-300 hover:underline"
        >ascent-override</NuxtLink
      >,

      <NuxtLink
        :to="localePath('/descent-override')"
        class="text-slate-300 hover:underline"
        >descent-override</NuxtLink
      >

      {{ t('and') }}

      <NuxtLink
        :to="localePath('/line-gap-override')"
        class="text-slate-300 hover:underline"
        >line-gap-override</NuxtLink
      >.

      <br />

      <NuxtLink
        :to="localePath('/preview')"
        class="text-slate-300 hover:underline"
      >
        Full preview
      </NuxtLink>
    </Blockquote>

    <FontComparer class="mt-4" />
  </div>
</template>

<script lang="ts" setup>
const { t } = useI18n({
  useScope: 'local',
});

const localePath = useLocalePath();
</script>

<i18n lang="json">
{
  "en": {
    "utilDescription": "Util for calculate",
    "and": "and"
  },
  "ru": {
    "utilDescription": "Утилита для рассчета",
    "and": "и"
  }
}
</i18n>
