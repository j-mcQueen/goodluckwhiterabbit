import { Dispatch, Fragment, SetStateAction, useEffect, useRef, useState } from "react";
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
} from "../../../global/utils/splitPortfolioLayoutIntoSegments";
import { generateMemoHtml } from "../../../global/memo/generateMemoHtml";
import { memoFieldsFromHtml } from "../../../global/memo/parseMemoHtml";
import { emptyMemoFields, MemoFields, PortfolioCategory } from "../../../global/memo/types";
import { portfolio_subcategory } from "../types/portfolioTypes";
import MemoDisplay from "../../../global/memo/MemoDisplay";
import MemoDialog from "./MemoDialog";
import Loading from "../../../global/Loading";
import Memo from "../../../../assets/media/icons/Memo";
import Close from "../../../../assets/media/icons/Close";
import { orderItemDelete } from "../../../global/styles/buttons";

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
// width auto per the image's own aspect ratio - a compact management view,
// not a grid of uniform cells. Only the memo itself needs to be pixel-WYSIWYG
// (spec §2.1); the surrounding image tiles never did.
const IMAGE_TILE_CLASSES =
  "relative shrink-0 border border-solid border-white overflow-hidden min-h-[300px] max-h-[350px]";
const IMAGE_CLASSES = "block object-cover min-h-[300px] max-h-[350px]";
const GAP_CLASSES =
  "group shrink-0 w-6 min-h-[300px] max-h-[350px] flex items-center justify-center border border-dashed border-transparent xl:hover:border-white/40 transition-colors xl:hover:cursor-pointer";
// the marker directly before a memo is rendered inside its own flex row
// alongside the memo (see the memo-wrap div below, which uses items-stretch
// so this stretches to match the memo's own rendered height), not as a
// flex-wrap sibling relying on natural line-wrapping to land next to
// something - that was fragile (an isolated tall gap when nothing preceded
// it on the same line, or a forced extra line break splitting an
// otherwise-continuous image row). Same width as GAP_CLASSES for visual
// consistency between the two marker kinds.
const MEMO_GAP_CLASSES =
  "group shrink-0 w-6 flex items-center justify-center border border-dashed border-transparent xl:hover:border-white/40 transition-colors xl:hover:cursor-pointer";
const EMPTY_SLOT_CLASSES =
  "shrink-0 w-[220px] min-h-[300px] max-h-[350px] border border-dashed border-white/30 xl:hover:border-white/70 transition-colors";
const LOAD_BATCH_BUTTON_CLASSES =
  "font-tnrBI text-md tracking-widest opacity-80 drop-shadow-glo px-3 pt-3 pb-2 border border-solid border-white transition-colors xl:hover:text-rd xl:hover:border-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:border-rd xl:focus:drop-shadow-red xl:hover:cursor-pointer w-full mt-2 disabled:opacity-30 disabled:cursor-not-allowed";

