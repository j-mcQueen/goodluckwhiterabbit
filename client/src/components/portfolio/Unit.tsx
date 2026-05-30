import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import { handleIntersection } from "./utils/handleIntersection";

import Image from "./Image";

export default function Unit({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    image,
    index,
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
      style={{ flexGrow: ratio }}
      className={`flex shrink basis-0 min-w-[90dvw] xl:min-w-[600px]`}
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
      <Image image={image} innerRef={imgRef} setRatio={setRatio} />
    </InView>
  ) : (
    <InView
      as="div"
      style={{ flexGrow: ratio }}
      className={`flex shrink basis-0 min-w-[90dvw] xl:min-w-[600px]`}
      onChange={(inView, entry) => {
        if (entry.intersectionRatio === 1) return; // prevent callback from firing immediately on first load
        if (inView) {
          const imageGroup = Number(image.group) - 1;
          const diff = imageGroup - activeGroup;
          if (diff !== 0) setActiveGroup(imageGroup);
        }
      }}
    >
      <Image image={image} innerRef={imgRef} setRatio={setRatio} />
    </InView>
  );
}
