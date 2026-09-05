// Packing placement (packPortfolioRun.ts) needs each image's aspect ratio
// up front, unlike the untouched grid (Unit.tsx) which measures on <img>
// onLoad and lets CSS reactively re-flow around the class change. Since the
// memo-aware path already fetches every blob in a batch before rendering it
// (see fetchPortfolioLayoutBatch.ts), ratios are measured the same way, up
// front, so a batch's segments only need to be computed once.
export const measurePortfolioImageRatio = async (blob: Blob): Promise<number> => {
  try {
    const bitmap = await createImageBitmap(blob);
    const ratio = bitmap.height > 0 ? bitmap.width / bitmap.height : 1;
    bitmap.close();
    return ratio;
  } catch (error) {
    return 1; // defaults to portrait/square (span 1), matching Unit.tsx's initial state
  }
};
