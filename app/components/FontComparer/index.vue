<template>
  <div>
    <FontPreviewSettings
      v-model:target="target"
      changeTarget
      v-model:src="src"
      changeSrc
      v-model:sizeAdjust="sizeAdjust"
      changeSizeAdjust
      v-model:ascentOverride="ascentOverride"
      changeAscentOverride
      v-model:descentOverride="descentOverride"
      changeDescentOverride
      v-model:lineGapOverride="lineGapOverride"
      changeLineGapOverride
      v-model:ghost="ghost"
      v-model:border="border"
      v-model:text="text"
    />

    <div class="grid gap-4 mt-4 sm:grid-cols-2">
      <label class="flex flex-col gap-2">
        {{ t('method') }}
        <select
          v-model="method"
          :disabled="pending"
          class="w-full min-h-11 p-2 bg-slate-800 text-slate-200 rounded-sm focus-visible:outline focus-visible:outline-2 disabled:opacity-75"
        >
          <option value="frequency">{{ t('frequencyMethod') }}</option>
          <option value="text">{{ t('textMethod') }}</option>
        </select>
      </label>

      <label
        v-if="method === 'frequency'"
        class="flex flex-col gap-2"
      >
        {{ t('profile') }}
        <select
          v-model="profileId"
          :disabled="pending"
          class="w-full min-h-11 p-2 bg-slate-800 text-slate-200 rounded-sm focus-visible:outline focus-visible:outline-2 disabled:opacity-75"
        >
          <option value="en">{{ t('profiles.en') }}</option>
          <option value="ru">{{ t('profiles.ru') }}</option>
          <option value="mix">{{ t('profiles.mix') }}</option>
          <option value="text">{{ t('profiles.text') }}</option>
        </select>
      </label>

      <label
        v-if="method === 'frequency' && profileId === 'mix'"
        class="flex flex-col gap-2 sm:col-span-2"
      >
        {{ t('mixRatio', { en: mixRatio, ru: 100 - mixRatio }) }}
        <input
          v-model.number="mixRatio"
          :disabled="pending"
          type="range"
          min="0"
          max="100"
          step="1"
          class="w-full min-h-11"
        />
      </label>
    </div>

    <div class="flex flex-wrap items-center gap-4 mt-4">
      <button
        class="bg-indigo-500 text-slate-200 py-2 px-4 rounded-sm disabled:opacity-75"
        :disabled="pending"
        @click="onClick"
      >
        {{ t('calc') }}
      </button>

      <span
        v-if="lastCalc"
        role="status"
      >
        {{ t('lastResult') }} <b>size-adjust</b>: {{ lastCalc.sizeAdjust }},
        <b>(ascent-override + descent-override + line-gap-override)</b>:
        {{
          Math.round(
            (lastCalc.ascentOverride +
              lastCalc.descentOverride +
              lastCalc.lineGapOverride) *
              100,
          ) / 100
        }}
        — {{ t(`resultMethods.${lastCalc.method}`) }} /
        {{ t(`profiles.${lastCalc.method === 'text' ? 'text' : profileId}`) }}
        <template v-if="lastCalc.method === 'frequency' && profileId === 'mix'">
          ({{ t('mixRatio', { en: mixRatio, ru: 100 - mixRatio }) }})
        </template>
      </span>
    </div>

    <p
      v-if="calcError"
      role="alert"
      class="mt-4 p-3 bg-slate-800 text-slate-100 rounded-sm"
    >
      {{ calcError }}
    </p>
    <div
      v-if="coverageWarning"
      role="status"
      class="mt-4 text-slate-200 break-words"
    >
      <p v-if="coverageWarning.target.length">
        {{
          t('missingTarget', {
            count: coverageWarning.target.length,
            chars:
              coverageWarning.target.slice(0, 20).join(' ') +
              (coverageWarning.target.length > 20 ? '…' : ''),
          })
        }}
      </p>
      <p v-if="coverageWarning.fallback.length">
        {{
          t('missingFallback', {
            count: coverageWarning.fallback.length,
            chars:
              coverageWarning.fallback.slice(0, 20).join(' ') +
              (coverageWarning.fallback.length > 20 ? '…' : ''),
          })
        }}
      </p>
    </div>

    <details class="mt-4">
      <summary class="cursor-pointer">Css <b>@font-face</b></summary>

      <FontFaceCssPreview
        :fontFamily="`${target}-${src}`"
        :src="src"
        :sizeAdjust="sizeAdjust"
        :ascentOverride="ascentOverride"
        :descentOverride="descentOverride"
        :lineGapOverride="lineGapOverride"
      />
    </details>

    <FontPreview
      :target="target"
      :src="src"
      :sizeAdjust="sizeAdjust"
      :ascentOverride="ascentOverride"
      :descentOverride="descentOverride"
      :lineGapOverride="lineGapOverride"
      :ghost="ghost"
      :border="border"
      :text="text"
      size
      class="mt-4"
    />
  </div>
</template>

<script lang="ts" setup>
import { defaultText } from '@/utils/consts';
import {
  calculateRootProperties,
  FrequencyCoverageError,
} from '~/utils/calculateFontProperties';
import {
  getLanguageProfile,
  mixProfiles,
  profileFromText,
} from '~/utils/frequency';

