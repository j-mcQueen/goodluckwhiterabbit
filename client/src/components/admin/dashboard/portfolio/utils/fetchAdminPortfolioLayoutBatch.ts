import { determineHost as host } from "../../../../global/utils/determineHost";
import { measurePortfolioImageRatio } from "../../../../global/memo/measurePortfolioImageRatio";
import { PortfolioLayoutEntry } from "../../../../global/utils/splitPortfolioLayoutIntoSegments";

type LayoutApiItem =
  | { type: "image"; position: number; url: string }
  | { type: "memo"; memoId: string; html: string };

// Admin counterpart to fetchFullPortfolioLayout.ts (public site), but
// fetches a single page at a time rather than looping to completion - large
// groups (50+ full-resolution images) shouldn't all be fetched and decoded
// into memory just to open the admin grid. Used by PortfolioAdminGrid.tsx,
// which accumulates pages itself and exposes a "load next batch" affordance
// instead of loading everything up front.
export const fetchAdminPortfolioLayoutBatch = async (
  category: string,
  sub: string,
  groupId: string,
  start: number,
): Promise<{
  entries: PortfolioLayoutEntry[];
  blobsByKey: Map<string, Blob>;
  stored: number;
} | null> => {
  const response = await fetch(
    `${host}/admin/portfolio/${category}/${sub}/${groupId}/layout/sm/${start}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    },
  );

  if (response.status !== 200) return null;
  const data = await response.json();
  if (!Array.isArray(data.items)) return null;

  const entries: PortfolioLayoutEntry[] = [];
  const blobsByKey = new Map<string, Blob>();

  for (const item of data.items as LayoutApiItem[]) {
    if (item.type === "memo") {
      entries.push({ type: "memo", key: item.memoId, memoId: item.memoId, html: item.html });
      continue;
    }

    const key = String(item.position);
    const imageResponse = await fetch(item.url);
    const blob = await imageResponse.blob();
    const ratio = await measurePortfolioImageRatio(blob);

    blobsByKey.set(key, blob);
    entries.push({ type: "image", key, ratio });
  }

  return { entries, blobsByKey, stored: data.stored };
};
