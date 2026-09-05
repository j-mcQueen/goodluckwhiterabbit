import { Dispatch, SetStateAction } from "react";
import { mobile } from "../../global/utils/determineViewport";
import { handleIntersection } from "./handleIntersection";
import { resolveGroupHasMemo } from "./resolveGroupHasMemo";
import { appendPlainImages } from "./appendPlainImages";
import { appendMemoBatch } from "./appendMemoBatch";
import { computeTrailingWidowKeys } from "./computeTrailingWidowKeys";
import { applyTrailingWidowKeys } from "./applyTrailingWidowKeys";
import { fetchPortfolioLayoutBatch } from "../../global/memo/fetchPortfolioLayoutBatch";
import { PortfolioBlock } from "../types/PortfolioBlock";
import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

const TAB_CATEGORY: Record<number, string> = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };

// Wraps the existing handleIntersection (generatePortfolioUrls' plain,
// auto-spilling batch fetch, left completely untouched) with the reactive
// truncation described in the plan: if a batch crosses into a memo-having
// group, the already-downloaded blobs for that group's head are discarded
// (bounded, one-time per boundary) and that group's own first batch is
// fetched instead via fetchPortfolioLayoutBatch - from there it pages in
// exactly like a plain group, 10 items at a time (see
// handleMemoBlockIntersection for continuing/advancing past it).
export const handlePortfolioIntersection = async ({
  activeGroupId,
  activeSub,
  activeSubIndex,
  activeTab,
  inView,
  nextStartIndex,
  route,
  setBlocks,
  setNextStartIndex,
  setNotice,
  sidebarData,
}: {
  activeGroupId: string;
  activeSub: string;
  activeSubIndex: number;
  activeTab: number;
  inView: boolean;
  nextStartIndex: number;
  route: string;
  setBlocks: Dispatch<SetStateAction<PortfolioBlock[]>>;
  setNextStartIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string | null }>
  >;
  sidebarData: PortfolioSidebarData;
}) => {
  const result = await handleIntersection({
    activeGroupId,
    activeSub,
    activeTab,
    inView,
    nextStartIndex,
    setImages: () => {}, // blocks (setBlocks below) own state now, not a flat image list
    setNextStartIndex,
    setNotice,
    setStaticKeys: () => {}, // each block owns its own per-image keys instead
  });

  if (!result || result.length === 0) return;

  const boundaryIndex = result.findIndex(
    (item: { group: string }) => item.group !== activeGroupId,
  );

  if (boundaryIndex === -1) {
    setBlocks((prev) => appendPlainImages(prev, result));
    return;
  }

  const before = result.slice(0, boundaryIndex);
  const after = result.slice(boundaryIndex);
  const newGroupId = after[0].group;

  if (before.length > 0) {
    setBlocks((prev) => appendPlainImages(prev, before));
  }

  if (!resolveGroupHasMemo(sidebarData, route, activeSubIndex, newGroupId)) {
    setBlocks((prev) => appendPlainImages(prev, after));
    return;
  }

  // the plain pipeline is closing here (a memo block is about to be
  // appended right after it) - capture whatever plain block is currently
  // the tail, so its trailing widow row can be measured accurately now
  // that we know for certain nothing more will ever be appended to it
  let closedPlainBlock: Extract<PortfolioBlock, { kind: "plain" }> | undefined;
  setBlocks((prev) => {
    const tail = prev[prev.length - 1];
    if (tail?.kind === "plain") closedPlainBlock = tail;
    return prev;
  });

  // after's blobs belong to newGroupId but were fetched via the plain
  // pipeline (no memo awareness) - discard them, bounded/one-time per
  // boundary, and fetch this group's own first batch instead
  const category = TAB_CATEGORY[activeTab];
  const size = mobile ? "sm" : "lg";

  setNotice({ status: true, loading: true, message: "LOADING..." });
  const batch = await fetchPortfolioLayoutBatch(category, activeSub, newGroupId, size, 0, setNotice);
  setNotice({ status: false, loading: false, message: null });

  setBlocks((prev) => appendMemoBatch(prev, newGroupId, batch));

  if (closedPlainBlock) {
    const widowKeys = await computeTrailingWidowKeys(closedPlainBlock.images);
    if (widowKeys.length > 0) {
      const key = closedPlainBlock.blockKey;
      setBlocks((prev) => applyTrailingWidowKeys(prev, key, widowKeys));
    }
  }
};
