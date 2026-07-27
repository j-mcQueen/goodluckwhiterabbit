import { Dispatch, SetStateAction } from "react";
import { generatePortfolioAdminGetUrls } from "./generatePortfolioAdminGetUrls";
import { generatePortfolioOrderBatch } from "../../../../../portfolio/utils/generatePortfolioBatch";

// admin ordering-grid counterpart to executeGenerationChain.ts, sourcing
// presigned URLs from the scoped admin endpoint instead of the private
// client-gallery one.
export const executePortfolioOrderChain = async (
  files: (Blob | object)[],
  category: string,
  sub: string,
  groupId: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >,
  counter: number,
  size: string,
  onItemLoaded?: (position: number, blob: Blob) => void,
) => {
  const urls = await generatePortfolioAdminGetUrls(
    category,
    sub,
    groupId,
    size,
    counter,
    setNotice,
  );

  if (urls.files === false) return { stored: 0, files: false, count: 0 };

  const newFileData = await generatePortfolioOrderBatch(
    { keys: urls.keys, urls: urls.presigns, files },
    counter,
    onItemLoaded,
  );

  return { ...newFileData, stored: urls.stored };
};
