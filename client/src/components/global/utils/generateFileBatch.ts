export const generateFileBatch = async (
  images: { urls: string[]; files: object[] },
  start: number
) => {
  let counter = 0;
  const newFiles =
    start < 10 ? images.files : [...images.files, ...Array(10).fill({})];

  for (let i = 0; i < images.urls.length; i++) {
    // get the index
    const indexRegex = /\/(\d{1,3})\//;
    const index = images.urls[i].match(indexRegex);

    // convert presigned url to file
    const response = await fetch(images.urls[i], { method: "GET" });
    const blob = await response.blob();

    newFiles[Number(index![1])] = blob;
    counter++;

    if (i === 9 || i === images.urls.length - 1) break;
  }
  return { files: newFiles, count: counter };
};