// framer-motion reserves onDragStart (and friends) on its own components for
// its pointer-based drag gesture API, with an incompatible signature from the
// native DOM DragEvent - matches PortfolioOrderItem.tsx's old workaround of
// attaching the native "dragstart" listener imperatively via ref instead of
// as a JSX prop.
function ImageTile({
  dragProps,
  onDragStartNative,
  onDelete,
  children,
}: {
  dragProps: {
    draggable: boolean;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
  };
  onDragStartNative: (e: DragEvent) => void;
  onDelete: () => void;
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
      className={IMAGE_TILE_CLASSES}
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

  useEffect(() => {
    onLoadedImageCountChange(entries ? entries.filter((entry) => entry.type === "image").length : 0);
    // onLoadedImageCountChange is a setState setter from the parent - stable
    // across renders, deliberately left out so this only reruns on entries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  const appendBatch = async (start: number) => {
    const result = await fetchAdminPortfolioLayoutBatch(category, sub, groupId, start);
    if (!result) return;

    setEntries((prev) => [...(prev ?? []), ...result.entries]);
    setUrlsByKey((prev) => {
      const next = new Map(prev);
      result.blobsByKey.forEach((blob, key) => next.set(key, URL.createObjectURL(blob)));
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
      result.blobsByKey.forEach((blob, key) => nextUrls.set(key, URL.createObjectURL(blob)));
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
    if (entries === null || entries.length !== stored || bulkUploadSignal.newCount <= stored) return;

    let cancelled = false;
    const catchUp = async () => {
      let start = stored;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const result = await fetchAdminPortfolioLayoutBatch(category, sub, groupId, start);
        if (cancelled || !result || result.entries.length === 0) break;

        setEntries((prev) => [...(prev ?? []), ...result.entries]);
        setUrlsByKey((prev) => {
          const next = new Map(prev);
          result.blobsByKey.forEach((blob, key) => next.set(key, URL.createObjectURL(blob)));
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
  const renderImage = (key: string) => {
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
            className={IMAGE_CLASSES}
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
  const flatIndexByKey = new Map(entries.map((entry, index) => [entry.key, index]));
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

      const success = await handleSwapPortfolioLayout({ category, sub, groupId, from: fromIndex, to: toIndex, setNotice });
      if (!success) return;

      setEntries((prev) => {
        if (!prev) return prev;
        const next = [...prev];
        [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
        return next;
      });
    } else {
      const success = await handleSwapPortfolioImages({ category, sub, groupId, from: fromKey, to: toKey, setNotice });
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
    const success = await handleMovePortfolioLayoutItem({ category, sub, groupId, from: memoFlatIndex, to: gapIndex, setNotice });
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
        message: "Load the rest of this group's existing images before adding new ones.",
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
    setEntries((prev) => (prev ? [...prev, { type: "image", key, ratio }] : prev));
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

    setEntries((prev) => (prev ? prev.filter((entry) => entry.key !== key) : prev));
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
    const success = await handleDeletePortfolioMemo({ category, sub, groupId, memoId, setNotice });
    if (!success) return;

    setEntries((prev) => (prev ? prev.filter((entry) => entry.key !== memoId) : prev));
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
          next.splice(insertAt, 0, { type: "memo", key: result.memoId, memoId: result.memoId, html });
          return next;
        });
        setStored((prev) => prev + 1);
      }
      return;
    }

    if (dialog.mode === "edit") {
      const memoId = dialog.memoId;
      const success = await handleUpdatePortfolioMemo({ memoId, html, setNotice });
      if (success) {
        setDialog({ mode: "closed" });
        setEntries((prev) =>
          prev
            ? prev.map((entry) => (entry.type === "memo" && entry.memoId === memoId ? { ...entry, html } : entry))
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

  const renderGap = (gapIndex: number, isTrailing = false, beforeMemo = false) => (
    <button
      type="button"
      key={`gap-${gapIndex}`}
      className={beforeMemo ? MEMO_GAP_CLASSES : GAP_CLASSES}
      onClick={() => setDialog({ mode: "create", position: gapIndex })}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const source = e.dataTransfer.getData("text/source");
        if (source === "memo") {
          const from = Number(e.dataTransfer.getData("text/flatIndex"));
          if (Number.isInteger(from)) handleMemoMove(from, gapIndex);
        } else if (isTrailing && source === "queue" && dragTarget instanceof File) {
          handleNewUpload(dragTarget);
        }
      }}
    >
      <Memo className="w-3 h-3 opacity-0 xl:group-hover:opacity-60 transition-opacity" />
    </button>
  );

  const imageTile = (key: string) => (
    <ImageTile
      dragProps={imageDragProps(key)}
      onDragStartNative={imageDragStartNative(key)}
      onDelete={() => handleImageDelete(key)}
    >
      {renderImage(key)}
    </ImageTile>
  );

  return (
    <div className="flex items-stretch flex-1 min-h-0">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center flex-1 min-h-0">
        <div className="flex flex-wrap items-stretch justify-center gap-2 max-w-[60dvw] px-5 overflow-scroll flex-1 min-h-0 relative">
          {segments.map((segment) => {
            if (segment.kind === "memo") {
              const memoFlatIndex = flatIndexByKey.get(segment.memoId)!;
              const memoTile = (
                <div className="relative border border-solid border-white p-2 w-full" {...memoDragProps(memoFlatIndex)}>
                  <button
                    type="button"
                    onClick={() => handleMemoDelete(segment.memoId)}
                    className={orderItemDelete}
                  >
                    <Close className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDialog({ mode: "edit", memoId: segment.memoId })}
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
                  <div key={`memo-${segment.memoId}`} className="flex flex-col items-center gap-2 p-2 w-full">
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
                <div key={`memo-wrap-${segment.memoId}`} className="w-full flex items-stretch gap-2">
                  {renderGap(memoFlatIndex, false, true)}
                  <div className="flex-1">{memoTile}</div>
                </div>
              );
            }

            return segment.images.map((image) => (
              <Fragment key={image.key}>
                {renderGap(flatIndexByKey.get(image.key)!)}
                {imageTile(image.key)}
              </Fragment>
            ));
          })}
          {renderGap(entries.length, true)}

          {caughtUp &&
            Array.from({ length: emptySlotCount }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className={EMPTY_SLOT_CLASSES}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const source = e.dataTransfer.getData("text/source");
                  if (source === "queue" && dragTarget instanceof File) handleNewUpload(dragTarget);
                }}
              />
            ))}
        </div>

        <button
          type="button"
          className={LOAD_BATCH_BUTTON_CLASSES}
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
                  (entries.find((entry) => entry.type === "memo" && entry.memoId === dialog.memoId) as
                    | { html: string }
                    | undefined)?.html ?? null,
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
