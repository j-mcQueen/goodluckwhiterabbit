import { AnimatePresence, motion } from "framer-motion";

const SelectGallery = ({ ...props }) => {
  const { initialized, handleSelect, user } = props;

  const buttonVariants = {
    populated:
      "border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all",
    empty:
      "border border-solid border-white py-2 px-3 relative line-through text-black bg-white",
  };

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

              <p className="pt-4">SELECT THE SET OF IMAGES YOU WANT TO VIEW:</p>
            </hgroup>

            <div className="flex gap-5">
              <button
                disabled={user.fileCounts.previews === 0}
                type="button"
                className={
                  user.fileCounts.previews === 0
                    ? buttonVariants["empty"]
                    : buttonVariants["populated"]
                }
                onClick={() => handleSelect("socials")}
              >
                PREVIEWS
              </button>

              <button
                disabled={user.fileCounts.full === 0}
                type="button"
                className={
                  user.fileCounts.full === 0
                    ? buttonVariants["empty"]
                    : buttonVariants["populated"]
                }
                onClick={() => handleSelect("full")}
              >
                GALLERY
              </button>

              <button
                disabled={user.fileCounts.socials === 0}
                type="button"
                className={
                  user.fileCounts.socials === 0
                    ? buttonVariants["empty"]
                    : buttonVariants["populated"]
                }
                onClick={() => handleSelect("socials")}
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
