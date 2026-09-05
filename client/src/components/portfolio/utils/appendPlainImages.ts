import { v4 as uuidv4 } from "uuid";
import { PortfolioBlock } from "../types/PortfolioBlock";

// concatenates into the tail block if it's already "plain" (the common
// case - a plain block spans as many consecutive memo-less groups as
// pagination walks through), otherwise opens a new one. Each image gets
// its own key here rather than via a separate parallel staticKeys array.
export const appendPlainImages = (
  blocks: PortfolioBlock[],
  newImages: { blob: Blob; group: string }[],
): PortfolioBlock[] => {
  if (newImages.length === 0) return blocks;

  const keyedImages = newImages.map((image) => ({ ...image, key: uuidv4() }));
  const tail = blocks[blocks.length - 1];

  if (tail?.kind === "plain") {
    const patchedTail: PortfolioBlock = { ...tail, images: [...tail.images, ...keyedImages] };
    return [...blocks.slice(0, -1), patchedTail];
  }

  return [...blocks, { kind: "plain", blockKey: uuidv4(), images: keyedImages }];
};
