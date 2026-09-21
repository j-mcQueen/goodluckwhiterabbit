// The plain pipeline fetches through generatePortfolioUrls, which spills
// forward into whatever groups follow - including ones with memos, whose
// layout (memo entries interleaved with images) it knows nothing about.
// Splits a plain batch at the first image belonging to a memo group so the
// caller can render everything before it as plain and hand that group over
// to the layout-aware pipeline instead of showing its images memo-less.
export const truncateAtMemoGroup = <T extends { group: string }>(
  images: T[],
  isMemoGroup: (groupId: string) => boolean,
): { kept: T[]; memoGroupId?: string } => {
  const index = images.findIndex((image) => isMemoGroup(image.group));
  return index === -1
    ? { kept: images }
    : { kept: images.slice(0, index), memoGroupId: images[index].group };
};
