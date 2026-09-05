import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

// sibling to resolveGroupId.ts/resolveGroupIndex.ts - looks up the
// taxonomy's groupHasMemo map (index-aligned with menu, keyed by groupId)
// so callers can decide render/fetch strategy the instant a groupId is
// known, with no round trip (see checkPortfolioGroupHasMemo.ts, which this
// supersedes).
export const resolveGroupHasMemo = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subIndex: number,
  groupId: string,
): boolean => {
  const hasMemoMap = sidebarData[route]?.groupHasMemo[subIndex] ?? {};
  return Boolean(hasMemoMap[groupId]);
};
