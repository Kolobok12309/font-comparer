import type { UnwrapNestedRefs, WritableComputedRef, UnwrapRef } from 'vue';
import { computed, unref } from 'vue';

type ExtractSimpleIterableKeys<T extends Record<string, any>> = Extract<
  keyof T,
  string | number
>;
type Keys<T extends Record<string, any>> = Array<ExtractSimpleIterableKeys<T>>;

export type UseMapSyncResult<MapValues extends Record<string, any>> = {
  [K in keyof MapValues]: WritableComputedRef<UnwrapRef<MapValues[K]>>;
};

type UseOptions = Record<string, any>;
type EmitFn<E extends string> = (event: E, ...args: any[]) => any;

export default <MapValues extends UseOptions, Emit>(
  emit: Emit extends EmitFn<infer Event> ? EmitFn<Event> : any,
  props: MapValues | UnwrapNestedRefs<MapValues>,
) => {
  const keys = Object.keys(props) as Keys<MapValues>;

  const refs = keys.reduce<UseMapSyncResult<MapValues>>((acc, key) => {
    acc[key] = computed({
      get: () => {
        return unref(props[key]);
      },
      set: (newVal) => {
        emit(`update:${String(key)}`, newVal);
      },
    });

    return acc;
  }, {} as UseMapSyncResult<MapValues>);

  return refs;
};
