import {
  packPortfolioRun,
  RunImageItem,
  RunPacking,
} from "./packPortfolioRun";

// Splits a group's full layout sequence into render segments, bounded by
// memos and by the group's own start/end (spec §2.1). Also resolves widow
// pairing: a run's trailing row, if it doesn't fill 3 columns, is a widow
// and - since a widow can by definition only occur immediately before a
// hard boundary - is always followed by a memo, except possibly the
// group's absolute final run, which has no following memo to pair with and
// stays a plain short row. One rule, applied uniformly at every boundary,
// not special-cased per direction (see spec §2.1 for the full reasoning).

export type PortfolioLayoutImageEntry = {
  type: "image";
  key: string;
  ratio: number; // defaults to 1 before the image has loaded
};

export type PortfolioLayoutMemoEntry = {
  type: "memo";
  key: string;
  memoId: string;
  html: string;
};

export type PortfolioLayoutEntry = PortfolioLayoutImageEntry | PortfolioLayoutMemoEntry;

export type PortfolioRunSegment = {
  kind: "run";
  images: PortfolioLayoutImageEntry[];
  packing: RunPacking;
};

export type PortfolioWidowImage = PortfolioLayoutImageEntry & { columnSpan: 1 | 2 };

export type PortfolioMemoSegment = {
  kind: "memo";
  memoId: string;
  html: string;
  // images pulled out of the preceding run's trailing widow row, to be
  // rendered paired/co-centered with this memo instead of as grid cells -
  // empty when the memo is a group/subgroup intro (nothing precedes it) or
  // when the preceding run's trailing row happened to fill evenly
  pairedWidowImages: PortfolioWidowImage[];
};

export type PortfolioLayoutSegment = PortfolioRunSegment | PortfolioMemoSegment;

const toRunItems = (images: PortfolioLayoutImageEntry[]): RunImageItem[] =>
  images.map((image) => ({ key: image.key, ratio: image.ratio }));

const packImages = (images: PortfolioLayoutImageEntry[]): PortfolioRunSegment => ({
  kind: "run",
  images,
  packing: packPortfolioRun(toRunItems(images)),
});

export const splitPortfolioLayoutIntoSegments = (
  entries: PortfolioLayoutEntry[],
): PortfolioLayoutSegment[] => {
  const segments: PortfolioLayoutSegment[] = [];
  let pendingImages: PortfolioLayoutImageEntry[] = [];

  const flushRunBeforeMemo = (memo: PortfolioLayoutMemoEntry) => {
    if (pendingImages.length === 0) {
      // group/subgroup intro memo - nothing precedes it, zero widow risk
      segments.push({ kind: "memo", memoId: memo.memoId, html: memo.html, pairedWidowImages: [] });
      return;
    }

    const runSegment = packImages(pendingImages);
    pendingImages = [];

    if (!runSegment.packing.isWidowRow) {
      segments.push(runSegment);
      segments.push({ kind: "memo", memoId: memo.memoId, html: memo.html, pairedWidowImages: [] });
      return;
    }

    const widowKeySet = new Set(runSegment.packing.widowKeys);
    const columnSpanByKey = new Map(
      runSegment.packing.placements.map((placement) => [placement.key, placement.columnSpan]),
    );
    const nonWidowImages = runSegment.images.filter((image) => !widowKeySet.has(image.key));
    const widowImages: PortfolioWidowImage[] = runSegment.images
      .filter((image) => widowKeySet.has(image.key))
      .map((image) => ({ ...image, columnSpan: columnSpanByKey.get(image.key) ?? 1 }));

    if (nonWidowImages.length > 0) {
      segments.push(packImages(nonWidowImages));
    }
    segments.push({
      kind: "memo",
      memoId: memo.memoId,
      html: memo.html,
      pairedWidowImages: widowImages,
    });
  };

  for (const entry of entries) {
    if (entry.type === "image") {
      pendingImages.push(entry);
    } else {
      flushRunBeforeMemo(entry);
    }
  }

  // the group's absolute final run, if any - its trailing widow row (if
  // short) has no following memo to pair with, so it stays a plain short
  // row exactly as it behaves today (spec §2.1)
  if (pendingImages.length > 0) {
    segments.push(packImages(pendingImages));
  }

  return segments;
};
