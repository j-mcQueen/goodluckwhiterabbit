import { Dispatch, SetStateAction } from "react";

export const generateFileBatch = async (
  images: { urls: string[]; files: File[] },
  start: number,
  setNewCount: Dispatch<SetStateAction<number>> | undefined,
  setNewFiles: Dispatch<SetStateAction<object>>
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
    setNewFiles({ urls: images.urls, files: newFiles });

    counter++;
    if (setNewCount !== undefined) setNewCount(counter);

    if (i === 9 || i === images.urls.length - 1) break;
  }
  return { files: newFiles, count: counter };
};
