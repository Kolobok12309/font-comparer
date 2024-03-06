<template>
  <div>
    fontFamily:
    <FontFamilySelector v-model="fontFamily" />

    <br>

    fallback fontFamily:
    <FontFamilySelector
      v-model="fallbackFontFamily"
      fallback
    />

    <FontFaceCssPreview
      :fontFamily="`${fontFamily}-fallback`"
      :src="fallbackFontFamily"
    />

    <details>
      <summary class="cursor-pointer">Text</summary>

      <textarea
        v-model="text"
        rows="10"
        placeholder="Example text"
        class="w-full mt-4 p-4 bg-slate-800 rounded-md"
      ></textarea>
    </details>

    <button @click="onClickText">
      Calculate text
    </button>

    <button @click="onClick">
      Calculate
    </button>

    <input
      v-model.number="assumption"
      type="number"
    >

    <button @click="onStop">
      Stop
    </button>

    <div>
      <p
        v-for="res in alphabetAnalyze"
        :key="res"
      >
        {{ res }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defaultText, enAlphabet } from '@/utils/consts';

const fontFamily = ref('Arial');
const fallbackFontFamily = ref('Arial');
const assumption = ref(0);
const text = ref(defaultText);

const alphabetAnalyze = ref<string[]>([]);
let isStopped = false;

const onStop = () => {
  isStopped = true;
};
const onClick = async () => {
  alphabetAnalyze.value = [];
  isStopped = false;

  await enAlphabet
    .split('')
    .reduce(async (acc: Promise<void>, letter: string) => {
      await acc;
      if (isStopped) return;

      const letterLine = letter.repeat(100);
      const testString = `${letterLine}\n`.repeat(100).slice(0, -1);

      console.time(
        `calculate letter ${letter} for ${fontFamily.value}:${fallbackFontFamily.value}`,
      );
      const res = await calculateFontProperties(
        fontFamily.value,
        fallbackFontFamily.value,
        testString,
        assumption.value,
      );
      console.timeEnd(
        `calculate letter ${letter} for ${fontFamily.value}:${fallbackFontFamily.value}`,
      );

      alphabetAnalyze.value.push(
        `${letter}: sizeAdjust:${res.sizeAdjust} overrideOpts:${res.lineHeightOpts}`,
      );
    }, Promise.resolve());
};

const onClickText = async () => {
  console.time(
    `calculate text for ${fontFamily.value}:${fallbackFontFamily.value}`,
  );
  const res = await calculateFontProperties(
    fontFamily.value,
    fallbackFontFamily.value,
    text.value,
    assumption.value,
  );
  console.timeEnd(
    `calculate text for ${fontFamily.value}:${fallbackFontFamily.value}`,
  );

  console.log('res', res);
};
</script>

<i18n lang="json">
{
  "en": {

  },
  "ru": {

  }
}
</i18n>
