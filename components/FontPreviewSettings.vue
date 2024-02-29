<template>
  <div class="font-settings">
    <h3 class="text-lg text-slate-200 font-medium">
      {{ t('title') }}
    </h3>

    <p v-if="changeSizeAdjust">
      Size-adjust: <b>{{ sizeAdjust }}%</b>

      <br />

      <input
        v-model="compSizeAdjust"
        class="w-full"
        type="range"
        min="0"
        max="200"
        step="0.1"
      />
    </p>

    <p v-if="changeAscentOverride">
      Ascent-override: <b>{{ ascentOverride }}%</b>

      <br />

      <input
        v-model="compAscentOverride"
        class="w-full"
        type="range"
        min="0"
        max="200"
        step="0.1"
      />
    </p>

    <p v-if="changeDescentOverride">
      Descent-override: <b>{{ descentOverride }}%</b>

      <br />

      <input
        v-model="compDescentOverride"
        class="w-full"
        type="range"
        min="0"
        max="200"
        step="0.1"
      />
    </p>

    <p v-if="changeLineGapOverride">
      Line-gap-override: <b>{{ lineGapOverride }}%</b>

      <br />

      <input
        v-model="compLineGapOverride"
        class="w-full"
        type="range"
        min="0"
        max="100"
        step="0.1"
      />
    </p>

    <div class="flex">
      <label class="flex items-center p-2">
        <input
          v-model="compGhost"
          type="checkbox"
          class="mr-2"
        />

        {{ t('ghost') }}
      </label>

      <label class="flex items-center p-2 ml-2">
        <input
          v-model="compBorder"
          type="checkbox"
          class="mr-2"
        />

        {{ t('border') }}
      </label>
    </div>

    <br />

    <details>
      <summary class="cursor-pointer">{{ t('textSummary') }}</summary>

      <textarea
        v-model="compText"
        rows="10"
        placeholder="Example text"
        class="w-full mt-4 p-4 bg-slate-800 rounded-md"
      ></textarea>
    </details>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps({
  fontFamily: {
    type: String,
    default: 'Some-custom',
  },

  src: {
    type: String,
    default: 'Arial',
  },

  changeFontFamily: {
    type: Boolean,
    default: false,
  },

  sizeAdjust: {
    type: Number,
    default: 100,
  },

  changeSizeAdjust: {
    type: Boolean,
    default: false,
  },

  ascentOverride: {
    type: Number,
    default: 100,
  },

  changeAscentOverride: {
    type: Boolean,
    default: false,
  },

  descentOverride: {
    type: Number,
    default: 100,
  },

  changeDescentOverride: {
    type: Boolean,
    default: false,
  },

  lineGapOverride: {
    type: Number,
    default: 100,
  },

  changeLineGapOverride: {
    type: Boolean,
    default: false,
  },

  ghost: {
    type: Boolean,
    default: false,
  },

  text: {
    type: String,
    default: '',
  },

  border: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  'update:fontFamily',
  'update:src',
  'update:sizeAdjust',
  'update:ascentOverride',
  'update:descentOverride',
  'update:lineGapOverride',
  'update:ghost',
  'update:text',
  'update:border',
]);

const {
  fontFamily: compFontFamily,
  src: compSrc,
  sizeAdjust: compSizeAdjust,
  ascentOverride: compAscentOverride,
  descentOverride: compDescentOverride,
  lineGapOverride: compLineGapOverride,
  ghost: compGhost,
  text: compText,
  border: compBorder,
} = useMapSync(emit, props);

const { t } = useI18n({
  useScope: 'local',
});
</script>

<i18n lang="json">
{
  "en": {
    "title": "Preview settings",
    "ghost": "Ghost",
    "border": "Border",
    "textSummary": "Text"
  },
  "ru": {
    "title": "Настройки превью",
    "ghost": "Призрак",
    "border": "Border",
    "textSummary": "Текст"
  }
}
</i18n>
