<template>
  <div class="font-preview">
    <h3 class="text-lg text-slate-200 font-medium mb-3">
      {{ t('title') }}
    </h3>

    <FontFace
      :fontFamily="fontFamily"
      :src="src"
      :sizeAdjust="sizeAdjust"
      :ascentOverride="ascentOverride"
      :descentOverride="descentOverride"
      :lineGapOverride="lineGapOverride"
    />

    <div
      v-if="ghost"
      ref="ghostContainerRef"
      class="font-preview__ghost-container relative"
    >
      <div
        ref="ghostOrigRef"
        class="font-preview__text font-preview__text_orig opacity-70 absolute top-0 select-none leading-[normal]"
        :class="{
          'border border-green-900': border,
        }"
      >
        {{ text }}
      </div>

      <div
        ref="ghostAdjustedRef"
        class="font-preview__text font-preview__text_adjusted opacity-30 absolute top-0 select-none leading-[normal]"
        :class="{
          'border border-red-900': border,
        }"
      >
        {{ text }}
      </div>
    </div>

    <div
      v-else
      class="flex"
    >
      <div class="flex-1">
        <h4 class="text-lg text-slate-200 font-medium mb-3">
          {{ t('orig') }}
        </h4>

        <div
          class="font-preview__text font-preview__text_orig leading-[normal]"
          :class="{
            'border border-green-900': border,
          }"
        >
          {{ text }}
        </div>
      </div>

      <div class="flex-1">
        <h4 class="text-lg text-slate-200 font-medium mb-3">
          {{ t('adjusted') }}
        </h4>

        <div
          class="font-preview__text font-preview__text_adjusted leading-[normal]"
          :class="{
            'border border-red-900': border,
          }"
        >
          {{ text }}
        </div>
      </div>
    </div>
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

  sizeAdjust: {
    type: Number,
    default: null,
  },

  ascentOverride: {
    type: Number,
    default: null,
  },

  descentOverride: {
    type: Number,
    default: null,
  },

  lineGapOverride: {
    type: Number,
    default: null,
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

const ghostContainerRef = ref<HTMLDivElement | null>(null);
const ghostOrigRef = ref<HTMLDivElement | null>(null);
const ghostAdjustedRef = ref<HTMLDivElement | null>(null);

const { t } = useI18n({
  useScope: 'local',
});

const updateGhostHeight = () => {
  const newHeight = Math.max(
    0,
    ghostOrigRef.value!.offsetHeight,
    ghostAdjustedRef.value!.offsetHeight,
  );

  requestAnimationFrame(() => {
    ghostContainerRef.value!.style.height = `${newHeight}px`;
  });
};

watch(
  () => [
    props.ghost,
    props.src,
    props.sizeAdjust,
    props.ascentOverride,
    props.descentOverride,
    props.lineGapOverride,
    props.text,
  ],
  async ([newGhost]) => {
    if (!newGhost) return;

    await nextTick();

    updateGhostHeight();
  },
);
onMounted(() => {
  if (!props.ghost) return;

  updateGhostHeight();
});
</script>

<i18n lang="json">
{
  "en": {
    "title": "Preview",
    "orig": "Original",
    "adjusted": "Adjusted"
  },
  "ru": {
    "title": "Превью",
    "orig": "Оригинал",
    "adjusted": "Измененный"
  }
}
</i18n>

<style scoped lang="stylus">
.font-preview {
  &__text {
    &_orig {
      font-family: v-bind(src);
    }

    &_adjusted {
      font-family: v-bind(fontFamily);
    }
  }
}
</style>
