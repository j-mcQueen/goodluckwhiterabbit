export const convertToFile = (url: string, filename: string, mime: string) => {
  // https://medium.com/@impulsejs/convert-dataurl-to-a-file-in-javascript-1921b8c3f4b
  const parts = url.split(",");
  const b64 = atob(parts[parts.length - 1]); // get the base 64 string
  let n = b64.length;
  const u8 = new Uint8Array(n); // initialize the best performing and most file compatible data type for new File object creation

  while (n--) {
    u8[n] = b64.charCodeAt(n); // replace character with integer
  }

  return new File([u8], filename, { type: mime });
};
