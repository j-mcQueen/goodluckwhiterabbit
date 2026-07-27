// sister to executeGenerationChain
export const generatePortfolioBatch = async (data: {
  keys: string[];
  urls: string[];
}) => {
  const groupRegex = /\/(\d{3})\//;

  const nextFiles = await Promise.all(
    data.urls.map(async (url, i) => {
      // data.keys[i] corresponds to data.urls[i]
      const group = data.keys[i].match(groupRegex)![1];

      // convert presigned url to file
      const response = await fetch(url, { method: "GET" });
      const blob = await response.blob();

      return { blob, group };
    }),
  );

  return nextFiles;
};

// admin ordering-grid variant of the above - sequential (not Promise.all) so
// each image can progressively reveal into its own grid slot as it resolves,
// mirroring generateFileBatch.ts's contract for the private-gallery grid.
// Position is read from the key's trailing `_{position}.ext` suffix rather
// than the group folder, since portfolio images are addressed that way.
export const generatePortfolioOrderBatch = async (
  data: { keys: string[]; urls: string[]; files: (Blob | object)[] },
  start: number,
  onItemLoaded?: (position: number, blob: Blob) => void,
) => {
  const positionRegex = /_(\d{1,3})\.[^.]+$/;
  let counter = 0;
  const newFiles =
    start < 10 ? data.files : [...data.files, ...Array(10).fill({})];

  for (let i = 0; i < data.urls.length; i++) {
    const match = data.keys[i].match(positionRegex);
    if (!match) continue;

    const response = await fetch(data.urls[i], { method: "GET" });
    const blob = await response.blob();

    const position = Number(match[1]);
    newFiles[position] = blob;
    counter++;

    onItemLoaded?.(position, blob);

    if (i === 9 || i === data.urls.length - 1) break;
  }

  return { files: newFiles, count: counter };
};
