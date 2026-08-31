import { Fragment, useEffect, useState } from "react";
import { checkPortfolioGroupHasMemo } from "../global/memo/checkPortfolioGroupHasMemo";

import Unit from "./Unit";
import MemoAwareBody from "./MemoAwareBody";

const TAB_CATEGORY: Record<number, string> = {
  0: "PHOTO",
  1: "ART",
  2: "DESIGN",
};

export default function Body({ ...props }) {
  const {
    activeGroupId,
    activeSub,
    activeTab,
    bodyRef,
    breadcrumb,
    images,
    nextStartIndex,
    setActiveGroupId,
    setContactOpen,
    setImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
    staticKeys,
  } = props;

  const category = TAB_CATEGORY[activeTab];
  // real S3 groupId, resolved upstream (Portfolio.tsx) from the taxonomy -
  // `activeGroup` is only a position in the sidebar's order-sorted list
  const groupId = activeGroupId as string | undefined;
  const stacked = category === "ART" || category === "DESIGN";

  // `images` can be a cross-group spillover list from the existing
  // infinite-scroll pagination (generatePortfolioUrls spills into the next
  // group once the current one is exhausted) - swapping the whole view to
  // MemoAwareBody the moment activeGroup's intersection-observer tracking
  // touches a memo-managed group would cut that spillover view off
  // mid-scroll. Only doing so for a "clean" single-group view (everything
  // currently loaded belongs to groupId - true right after a sidebar group
  // click, which replaces `images` outright) keeps the untouched scroll
  // path intact; scrolling organically into a memo-managed group via
  // spillover is explicitly out of scope for this pass (see spec task
  // notes) and falls back to the existing grid instead of swapping.
  const isCleanSingleGroupView =
    images.length > 0 &&
    images.every((unit: { group: string }) => unit.group === groupId);

  // zero-memo groups (the overwhelming default) never run this check's
  // result through anything - see the render branch below, which falls
  // straight through to the untouched grid unless this resolves true
  const [hasMemo, setHasMemo] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setHasMemo(false);

    if (category && activeSub && groupId) {
      checkPortfolioGroupHasMemo(category, activeSub, groupId).then(
        (result) => {
          if (!cancelled) setHasMemo(result);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, [category, activeSub, groupId]);

  return (
    <section
      ref={bodyRef}
      className="overflow-y-scroll w-full overflow-x-hidden mb-[0.625rem] xl:my-2"
    >
      {breadcrumb && (
        <div className="sticky top-0 z-10 w-full bg-black backdrop-blur-sm border-b border-white px-3 py-1 text-md leading-tight tracking-widest text-white/75 uppercase truncate text-center">
          {breadcrumb.category} -- {breadcrumb.subcategory} --{" "}
          {breadcrumb.group}
        </div>
      )}

      {hasMemo && isCleanSingleGroupView && groupId ? (
        <MemoAwareBody
          category={category}
          sub={activeSub}
          groupId={groupId}
          setContactOpen={setContactOpen}
        />
      ) : (
        <div
          className={
            stacked
              ? "h-full flex flex-col"
              : // row height is viewport-relative (not a flat px) so it
                // tracks column width: with 3 columns, colWidth ≈ 100vw/3,
                // and dividing that by our target single-span cell ratio
                // (~0.85, portrait-friendly) gives ~100vw/(3*0.85) ≈ 39vw -
                // a flat px height would drift toward a landscape-shaped
                // single-span cell as the viewport grows, badly
                // over-cropping portraits
                "grid grid-cols-1 gap-2 px-2 xl:grid-flow-dense xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]"
          }
        >
          {images.map((unit: { image: Blob; group: string }, index: number) => {
            return (
              <Fragment key={staticKeys[index]}>
                <Unit
                  activeGroupId={activeGroupId}
                  activeSub={activeSub}
                  activeTab={activeTab}
                  image={unit}
                  index={index}
                  itemKey={staticKeys[index]}
                  lastIndex={images.length - 1}
                  nextStartIndex={nextStartIndex}
                  setActiveGroupId={setActiveGroupId}
                  setImages={setImages}
                  setNextStartIndex={setNextStartIndex}
                  setNotice={setNotice}
                  setStaticKeys={setStaticKeys}
                  stacked={stacked}
                />
              </Fragment>
            );
          })}
        </div>
      )}
    </section>
  );
}
