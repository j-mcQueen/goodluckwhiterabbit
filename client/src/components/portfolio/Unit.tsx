import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import { handleIntersection } from "./utils/handleIntersection";
import { STACKED_ITEM_CLASSES, STACKED_IMAGE_FRAME_CLASSES } from "./StackedItem";

import Image from "./Image";

const SPAN_THRESHOLD = 1.3; // ratio at/above this is "landscape enough" to take 2 grid columns

export default function Unit({ ...props }) {
  const {
    activeGroupId,
    activeSub,
    activeTab,
    image,
    index,
    itemKey,
    lastIndex,
    nextStartIndex,
    setActiveGroupId,
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

        // image.group is ground truth for "what group is now in view" -
        // parsed straight from the just-loaded image's real S3 key, so no
        // arithmetic reconstruction from a display index is needed
        if (image.group !== activeGroupId) setActiveGroupId(image.group);

        const args = {
          activeGroupId: image.group,
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
        if (inView && image.group !== activeGroupId) {
          setActiveGroupId(image.group);
        }
      }}
    >
      {imageElement}
    </InView>
  );
}
