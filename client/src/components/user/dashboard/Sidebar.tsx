import { AnimatePresence, motion } from "framer-motion";
import { handleDownloadAll } from "./utils/handleDownloadAll";
import Loading from "../../global/Loading";

export default function Sidebar({ ...props }) {
  const {
    activeImageset,
    images,
    retrieving,
    setNotice,
    setRetrieving,
    spinner,
    user,
  } = props;

  return (
    <aside className="flex flex-col xl:gap-5 xl:min-w-[245px] xl:max-w-[245px] xl:max-h-[calc(100dvh-57px-1.5rem)] xl:border-r border-solid border-white">
      <h1 className="text-white text-center text-2xl pt-5">
        {user.name.toUpperCase()}
      </h1>

      <div className="text-white text-center text-2xl pb-2">
        <p>{user.category}</p>
      </div>

      <div className="text-center flex xl:block items-center justify-between px-5 xl:px-0 py-5 xl:py-0 border-b xl:border-none border-solid border-white">
        <p className="text-center xl:pb-2 text-rd">
          LOADED:{" "}
          {
            images[activeImageset as keyof typeof images].filter(
              (img: Blob) => img instanceof Blob === true
            ).length
          }{" "}
          / {user.fileCounts[activeImageset]}
        </p>

        <button
          type="button"
          className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors xl:mt-5"
          onClick={() => {
            const args = {
              activeImageset,
              setNotice,
              setRetrieving,
              user,
            };

            handleDownloadAll(args);
          }}
        >
          DOWNLOAD: ALL
        </button>
      </div>

      <div>
        {retrieving.state === true ? (
          <AnimatePresence mode="wait">
            {retrieving.state && (
              <motion.p
                key={"notice"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ylw min-w-[245px] max-w-[245px] px-5 pt-5"
              >
                Your download has started. Please keep this page open while it
                completes!
              </motion.p>
            )}
          </AnimatePresence>
        ) : retrieving.complete ? (
          <motion.p
            key={"notice"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-blu min-w-[245px] max-w-[245px] px-5 pt-5"
          >
            Download complete. Enjoy!
          </motion.p>
        ) : null}

        {spinner ? (
          <div className="pt-5 text-center">
            <Loading />
          </div>
        ) : null}
      </div>
    </aside>
  );
}
