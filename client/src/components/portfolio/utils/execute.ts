// sister to executeGenerationChain
import { Dispatch, SetStateAction } from "react";
import { generatePortfolioBatch } from "./generatePortfolioBatch";
import { generatePortfolioGetUrls } from "./generatePortfolioGetUrls";

export const execute = async (
  category: string,
  group: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >,
  size: string,
  start: number,
  sub: string,
) => {
  const data = await generatePortfolioGetUrls(
    category,
    group, // "001" / "010" / "111"
    setNotice,
    size,
    start,
    sub,
  );

  return data.files === false
    ? []
    : await generatePortfolioBatch({
        keys: data.keys,
        urls: data.presigns,
      });
};
