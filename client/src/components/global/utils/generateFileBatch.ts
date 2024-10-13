export const generateFileBatch = async (
  images: { urls: string[]; files: object[] },
  start: number
) => {
  let counter = 0;
  const newFiles =
    start < 10 ? images.files : [...images.files, ...Array(10).fill({})];

  for (let i = 0; i < images.urls.length; i++) {
    // get the file name
    const filenameRegex = /\/([^/?]+)\?/; // match the substring between "/" and "?"
    const filename = images.urls[i].match(filenameRegex);

    // get the index
    const indexRegex = /\/(\d{1,3})\//;
    const index = images.urls[i].match(indexRegex);

    // convert presigned url to file
    const response = await fetch(images.urls[i], { method: "GET" });
    const data = await response.blob();
    const file = new File([data], filename![1], { type: data.type });

    newFiles[Number(index![1])] = file;
    counter++;

    if (i === 9 || i === images.urls.length - 1) break;
  }
  return { files: newFiles, count: counter };
};
