import { determineHost as host } from "../utils/determineHost";
import { measurePortfolioImageRatio } from "./measurePortfolioImageRatio";
import { PortfolioLayoutEntry } from "../utils/splitPortfolioLayoutIntoSegments";

type LayoutApiItem =
  | { type: "image"; position: number; url: string }
  | { type: "memo"; memoId: string; html: string };

// Loads a memo-managed group's full layout via generatePortfolioLayoutUrls,
// looping its 10-item-per-request batches (the endpoint's existing cap,
// matched from generatePortfolioGetUrls' convention) until exhausted, and
// resolves every image to a blob + measured ratio up front. Real group
// sizes here are small (largest today is 32 images - see the layout
// migration run), so loading a memo-managed group as one unit rather than
// replicating the existing infinite-scroll/intersection-observer machinery
// for this path is a deliberate scope decision, not an oversight - that
// machinery stays completely untouched for zero-memo groups (§2.1).
export const fetchFullPortfolioLayout = async (
  category: string,
  sub: string,
  groupId: string,
  size: "sm" | "lg",
): Promise<{ entries: PortfolioLayoutEntry[]; blobsByKey: Map<string, Blob> }> => {
  const entries: PortfolioLayoutEntry[] = [];
  const blobsByKey = new Map<string, Blob>();

  let start = 0;
  let stored = Infinity;

  while (entries.length < stored) {
    const response = await fetch(
      `${host}/portfolio/${category}/${sub}/${groupId}/layout/${size}/${start}`,
      { method: "GET", headers: { Accept: "application/json" }, credentials: "include" },
    );

    if (response.status !== 200) break;
    const data = await response.json();
    if (data.files === false || !Array.isArray(data.items)) break;

    stored = data.stored;
    const items = data.items as LayoutApiItem[];
    if (items.length === 0) break;

    for (const item of items) {
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

    start += 10;
  }

  return { entries, blobsByKey };
};
