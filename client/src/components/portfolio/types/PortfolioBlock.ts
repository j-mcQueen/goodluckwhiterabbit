import { PortfolioLayoutEntry } from "../../global/utils/splitPortfolioLayoutIntoSegments";

// Body.tsx renders an ordered sequence of these instead of one flat image
// list, so a memo-managed group crossed via organic infinite-scroll renders
// inline instead of falling back to the plain grid (see the plan for why).
// A "plain" block is exactly today's flat image list, scoped to a run of
// one or more consecutive memo-less groups; a "memo-aware" block is always
// exactly one memo-managed group, loaded 10 layout entries at a time (same
// batch size as a plain group) via fetchPortfolioLayoutBatch rather than as
// one atomic unit - a block is only ever appended once its first batch has
// resolved, so there's no separate "loading" status to track: entries
// simply accumulates across batches, and segments are derived from it at
// render time (see PortfolioMemoSegments.tsx).
export type PortfolioPlainBlock = {
  kind: "plain";
  blockKey: string;
  images: { blob: Blob; group: string; key: string }[];
  // keys of the images that make up this (now-closed) block's trailing
  // widow row, if any - only ever computed once, at the moment the block
  // is closed off by a following memo-aware block (see
  // computeTrailingWidowKeys.ts). A plain image's aspect ratio isn't known
  // until it loads, so this can't be guessed from count alone (a landscape
  // image anywhere earlier in the sequence shifts which images actually
  // land in the last row) - undefined while still open, or before the
  // async measurement resolves.
  trailingWidowKeys?: string[];
};

export type PortfolioMemoBlock = {
  kind: "memo-aware";
  blockKey: string;
  groupId: string;
  entries: PortfolioLayoutEntry[]; // accumulated so far, in layout order
  stored: number; // total layout entries in the group - entries.length >= stored means exhausted
  nextStart: number; // next layout-array index to fetch (== entries.length)
  urlsByKey: Map<string, string>;
};

export type PortfolioBlock = PortfolioPlainBlock | PortfolioMemoBlock;
