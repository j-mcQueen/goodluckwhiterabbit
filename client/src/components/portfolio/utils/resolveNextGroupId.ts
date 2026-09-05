import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

// mirrors generatePortfolioUrls' own `order`-sorted walk
// (backend/controllers/global/global.js) client-side: menu is already
// order-sorted by the taxonomy loader, so "next group" is just the next
// entry in that same list. Returns undefined at the end of a subcategory -
// there is nothing to advance to (forward-only, v1 scope).
export const resolveNextGroupId = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subIndex: number,
  currentGroupId: string,
): string | undefined => {
  const menu = sidebarData[route]?.menu[subIndex] ?? {};
  const groupIds = Object.values(menu);
  const currentIndex = groupIds.indexOf(currentGroupId);

  if (currentIndex === -1 || currentIndex === groupIds.length - 1) return undefined;
  return groupIds[currentIndex + 1];
};