const { t, locale } = useI18n({
  useScope: 'local',
});

const target = ref('Montserrat');
const targetIsChanged = ref(false);
watch(target, () => {
  targetIsChanged.value = true;
});

const src = ref('Arial');
const assumption = ref(0);
const text = ref(defaultText);
const method = ref<'frequency' | 'text'>('frequency');
const profileId = ref<'en' | 'ru' | 'mix' | 'text'>(
  locale.value === 'ru' ? 'ru' : 'en',
);
const mixRatio = ref(50);
const calcError = ref<string | null>(null);
const coverageWarning = ref<{
  target: string[];
  fallback: string[];
} | null>(null);

const sizeAdjust = ref(100);
const ascentOverride = ref(100);
const descentOverride = ref(0);
const lineGapOverride = ref(0);
const ghost = ref(false);
const border = ref(false);

const lastCalc = ref<Awaited<ReturnType<typeof calculateRootProperties>> | null>(null);
let calculationGeneration = 0;
watch(
  [target, src, method, profileId, mixRatio, text],
  () => {
    calculationGeneration++;
    lastCalc.value = null;
    calcError.value = null;
    coverageWarning.value = null;
  },
  { flush: 'sync' },
);
const pending = ref(false);

const onClick = async () => {
  const generation = ++calculationGeneration;
  pending.value = true;
  calcError.value = null;
  coverageWarning.value = null;
  lastCalc.value = null;

  const timer = `calculate text for ${target.value}:${src.value}`;
  console.time(timer);
  try {
    const profile =
      method.value === 'text'
        ? undefined
        : profileId.value === 'mix'
          ? mixProfiles(
              getLanguageProfile('en'),
              getLanguageProfile('ru'),
              mixRatio.value / 100,
            )
          : profileId.value === 'text'
            ? profileFromText(text.value)
            : getLanguageProfile(profileId.value);
    const res = await calculateRootProperties(
      target.value,
      src.value,
      text.value,
      assumption.value,
      { method: method.value, profile },
    );
    if (generation !== calculationGeneration) return;

    lastCalc.value = res;
    coverageWarning.value = res.uncovered;

    sizeAdjust.value = res.sizeAdjust;
    ascentOverride.value = res.ascentOverride;
    descentOverride.value = res.descentOverride;
    lineGapOverride.value = res.lineGapOverride;
    console.log(`res ${target.value}:${src.value}`, res);
  } catch (err) {
    if (generation !== calculationGeneration) return;

    if (err instanceof FrequencyCoverageError) {
      calcError.value = t('coverageError');
      coverageWarning.value = err.uncovered;
    } else if (
      err instanceof Error &&
      err.message === 'Empty frequency profile'
    ) {
      calcError.value = t('emptyTextError');
    } else {
      calcError.value = t('calculationError');
      console.error(err);
    }
  } finally {
    console.timeEnd(timer);
    pending.value = false;
  }
};
onMounted(async () => {
  try {
    await fontLoadPromise(target.value, targetIsChanged);

    await onClick();
  } catch (err) {
    if ((err as Error)?.message === 'Canceled') return;

    throw err;
  }
});
</script>

<i18n lang="json">
{
  "en": {
    "calc": "Calculate",
    "method": "Calculation method",
    "frequencyMethod": "By letter frequency",
    "textMethod": "By preview text",
    "profile": "Frequency profile",
    "profiles": {
      "en": "English",
      "ru": "Russian",
      "mix": "English + Russian",
      "text": "From preview text"
    },
    "mixRatio": "EN {en}% / RU {ru}%",
    "lastResult": "Last result",
    "resultMethods": {
      "frequency": "frequency",
      "text": "preview text"
    },
    "emptyTextError": "Enter preview text to build a frequency profile.",
    "coverageError": "The fonts share no characters from this profile. Choose another profile or font.",
    "calculationError": "Calculation failed. Check the selected fonts and try again.",
    "missingTarget": "{count} characters are missing in the target font: {chars}",
    "missingFallback": "{count} characters are missing in the fallback font: {chars}"
  },
  "ru": {
    "calc": "Вычислить",
    "method": "Метод расчёта",
    "frequencyMethod": "По частоте букв",
    "textMethod": "По тексту превью",
    "profile": "Частотный профиль",
    "profiles": {
      "en": "Английский",
      "ru": "Русский",
      "mix": "Английский + русский",
      "text": "Из текста превью"
    },
    "mixRatio": "EN {en}% / RU {ru}%",
    "lastResult": "Последний результат",
    "resultMethods": {
      "frequency": "частота",
      "text": "текст превью"
    },
    "emptyTextError": "Введите текст превью для создания частотного профиля.",
    "coverageError": "В шрифтах нет общих символов этого профиля. Выберите другой профиль или шрифт.",
    "calculationError": "Не удалось выполнить расчёт. Проверьте выбранные шрифты и повторите попытку.",
    "missingTarget": "В целевом шрифте нет {count} символов: {chars}",
    "missingFallback": "В запасном шрифте нет {count} символов: {chars}"
  }
}
</i18n>
