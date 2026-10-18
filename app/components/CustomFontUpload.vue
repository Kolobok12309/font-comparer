<template>
  <section
    class="min-w-0 rounded-md border border-dashed border-slate-600 p-3"
    :class="{ 'bg-slate-700': dragDepth > 0 && !disabled }"
    :aria-label="t('customFonts')"
    :aria-busy="busy"
    @dragenter.prevent="dragDepth++"
    @dragover.prevent
    @dragleave.prevent="dragDepth = Math.max(0, dragDepth - 1)"
    @drop.prevent="onDrop"
  >
    <input
      ref="fileInput"
      type="file"
      accept=".woff2,.woff,.ttf,.otf"
      multiple
      hidden
      :disabled="disabled"
      :aria-label="t('upload')"
      @change="onFiles"
    />

    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        class="rounded-sm bg-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-600 disabled:opacity-50"
        :disabled="disabled"
        @click="fileInput?.click()"
      >
        {{ t('upload') }}
      </button>
      <span
        v-if="listsPending"
        role="status"
        class="text-sm text-slate-300"
      >
        {{ t('loading') }}
      </span>
      <span
        v-else-if="busy"
        role="status"
        class="text-sm text-slate-300"
      >
        {{ t('uploading') }}
      </span>
      <span
        v-else
        class="text-sm text-slate-300"
      >
        {{ t('dropHint') }}
      </span>
    </div>
    <p class="mt-2 text-sm text-slate-400">{{ t('privacy') }}</p>

    <ul
      v-if="uploadErrors.length"
      role="alert"
      class="mt-2 space-y-1 text-sm text-red-300"
    >
      <li
        v-for="(error, index) in uploadErrors"
        :key="index"
        class="break-words"
      >
        {{ error.fileName }}: {{ t(error.key) }}
      </li>
    </ul>

    <ul
      v-if="fonts.length"
      class="mt-3 divide-y divide-slate-700"
    >
      <li
        v-for="font in fonts"
        :key="font.id"
        class="py-2"
      >
        <div class="flex flex-wrap items-center gap-2">
          <div
            class="min-w-0 w-full break-words sm:w-auto sm:flex-1"
            :class="font.broken ? 'text-slate-400' : 'text-slate-200'"
          >
            <span class="font-medium">{{ font.family }}</span>
            <span class="ml-2 text-sm text-slate-400">
              {{ font.format.toUpperCase() }} ·
              {{ Math.ceil(font.size / 1024) }} {{ t('kb') }}
            </span>
            <span
              v-if="font.broken"
              class="block text-sm"
            >
              {{ t('failedToLoad') }}
            </span>
          </div>
          <button
            type="button"
            class="rounded-sm bg-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 disabled:opacity-50"
            :disabled="font.broken || !!rowBusy || busy || listsPending"
            @click="startRename(font.id, font.family)"
          >
            {{ t('rename') }}
          </button>
          <button
            type="button"
            class="rounded-sm bg-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 disabled:opacity-50"
            :disabled="!!rowBusy || busy"
            :aria-label="`${t('delete')} ${font.family}`"
            @click="deleteFont(font.id)"
          >
            {{ t('delete') }}
          </button>
        </div>
        <form
          v-if="editingId === font.id && !font.broken"
          class="mt-2 flex flex-wrap gap-2"
          @submit.prevent="saveRename(font.id)"
        >
          <input
            v-model="newName"
            type="text"
            class="min-w-0 flex-1 rounded-sm bg-slate-800 px-2 py-2 text-slate-200"
            :aria-label="t('fontName')"
            :aria-invalid="!!rowErrors[font.id]"
            :disabled="!!rowBusy"
            @keydown.esc="editingId = null"
          />
          <button
            type="submit"
            class="rounded-sm bg-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600 disabled:opacity-50"
            :disabled="!!rowBusy || listsPending"
          >
            {{ t('save') }}
          </button>
          <button
            type="button"
            class="rounded-sm px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 disabled:opacity-50"
            :disabled="!!rowBusy"
            @click="editingId = null"
          >
            {{ t('cancel') }}
          </button>
        </form>
        <p
          v-if="rowErrors[font.id]"
          role="alert"
          class="mt-1 text-sm text-red-300"
        >
          {{ t(rowErrors[font.id]) }}
        </p>
      </li>
    </ul>
  </section>
</template>

<script lang="ts" setup>
import {
  useCustomFonts,
  useGoogleFonts,
  useSystemFonts,
} from '@/composables/fonts';
import { CustomFontError } from '@/utils/fontFile';
import type { CustomFontErrorCode } from '@/utils/fontFile';

