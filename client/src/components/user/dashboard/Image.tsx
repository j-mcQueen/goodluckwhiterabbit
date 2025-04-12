import { AnimatePresence, motion } from "framer-motion";
import ActionBar from "./ActionBar";
import { useRef } from "react";

export default function Image({ ...props }) {
  const { activeImage, activeImageset, userId, imageset, carousel } = props;

  const imgRef = useRef<HTMLImageElement>(null);

  const variants = {
    carousel: "h-[50dvh]",
    gridV: "max-h-[40dvh]",
    gridH: "max-w-[20dvw]",
  };

  return (
    <div className="relative z-0 pt-20">
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
                activeImage instanceof File
                  ? URL.createObjectURL(activeImage)
                  : ""
              }
              alt={activeImage?.name}
              className={
                carousel
                  ? "h-[50dvh]"
                  : imgRef.current
                    ? imgRef.current.width > imgRef.current.height
                      ? variants.gridH
                      : variants.gridV
                    : "max-h-[30dvh]"
              }
            />

            <div className="text-white flex justify-between py-2">
              <ActionBar
                userId={userId}
                activeImage={activeImage}
                activeImageset={activeImageset}
                imageset={imageset}
                carousel={carousel}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
