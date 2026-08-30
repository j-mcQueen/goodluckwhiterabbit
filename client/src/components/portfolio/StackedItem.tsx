import { ReactNode } from "react";

// Single-column, fill-available-height item used by ART/DESIGN (Body.tsx's
// plain-grid path and MemoAwareBody's memo-managed path both render into
// this instead of the 3-column masonry grid PHOTO uses). `min-h-full`
// resolves against the nearest ancestor with a definite height rather than
// a hardcoded vh calc - see Body.tsx's "h-full flex flex-col" wrapper for
// why that chain is safe (every intermediate container is a flex item, so
// each has a definite used size post-layout per the flexbox spec).
export const STACKED_ITEM_CLASSES =
  "min-h-full w-full max-w-3xl mx-auto flex flex-col items-center justify-center gap-4 py-6 px-2";

// Wraps the actual <img> so it gets a definite height to resolve its own
// h-full against, and so it grows (flex-1) to fill whatever room a sibling
// memo doesn't need - this works regardless of whether the memo renders
// before or after the image, since flex-grow/shrink-0 sizing is
// order-independent.
export const STACKED_IMAGE_FRAME_CLASSES =
  "flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden";

export default function StackedItem({ children }: { children: ReactNode }) {
  return <div className={STACKED_ITEM_CLASSES}>{children}</div>;
}

export function StackedImageFrame({ children }: { children: ReactNode }) {
  return <div className={STACKED_IMAGE_FRAME_CLASSES}>{children}</div>;
}
