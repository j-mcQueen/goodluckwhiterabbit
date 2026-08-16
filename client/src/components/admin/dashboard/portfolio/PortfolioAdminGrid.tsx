import {
  CSSProperties,
  Dispatch,
  Fragment,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { fetchAdminPortfolioLayoutBatch } from "./utils/fetchAdminPortfolioLayoutBatch";
import { handleCreatePortfolioMemo } from "../utils/handlers/portfolioOrdering/handleCreatePortfolioMemo";
import { handleUpdatePortfolioMemo } from "../utils/handlers/portfolioOrdering/handleUpdatePortfolioMemo";
import { handleDeletePortfolioMemo } from "../utils/handlers/portfolioOrdering/handleDeletePortfolioMemo";
import { handleSwapPortfolioLayout } from "../utils/handlers/portfolioOrdering/handleSwapPortfolioLayout";
import { handleMovePortfolioLayoutItem } from "../utils/handlers/portfolioOrdering/handleMovePortfolioLayoutItem";
import { handleSwapPortfolioImages } from "../utils/handlers/portfolioOrdering/handleSwapPortfolioImages";
import { handlePortfolioFileUpload } from "../utils/handlers/portfolioOrdering/handlePortfolioFileUpload";
import { handlePortfolioDelete } from "../utils/handlers/portfolioOrdering/handlePortfolioDelete";
import { measurePortfolioImageRatio } from "../../../global/memo/measurePortfolioImageRatio";
import {
  splitPortfolioLayoutIntoSegments,
  PortfolioLayoutEntry,
  PortfolioRunSegment,
} from "../../../global/utils/splitPortfolioLayoutIntoSegments";
import { COLUMNS } from "../../../global/utils/packPortfolioRun";
import { generateMemoHtml } from "../../../global/memo/generateMemoHtml";
import { memoFieldsFromHtml } from "../../../global/memo/parseMemoHtml";
import {
  emptyMemoFields,
  MemoFields,
  PortfolioCategory,
} from "../../../global/memo/types";
import { portfolio_subcategory } from "../types/portfolioTypes";
import MemoDisplay from "../../../global/memo/MemoDisplay";
import MemoDialog from "./MemoDialog";
import Loading from "../../../global/Loading";
import Memo from "../../../../assets/media/icons/Memo";
import Close from "../../../../assets/media/icons/Close";
import { loadBatchButton, orderItemDelete } from "../../../global/styles/buttons";

type DialogState =
  | { mode: "closed" }
  | { mode: "create"; position: number }
  | { mode: "edit"; memoId: string };

type Notice = {
  status: boolean;
  message: string;
  logout: { status: boolean; path: string | null };
};

// how many items the backend layout endpoint returns per page - mirrors the
// server-side batch size in adminGetPortfolioGroupLayout
const BATCH_SIZE = 10;

// matches PortfolioOrderItem.tsx's old tile sizing exactly: height-capped,
// width auto per the image's own aspect ratio. Used only for the widow-image
// row rendered alongside a memo (flex-wrap, not part of the packed grid
// below) - GRID_IMAGE_TILE_CLASSES/GRID_IMAGE_CLASSES fill their grid cell
// instead, since the packed grid's own row/column tracks size those now.
const IMAGE_TILE_CLASSES =
  "relative shrink-0 border border-solid border-white overflow-hidden min-h-[300px] max-h-[350px]";
const IMAGE_CLASSES = "block object-cover min-h-[300px] max-h-[350px]";
const GRID_IMAGE_TILE_CLASSES =
  "relative w-full h-full border border-solid border-white overflow-hidden";
const GRID_IMAGE_CLASSES = "block w-full h-full object-cover";
// shared visible chrome for every gap marker variant below (in-grid,
// memo-adjacent, run-trailing) - a fixed-size button so all three read as
// the same control and click precisely where they visibly are, rather than
// a big invisible-until-hover zone. Always visible (no opacity-0/hover
// reveal) so a user isn't guessing where to hover to find one.
const GAP_MARKER_SIZE = 40; // px - also the in-grid hit box, since hit === visible now
const GAP_MARKER_BUTTON_CLASSES =
  "w-10 h-10 rounded-full border border-solid border-white/40 bg-black/50 xl:hover:border-white/70 xl:hover:bg-black/70 transition-colors flex items-center justify-center xl:hover:cursor-pointer";
const GAP_MARKER_ICON_CLASSES = "w-5 h-5 opacity-80";

// non-interactive layout box - centers the fixed-size button (above) within
// whatever space this context provides. Split from the button itself so
// hovering/clicking only does something over the button, not the whole
// stretched column/bar around it.
//
// tall column, unchanged in spirit from the pre-grid design - still lives
// in a flex row alongside full-height widow-pair image tiles
// (IMAGE_TILE_CLASSES), so it needs to match their height the same way it
// always did.
const GAP_WRAPPER_CLASSES =
  "shrink-0 w-14 min-h-[300px] max-h-[350px] flex items-center justify-center";
// the marker directly before a memo is rendered inside its own flex row
// alongside the memo (see the memo-wrap div below, which uses items-stretch
// so this stretches to match the memo's own rendered height), not as a
// flex-wrap sibling relying on natural line-wrapping to land next to
// something - that was fragile (an isolated tall gap when nothing preceded
// it on the same line, or a forced extra line break splitting an
// otherwise-continuous image row).
const MEMO_GAP_WRAPPER_CLASSES =
  "shrink-0 w-14 flex items-center justify-center";
// the run-trailing marker used to reuse GAP_WRAPPER_CLASSES's 300-350px
// min/max-height, sized for sitting inline next to a flex-wrap tile of the
// same height. Now that the grid wrapper is flex-col, a lone flex-col child
// with that height renders as its own mostly-empty 300-350px-tall row -
// hence the dedicated short, full-width bar here instead.
const TRAILING_GAP_WRAPPER_CLASSES =
  "w-full h-16 flex items-center justify-center";
const EMPTY_SLOT_CLASSES =
  "shrink-0 w-[220px] min-h-[300px] max-h-[350px] border border-dashed border-white/30 xl:hover:border-white/70 transition-colors";

// prototype: span-packed grid (mirrors the live site's MemoAwareBody/Body
// dense packing) instead of flex-wrap. A packed 3-column grid has no spare
// column to give a gap marker its own layout box the way flex-wrap did, so
// in-grid markers below are absolutely positioned into the grid's own gap
// gutter instead, bleeding into neighboring cells slightly at this size -
// acceptable since they're always visible now rather than a subtle
// hover-only affordance.
const GRID_GAP_PX = 8; // must match the gap-2 on the grid wrapper + each run's grid
const ROW_HEIGHT_RATIO = 0.85; // matches Body.tsx/MemoAwareBody's portrait-friendly target ratio

// framer-motion reserves onDragStart (and friends) on its own components for
// its pointer-based drag gesture API, with an incompatible signature from the
// native DOM DragEvent - matches PortfolioOrderItem.tsx's old workaround of
// attaching the native "dragstart" listener imperatively via ref instead of
// as a JSX prop.
function ImageTile({
  dragProps,
  onDragStartNative,
  onDelete,
  className,
  children,
}: {
  dragProps: {
    draggable: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  onDragStartNative: (e: DragEvent) => void;
  onDelete: () => void;
  className: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.addEventListener("dragstart", onDragStartNative);
    return () => node.removeEventListener("dragstart", onDragStartNative);
  }, [onDragStartNative]);

  return (
    <motion.div
      ref={ref}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={className}
      {...dragProps}
    >
      <button type="button" onClick={onDelete} className={orderItemDelete}>
        <Close className="w-4 h-4" />
      </button>
      {children}
    </motion.div>
  );
}

// Single admin grid for every group, memo-managed or not - replaces both
// PortfolioImageOrder.tsx and MemoAwareAdminQueue.tsx. Always renders from
// `layout`, so a feather-icon gap marker between every pair of adjacent
// items (image or memo) can insert a memo at an exact spot in one step,
// rather than creating it somewhere generic and dragging it into place
// afterward.
//
// Unification is UI/component-only, not a write-path change: a memo-free
// group's public-facing order is still 100% S3 filename position (the
// public site never reads `layout` for those groups), so image-to-image
// swaps there still rename S3 content (handleSwapPortfolioImages) to keep
// public and admin in sync automatically. Once a group has any memo,
// swaps become pure layout-array operations (handleSwapPortfolioLayout).
// `hasMemo` is derived locally from what's already fetched.
//
// Loading is paginated, one batch of BATCH_SIZE at a time, regardless of
// whether the group has a memo - fetching and decoding every image blob for
// a 50+ image group up front isn't worth it just so widow-pairing has every
// ratio available immediately. The one tradeoff: widow-pairing near a batch
// boundary next to a memo can look wrong until both sides are loaded, then
// self-corrects. Every mutation this component makes (swap/move/delete/
// create/edit/new upload) updates `entries` locally instead of refetching,
// so the grid never blanks or fully re-renders in response to its own
// actions - only an explicit "load next batch" or switching groups fetches.
export default function PortfolioAdminGrid({
  category,
  sub,
  groupId,
  dragTarget,
  targetSubcategory,
  setTargetSubcategory,
  taxonomy,
  setTaxonomy,
  setNotice,
  bulkUploadSignal,
  onLoadedImageCountChange,
}: {
  category: PortfolioCategory;
  sub: string;
  groupId: string;
  dragTarget: File | object;
  targetSubcategory: portfolio_subcategory;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  taxonomy: portfolio_subcategory[];
  setTaxonomy: Dispatch<SetStateAction<portfolio_subcategory[]>>;
  setNotice: Dispatch<SetStateAction<Notice>>;
  // one-shot signal from PortfolioManager.tsx, bumped only when a bulk
  // upload (handled outside this component) actually succeeds - carries the
  // new total so this grid can catch itself up automatically rather than
  // requiring an extra manual "load next batch" click right after
  // uploading. Deliberately not the group's plain `count` prop: that value
  // can change for other incidental reasons during navigation, and would
  // make the grid auto-load its entire backlog on those too.
  bulkUploadSignal: { key: number; newCount: number } | null;
  // reports how many *images* (not memos) are currently loaded into
  // `entries`, so PortfolioFileInfo.tsx's "FILES DISPLAYED" counter can
  // reflect this grid's actual paginated state instead of just echoing the
  // group's total stored count a second time.
  onLoadedImageCountChange: (count: number) => void;
}) {
  const [entries, setEntries] = useState<PortfolioLayoutEntry[] | null>(null);
  const [urlsByKey, setUrlsByKey] = useState<Map<string, string>>(new Map());
  const [stored, setStored] = useState(0);
  const [dialog, setDialog] = useState<DialogState>({ mode: "closed" });
  // how many empty drop-target slots are currently visible once caught up -
  // grows by BATCH_SIZE each time the load-more button is pressed while
  // caught up, so a user with more queued files than visible slots can keep
  // asking for more without a ceiling, same as the old batch-loading grid
  const [emptySlotCount, setEmptySlotCount] = useState(BATCH_SIZE);
  // mirrors urlsByKey for the unmount-only cleanup below - object URLs must
  // only be revoked once truly discarded (replaced/deleted/group switched),
  // never blanket-revoked on every state change: a swap reuses the same URL
  // strings at different keys, and revoking those breaks the very images
  // that are still in use, racing the browser's re-fetch of the changed src
  const urlsByKeyRef = useRef(urlsByKey);
  urlsByKeyRef.current = urlsByKey;

  // drives row height for the packed grid below - the live site can use a
  // viewport-relative `vw` row height because it's ~full viewport width, but
  // this grid shares its row with a reserved-width queue panel, so row
  // height has to come from the grid's own measured width instead. State
  // (not a plain ref) so the observer effect re-attaches once the real
  // wrapper mounts - it doesn't exist yet during the `!entries` loading
  // render below, so a ref-only effect with `[]` deps would fire once
  // against a still-null node and never observe anything.
  const [gridWidth, setGridWidth] = useState(0);
  const [gridWrapperNode, setGridWrapperNode] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (!gridWrapperNode) return;
    const observer = new ResizeObserver((observerEntries) => {
      const width = observerEntries[0]?.contentRect.width;
      if (typeof width === "number") setGridWidth(width);
    });
    observer.observe(gridWrapperNode);
    return () => observer.disconnect();
  }, [gridWrapperNode]);

  useEffect(() => {
    onLoadedImageCountChange(
      entries ? entries.filter((entry) => entry.type === "image").length : 0,
    );
    // onLoadedImageCountChange is a setState setter from the parent - stable
    // across renders, deliberately left out so this only reruns on entries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const appendBatch = async (start: number) => {
    const result = await fetchAdminPortfolioLayoutBatch(
      category,
      sub,
      groupId,
      start,
    );
    if (!result) return;

    setEntries((prev) => [...(prev ?? []), ...result.entries]);
    setUrlsByKey((prev) => {
      const next = new Map(prev);
      result.blobsByKey.forEach((blob, key) =>
        next.set(key, URL.createObjectURL(blob)),
      );
      return next;
    });
    setStored(result.stored);
  };

  // guarded against React StrictMode's dev-mode double-invoke of effects:
  // appendBatch is an accumulator (setEntries(prev => [...prev, ...])), not
  // idempotent the way a plain replace would be - without the `cancelled`
  // check, a double-invoked mount would append the first batch twice
  useEffect(() => {
    let cancelled = false;
    setEntries(null);
    setUrlsByKey((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return new Map();
    });
    setStored(0);
    setEmptySlotCount(BATCH_SIZE);

    fetchAdminPortfolioLayoutBatch(category, sub, groupId, 0).then((result) => {
      if (cancelled || !result) return;
      setEntries(result.entries);
      const nextUrls = new Map<string, string>();
      result.blobsByKey.forEach((blob, key) =>
        nextUrls.set(key, URL.createObjectURL(blob)),
      );
      setUrlsByKey(nextUrls);
      setStored(result.stored);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sub, groupId]);

  // catches this component up to a bulk upload handled by PortfolioManager.tsx
  // - only when there's no backlog already pending, so newly uploaded content
  // never gets appended out of order ahead of older, not-yet-loaded images
  useEffect(() => {
    if (!bulkUploadSignal) return;
    if (
      entries === null ||
      entries.length !== stored ||
      bulkUploadSignal.newCount <= stored
    )
      return;

    let cancelled = false;
    const catchUp = async () => {
      let start = stored;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await fetchAdminPortfolioLayoutBatch(
          category,
          sub,
          groupId,
          start,
        );
        if (cancelled || !result || result.entries.length === 0) break;

        setEntries((prev) => [...(prev ?? []), ...result.entries]);
        setUrlsByKey((prev) => {
          const next = new Map(prev);
          result.blobsByKey.forEach((blob, key) =>
            next.set(key, URL.createObjectURL(blob)),
          );
          return next;
        });
        setStored(result.stored);

        start += result.entries.length;
        if (start >= result.stored) break;
      }
    };
    catchUp();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bulkUploadSignal]);

  // unmount only (empty deps) - per-mutation revocation happens at each
  // mutation site instead (handleReplace, handleImageDelete, the group-switch
  // reset above), so this is just the final sweep when leaving the group
  // entirely rather than switching to another one
  useEffect(() => {
    return () => {
      urlsByKeyRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // matches PortfolioOrderItem.tsx's old cross-fade exactly: keyed by the
  // blob URL itself, so a swap/replace (which changes which URL renders at
  // this key, not the key itself) is what triggers the exit/enter transition
  const renderImage = (key: string, imgClassName: string = IMAGE_CLASSES) => {
    const url = urlsByKey.get(key);
    return (
      <AnimatePresence mode="wait">
        {url && (
          <motion.img
            key={url}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            src={url}
            alt=""
            className={imgClassName}
            draggable={false}
          />
        )}
      </AnimatePresence>
    );
  };

  if (!entries) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loading />
      </div>
    );
  }

  const hasMemo = entries.some((entry) => entry.type === "memo");
  const flatIndexByKey = new Map(
    entries.map((entry, index) => [entry.key, index]),
  );
  // only once every existing item is loaded is it safe to append new
  // content at entries.length and have that actually be the group's true
  // end - otherwise unloaded backlog would end up displayed after content
  // that's really positioned ahead of it
  const caughtUp = entries.length === stored;

  const handleImageSwap = async (fromKey: string, toKey: string) => {
    if (fromKey === toKey) return;

    if (hasMemo) {
      const fromIndex = flatIndexByKey.get(fromKey);
      const toIndex = flatIndexByKey.get(toKey);
      if (fromIndex === undefined || toIndex === undefined) return;

      const success = await handleSwapPortfolioLayout({
        category,
        sub,
        groupId,
        from: fromIndex,
        to: toIndex,
        setNotice,
      });
      if (!success) return;

      setEntries((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
        return next;
      });
    } else {
      const success = await handleSwapPortfolioImages({
        category,
        sub,
        groupId,
        from: fromKey,
        to: toKey,
        setNotice,
      });
      if (!success) return;

      // content at the two positions traded, but layout's array order
      // (already ascending by position for a memo-free group) is untouched
      // by design - swap which blob is shown at each key instead
      setUrlsByKey((prev) => {
        const next = new Map(prev);
        const a = prev.get(fromKey);
        const b = prev.get(toKey);
        if (a) next.set(toKey, a);
        else next.delete(toKey);
        if (b) next.set(fromKey, b);
        else next.delete(fromKey);
        return next;
      });
    }
  };

  const handleMemoMove = async (memoFlatIndex: number, gapIndex: number) => {
    const success = await handleMovePortfolioLayoutItem({
      category,
      sub,
      groupId,
      from: memoFlatIndex,
      to: gapIndex,
      setNotice,
    });
    if (!success) return;

    // mirrors the backend's own splice-out/splice-in exactly, so this can
    // be applied locally without a refetch
    setEntries((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const [item] = next.splice(memoFlatIndex, 1);
      const adjustedTo = gapIndex > memoFlatIndex ? gapIndex - 1 : gapIndex;
      next.splice(adjustedTo, 0, item);
      return next;
    });
  };

  const handleNewUpload = async (file: File) => {
    if (!caughtUp) {
      setNotice({
        status: true,
        message:
          "Load the rest of this group's existing images before adding new ones.",
        logout: { status: false, path: null },
      });
      return;
    }

    const result = await handlePortfolioFileUpload({
      category,
      sub,
      groupId,
      file,
      isReplace: false,
      targetSubcategory,
      setTargetSubcategory,
      taxonomy,
      setTaxonomy,
      setNotice,
    });
    if (!result) return;

    const key = String(result.position);
    const ratio = await measurePortfolioImageRatio(result.blob);
    setEntries((prev) =>
      prev ? [...prev, { type: "image", key, ratio }] : prev,
    );
    setUrlsByKey((prev) => {
      const next = new Map(prev);
      next.set(key, URL.createObjectURL(result.blob));
      return next;
    });
    setStored((prev) => prev + 1);
  };

  const handleReplace = async (key: string, file: File) => {
    const result = await handlePortfolioFileUpload({
      category,
      sub,
      groupId,
      position: Number(key),
      file,
      isReplace: true,
      targetSubcategory,
      setTargetSubcategory,
      taxonomy,
      setTaxonomy,
      setNotice,
    });
    if (result) {
      setUrlsByKey((prev) => {
        const next = new Map(prev);
        const oldUrl = next.get(key);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        next.set(key, URL.createObjectURL(result.blob));
        return next;
      });
    }
  };

  const handleImageDelete = async (key: string) => {
    const result = await handlePortfolioDelete({
      category,
      index: key,
      targetSubcategory,
      targetGroupId: groupId,
      taxonomy,
      setTaxonomy,
      setTargetSubcategory,
      setNotice,
    });
    if (!result?.success) return;

    setEntries((prev) =>
      prev ? prev.filter((entry) => entry.key !== key) : prev,
    );
    setUrlsByKey((prev) => {
      const next = new Map(prev);
      const url = next.get(key);
      if (url) URL.revokeObjectURL(url);
      next.delete(key);
      return next;
    });
    setStored((prev) => Math.max(0, prev - 1));
  };

  const handleMemoDelete = async (memoId: string) => {
    const success = await handleDeletePortfolioMemo({
      category,
      sub,
      groupId,
      memoId,
      setNotice,
    });
    if (!success) return;

    setEntries((prev) =>
      prev ? prev.filter((entry) => entry.key !== memoId) : prev,
    );
    setStored((prev) => Math.max(0, prev - 1));
  };

  const handleDialogSubmit = async (fields: MemoFields) => {
    const html = generateMemoHtml(category, fields);

    if (dialog.mode === "create") {
      const insertAt = dialog.position;
      const result = await handleCreatePortfolioMemo({
        category,
        sub,
        groupId,
        html,
        position: insertAt,
        setNotice,
      });
      if (result) {
        setDialog({ mode: "closed" });
        setEntries((prev) => {
          if (!prev) return prev;
          const next = [...prev];
          next.splice(insertAt, 0, {
            type: "memo",
            key: result.memoId,
            memoId: result.memoId,
            html,
          });
          return next;
        });
        setStored((prev) => prev + 1);
      }
      return;
    }

    if (dialog.mode === "edit") {
      const memoId = dialog.memoId;
      const success = await handleUpdatePortfolioMemo({
        memoId,
        html,
        setNotice,
      });
      if (success) {
        setDialog({ mode: "closed" });
        setEntries((prev) =>
          prev
            ? prev.map((entry) =>
                entry.type === "memo" && entry.memoId === memoId
                  ? { ...entry, html }
                  : entry,
              )
            : prev,
        );
      }
    }
  };

  const segments = splitPortfolioLayoutIntoSegments(entries);

  const imageDragProps = (key: string) => ({
    draggable: true,
    onDragOver: (e: React.DragEvent) => e.preventDefault(),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      const source = e.dataTransfer.getData("text/source");
      if (source === "image") {
        handleImageSwap(e.dataTransfer.getData("text/key"), key);
      } else if (source === "queue" && dragTarget instanceof File) {
        handleReplace(key, dragTarget);
      }
    },
  });

  const imageDragStartNative = (key: string) => (e: DragEvent) => {
    if (!e.dataTransfer) return;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/source", "image");
    e.dataTransfer.setData("text/key", key);
  };

  const memoDragProps = (flatIndex: number) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/source", "memo");
      e.dataTransfer.setData("text/flatIndex", String(flatIndex));
    },
  });

  const renderGap = (
    gapIndex: number,
    isTrailing = false,
    beforeMemo = false,
  ) => (
    <div
      key={`gap-${gapIndex}`}
      className={
        beforeMemo
          ? MEMO_GAP_WRAPPER_CLASSES
          : isTrailing
            ? TRAILING_GAP_WRAPPER_CLASSES
            : GAP_WRAPPER_CLASSES
      }
    >
      <button
        type="button"
        className={GAP_MARKER_BUTTON_CLASSES}
        onClick={() => setDialog({ mode: "create", position: gapIndex })}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const source = e.dataTransfer.getData("text/source");
          if (source === "memo") {
            const from = Number(e.dataTransfer.getData("text/flatIndex"));
            if (Number.isInteger(from)) handleMemoMove(from, gapIndex);
          } else if (
            isTrailing &&
            source === "queue" &&
            dragTarget instanceof File
          ) {
            handleNewUpload(dragTarget);
          }
        }}
      >
        <Memo className={GAP_MARKER_ICON_CLASSES} />
      </button>
    </div>
  );

  const imageTile = (
    key: string,
    tileClassName: string = IMAGE_TILE_CLASSES,
    imgClassName: string = IMAGE_CLASSES,
  ) => (
    <ImageTile
      dragProps={imageDragProps(key)}
      onDragStartNative={imageDragStartNative(key)}
      onDelete={() => handleImageDelete(key)}
      className={tileClassName}
    >
      {renderImage(key, imgClassName)}
    </ImageTile>
  );

  const colWidth =
    gridWidth > 0 ? (gridWidth - GRID_GAP_PX * (COLUMNS - 1)) / COLUMNS : 0;
  const rowHeightPx =
    colWidth > 0 ? Math.round(colWidth / ROW_HEIGHT_RATIO) : 300;

  // left/right anchors are vertically centered on their own tile - measured
  // against real row heights (300px+), that's already ample clearance from
  // that same tile's own delete button (top-left, ~30px footprint), so no
  // need to push them off-center for it.
  //
  // the bottom anchor is the real collision risk: it bleeds below its own
  // tile into the row underneath, landing near whatever's at the *top* of
  // that next row. Every delete button sits at its own tile's top-LEFT
  // (never top-right), so biasing the bottom anchor's horizontal position
  // toward the right side of its own tile (rather than dead-center) reduces
  // the chance of landing near a delete button in the row below.
  const IN_GRID_BOTTOM_ANCHOR_HORIZONTAL_PERCENT = 80;

  const inGridMarkerStyle = (
    anchor: "left" | "right" | "bottom",
  ): CSSProperties => {
    const half = GAP_MARKER_SIZE / 2;
    if (anchor === "right")
      return { top: "50%", right: -half, transform: "translateY(-50%)" };
    if (anchor === "left")
      return { top: "50%", left: -half, transform: "translateY(-50%)" };
    return {
      left: `${IN_GRID_BOTTOM_ANCHOR_HORIZONTAL_PERCENT}%`,
      bottom: -half,
      transform: "translateX(-50%)",
    };
  };

  // same create/move behavior as renderGap above, just anchored into a
  // packed grid cell's gutter instead of rendered as its own flex sibling -
  // see the constants block above for why
  const renderInGridGap = (
    gapIndex: number,
    anchor: "left" | "right" | "bottom",
  ) => (
    <button
      type="button"
      key={`in-grid-gap-${gapIndex}-${anchor}`}
      className={`absolute z-10 ${GAP_MARKER_BUTTON_CLASSES}`}
      style={inGridMarkerStyle(anchor)}
      onClick={() => setDialog({ mode: "create", position: gapIndex })}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const source = e.dataTransfer.getData("text/source");
        if (source === "memo") {
          const from = Number(e.dataTransfer.getData("text/flatIndex"));
          if (Number.isInteger(from)) handleMemoMove(from, gapIndex);
        }
      }}
    >
      <Memo className={GAP_MARKER_ICON_CLASSES} />
    </button>
  );

  // one CSS grid per run, applying the packing this component already
  // computes via splitPortfolioLayoutIntoSegments (segment.packing) - same
  // placement math MemoAwareBody.tsx uses for the live site, just not
  // wired into rendering here until now. Row-major order is preserved by
  // packPortfolioRun's greedy scan, so "the gap after image i" is always
  // either immediately to its right (mid-row) or below it (row-final) -
  // that's what makes anchoring a marker to image i's own edge valid.
  const renderRun = (segment: PortfolioRunSegment, key: string) => (
    <div
      key={key}
      className="grid grid-cols-3 gap-2"
      style={{ gridAutoRows: `${rowHeightPx}px` }}
    >
      {segment.images.map((image, i) => {
        const placement = segment.packing.placements[i];
        const isRowFinal =
          placement.column + placement.columnSpan - 1 === COLUMNS;
        const nextImage = segment.images[i + 1];

        return (
          <div
            key={image.key}
            className="relative"
            style={{
              gridColumn: `${placement.column} / span ${placement.columnSpan}`,
              gridRow: `${placement.row} / span 1`,
            }}
          >
            {i === 0 && renderInGridGap(flatIndexByKey.get(image.key)!, "left")}
            {imageTile(image.key, GRID_IMAGE_TILE_CLASSES, GRID_IMAGE_CLASSES)}
            {nextImage &&
              renderInGridGap(
                flatIndexByKey.get(nextImage.key)!,
                isRowFinal ? "bottom" : "right",
              )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="flex items-stretch flex-1 min-h-0 min-w-0">
      <div className="text-white p-3 flex flex-col flex-1 min-h-0 min-w-0">
        <div
          ref={setGridWrapperNode}
          className="flex flex-col gap-2 overflow-scroll flex-1 min-h-0"
        >
          {segments.map((segment) => {
            if (segment.kind === "memo") {
              const memoFlatIndex = flatIndexByKey.get(segment.memoId)!;
              const memoTile = (
                <div
                  className="relative border border-solid border-white p-2 w-full"
                  {...memoDragProps(memoFlatIndex)}
                >
                  <button
                    type="button"
                    onClick={() => handleMemoDelete(segment.memoId)}
                    className={orderItemDelete}
                  >
                    <Close className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setDialog({ mode: "edit", memoId: segment.memoId })
                    }
                    className="absolute bg-black m-1 top-0 right-0 border border-solid border-white p-1"
                  >
                    <Memo className="w-4 h-4" />
                  </button>
                  <MemoDisplay html={segment.html} />
                </div>
              );

              if (segment.pairedWidowImages.length > 0) {
                // widow row + its following memo render as one visually
                // paired unit here too (matching the public site's
                // centering), but the memo tile itself needs edit/delete
                // buttons the shared component doesn't know about, so only
                // the image-row half of that pairing is reused here, not
                // WidowMemoPair itself. No border here - this is a layout
                // grouping only, not a visible boundary.
                return (
                  <div
                    key={`memo-${segment.memoId}`}
                    className="flex flex-col items-center gap-2 p-2 w-full"
                  >
                    <div className="flex flex-wrap justify-center items-stretch gap-2">
                      {segment.pairedWidowImages.map((image) => (
                        <Fragment key={image.key}>
                          {renderGap(flatIndexByKey.get(image.key)!)}
                          {imageTile(image.key)}
                        </Fragment>
                      ))}
                    </div>
                    <div className="w-full flex items-stretch gap-2">
                      {renderGap(memoFlatIndex, false, true)}
                      <div className="flex-1">{memoTile}</div>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={`memo-wrap-${segment.memoId}`}
                  className="w-full flex items-stretch gap-2"
                >
                  {renderGap(memoFlatIndex, false, true)}
                  <div className="flex-1">{memoTile}</div>
                </div>
              );
            }

            return renderRun(
              segment,
              `run-${flatIndexByKey.get(segment.images[0].key)}`,
            );
          })}
          {renderGap(entries.length, true)}

          {caughtUp && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: emptySlotCount }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className={EMPTY_SLOT_CLASSES}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const source = e.dataTransfer.getData("text/source");
                    if (source === "queue" && dragTarget instanceof File)
                      handleNewUpload(dragTarget);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className={loadBatchButton}
          onClick={() => {
            if (caughtUp) {
              setEmptySlotCount((prev) => prev + BATCH_SIZE);
            } else {
              appendBatch(entries.length);
            }
          }}
        >
          {caughtUp ? "ADD MORE EMPTY SLOTS" : "LOAD NEXT BATCH"}
        </button>
      </div>

      {dialog.mode !== "closed" && (
        <MemoDialog
          category={category}
          initialFields={
            dialog.mode === "edit"
              ? memoFieldsFromHtml(
                  (
                    entries.find(
                      (entry) =>
                        entry.type === "memo" && entry.memoId === dialog.memoId,
                    ) as { html: string } | undefined
                  )?.html ?? null,
                  category,
                )
              : emptyMemoFields(category)
          }
          onClose={() => setDialog({ mode: "closed" })}
          onSubmit={handleDialogSubmit}
        />
      )}
    </div>
  );
}
