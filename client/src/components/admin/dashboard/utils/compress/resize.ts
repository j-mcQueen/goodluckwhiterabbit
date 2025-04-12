export const resize = async (
  file: File,
  type: string,
  scalarI: number,
  scalarJ: number,
  scalarK: number
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { alpha: false });

  const imageUrl = URL.createObjectURL(file);
  const img = new Image();

  await new Promise<void>((resolve, reject) => {
    // promise ensures conversion to dataURL always receives a value
    img.onload = () => {
      URL.revokeObjectURL(imageUrl);
      const oc = document.createElement("canvas");
      const octx = oc.getContext("2d", { alpha: false });

      canvas.width = img.width * scalarI; // target width -> determines size of final image
      canvas.height = canvas.width * (img.height / img.width);

      let cur = {
        width: Math.floor(img.width * scalarJ),
        height: Math.floor(img.height * scalarJ),
      };

      oc.width = cur.width;
      oc.height = cur.height;

      octx?.drawImage(img, 0, 0, cur.width, cur.height);

      while (cur.width * scalarJ > img.width * scalarI) {
        // ensure right operand in conditional matches target width above
        cur = {
          width: Math.floor(cur.width * scalarJ),
          height: Math.floor(cur.height * scalarJ),
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
      oc.remove();
      resolve();
    };
    img.onerror = reject;
    if (typeof imageUrl === "string") img.src = imageUrl;
  });
  const url = canvas.toDataURL(type, scalarK);
  canvas.remove();
  return url;
};
