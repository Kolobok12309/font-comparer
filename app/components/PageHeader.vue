<template>
  <div class="flex">
    <h1 class="text-4xl text-slate-200 font-medium">
      <slot />
    </h1>

    <div class="flex items-center ml-auto">
      <NuxtLink
        v-if="$i18n.locale !== 'en'"
        :to="switchLocalePath('en')"
      >
        Eng
      </NuxtLink>

      <NuxtLink
        v-if="$i18n.locale !== 'ru'"
        :to="switchLocalePath('ru')"
      >
        Ру
      </NuxtLink>
    </div>
  </div>
</template>

<script lang="ts" setup>
const switchLocalePath = useSwitchLocalePath();
</script>
