import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import { handleIntersection } from "./utils/handleIntersection";
import { STACKED_ITEM_CLASSES, STACKED_IMAGE_FRAME_CLASSES } from "./StackedItem";

import Image from "./Image";

const SPAN_THRESHOLD = 1.3; // ratio at/above this is "landscape enough" to take 2 grid columns

export default function Unit({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    image,
    index,
    itemKey,
    lastIndex,
    nextStartIndex,
    setActiveGroup,
    setImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
    stacked = false,
  } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState(1);

  const wrapperClassName = stacked
    ? STACKED_ITEM_CLASSES
    : `flex overflow-hidden ${ratio >= SPAN_THRESHOLD ? "xl:col-span-2" : ""}`;

  const imageElement = stacked ? (
    <div className={STACKED_IMAGE_FRAME_CLASSES}>
      <Image
        image={image}
        innerRef={imgRef}
        itemKey={itemKey}
        setRatio={setRatio}
        fit="contain"
      />
    </div>
  ) : (
    <Image image={image} innerRef={imgRef} itemKey={itemKey} setRatio={setRatio} />
  );

  return index === lastIndex ? (
    <InView
      as="div"
      className={wrapperClassName}
      onChange={async (inView, entry) => {
        if (entry.intersectionRatio === 1 || !entry.isIntersecting) return; // prevent callback from firing immediately on first load

        const imageGroup = Number(image.group) - 1;
        const diff = imageGroup - activeGroup;
        if (diff !== 0) setActiveGroup(imageGroup);

        const args = {
          activeGroup: diff !== 0 ? imageGroup + 1 : activeGroup + 1,
          activeSub,
          activeTab,
          inView,
          nextStartIndex,
          setImages,
          setNextStartIndex,
          setNotice,
          setStaticKeys,
        };

        return await handleIntersection(args);
      }}
    >
      {imageElement}
    </InView>
  ) : (
    <InView
      as="div"
      className={wrapperClassName}
      onChange={(inView, entry) => {
        if (entry.intersectionRatio === 1) return; // prevent callback from firing immediately on first load
        if (inView) {
          const imageGroup = Number(image.group) - 1;
          const diff = imageGroup - activeGroup;
          if (diff !== 0) setActiveGroup(imageGroup);
        }
      }}
    >
      {imageElement}
    </InView>
  );
}
