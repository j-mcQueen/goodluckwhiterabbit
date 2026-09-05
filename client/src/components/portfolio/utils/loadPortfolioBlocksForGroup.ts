import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import { mobile } from "../../global/utils/determineViewport";
import { triggerBatch } from "./triggerBatch";
import { appendMemoBatch } from "./appendMemoBatch";
import { fetchPortfolioLayoutBatch } from "../../global/memo/fetchPortfolioLayoutBatch";
import { PortfolioBlock } from "../types/PortfolioBlock";

const TAB_CATEGORY: Record<number, string> = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };

// Entry point for every "clean navigation" (sidebar/mobile-nav group click,
// initial subcategory load) - callers resolve hasMemo via
// resolveGroupHasMemo first, since it's already known synchronously from
// the taxonomy. Replaces Body.tsx's old whole-view swap to MemoAwareBody:
// every path now returns a single-block PortfolioBlock[] and renders
// through the same block-sequence renderer, which also fixes the
// pre-existing one-frame flash on this path (no checkPortfolioGroupHasMemo
// round trip after groupId changes).
//
// A memo group's first batch is loaded here (10 items, same as a plain
// group) rather than the whole group at once - the rest pages in on scroll
// via handleMemoBlockIntersection, exactly like a plain group.
export const loadPortfolioBlocksForGroup = async ({
  activeSub,
  activeTab,
  groupId,
  hasMemo,
  setNotice,
}: {
  activeSub: string;
  activeTab: number;
  groupId: string;
  hasMemo: boolean;
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string | null }>
  >;
}): Promise<{ blocks: PortfolioBlock[]; nextStartIndex: number }> => {
  const category = TAB_CATEGORY[activeTab];

  if (!hasMemo) {
    const images = await triggerBatch(
      activeSub,
      activeTab,
      groupId,
      () => {}, // this replaces the whole view - blocks below owns the resulting state
      setNotice,
      true,
      0,
    );
    const keyedImages = (images ?? []).map((image) => ({ ...image, key: uuidv4() }));

    return {
      blocks:
        keyedImages.length > 0
          ? [{ kind: "plain", blockKey: uuidv4(), images: keyedImages }]
          : [],
      nextStartIndex: keyedImages.length,
    };
  }

  const size = mobile ? "sm" : "lg";
  setNotice({ status: true, loading: true, message: "LOADING..." });
  const batch = await fetchPortfolioLayoutBatch(category, activeSub, groupId, size, 0, setNotice);
  setNotice({ status: false, loading: false, message: null });

  const blocks = appendMemoBatch([], groupId, batch);
  return { blocks, nextStartIndex: 0 };
};
