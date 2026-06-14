<template>
  <NuxtLink
    to="/"
    class="text-slate-300 hover:underline"
  >
    &lt;- {{ t('back') }}
  </NuxtLink>
</template>

<script lang="ts" setup>
const { t } = useI18n({
  useScope: 'local',
});
</script>

<i18n lang="json">
{
  "en": {
    "back": "back"
  },
  "ru": {
    "back": "назад"
  }
}
</i18n>
