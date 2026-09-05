import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import { STACKED_ITEM_CLASSES, STACKED_IMAGE_FRAME_CLASSES } from "./StackedItem";
import { widowCellClassName } from "../global/memo/widowCellClassName";

import Image from "./Image";

const SPAN_THRESHOLD = 1.3; // ratio at/above this is "landscape enough" to take 2 grid columns

export default function Unit({ ...props }) {
  const {
    activeGroupId,
    image,
    itemKey,
    layout = "grid",
    onTrigger,
    setActiveGroupId,
    stacked = false,
  } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState(1);

  // "row" is used for a plain block's trailing widow row (see Body.tsx) -
  // rendered in a centered flex row (WidowImagesRow) rather than the dense
  // grid, sized to match the grid's own column width/row height exactly
  // (widowCellClassName) rather than shrinking to WidowMemoPair's smaller
  // paired-with-memo preview size.
  const wrapperClassName = stacked
    ? STACKED_ITEM_CLASSES
    : layout === "row"
      ? widowCellClassName(ratio >= SPAN_THRESHOLD ? 2 : 1)
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

  return (
    <InView
      as="div"
      className={wrapperClassName}
      onChange={(inView) => {
        if (!inView) return; // only act on entering view, not leaving it

        // image.group is ground truth for "what group is now in view" -
        // parsed straight from the just-loaded image's real S3 key, so no
        // arithmetic reconstruction from a display index is needed
        if (image.group !== activeGroupId) setActiveGroupId(image.group);

        // only the true last unit across the whole blocks sequence
        // (Body.tsx) is given a trigger - pagination fires from there
        // instead of from an index === lastIndex comparison
        onTrigger?.();
      }}
    >
      {imageElement}
    </InView>
  );
}
