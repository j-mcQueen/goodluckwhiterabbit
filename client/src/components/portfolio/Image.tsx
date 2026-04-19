import { AnimatePresence, motion } from "framer-motion";
import { handleLoad } from "./utils/handleLoad";

export default function Image({ ...props }) {
  const { image, innerRef, setRatio } = props;

  return (
    <AnimatePresence mode="wait">
      {image && (
        <motion.img
          onLoad={(e) => handleLoad(e, setRatio)}
          key={String(image.blob.size)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          alt=""
          className={`block object-cover`}
          loading="lazy"
          src={
            image.blob instanceof Blob ? URL.createObjectURL(image.blob) : ""
          }
          ref={innerRef}
        />
      )}
    </AnimatePresence>
  );
}
