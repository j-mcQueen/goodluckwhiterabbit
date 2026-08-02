import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import { handleIntersection } from "./utils/handleIntersection";

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
  } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState(1);

  return index === lastIndex ? (
    <InView
      as="div"
      className={`flex overflow-hidden ${ratio >= SPAN_THRESHOLD ? "xl:col-span-2" : ""}`}
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
      <Image
        image={image}
        innerRef={imgRef}
        itemKey={itemKey}
        setRatio={setRatio}
      />
    </InView>
  ) : (
    <InView
      as="div"
      className={`flex overflow-hidden ${ratio >= SPAN_THRESHOLD ? "xl:col-span-2" : ""}`}
      onChange={(inView, entry) => {
        if (entry.intersectionRatio === 1) return; // prevent callback from firing immediately on first load
        if (inView) {
          const imageGroup = Number(image.group) - 1;
          const diff = imageGroup - activeGroup;
          if (diff !== 0) setActiveGroup(imageGroup);
        }
      }}
    >
      <Image
        image={image}
        innerRef={imgRef}
        itemKey={itemKey}
        setRatio={setRatio}
      />
    </InView>
  );
}
