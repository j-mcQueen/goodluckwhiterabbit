import { v4 as uuidv4 } from "uuid";

export const generateKeys = (len: number) => {
  const keys = [];
  for (let i = 0; i < len; i++) {
    const key = uuidv4();
    keys.push(key);
  }
  return keys;
};
