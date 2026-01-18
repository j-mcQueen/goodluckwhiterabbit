// sister to executeGenerationChain
import { Dispatch, SetStateAction } from "react";
import { generatePortfolioBatch } from "./generatePortfolioBatch";
import { generatePortfolioGetUrls } from "./generatePortfolioGetUrls";

export const execute = async (
  category: string,
  existingFiles: { [key: string]: Blob[] },
  group: string,
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string }>
  >,
  size: string,
  start: number,
  sub: string
) => {
  const data = await generatePortfolioGetUrls(
    category,
    group, // "001" / "010" / "111"
    setNotice,
    size,
    start,
    sub
  );

  if (data.files === false) return { stored: 0, files: false };

  return await generatePortfolioBatch({
    existingFiles,
    keys: data.keys,
    urls: data.urls,
  });
};
