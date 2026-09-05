import { Fragment, useRef } from "react";
import { handlePortfolioIntersection } from "./utils/handlePortfolioIntersection";
import { handleMemoBlockIntersection } from "./utils/handleMemoBlockIntersection";
import { PortfolioBlock } from "./types/PortfolioBlock";
import MemoDisplay from "../global/memo/MemoDisplay";

import Unit from "./Unit";
import PortfolioMemoSegments from "./PortfolioMemoSegments";
import PortfolioTrigger from "./PortfolioTrigger";
import StackedItem, { STACKED_ITEM_CLASSES, STACKED_IMAGE_FRAME_CLASSES } from "./StackedItem";
import WidowImagesRow from "../global/memo/WidowImagesRow";

const TAB_CATEGORY: Record<number, string> = {
  0: "PHOTO",
  1: "ART",
  2: "DESIGN",
};

const PLAIN_GRID_CLASSES =
  // row height is viewport-relative (not a flat px) so it tracks column
  // width: with 3 columns, colWidth ≈ 100vw/3, and dividing that by our
  // target single-span cell ratio (~0.85, portrait-friendly) gives
  // ~100vw/(3*0.85) ≈ 39vw - a flat px height would drift toward a
  // landscape-shaped single-span cell as the viewport grows, badly
  // over-cropping portraits
  "grid grid-cols-1 gap-2 px-2 xl:grid-flow-dense xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]";

