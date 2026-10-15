<template>
  <div class="bg-slate-900 rounded-md p-6">
    <PageHeader>
      {{ t('title') }}
    </PageHeader>

    <div class="mt-4">
      <h2 class="text-xl text-slate-200 font-medium">
        {{ t('localFonts') }}
      </h2>
    </div>

    <div class="mt-4">
      <h2 class="text-xl text-slate-200 font-medium">
        {{ t('systemFonts') }}
      </h2>
    </div>

    <div class="mt-4">
      <h2 class="text-xl text-slate-200 font-medium">
        Google fonts
      </h2>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useSystemFonts } from '@/composables/fonts';

const { t } = useI18n({
  useScope: 'local',
});

const {
  pending,
  list,
} = useSystemFonts();
</script>

<i18n lang="json">
{
  "en": {
    "title": "Fonts list",
    "localFonts": "Local fonts",
    "systemFonts": "System/browser fonts"
  },
  "ru": {
    "title": "Список шрифтов",
    "localFonts": "Локальные шрифты",
    "systemFonts": "Системные/браузерные шрифты"
  }
}
</i18n>
