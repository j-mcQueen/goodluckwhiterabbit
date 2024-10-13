import { Dispatch, SetStateAction } from "react";
import { generateImagesetGetUrls } from "./generateImagesetGetUrls";
import { generateFileBatch } from "./generateFileBatch";

export const executeGenerationChain = async (
  files: object[],
  targetImageset: string,
  setNotice: Dispatch<SetStateAction<object>>,
  counter: number,
  endPoint: number,
  id: string | undefined
) => {
  const urls = await generateImagesetGetUrls(
    counter,
    endPoint,
    targetImageset,
    setNotice,
    id
  );

  const newFileData = await generateFileBatch(
    {
      urls,
      files,
    },
    counter
  );

  return newFileData;
};
