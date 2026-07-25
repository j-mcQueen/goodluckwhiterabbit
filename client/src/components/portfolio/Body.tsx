import { Fragment } from "react";

import Unit from "./Unit";

export default function Body({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
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
      className="overflow-y-scroll w-full overflow-x-hidden my-[0.625rem] xl:my-5"
    >
      <div className="flex flex-wrap items-stretch justify-center gap-3 xl:gap-5 px-5">
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
