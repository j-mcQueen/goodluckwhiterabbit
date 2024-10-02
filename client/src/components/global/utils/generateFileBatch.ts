export const generateFileBatch = async (
  images: { urls: string[]; files: object[] },
  start: number
) => {
  let counter = start;
  const newFiles = images.files;

  for (let i = 0; i < images.urls.length; i++) {
    // get the file name
    const filenameRegex = /\/([^/?]+)\?/; // match the substring between "/" and "?"
    const filename = images.urls[counter].match(filenameRegex);

    // convert presigned url to file
    const response = await fetch(images.urls[counter], { method: "GET" });
    const data = await response.blob();
    const file = new File([data], filename![1], { type: data.type });

    newFiles.push(file);
    counter++;

    if (i === 9 || i === images.urls.length - 1) break;
  }
  return { files: newFiles, count: counter };
};
