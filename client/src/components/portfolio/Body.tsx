import { Fragment, useState } from "react";
import { generateKeys } from "../global/utils/generateKeys";

import Unit from "./Unit";

export default function Body({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
    images,
    setActiveGroup,
    setImages,
    setNotice,
  } = props;

  const [staticKeys, setStaticKeys] = useState(generateKeys(10));
  const [nextStartIndex, setNextStartIndex] = useState(10);

  return (
    <section
      ref={bodyRef}
      className="overflow-y-scroll w-full overflow-x-hidden my-5"
    >
      <div className="flex flex-wrap items-stretch justify-center gap-5 px-5">
        {images.map((unit: { image: Blob; group: string }, index: number) => {
          return (
            <Fragment key={staticKeys[index]}>
              <Unit
                activeGroup={activeGroup}
                activeSub={activeSub}
                activeTab={activeTab}
                image={unit}
                index={index}
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
