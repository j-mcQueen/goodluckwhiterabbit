import { Dispatch, SetStateAction } from "react";
import { generateImagesetGetUrls } from "./generateImagesetGetUrls";
import { generateFileBatch } from "./generateFileBatch";

export const executeGenerationChain = async (
  files: object[],
  targetImageset: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >,
  counter: number,
  endPoint: number,
  id: string | undefined,
  size: string,
  // optional, used by the admin ordering grid's progressive reveal - other
  // callers (portfolio, user dashboard) omit it; see generateFileBatch.ts
  onItemLoaded?: (index: number, blob: Blob) => void,
) => {
  const urls = await generateImagesetGetUrls(
    counter,
    endPoint,
    targetImageset,
    setNotice,
    id,
    size,
  );

  if (urls.files === false) return { stored: 0, files: false, count: 0 };

  const newFileData = await generateFileBatch(
    {
      urls: urls.presigns,
      files,
    },
    counter,
    onItemLoaded,
  );

  return { ...newFileData, stored: urls.stored };
};
