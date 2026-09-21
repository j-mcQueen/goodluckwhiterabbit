import { Dispatch, SetStateAction } from "react";
import { v4 as uuidv4 } from "uuid";
import { mobile } from "../../global/utils/determineViewport";
import { triggerBatch } from "./triggerBatch";
import { calcNextStart } from "./calcNextStart";
import { truncateAtMemoGroup } from "./truncateAtMemoGroup";
import { appendMemoBatch } from "./appendMemoBatch";
import { fetchPortfolioLayoutBatch } from "../../global/memo/fetchPortfolioLayoutBatch";
import { PortfolioBlock } from "../types/PortfolioBlock";

const EMPTY_GROUP_MESSAGE =
  "Something went wrong. It appears there are no files within this collection.";

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
//
// `empty` is true when the requested group itself has nothing to show. A
// plain group's endpoint spills forward into the next group with content
// (right for scrolling past a group's end), so an empty group would otherwise
// come back holding a *different* group's images - detected via each image's
// source `group`. Callers that are switching *to* a specific group (sidebar
// and mobile-nav group clicks) must not switch when this is set; a notice
// explaining why has already been raised here.
export const loadPortfolioBlocksForGroup = async ({
  activeSub,
  activeTab,
  groupId,
  hasMemo,
  isMemoGroup,
  setNotice,
}: {
  activeSub: string;
  activeTab: number;
  groupId: string;
  hasMemo: boolean;
  isMemoGroup: (groupId: string) => boolean;
  setNotice: Dispatch<
    SetStateAction<{ status: boolean; loading: boolean; message: string | null }>
  >;
}): Promise<{ blocks: PortfolioBlock[]; nextStartIndex: number; empty: boolean }> => {
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
    // images arrive in group order starting at the requested group, so if
    // the first one belongs elsewhere the requested group had none of its own
    const empty = !images || images.length === 0 || images[0].group !== groupId;
    if (empty) {
      setNotice({ status: true, loading: false, message: EMPTY_GROUP_MESSAGE });
      return { blocks: [], nextStartIndex: 0, empty: true };
    }

    // the batch can spill into following groups; stop short of any group
    // with memos (the plain pipeline can't render its layout) - the tail
    // trigger then reaches that boundary through handlePortfolioIntersection
    const { kept } = truncateAtMemoGroup(images, isMemoGroup);
    const keyedImages = kept.map((image) => ({ ...image, key: uuidv4() }));

    return {
      blocks: [{ kind: "plain", blockKey: uuidv4(), images: keyedImages }],
      // the cursor is an index *within the tail image's group*, not a total
      // count - a batch that spilled into another group would otherwise
      // start the next fetch too far into that group and skip its images
      nextStartIndex: calcNextStart(groupId, keyedImages, 0),
      empty: false,
    };
  }

  const size = mobile ? "sm" : "lg";
  setNotice({ status: true, loading: true, message: "LOADING..." });
  const batch = await fetchPortfolioLayoutBatch(category, activeSub, groupId, size, 0, setNotice);
  setNotice({ status: false, loading: false, message: null });

  const blocks = appendMemoBatch([], groupId, batch);
  if (blocks.length === 0) {
    setNotice({ status: true, loading: false, message: EMPTY_GROUP_MESSAGE });
  }
  return { blocks, nextStartIndex: 0, empty: blocks.length === 0 };
};
