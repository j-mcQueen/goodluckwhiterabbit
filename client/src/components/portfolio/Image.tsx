import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { handleLoad } from "./utils/handleLoad";
import { STACKED_BANNER_IMAGE_CLASSES } from "./StackedItem";

const FIT_CLASSES = {
  cover: "block w-full h-full object-cover",
  contain: "block w-full h-full object-contain",
  banner: STACKED_BANNER_IMAGE_CLASSES,
};

export default function Image({ ...props }) {
  const { image, innerRef, itemKey, setRatio, fit = "cover" } = props;
  const [src, setSrc] = useState("");

  useEffect(() => {
    if (!(image?.blob instanceof Blob)) {
      setSrc("");
      return;
    }

    const url = URL.createObjectURL(image.blob);
    setSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [image?.blob]);

  return (
    <AnimatePresence mode="wait">
      {image && (
        <motion.img
          onLoad={(e) => handleLoad(e, setRatio)}
          key={itemKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          alt=""
          className={FIT_CLASSES[fit as keyof typeof FIT_CLASSES]}
          loading="lazy"
          src={src}
          ref={innerRef}
        />
      )}
    </AnimatePresence>
  );
}
