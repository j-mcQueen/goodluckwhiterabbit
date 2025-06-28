import { useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mobile } from "./utils/determineViewport";
import ActionBar from "./ActionBar";

export default function ImageItem({ ...props }) {
  const { activeImage, carousel, user, activeImageset, imageset, setNotice } =
    props;

  const imgRef = useRef<HTMLImageElement>(null);

  const variants = {
    carousel: "h-[50dvh]",
    scrollerV: "max-h-[70dvh]",
    scrollerH: "max-w-[20dvw]",
  };

  return (
    <AnimatePresence mode="wait">
      {activeImage && (
        <motion.div
          key={activeImage.name}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <img
            ref={imgRef}
            loading="lazy"
            src={
              activeImage instanceof Blob
                ? URL.createObjectURL(activeImage)
                : ""
            }
            alt={activeImage?.name}
            className={
              carousel
                ? "h-[75dvh]"
                : imgRef.current
                  ? imgRef.current.width > imgRef.current.height
                    ? variants.scrollerH
                    : variants.scrollerV
                  : mobile
                    ? "max-h-[50dvh]"
                    : "max-h-[30dvh]"
            }
          />

          <div className="text-white flex justify-between py-2">
            <ActionBar
              user={user}
              activeImage={activeImage}
              activeImageset={activeImageset}
              imageset={imageset}
              carousel={carousel}
              setNotice={setNotice}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
