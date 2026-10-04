import { ReactNode } from "react";

// Single-column, fill-available-height item used by ART/DESIGN (Body.tsx's
// plain-grid path and MemoAwareBody's memo-managed path both render into
// this instead of the 3-column masonry grid PHOTO uses). `min-h-full`
// resolves against the nearest ancestor with a definite height rather than
// a hardcoded vh calc - see Body.tsx's "h-full flex flex-col" wrapper for
// why that chain is safe (every intermediate container is a flex item, so
// each has a definite used size post-layout per the flexbox spec).
const STACKED_ITEM_LAYOUT_CLASSES =
  "w-full mx-auto flex flex-col items-center justify-center gap-4 py-1.5 px-2";
const STACKED_ITEM_BASE_CLASSES = `max-w-3xl ${STACKED_ITEM_LAYOUT_CLASSES}`;

export const STACKED_ITEM_CLASSES = `min-h-full ${STACKED_ITEM_BASE_CLASSES}`;

// admin-flagged banner image (layout `banner`) - identical to
// STACKED_ITEM_CLASSES minus the max-w-3xl cap, so it spans the body's full
// width while keeping exactly the same height behavior. Pair with
// STACKED_BANNER_IMAGE_CLASSES on the <img> itself.
export const STACKED_BANNER_ITEM_CLASSES = `min-h-full ${STACKED_ITEM_LAYOUT_CLASSES}`;

// width is the primary fit: always the frame's full width, natural height
// at that width, capped at the frame's height - when the cap binds,
// object-cover crops top and bottom rather than squashing. Never wider or
// taller than the frame, never distorted.
export const STACKED_BANNER_IMAGE_CLASSES = "block w-full h-auto max-h-full object-cover";

// A memo is only a few lines of text, so filling a whole viewport-height
// item (STACKED_ITEM_CLASSES) leaves it centered in hundreds of px of empty
// space on either side, far from the artwork it describes. A shorter minimum
// height tightens that dead space while still giving it some air. `shrink-0`
// is required: the parent is a flex column, and an explicit min-h replaces
// the default "never shrink below content" floor, so without it a small
// min-h lets the item shrink below the memo's own height and overflow.
//
// Vertical spacing: every item has 0.375rem (py-1.5) top and bottom, so any
// two neighbours are 0.75rem apart. A memo must have that same 0.75rem above
// and below it wherever it sits, so `first:`/`last:` top it up to 0.75rem when
// there is no neighbour to supply the other half (memo at either end of the
// list - e.g. the last item until the next batch loads).
//
// On top of that, 4rem (64px) is added below every memo: that's the empty
// space an average-shaped artwork gets above/below itself from being
// object-contain'd inside its full-viewport-height item, so the memo doesn't
// sit tighter to what follows it than the artworks do. (Tailwind emits `pb-`
// after `py-`, and variants after both, so these override the base py-1.5.)
//
// The `.memo-content` override zeroes the vertical padding baked into a
// stored ART memo's markup (older memos carry a lopsided `pt-2 pb-10`): left
// in place the memo sits off-center between the images above and below it,
// whereas this item's own padding is symmetric.
export const STACKED_MEMO_ITEM_CLASSES = `min-h-[10%] shrink-0 first:pt-3 pb-[calc(0.375rem+4rem)] last:pb-[calc(0.75rem+4rem)] [&_.memo-content]:py-0 ${STACKED_ITEM_BASE_CLASSES}`;

// Wraps the actual <img> so it gets a definite height to resolve its own
// h-full against, and so it grows (flex-1) to fill whatever room a sibling
// memo doesn't need - this works regardless of whether the memo renders
// before or after the image, since flex-grow/shrink-0 sizing is
// order-independent.
export const STACKED_IMAGE_FRAME_CLASSES =
  "flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden";

export default function StackedItem({
  children,
  memo = false,
  banner = false,
}: {
  children: ReactNode;
  memo?: boolean;
  banner?: boolean;
}) {
  return (
    <div
      className={
        memo
          ? STACKED_MEMO_ITEM_CLASSES
          : banner
            ? STACKED_BANNER_ITEM_CLASSES
            : STACKED_ITEM_CLASSES
      }
    >
      {children}
    </div>
  );
}

export function StackedImageFrame({ children }: { children: ReactNode }) {
  return <div className={STACKED_IMAGE_FRAME_CLASSES}>{children}</div>;
}
