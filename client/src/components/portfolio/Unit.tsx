import { InView } from "react-intersection-observer";
import { useState } from "react";

import Image from "./Image";
import { testActiveGroup } from "./utils/testActiveGroup";
import { handleIntersection } from "./utils/handleIntersection";

export default function Unit({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    existingImages,
    image,
    index,
    lastIndex,
    setActiveGroup,
    setExistingImages,
    setLoadedImages,
    setNotice,
    setStaticKeys,
    staticKeys,
  } = props;
  const [nextStartIndex, setNextStartIndex] = useState(lastIndex);
  const [thresholds, setThresholds] = useState([]);

  return index === lastIndex ? (
    <InView
      as="div"
      onChange={async (inView, entry) => {
        if (entry.intersectionRatio === 1) return; // prevent callback from firing immediately on first load

        const args = {
          activeGroup,
          activeSub,
          activeTab,
          existingImages,
          inView,
          nextStartIndex,
          setExistingImages,
          setLoadedImages,
          setNextStartIndex,
          setNotice,
          setStaticKeys,
          setThresholds,
          staticKeys,
          thresholds,
        };
        return handleIntersection(args);
      }}
    >
      <Image image={image} />
    </InView>
  ) : (
    <InView
      as="div"
      onChange={(inView, entry) => {
        if (entry.intersectionRatio === 1) return; // prevent callback from firing immediately on first load

        if (inView) {
          const args = {
            activeGroup,
            index,
            setActiveGroup,
            thresholds,
          };

          return testActiveGroup(args);
        }
      }}
    >
      <Image image={image} />
    </InView>
  );
}
