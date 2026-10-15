export const getRandomNum = (limit: number = 10000) =>
  Math.floor(Math.random() * limit);

const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charactersLength = characters.length;
export const getRandomString = (length: number = 10): string => {
  return Array.from({ length })
    .map(() => characters[getRandomNum(charactersLength)])
    .join('');
};
