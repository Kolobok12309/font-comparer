<template>
  <pre>{{ text }}</pre>
</template>

<script lang="ts" setup>
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

const text = computed(() => {
  const parts = [
    '@font-face {',
    `  font-family: "${props.fontFamily}";`,
    `  src: local('${props.src}');`,
  ];

  if (props.sizeAdjust) parts.push(`  size-adjust: ${props.sizeAdjust}%;`);
  if (props.ascentOverride)
    parts.push(`  ascent-override: ${props.ascentOverride}%;`);
  if (props.descentOverride)
    parts.push(`  descent-override: ${props.descentOverride}%;`);
  if (props.lineGapOverride)
    parts.push(`  line-gap-override: ${props.lineGapOverride}%;`);

  parts.push('}');

  return parts.join('\n');
});
</script>
