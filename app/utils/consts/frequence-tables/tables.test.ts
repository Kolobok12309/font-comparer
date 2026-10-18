import { describe, expect, it } from 'vitest';
import en from './en.json';
import ru from './ru.json';

describe('frequency tables', () => {
  it('contains 26 English letters with frequencies between 0 and 1', () => {
    expect(Object.keys(en)).toHaveLength(26);
    expect(Object.values(en).every((value) => value > 0 && value < 1)).toBe(
      true,
    );
  });

  it('contains 33 Russian letters with frequencies between 0 and 1', () => {
    expect(Object.keys(ru)).toHaveLength(33);
    expect(Object.values(ru).every((value) => value > 0 && value < 1)).toBe(
      true,
    );
  });
});
