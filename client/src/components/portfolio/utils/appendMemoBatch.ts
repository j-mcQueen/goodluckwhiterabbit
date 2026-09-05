import { v4 as uuidv4 } from "uuid";
import { PortfolioBlock, PortfolioMemoBlock } from "../types/PortfolioBlock";
import { PortfolioLayoutEntry } from "../../global/utils/splitPortfolioLayoutIntoSegments";

// Upserts one fetched batch into the memo-aware block for groupId: merges
// into the tail block if it's already that same group (a later batch of an
// in-progress group), otherwise opens a new block (that group's first
// batch) - mirrors appendPlainImages' "extend tail if same kind, else open
// a new one" pattern, just keyed by groupId instead of block kind alone.
export const appendMemoBatch = (
  blocks: PortfolioBlock[],
  groupId: string,
  batch: { entries: PortfolioLayoutEntry[]; blobsByKey: Map<string, Blob>; stored: number },
): PortfolioBlock[] => {
  const newUrls = new Map<string, string>();
  batch.blobsByKey.forEach((blob, key) => newUrls.set(key, URL.createObjectURL(blob)));

  const tail = blocks[blocks.length - 1];

  if (tail?.kind === "memo-aware" && tail.groupId === groupId) {
    const merged: PortfolioMemoBlock = {
      ...tail,
      entries: [...tail.entries, ...batch.entries],
      stored: batch.stored,
      nextStart: tail.entries.length + batch.entries.length,
      urlsByKey: new Map([...tail.urlsByKey, ...newUrls]),
    };
    return [...blocks.slice(0, -1), merged];
  }

  const newBlock: PortfolioMemoBlock = {
    kind: "memo-aware",
    blockKey: uuidv4(),
    groupId,
    entries: batch.entries,
    stored: batch.stored,
    nextStart: batch.entries.length,
    urlsByKey: newUrls,
  };
  return [...blocks, newBlock];
};
