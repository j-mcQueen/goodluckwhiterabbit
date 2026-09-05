import { PortfolioBlock } from "../types/PortfolioBlock";

// Patches a plain block (found by blockKey, not necessarily still the
// tail) with its accurately-computed trailing widow keys once
// computeTrailingWidowKeys resolves - see handlePortfolioIntersection.ts
// for where this is called, right after the block closes.
export const applyTrailingWidowKeys = (
  blocks: PortfolioBlock[],
  blockKey: string,
  widowKeys: string[],
): PortfolioBlock[] =>
  blocks.map((block) =>
    block.kind === "plain" && block.blockKey === blockKey
      ? { ...block, trailingWidowKeys: widowKeys }
      : block,
  );
