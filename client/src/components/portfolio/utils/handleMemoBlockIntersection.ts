import { Dispatch, SetStateAction } from "react";
import { mobile } from "../../global/utils/determineViewport";
import { resolveNextGroupId } from "./resolveNextGroupId";
import { resolveGroupHasMemo } from "./resolveGroupHasMemo";
import { appendPlainImages } from "./appendPlainImages";
import { appendMemoBatch } from "./appendMemoBatch";
import { execute } from "./execute";
import { fetchPortfolioLayoutBatch } from "../../global/memo/fetchPortfolioLayoutBatch";
import { PortfolioBlock } from "../types/PortfolioBlock";
import { PortfolioSidebarData } from "../types/PortfolioSidebarData";

const TAB_CATEGORY: Record<number, string> = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };

// Fires when the tail memo-aware block's last rendered element scrolls
// into view. Two cases, exactly mirroring how a plain group behaves at its
// own tail:
//  - group not yet exhausted (entries.length < stored): fetch that same
//    group's next batch and merge it in (appendMemoBatch upserts into the
//    same block).
//  - group exhausted: resolve whatever comes next in `order` sequence and
//    fetch ITS first batch - a plain execute() if it has no memo, or
//    fetchPortfolioLayoutBatch (opening a new block) if it does.
export const handleMemoBlockIntersection = async ({
  activeSub,
  activeSubIndex,
  activeTab,
  block,
  route,
  setBlocks,
  setNextStartIndex,
  setNotice,
  sidebarData,
}: {
  activeSub: string;
  activeSubIndex: number;
  activeTab: number;
  block: Extract<PortfolioBlock, { kind: "memo-aware" }>;
  route: string;
  setBlocks: Dispatch<SetStateAction<PortfolioBlock[]>>;
  setNextStartIndex: Dispatch<SetStateAction<number>>;
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string | null }>
  >;
  sidebarData: PortfolioSidebarData;
}) => {
  const category = TAB_CATEGORY[activeTab];
  const size = mobile ? "sm" : "lg";

  if (block.entries.length < block.stored) {
    setNotice({ status: true, loading: true, message: "LOADING..." });
    const batch = await fetchPortfolioLayoutBatch(
      category,
      activeSub,
      block.groupId,
      size,
      block.nextStart,
      setNotice,
    );
    setNotice({ status: false, loading: false, message: null });

    setBlocks((prev) => appendMemoBatch(prev, block.groupId, batch));
    return;
  }

  const nextGroupId = resolveNextGroupId(sidebarData, route, activeSubIndex, block.groupId);
  if (!nextGroupId) return; // end of subcategory - nothing to advance to (forward-only, v1 scope)

  if (!resolveGroupHasMemo(sidebarData, route, activeSubIndex, nextGroupId)) {
    setNotice({ status: true, loading: true, message: "LOADING..." });
    const nextImages = await execute(category, nextGroupId, setNotice, size, 0, activeSub);
    setNotice({ status: false, loading: false, message: null });

    if (nextImages.length > 0) {
      setNextStartIndex(nextImages.length);
      setBlocks((prev) => appendPlainImages(prev, nextImages));
    }
    return;
  }

  setNotice({ status: true, loading: true, message: "LOADING..." });
  const batch = await fetchPortfolioLayoutBatch(category, activeSub, nextGroupId, size, 0, setNotice);
  setNotice({ status: false, loading: false, message: null });

  setBlocks((prev) => appendMemoBatch(prev, nextGroupId, batch));
};
