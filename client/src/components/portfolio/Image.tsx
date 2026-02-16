import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

export default function Image({ ...props }) {
  const { image } = props;
  const imgRef = useRef<HTMLImageElement>(null);

  return (
    <AnimatePresence mode="wait">
      {image && (
        <motion.div
          key={"test"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <img
            alt=""
            className={""}
            loading="lazy"
            src={image instanceof Blob ? URL.createObjectURL(image) : ""}
            ref={imgRef}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
