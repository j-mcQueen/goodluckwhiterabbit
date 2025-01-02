import { toBase64 } from "./toBase64";

export const resize = async (file: File, type: string) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const imageUrl = await toBase64(file);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    // promise ensures conversion to dataURL always receives a value
    img.onload = () => {
      const oc = document.createElement("canvas");
      const octx = oc.getContext("2d");

      canvas.width = img.width * (1 / 10); // target width -> determines size of final image
      canvas.height = canvas.width * (img.height / img.width);

      let cur = {
        width: Math.floor(img.width * 0.5),
        height: Math.floor(img.height * 0.5),
      };

      oc.width = cur.width;
      oc.height = cur.height;

      octx?.drawImage(img, 0, 0, cur.width, cur.height);

      while (cur.width * 0.5 > img.width * (1 / 10)) {
        // ensure right operand in conditional matches target width above
        cur = {
          width: Math.floor(cur.width * 0.5),
          height: Math.floor(cur.height * 0.5),
        };
        octx?.drawImage(
          oc,
          0,
          0,
          cur.width * 2,
          cur.height * 2,
          0,
          0,
          cur.width,
          cur.height
        );
      }

      ctx?.drawImage(
        oc,
        0,
        0,
        cur.width,
        cur.height,
        0,
        0,
        canvas.width,
        canvas.height
      );
      resolve();
    };
    img.onerror = reject;
    if (typeof imageUrl === "string") img.src = imageUrl;
  });
  const dUrl = canvas.toDataURL(type, 0.9);
  return dUrl;
};
