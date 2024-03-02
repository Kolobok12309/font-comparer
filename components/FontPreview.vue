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
        class="font-preview__text font-preview__text_orig opacity-70 absolute top-0 select-none leading-[normal]"
        :class="{
          'border border-green-900': border,
        }"
      >
        <span
          ref="ghostOrigRef"
          class="inline-block whitespace-pre-line"
        >
          {{ text }}
        </span>

        <div
          v-if="size"
          class="absolute left-48 bottom-full font-sans whitespace-nowrap"
          :class="{
            'border border-green-900': border,
          }"
        >
          {{ t('shortWidth') }}: {{ ghostOrigSizes.width }}

          <br>

          {{ t('shortHeight') }}: {{ ghostOrigSizes.height }}
        </div>
      </div>

      <div
        class="font-preview__text font-preview__text_adjusted opacity-30 absolute top-0 select-none leading-[normal]"
        :class="{
          'border border-red-900': border,
        }"
      >
        <span
          ref="ghostAdjustedRef"
          class="inline-block whitespace-pre-line"
        >
          {{ text }}
        </span>

        <div
          v-if="size"
          class="absolute right-0 bottom-full font-sans whitespace-nowrap"
          :class="{
            'border border-red-900': border,
          }"
        >
          {{ t('shortWidth') }}: {{ ghostAdjustSizes.width }}

          <br>

          {{ t('shortHeight') }}: {{ ghostAdjustSizes.height }}
        </div>
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
          class="font-preview__text font-preview__text_orig leading-[normal] relative"
          :class="{
            'border border-green-900': border,
          }"
        >
          <span
            ref="origRef"
            class="inline-block whitespace-pre-line"
          >
            {{ text }}
          </span>

          <div
            v-if="size"
            class="absolute right-0 bottom-full font-sans whitespace-nowrap"
            :class="{
              'border border-green-900': border,
            }"
          >
            {{ t('shortWidth') }}: {{ origSizes.width }}

            <br>

            {{ t('shortHeight') }}: {{ origSizes.height }}
          </div>
        </div>
      </div>

      <div class="flex-1">
        <h4 class="text-lg text-slate-200 font-medium mb-3">
          {{ t('adjusted') }}
        </h4>

        <div
          class="font-preview__text font-preview__text_adjusted leading-[normal] relative"
          :class="{
            'border border-red-900': border,
          }"
        >
          <span
            ref="adjustRef"
            class="inline-block whitespace-pre-line"
          >
            {{ text }}
          </span>

          <div
            v-if="size"
            class="absolute right-0 bottom-full font-sans whitespace-nowrap"
            :class="{
              'border border-red-900': border,
            }"
          >
            {{ t('shortWidth') }}: {{ adjustSizes.width }}

            <br>

            {{ t('shortHeight') }}: {{ adjustSizes.height }}
          </div>
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

  size: {
    type: Boolean,
    default: false,
  },
});

const { t } = useI18n({
  useScope: 'local',
});

const ghostContainerRef = ref<HTMLDivElement | null>(null);

const origRef = ref<HTMLDivElement | null>(null);
const origSizes = useSizes(origRef);
const adjustRef = ref<HTMLDivElement | null>(null);
const adjustSizes = useSizes(adjustRef);

const ghostOrigRef = ref<HTMLDivElement | null>(null);
const ghostOrigSizes = useSizes(ghostOrigRef);
const ghostAdjustedRef = ref<HTMLDivElement | null>(null);
const ghostAdjustSizes = useSizes(ghostAdjustedRef);

const updateGhostHeight = () => {
  const newHeight = Math.max(0, ghostOrigSizes.height, ghostAdjustSizes.height);

  requestAnimationFrame(() => {
    ghostContainerRef.value!.style.height = `${newHeight}px`;
  });
};

watch(
  () => [props.ghost, ghostAdjustSizes.height],
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
    "adjusted": "Adjusted",
    "shortWidth": "w",
    "shortHeight": "h"
  },
  "ru": {
    "title": "Превью",
    "orig": "Оригинал",
    "adjusted": "Измененный",
    "shortWidth": "ш",
    "shortHeight": "в"
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
