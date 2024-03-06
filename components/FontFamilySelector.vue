<template>
  <select v-model="compValue">
    <optgroup :label="t('systemFonts')">
      <option
        v-for="fontName in systemFontNames"
        :key="fontName"
        :value="fontName"
      >
        {{ fontName }}
      </option>
    </optgroup>

    <optgroup
      v-if="googleFontNames.length && !fallback"
      label="Google fonts"
    >
      <option
        v-for="fontName in googleFontNames"
        :key="fontName"
        :value="fontName"
      >
        {{ fontName }}
      </option>
    </optgroup>

    <optgroup
      v-if="customFontNames.length && !fallback"
      :label="t('customFonts')"
    >
      <option
        v-for="fontName in customFontNames"
        :key="fontName"
        :value="fontName"
      >
        {{ fontName }}
      </option>
    </optgroup>
  </select>
</template>

<script lang="ts" setup>
import { systemFonts, googleFonts } from '@/utils/consts';

const props = defineProps({
  modelValue: {
    type: String,
    default: null,
  },

  fallback: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['update:modelValue']);

const { modelValue: compValue } = useMapSync(emit, props);

const googleFontNames = Object.keys(googleFonts);
const systemFontNames = Object.keys(systemFonts);
const customFontNames = ref([]);

watch(
  compValue,
  (newVal: string | null) => {
    if (!process.client) return;
    if (!newVal) return;
    if (googleFontNames.includes(newVal)) {
      const linkId = `google-font-${newVal}`;

      if (document.getElementById(linkId)) return;

      const googleUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
        newVal,
      )}`;

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = googleUrl;
      link.id = linkId;
      document.head.appendChild(link);
    }
  },
  { immediate: true },
);

const { t } = useI18n({
  useScope: 'local',
});
</script>

<style>
</style>

<i18n lang="json">
{
  "en": {
    "systemFonts": "System fonts",
    "customFonts": "Custom fonts"
  },
  "ru": {
    "systemFonts": "Системные шрифты",
    "customFonts": "Пользовательские шрифты"
  }
}
</i18n>
