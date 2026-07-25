import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { handleLoad } from "./utils/handleLoad";

export default function Image({ ...props }) {
  const { image, innerRef, itemKey, setRatio } = props;
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
          className={`block object-cover`}
          loading="lazy"
          src={src}
          ref={innerRef}
        />
      )}
    </AnimatePresence>
  );
}
