import { AnimatePresence, motion } from "framer-motion";

const SelectGallery = ({ ...props }) => {
  const { initialized, setInitialized } = props;

  return (
    <AnimatePresence>
      {!initialized && (
        <motion.main
          initial={{ opacity: 0, translateY: 25 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex flex-col gap-5 items-center justify-center text-white h-outer w-outer">
            <hgroup className="text-center">
              <h1 className="font-liquid text-2xl xl:text-3xl tracking-widest opacity-80 drop-shadow-glo">
                only one click away
              </h1>

              <p>SELECT THE SET OF IMAGES YOU WANT TO VIEW:</p>
            </hgroup>

            <div className="flex gap-5">
              <button
                type="button"
                className="border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all"
                onClick={() => setInitialized(true)}
              >
                PREVIEWS
              </button>

              <button
                type="button"
                className="border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all"
              >
                GALLERY
              </button>

              <button
                type="button"
                className="border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all"
              >
                SOCIALS
              </button>
            </div>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
};
export default SelectGallery;
