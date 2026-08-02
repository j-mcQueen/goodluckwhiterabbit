import { AnimatePresence, motion } from "framer-motion";
import SelectBtn from "./SelectBtn";

const SelectGallery = ({ ...props }) => {
  const { initialized, handleSelect, user } = props;

  const buttonVariants = {
    populated:
      "border border-solid border-white py-2 px-3 text-lg xl:hover:text-rd xl:hover:border-rd focus:text-red focus:border-rd xl:hover:drop-shadow-red focus:outline-none transition-all",
    empty:
      "border border-solid border-white py-2 px-3 text-lg relative opacity-15",
  };

  const fileCountEntries = Object.entries(user.fileCounts);
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
              <h1 className="font-tnrBI text-2xl xl:text-3xl tracking-widest opacity-80 drop-shadow-glo">
                ENJOY !
              </h1>
            </hgroup>

            <div className="flex gap-5 tracking-wider">
              {fileCountEntries.map((item) => {
                return (
                  <SelectBtn
                    key={item[0]}
                    buttonVariants={buttonVariants}
                    count={item[1]}
                    handleSelect={handleSelect}
                    imageset={item[0]}
                  />
                );
              })}
            </div>
          </div>
        </motion.main>
      )}
    </AnimatePresence>
  );
};
export default SelectGallery;
