import {
  packPortfolioRun,
  RunImageItem,
  RunPacking,
} from "./packPortfolioRun";

// Splits a group's full layout sequence into render segments, bounded by
// memos and by the group's own start/end (spec §2.1). Also resolves widow
// pairing: a run's trailing row, if it doesn't fill 3 columns, is a widow.
// Mid-sequence, a widow is always immediately followed by a memo in the
// same group, and pairs with it (PortfolioMemoSegment.pairedWidowImages).
// The group's absolute final run has no such memo within the group to pair
// with - if the *next group* has one, the caller passes endsBeforeMemo so
// this still centers the widow (PortfolioWidowSegment, no memo attached,
// since that memo renders in a separate block entirely); otherwise it
// stays a plain short row, exactly as before this existed.

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

// A widow row centered with no memo of its own - the pairing memo lives in
// the next group's separate block (see endsBeforeMemo above).
export type PortfolioWidowSegment = {
  kind: "widow";
  images: PortfolioWidowImage[];
};

export type PortfolioLayoutSegment = PortfolioRunSegment | PortfolioMemoSegment | PortfolioWidowSegment;

const toRunItems = (images: PortfolioLayoutImageEntry[]): RunImageItem[] =>
  images.map((image) => ({ key: image.key, ratio: image.ratio }));

const packImages = (images: PortfolioLayoutImageEntry[]): PortfolioRunSegment => ({
  kind: "run",
  images,
  packing: packPortfolioRun(toRunItems(images)),
});

// splits a packed run's trailing widow row out from the rest of it -
// shared by the mid-sequence (paired with a same-group memo) and
// end-of-group (paired with nothing, or a cross-group memo) cases
const splitWidowFromRun = (
  runSegment: PortfolioRunSegment,
): { nonWidowImages: PortfolioLayoutImageEntry[]; widowImages: PortfolioWidowImage[] } => {
  const widowKeySet = new Set(runSegment.packing.widowKeys);
  const columnSpanByKey = new Map(
    runSegment.packing.placements.map((placement) => [placement.key, placement.columnSpan]),
  );
  const nonWidowImages = runSegment.images.filter((image) => !widowKeySet.has(image.key));
  const widowImages: PortfolioWidowImage[] = runSegment.images
    .filter((image) => widowKeySet.has(image.key))
    .map((image) => ({ ...image, columnSpan: columnSpanByKey.get(image.key) ?? 1 }));

  return { nonWidowImages, widowImages };
};

export const splitPortfolioLayoutIntoSegments = (
  entries: PortfolioLayoutEntry[],
  endsBeforeMemo = false,
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

    const { nonWidowImages, widowImages } = splitWidowFromRun(runSegment);

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

  if (pendingImages.length > 0) {
    const runSegment = packImages(pendingImages);

    if (endsBeforeMemo && runSegment.packing.isWidowRow) {
      const { nonWidowImages, widowImages } = splitWidowFromRun(runSegment);
      if (nonWidowImages.length > 0) segments.push(packImages(nonWidowImages));
      segments.push({ kind: "widow", images: widowImages });
    } else {
      // no memo follows (in this group or, per endsBeforeMemo, the next
      // one either) - stays a plain short row, exactly as before this existed
      segments.push(runSegment);
    }
  }

  return segments;
};
