import { measurePortfolioImageRatio } from "../../global/memo/measurePortfolioImageRatio";
import { packPortfolioRun } from "../../global/utils/packPortfolioRun";

// Accurately determines which of a (now-closed) plain block's images make
// up its trailing widow row, by measuring their real aspect ratios and
// running them through the exact same packing simulation memo-aware runs
// already use - rather than guessing from `images.length % 3`, which
// silently breaks the moment a landscape (2-column) image appears anywhere
// earlier in the sequence and shifts which images actually land in the
// last row. Cheap to do here: every blob is already downloaded and in
// memory, so this is a local decode, not a network fetch, and it only
// happens once, at the exact moment the block stops growing (see
// handlePortfolioIntersection.ts).
export const computeTrailingWidowKeys = async (
  images: { blob: Blob; key: string }[],
): Promise<string[]> => {
  if (images.length === 0) return [];

  const ratios = await Promise.all(images.map((image) => measurePortfolioImageRatio(image.blob)));
  const packing = packPortfolioRun(images.map((image, i) => ({ key: image.key, ratio: ratios[i] })));

  return packing.isWidowRow ? packing.widowKeys : [];
};