const { t } = useI18n({ useScope: 'local' });
const { fonts, pending, add, rename, remove } = useCustomFonts();
const google = useGoogleFonts();
const system = useSystemFonts();
const listsPending = computed(
  () => google.pending.value || system.pending.value,
);
const takenNames = computed(() => [
  ...system.uniqFonts.value,
  ...google.list.value.map((font) => font.family),
]);
const fileInput = ref<HTMLInputElement | null>(null);
const busy = ref(false);
const rowBusy = ref<string | null>(null);
const disabled = computed(
  () => listsPending.value || pending.value || busy.value || !!rowBusy.value,
);
const dragDepth = ref(0);
const editingId = ref<string | null>(null);
const newName = ref('');
const uploadErrors = ref<{ fileName: string; key: string }[]>([]);
const rowErrors = ref<Record<string, string>>({});
const errorKeys: Record<CustomFontErrorCode, string> = {
  'too-large': 'tooLarge',
  'quota-exceeded': 'quotaExceeded',
  'unsupported-format': 'unsupportedFormat',
  'invalid-font': 'invalidFont',
  'storage-failed': 'storageFailed',
  'name-taken': 'nameTaken',
};
const errorKey = (error: unknown) =>
  error instanceof CustomFontError ? errorKeys[error.code] : 'unknownError';

const upload = async (files: File[]) => {
  if (disabled.value) return;
  busy.value = true;
  uploadErrors.value = [];
  try {
    for (const file of files) {
      try {
        await add(file, takenNames.value);
      } catch (error) {
        uploadErrors.value.push({
          fileName: file.name,
          key: errorKey(error),
        });
      }
    }
  } finally {
    busy.value = false;
  }
};

const onFiles = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  await upload(files);
};
const onDrop = async (event: DragEvent) => {
  dragDepth.value = 0;
  await upload(Array.from(event.dataTransfer?.files ?? []));
};
const startRename = (id: string, family: string) => {
  editingId.value = id;
  newName.value = family;
  delete rowErrors.value[id];
};
const saveRename = async (id: string) => {
  if (rowBusy.value || listsPending.value) return;
  rowBusy.value = id;
  delete rowErrors.value[id];
  try {
    await rename(id, newName.value, takenNames.value);
    editingId.value = null;
  } catch (error) {
    rowErrors.value[id] = errorKey(error);
  } finally {
    rowBusy.value = null;
  }
};
const deleteFont = async (id: string) => {
  rowBusy.value = id;
  delete rowErrors.value[id];
  try {
    await remove(id);
    if (editingId.value === id) editingId.value = null;
  } catch (error) {
    rowErrors.value[id] = errorKey(error);
  } finally {
    rowBusy.value = null;
  }
};
</script>

<i18n lang="json">
{
  "en": {
    "customFonts": "Custom fonts",
    "upload": "Upload font",
    "loading": "Loading font lists…",
    "uploading": "Uploading…",
    "dropHint": "or drop font files here",
    "privacy": "Files stay in your browser (Chromium only)",
    "kb": "KB",
    "rename": "Rename",
    "delete": "Delete",
    "fontName": "Font name",
    "save": "Save",
    "cancel": "Cancel",
    "failedToLoad": "Failed to load",
    "tooLarge": "File is too large (maximum 20 MB).",
    "quotaExceeded": "Storage limit reached (10 fonts / 100 MB).",
    "unsupportedFormat": "Unsupported format. Use WOFF2, WOFF, TTF or OTF.",
    "invalidFont": "Invalid font: the browser could not load this file.",
    "storageFailed": "Could not save changes in browser storage.",
    "nameTaken": "Name is empty or already taken. Choose another name.",
    "unknownError": "An unexpected error occurred."
  },
  "ru": {
    "customFonts": "Пользовательские шрифты",
    "upload": "Загрузить шрифт",
    "loading": "Загрузка списков шрифтов…",
    "uploading": "Загрузка…",
    "dropHint": "или перетащите файлы шрифтов сюда",
    "privacy": "Файлы остаются в вашем браузере (только Chromium)",
    "kb": "КБ",
    "rename": "Переименовать",
    "delete": "Удалить",
    "fontName": "Имя шрифта",
    "save": "Сохранить",
    "cancel": "Отмена",
    "failedToLoad": "Не удалось загрузить",
    "tooLarge": "Файл слишком большой (не более 20 МБ).",
    "quotaExceeded": "Достигнут лимит хранения (10 шрифтов / 100 МБ).",
    "unsupportedFormat": "Неподдерживаемый формат. Используйте WOFF2, WOFF, TTF или OTF.",
    "invalidFont": "Некорректный шрифт: браузер не смог загрузить файл.",
    "storageFailed": "Не удалось сохранить изменения в браузере.",
    "nameTaken": "Имя пустое или уже занято. Выберите другое имя.",
    "unknownError": "Произошла непредвиденная ошибка."
  }
}
</i18n>