export default function Body({ ...props }) {
  const {
    activeGroupId,
    activeSub,
    activeSubIndex,
    activeTab,
    blocks,
    bodyRef,
    breadcrumb,
    nextStartIndex,
    route,
    setActiveGroupId,
    setBlocks,
    setContactOpen,
    setNextStartIndex,
    setNotice,
    sidebarData,
  } = props;

  const category = TAB_CATEGORY[activeTab];
  const stacked = category === "ART" || category === "DESIGN";

  // Only one batch fetch may ever be in flight at a time, across both
  // trigger paths below (only one block is ever "the tail" at once, so one
  // shared guard covers both). Without this, a growing memo run can
  // re-fire its own IntersectionObserver purely because appending content
  // made the observed element taller - with no guard, that immediately
  // fires a second overlapping fetch against a stale cursor, duplicating
  // entries (and their React keys) and compounding into a runaway loop.
  // Dropping the redundant call here is safe: once state settles and the
  // container's real size is reflected, a genuine geometry change will
  // fire the observer again on its own and be let through normally.
  const isFetchingRef = useRef(false);

  const runTriggerOnce = async (trigger: () => Promise<void>) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      await trigger();
    } finally {
      isFetchingRef.current = false;
    }
  };

  // fires only from the true last rendered node in the whole blocks
  // sequence, whatever kind of block that happens to be - see the
  // isLast checks in each render branch below
  const triggerPlainPipeline = (imageGroup: string) =>
    runTriggerOnce(() =>
      handlePortfolioIntersection({
        activeGroupId: imageGroup,
        activeSub,
        activeSubIndex,
        activeTab,
        inView: true,
        nextStartIndex,
        route,
        setBlocks,
        setNextStartIndex,
        setNotice,
        sidebarData,
      }),
    );

  const triggerMemoBlock = (block: Extract<PortfolioBlock, { kind: "memo-aware" }>) =>
    runTriggerOnce(() =>
      handleMemoBlockIntersection({
        activeSub,
        activeSubIndex,
        activeTab,
        block,
        route,
        setBlocks,
        setNextStartIndex,
        setNotice,
        sidebarData,
      }),
    );

  const renderPlainImages = (
    block: Extract<PortfolioBlock, { kind: "plain" }>,
    isLastBlock: boolean,
  ) =>
    block.images.map((image, imageIndex) => {
      const isLastImage = isLastBlock && imageIndex === block.images.length - 1;
      return (
        <Fragment key={image.key}>
          <Unit
            activeGroupId={activeGroupId}
            image={image}
            itemKey={image.key}
            onTrigger={isLastImage ? () => triggerPlainPipeline(image.group) : undefined}
            setActiveGroupId={setActiveGroupId}
            stacked={stacked}
          />
        </Fragment>
      );
    });

  const renderStackedMemoBlock = (
    block: Extract<PortfolioBlock, { kind: "memo-aware" }>,
    isLastBlock: boolean,
  ) =>
    block.entries.map((entry, entryIndex) => {
      const key = entry.type === "memo" ? `memo-${entry.memoId}` : `image-${entry.key}`;
      const isLastEntry = isLastBlock && entryIndex === block.entries.length - 1;

      const content =
        entry.type === "memo" ? (
          <MemoDisplay
            html={entry.html}
            onInquire={() => setContactOpen(true)}
            className="w-full"
          />
        ) : (
          <div className={STACKED_IMAGE_FRAME_CLASSES}>
            {(() => {
              const url = block.urlsByKey.get(entry.key);
              return url ? (
                <img
                  src={url}
                  alt=""
                  className="block w-full h-full object-contain"
                  loading="lazy"
                />
              ) : null;
            })()}
          </div>
        );

      return isLastEntry ? (
        <PortfolioTrigger
          key={key}
          className={STACKED_ITEM_CLASSES}
          onTrigger={() => triggerMemoBlock(block)}
        >
          {content}
        </PortfolioTrigger>
      ) : (
        <StackedItem key={key}>{content}</StackedItem>
      );
    });

  return (
    <section
      ref={bodyRef}
      className="overflow-y-scroll w-full overflow-x-hidden mb-[0.625rem] xl:my-2"
    >
      {breadcrumb && (
        <div className="sticky top-0 z-10 w-full bg-black backdrop-blur-sm border-b border-white px-3 py-1 text-md leading-tight tracking-widest text-white uppercase truncate text-center">
          {breadcrumb.category} -- {breadcrumb.subcategory} --{" "}
          {breadcrumb.group}
        </div>
      )}

      {stacked ? (
        <div className="h-full flex flex-col">
          {(blocks as PortfolioBlock[]).map((block, blockIndex) => {
            const isLastBlock = blockIndex === blocks.length - 1;
            return (
              <Fragment key={block.blockKey}>
                {block.kind === "plain"
                  ? renderPlainImages(block, isLastBlock)
                  : renderStackedMemoBlock(block, isLastBlock)}
              </Fragment>
            );
          })}
        </div>
      ) : (
        (blocks as PortfolioBlock[]).map((block, blockIndex) => {
          const isLastBlock = blockIndex === blocks.length - 1;
          // a plain block only ever has something after it once the next
          // group has a memo (consecutive memo-less groups merge into the
          // same block - see appendPlainImages), and a memo-aware group's
          // own final run only has something after it once the *next*
          // group's memo-aware block has started - either way, "is there a
          // following block" here means "does a memo follow"
          const nextBlockIsMemo = blocks[blockIndex + 1]?.kind === "memo-aware";

          if (block.kind === "plain") {
            // trailing widow row, if any, centers separately instead of
            // sitting left-aligned inside the dense grid - trailingWidowKeys
            // is only ever populated once, right when this block closed
            // (see handlePortfolioIntersection.ts's computeTrailingWidowKeys
            // call), using real measured ratios rather than guessing from
            // count alone - a plain image's aspect ratio isn't known until
            // it loads, so a landscape image anywhere earlier in the
            // sequence would throw off a count-based guess
            const widowKeySet = new Set(nextBlockIsMemo ? block.trailingWidowKeys ?? [] : []);
            const mainImages = block.images.filter((image) => !widowKeySet.has(image.key));
            const trailingImages = block.images.filter((image) => widowKeySet.has(image.key));

            return (
              <Fragment key={block.blockKey}>
                <div className={PLAIN_GRID_CLASSES}>
                  {renderPlainImages({ ...block, images: mainImages }, isLastBlock)}
                </div>
                {trailingImages.length > 0 && (
                  // mt-2 matches the main grid's own gap-2 between rows -
                  // this row is a separate sibling container, not an actual
                  // row of that grid, so it needs its own top margin to
                  // avoid sitting flush against the grid above it
                  <WidowImagesRow className="flex flex-col xl:flex-row xl:justify-center gap-2 w-full px-2 mt-2">
                    {trailingImages.map((image) => (
                      <Unit
                        key={image.key}
                        activeGroupId={activeGroupId}
                        image={image}
                        itemKey={image.key}
                        layout="row"
                        setActiveGroupId={setActiveGroupId}
                      />
                    ))}
                  </WidowImagesRow>
                )}
              </Fragment>
            );
          }

          return (
            <PortfolioMemoSegments
              key={block.blockKey}
              entries={block.entries}
              urlsByKey={block.urlsByKey}
              onInquire={() => setContactOpen(true)}
              onTrigger={isLastBlock ? () => triggerMemoBlock(block) : undefined}
              endsBeforeMemo={nextBlockIsMemo}
            />
          );
        })
      )}
    </section>
  );
}
