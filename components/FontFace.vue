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
    default: 100,
  },

  ascentOverride: {
    type: Number,
    default: 100,
  },

  descentOverride: {
    type: Number,
    default: 100,
  },

  lineGapOverride: {
    type: Number,
    default: 100,
  },
});

const render = () =>
  h(
    'style',
    `@font-face {
  font-family: '${props.fontFamily}';
  src: local('${props.src}');
  size-adjust: ${props.sizeAdjust}%;
  ascent-override: ${props.ascentOverride}%;
  descent-override: ${props.descentOverride}%;
  line-gap-override: ${props.lineGapOverride}%;
}`,
  );
</script>

<style>
</style>
