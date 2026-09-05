import { Dispatch, SetStateAction } from "react";
import { determineHost as host } from "../utils/determineHost";
import { measurePortfolioImageRatio } from "./measurePortfolioImageRatio";
import { PortfolioLayoutEntry } from "../utils/splitPortfolioLayoutIntoSegments";

type LayoutApiItem =
  | { type: "image"; position: number; url: string }
  | { type: "memo"; memoId: string; html: string };

type LayoutApiResponse =
  | { files: false }
  | { items: LayoutApiItem[]; stored: number; skipped?: string[] };

// Fetches exactly one batch (<=10 layout entries, images and/or memos
// mixed) from generatePortfolioLayoutUrls, for one group at one start
// offset - callers (handlePortfolioIntersection, handleMemoBlockIntersection,
// loadPortfolioBlocksForGroup) drive the cursor themselves, so a memo group
// pages in exactly like a plain one: 10 items per scroll-triggered batch,
// regardless of whether the group has a memo (this replaces the old
// fetchFullPortfolioLayout, which loaded a whole group as one unit).
//
// Per-image downloads within the batch run concurrently via
// Promise.allSettled rather than sequentially - one failed image (expired
// presign, network blip) no longer has to abort the rest of the batch. Both
// that failure mode and the backend's own `skipped` (entries it couldn't
// presign or find a memo doc for) are surfaced through the same notice
// message generatePortfolioGetUrls' `skipped` already uses for plain
// batches, rather than silently dropping content.
export const fetchPortfolioLayoutBatch = async (
  category: string,
  sub: string,
  groupId: string,
  size: "sm" | "lg",
  start: number,
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string | null }>
  >,
): Promise<{ entries: PortfolioLayoutEntry[]; blobsByKey: Map<string, Blob>; stored: number }> => {
  const empty = { entries: [], blobsByKey: new Map<string, Blob>(), stored: 0 };

  let data: LayoutApiResponse;
  try {
    const response = await fetch(
      `${host}/portfolio/${category}/${sub}/${groupId}/layout/${size}/${start}`,
      { method: "GET", headers: { Accept: "application/json" }, credentials: "include" },
    );
    if (response.status !== 200) return empty;
    data = await response.json();
  } catch (error) {
    return empty;
  }

  if ("files" in data && data.files === false) return empty;
  if (!("items" in data) || !Array.isArray(data.items)) return empty;

  const items = data.items;
  const skippedLabels: string[] = Array.isArray(data.skipped) ? [...data.skipped] : [];

  const settled = await Promise.allSettled(
    items.map(async (item) => {
      if (item.type === "memo") {
        return { type: "memo" as const, key: item.memoId, memoId: item.memoId, html: item.html };
      }
      const imageResponse = await fetch(item.url);
      const blob = await imageResponse.blob();
      const ratio = await measurePortfolioImageRatio(blob);
      return { type: "image" as const, key: String(item.position), ratio, blob };
    }),
  );

  const entries: PortfolioLayoutEntry[] = [];
  const blobsByKey = new Map<string, Blob>();

  settled.forEach((result, i) => {
    if (result.status === "rejected") {
      const item = items[i];
      skippedLabels.push(item.type === "memo" ? item.memoId : String(item.position));
      return;
    }

    const value = result.value;
    if (value.type === "memo") {
      entries.push({ type: "memo", key: value.key, memoId: value.memoId, html: value.html });
    } else {
      blobsByKey.set(value.key, value.blob);
      entries.push({ type: "image", key: value.key, ratio: value.ratio });
    }
  });

  if (skippedLabels.length > 0) {
    setNotice({
      status: true,
      loading: false,
      message: `We could not receive permission to retrieve these files: ${skippedLabels.join(" ")}`,
    });
  }

  return { entries, blobsByKey, stored: data.stored };
};
