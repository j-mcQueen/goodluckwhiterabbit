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
    <aside className="grid items-center xl:flex xl:flex-col gap-2 xl:gap-5 xl:min-w-sidebar xl:max-w-sidebar xl:max-h-[calc(100dvh-57px-var(--frame))] xl:border-r border-solid border-white/20 border-b pb-5">
      <h1 className="font-tnrBI xl:text-2xl text-white text-center tracking-widest opacity-80 drop-shadow-glo max-xl:col-start-1 max-xl:col-end-1 max-xl:pl-3 pt-8">
        {user.name.toUpperCase()}
      </h1>

      <div className="text-white text-left xl:text-center text-xl max-xl:row-start-2 max-xl:row-end-2 max-xl:col-start-1 max-xl:col-end-1 max-xl:pl-3">
        <p>{user.category}</p>
      </div>

      <p className="text-right xl:pb-2 text-rd max-xl:row-start-1 max-xl:row-end-1 max-xl:col-start-2 max-xl:col-end-2 max-xl:pr-3">
        LOADED:{" "}
        {
          images[activeImageset as keyof typeof images].filter(
            (img: Blob) => img instanceof Blob === true,
          ).length
        }{" "}
        / {user.fileCounts[activeImageset]}
      </p>

      <button
        type="button"
        className="border border-solid border-white/20 text-lg text-white py-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors max-xl:row-start-2 max-xl:row-end-2 max-xl:col-start-2 max-xl:col-end-2 max-xl:mr-3"
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

      <div>
        {retrieving.state === true ? (
          <AnimatePresence mode="wait">
            {retrieving.state && (
              <motion.p
                key={"notice"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-ylw min-w-sidebar max-w-sidebar px-5 pt-5"
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
            className="text-blu min-w-sidebar max-w-sidebar px-5 pt-5"
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
