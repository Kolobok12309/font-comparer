<template>
  <render />
</template>

<script setup lang="ts">
import { h } from 'vue';

const props = defineProps({
  fontFamily: {
    type: String,
    default: 'Arial-custom',
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
});

const render = () => {
  const parts = [
    '@font-face {',
    `  font-family: "${props.fontFamily}";`,
    `  src: local('${props.src}');`,
  ];

  if (props.sizeAdjust !== null)
    parts.push(`  size-adjust: ${props.sizeAdjust}%;`);
  if (props.ascentOverride !== null)
    parts.push(`  ascent-override: ${props.ascentOverride}%;`);
  if (props.descentOverride !== null)
    parts.push(`  descent-override: ${props.descentOverride}%;`);
  if (props.lineGapOverride !== null)
    parts.push(`  line-gap-override: ${props.lineGapOverride}%;`);

  parts.push('}');

  const innerHTML = parts.join('\n');

  return h('style', { innerHTML });
};
</script>
