import { CSSProperties, useMemo } from "react";
import { mobile } from "../global/utils/determineViewport";
import {
  PortfolioLayoutEntry,
  splitPortfolioLayoutIntoSegments,
} from "../global/utils/splitPortfolioLayoutIntoSegments";
import MemoDisplay from "../global/memo/MemoDisplay";
import WidowMemoPair from "../global/memo/WidowMemoPair";
import WidowImagesRow from "../global/memo/WidowImagesRow";
import { widowCellClassName } from "../global/memo/widowCellClassName";
import PortfolioTrigger from "./PortfolioTrigger";

// Non-stacked (PHOTO) segment renderer for a memo-aware block - extracted
// from MemoAwareBody.tsx so Body.tsx can mount it per-block instead of only
// via a whole-view swap. Segmented grid blocks per run, explicit
// grid-row/grid-column placement from the packing simulation rather than
// grid-auto-flow: dense, and widow rows co-centered with their following
// memo - see splitPortfolioLayoutIntoSegments.ts and packPortfolioRun.ts
// for why.
//
// Segments are derived from the block's raw, accumulating `entries` here
// rather than stored in block state - the block only ever holds the layout
// entries fetched so far (see PortfolioBlock.ts), and re-deriving is cheap
// at these group sizes. This does mean a run that looks like the group's
// final (possibly-widowed) run can be reclassified once the next batch
// arrives and turns out to continue it or reveal a following memo -
// accepted as a rare, self-correcting cosmetic reflow (see plan).
const GRID_CLASSES =
  "grid grid-cols-1 gap-2 px-2 xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]";

export default function PortfolioMemoSegments({
  entries,
  urlsByKey,
  onInquire,
  onTrigger,
  endsBeforeMemo = false,
}: {
  entries: PortfolioLayoutEntry[];
  urlsByKey: Map<string, string>;
  onInquire: () => void;
  onTrigger?: () => void;
  // true when the *next* block is memo-aware (a different group's memo) -
  // this group's own absolute final run, if it's a widow, should still
  // center rather than stay a left-aligned short row, even though the
  // pairing memo isn't part of this block at all (see splitPortfolioLayoutIntoSegments.ts)
  endsBeforeMemo?: boolean;
}) {
  const segments = useMemo(
    () => splitPortfolioLayoutIntoSegments(entries, endsBeforeMemo),
    [entries, endsBeforeMemo],
  );

  const renderImage = (key: string, fit: "cover" | "contain" = "cover") => {
    const url = urlsByKey.get(key);
    if (!url) return null;
    return (
      <img
        src={url}
        alt=""
        className={`block w-full h-full ${fit === "contain" ? "object-contain" : "object-cover"}`}
        loading="lazy"
      />
    );
  };

  return (
    // my-12 lives on each memo/widow segment itself (below), not as a gap
    // on this container - flex `gap` only inserts space *between*
    // siblings, so a group-intro memo (the very first segment here, with
    // no earlier sibling in this component) would get none of it above,
    // while still getting the full amount below. Margin on the segment's
    // own box doesn't have that asymmetry: it pushes away from whatever's
    // adjacent regardless of position, including the previous block's
    // content in Body.tsx, which sits in a different DOM subtree entirely.
    <div className="flex flex-col">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;

        if (segment.kind === "widow") {
          // mobile has no row/widow concept at all (single column already) -
          // stack full-width exactly like a mobile run's images. Desktop
          // sizes to match the grid itself (widowCellClassName) rather than
          // WidowMemoPair's smaller paired-with-memo preview size, and
          // hides below xl like every other desktop-branch cell here (the
          // mobile branch above handles anything narrower via the JS
          // `mobile` check instead).
          const content = mobile ? (
            <div className="flex flex-col gap-2 px-2">
              {segment.images.map((image) => (
                <div key={image.key} className="w-full aspect-[4/3] overflow-hidden">
                  {renderImage(image.key)}
                </div>
              ))}
            </div>
          ) : (
            <WidowImagesRow>
              {segment.images.map((image) => (
                <div key={image.key} className={`hidden xl:block ${widowCellClassName(image.columnSpan)}`}>
                  {renderImage(image.key)}
                </div>
              ))}
            </WidowImagesRow>
          );

          if (!isLast || !onTrigger) {
            return (
              <div key="widow" className="my-12">
                {content}
              </div>
            );
          }

          return (
            <PortfolioTrigger key="widow" className="my-12" onTrigger={onTrigger}>
              {content}
            </PortfolioTrigger>
          );
        }

        if (segment.kind === "memo") {
          const content =
            segment.pairedWidowImages.length > 0 ? (
              <WidowMemoPair
                widowImages={segment.pairedWidowImages}
                renderImage={renderImage}
                html={segment.html}
                onInquire={onInquire}
              />
            ) : (
              <MemoDisplay html={segment.html} onInquire={onInquire} />
            );

          if (!isLast || !onTrigger) {
            return (
              <div key={`memo-${segment.memoId}`} className="my-12">
                {content}
              </div>
            );
          }

          return (
            <PortfolioTrigger key={`memo-${segment.memoId}`} className="my-12" onTrigger={onTrigger}>
              {content}
            </PortfolioTrigger>
          );
        }

        if (mobile) {
          // trigger sits on the last individual cell, not the run's outer
          // container - a run merges every consecutive image batch with no
          // intervening memo (see the file-level comment above), so its
          // container can end up far taller than the viewport. An
          // IntersectionObserver only fires again once its target's
          // isIntersecting flips false-then-true; a container that already
          // spans past both edges of the viewport never flips again as
          // more cells are appended inside it, silently stalling
          // pagination. A small per-cell trigger, replaced by a fresh one
          // as each new last image arrives, doesn't have that problem -
          // exactly how the plain pipeline's per-Unit trigger behaves.
          const lastImageIndex = segment.images.length - 1;
          const cellClassName = "w-full aspect-[4/3] overflow-hidden";
          const runContent = segment.images.map((image, imageIndex) =>
            isLast && onTrigger && imageIndex === lastImageIndex ? (
              <PortfolioTrigger key={image.key} className={cellClassName} onTrigger={onTrigger}>
                {renderImage(image.key)}
              </PortfolioTrigger>
            ) : (
              <div key={image.key} className={cellClassName}>
                {renderImage(image.key)}
              </div>
            ),
          );

          return (
            <div key={`run-${index}`} className="flex flex-col gap-2 px-2">
              {runContent}
            </div>
          );
        }

        // same reasoning as the mobile branch above - trigger goes on the
        // last placement's own cell, not the run's outer grid container
        const lastPlacementKey = segment.packing.placements.at(-1)?.key;
        const cellClassName = "overflow-hidden hidden xl:block";
        const runContent = segment.packing.placements.map((placement) => {
          const style: CSSProperties = {
            gridColumn: `${placement.column} / span ${placement.columnSpan}`,
            gridRow: `${placement.row} / span 1`,
          };

          return isLast && onTrigger && placement.key === lastPlacementKey ? (
            <PortfolioTrigger key={placement.key} className={cellClassName} style={style} onTrigger={onTrigger}>
              {renderImage(placement.key)}
            </PortfolioTrigger>
          ) : (
            <div key={placement.key} className={cellClassName} style={style}>
              {renderImage(placement.key)}
            </div>
          );
        });

        return (
          <div key={`run-${index}`} className={GRID_CLASSES}>
            {runContent}
          </div>
        );
      })}
    </div>
  );
}
