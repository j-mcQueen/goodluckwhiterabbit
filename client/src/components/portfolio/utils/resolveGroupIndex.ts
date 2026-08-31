import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

// inverse of resolveGroupId.ts - given a real groupId (e.g. from the image
// that just scrolled into view), finds its position in the order-sorted
// menu list, purely for sidebar/nav highlighting. Never used for
// data-fetching decisions - the real groupId itself is authoritative there.
export const resolveGroupIndex = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subIndex: number,
  groupId: string,
): number | undefined => {
  const menu = sidebarData[route]?.menu[subIndex] ?? {};
  const index = Object.values(menu).indexOf(groupId);
  return index === -1 ? undefined : index;
};
