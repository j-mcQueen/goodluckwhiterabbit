import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

// a group's position in the sidebar/nav (its index within a subcategory's
// menu, which is already sorted by the taxonomy's `order` field) is not the
// same thing as its S3 groupId - `order` is free to diverge from creation
// sequence (that's the whole point of letting an admin reorder groups), so
// callers must resolve the real groupId here rather than deriving it
// arithmetically (e.g. `index + 1`)
export const resolveGroupId = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subIndex: number,
  groupIndex: number,
): string | undefined => {
  const menu = sidebarData[route]?.menu[subIndex] ?? {};
  return Object.values(menu)[groupIndex];
};
