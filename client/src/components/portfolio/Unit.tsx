import { InView } from "react-intersection-observer";
import { useState, useRef } from "react";
import {
  STACKED_ITEM_CLASSES,
  STACKED_BANNER_ITEM_CLASSES,
  STACKED_IMAGE_FRAME_CLASSES,
} from "./StackedItem";
import { widowCellClassName } from "../global/memo/widowCellClassName";

import Image from "./Image";

const SPAN_THRESHOLD = 1.3; // ratio at/above this is "landscape enough" to take 2 grid columns

export default function Unit({ ...props }) {
  const {
    image,
    itemKey,
    layout = "grid",
    onTrigger,
    stacked = false,
  } = props;
  const imgRef = useRef<HTMLImageElement>(null);
  const [ratio, setRatio] = useState(1);

  // "row" is used for a plain block's trailing widow row (see Body.tsx) -
  // rendered in a centered flex row (WidowImagesRow) rather than the dense
  // grid, sized to match the grid's own column width/row height exactly
  // (widowCellClassName) rather than shrinking to WidowMemoPair's smaller
  // paired-with-memo preview size.
  const banner = stacked && Boolean(image?.banner);

  const wrapperClassName = stacked
    ? banner
      ? STACKED_BANNER_ITEM_CLASSES
      : STACKED_ITEM_CLASSES
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
        fit={banner ? "banner" : "contain"}
      />
    </div>
  ) : (
    <Image image={image} innerRef={imgRef} itemKey={itemKey} setRatio={setRatio} />
  );

  return (
    <InView
      as="div"
      className={wrapperClassName}
      // read by Body's scroll line check to tell which group this image
      // belongs to - image.group is parsed straight from its real S3 key
      data-group={image.group}
      onChange={(inView) => {
        if (!inView) return; // only act on entering view, not leaving it

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
