import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import ActionBar from "./ActionBar";

export default function Image({ ...props }) {
  const { activeImage, imageset, carousel } = props;

  return (
    <div className="relative z-0 pt-20">
      <AnimatePresence mode="wait">
        {activeImage && (
          <motion.div
            key={uuidv4()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <img
              loading="lazy"
              src={
                activeImage instanceof File
                  ? URL.createObjectURL(activeImage)
                  : ""
              }
              alt={activeImage?.name}
              className="h-[65dvh]"
            />

            <div className="text-white flex justify-between py-2">
              <ActionBar
                activeImage={activeImage}
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
