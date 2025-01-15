import { v4 as uuidv4 } from "uuid";

export const generateKeys = () => {
  const keys = [];
  for (let i = 0; i < 10; i++) {
    const key = uuidv4();
    keys.push(key);
  }
  return keys;
};
