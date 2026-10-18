<template>
  <pre class="max-w-full overflow-x-auto">{{ text }}</pre>
</template>

<script lang="ts" setup>
import { getCustomFont } from '@/composables/fonts/custom-fonts';
import { stripCustomSuffix } from '@/utils/fontFile';

const props = defineProps({
  fontFamily: {
    type: String,
    required: true,
  },

  src: {
    type: String,
    required: true,
  },

  sizeAdjust: {
    type: [Number, String],
    default: null,
  },

  ascentOverride: {
    type: [Number, String],
    default: null,
  },

  descentOverride: {
    type: [Number, String],
    default: null,
  },

  lineGapOverride: {
    type: [Number, String],
    default: null,
  },
});

const custom = computed(() => getCustomFont(props.src));

const text = computed(() => {
  const parts = [
    '@font-face {',
    `  font-family: "${props.fontFamily}";`,
    `  src: local('${custom.value ? stripCustomSuffix(props.src) : props.src}');`,
  ];

  if (custom.value) {
    const format = {
      woff2: 'woff2',
      woff: 'woff',
      ttf: 'truetype',
      otf: 'opentype',
    }[custom.value.format];
    parts.push(
      `  /* replace local() with url('/fonts/${custom.value.fileName}') format('${format}') */`,
    );
  }

  if (props.sizeAdjust !== null)
    parts.push(`  size-adjust: ${props.sizeAdjust}%;`);
  if (props.ascentOverride !== null)
    parts.push(`  ascent-override: ${props.ascentOverride}%;`);
  if (props.descentOverride !== null)
    parts.push(`  descent-override: ${props.descentOverride}%;`);
  if (props.lineGapOverride !== null)
    parts.push(`  line-gap-override: ${props.lineGapOverride}%;`);

  parts.push('}');

  return parts.join('\n');
});
</script>
