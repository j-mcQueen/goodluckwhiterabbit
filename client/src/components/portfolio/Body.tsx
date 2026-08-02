import { Fragment } from "react";

import Unit from "./Unit";

export default function Body({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
    breadcrumb,
    images,
    nextStartIndex,
    setActiveGroup,
    setImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
    staticKeys,
  } = props;

  return (
    <section
      ref={bodyRef}
      className="overflow-y-scroll w-full overflow-x-hidden mb-[0.625rem] xl:my-2"
    >
      {breadcrumb && (
        <div className="sticky top-0 z-10 w-full bg-black backdrop-blur-sm border-b border-white/20 px-3 py-1 text-md leading-tight tracking-widest text-white/75 uppercase truncate text-center">
          {breadcrumb.category} -- {breadcrumb.subcategory} --{" "}
          {breadcrumb.group}
        </div>
      )}

      {/* row height is viewport-relative (not a flat px) so it tracks column
          width: with 3 columns, colWidth ≈ 100vw/3, and dividing that by our
          target single-span cell ratio (~0.85, portrait-friendly) gives
          ~100vw/(3*0.85) ≈ 39vw - a flat px height would drift toward a
          landscape-shaped single-span cell as the viewport grows, badly
          over-cropping portraits */}
      <div className="grid grid-cols-1 gap-2 px-2 xl:grid-flow-dense xl:auto-rows-[39vw] xl:[grid-template-columns:repeat(3,minmax(320px,1fr))]">
        {images.map((unit: { image: Blob; group: string }, index: number) => {
          return (
            <Fragment key={staticKeys[index]}>
              <Unit
                activeGroup={activeGroup}
                activeSub={activeSub}
                activeTab={activeTab}
                image={unit}
                index={index}
                itemKey={staticKeys[index]}
                lastIndex={images.length - 1}
                nextStartIndex={nextStartIndex}
                setActiveGroup={setActiveGroup}
                setImages={setImages}
                setNextStartIndex={setNextStartIndex}
                setNotice={setNotice}
                setStaticKeys={setStaticKeys}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
