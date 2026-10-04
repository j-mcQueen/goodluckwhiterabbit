import { PortfolioSidebarData } from "../types/PortfolioSidebarData";
import { toGroupSlug, toSubSlug } from "../../global/utils/portfolioSlug";

// a group whose name has no slug-able characters (only possible for groups
// created before slugs were validated) falls back to its groupId so it
// still gets a non-empty, stable URL segment
const groupSegment = (name: string, groupId: string) => toGroupSlug(name) || groupId;

// URL -> position. Unknown or missing slugs fall back to the first
// subcategory/group (an old link to a since-renamed group still lands
// somewhere sensible); the caller canonicalizes the URL afterwards.
// Returns undefined until the taxonomy has loaded a subcategory for this
// route. groupIndex/groupId are undefined when the subcategory is empty.
export const resolvePortfolioSlugs = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subParam: string | undefined,
  groupParam: string | undefined,
): { subIndex: number; groupIndex?: number; groupId?: string } | undefined => {
  const data = sidebarData[route];
  if (!data || data.subcategories.length === 0) return undefined;

  const foundSub = subParam
    ? data.subcategories.findIndex((name) => toSubSlug(name) === subParam.toLowerCase())
    : -1;
  const subIndex = foundSub === -1 ? 0 : foundSub;

  const entries = Object.entries(data.menu[subIndex] ?? {});
  if (entries.length === 0) return { subIndex };

  const foundGroup = groupParam
    ? entries.findIndex(([name, id]) => groupSegment(name, id) === groupParam.toLowerCase())
    : -1;
  const groupIndex = foundGroup === -1 ? 0 : foundGroup;

  return { subIndex, groupIndex, groupId: entries[groupIndex][1] };
};

// position -> URL, the inverse of resolvePortfolioSlugs
export const buildPortfolioPath = (
  sidebarData: PortfolioSidebarData,
  route: string,
  subIndex: number,
  groupIndex?: number,
): string => {
  const data = sidebarData[route];
  const subName = data?.subcategories[subIndex];
  if (!subName) return route;

  const subPath = `${route}/${toSubSlug(subName)}`;
  const entry =
    groupIndex === undefined ? undefined : Object.entries(data.menu[subIndex] ?? {})[groupIndex];

  return entry ? `${subPath}/${groupSegment(entry[0], entry[1])}` : subPath;
};
