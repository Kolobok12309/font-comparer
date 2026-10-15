<template>
  <select v-model="compValue">
    <optgroup
      :label="t('systemFonts')"
      :disabled="systemFontsPending"
    >
      <option
        v-for="font in uniqSystemFonts"
        :key="font"
        :value="font"
      >
        {{ font }}
      </option>
    </optgroup>

    <optgroup
      v-if="googleFonts.length && !fallback"
      label="Google fonts"
      :disabled="googleFontsPending"
    >
      <option
        v-for="font in googleFonts"
        :key="font.family"
        :value="font.family"
      >
        {{ font.family }}
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
import { useGoogleFonts, useSystemFonts } from '@/composables/fonts';

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

const {
  pending: googleFontsPending,
  list: googleFonts,
  load: loadGoogleFont,
} = useGoogleFonts();
const {
  pending: systemFontsPending,
  list: systemFonts,
  uniqFonts: uniqSystemFonts,
} = useSystemFonts();
const customFontNames = ref([]);

watch(
  [compValue, googleFontsPending],
  ([newVal, pending]) => {
    if (!process.client) return;
    if (!newVal) return;
    if (pending) return;
    if (googleFonts.value.some(({ family }) => family === newVal)) {
      loadGoogleFont({ family: newVal });
    }
  },
  { immediate: true },
);

const { t } = useI18n({
  useScope: 'local',
});
</script>

<style></style>

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
