import { useState } from "react";
import { handleDownloadAll } from "./utils/handleDownloadAll";
import { AnimatePresence, motion } from "framer-motion";

import Carousel from "./views/Carousel";
import Loading from "../../global/Loading";

export default function Views({ ...props }) {
  const {
    user,
    images,
    activeImageset,
    setImages,
    setNotice,
    setSpinner,
    spinner,
  } = props;

  const [retrieving, setRetrieving] = useState({
    state: false,
    complete: false,
  });

  return (
    <div className="flex">
      <aside className="flex flex-col gap-5 min-w-[245px] max-w-[245px] max-h-[calc(100dvh-57px-1.5rem)] border-r border-solid border-white">
        <h1 className="text-white text-center xl:text-2xl pt-5">
          {user.name.toUpperCase()}
        </h1>

        <div className="text-center">
          <p className="text-white text-center pb-2">
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
            className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors mt-5"
            onClick={() => {
              const args = {
                activeImageset,
                user,
                setNotice,
                setRetrieving,
              };

              handleDownloadAll(args);
            }}
          >
            DOWNLOAD: ALL
          </button>

          {retrieving.state === true ? (
            <AnimatePresence mode="wait">
              {retrieving.state && (
                <motion.p
                  key={"notice"}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-yellow-400 min-w-[245px] max-w-[245px] px-5 pt-5"
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
              className="text-green-400 min-w-[245px] max-w-[245px] px-5 pt-5"
            >
              Download complete. Enjoy!
            </motion.p>
          ) : null}

          {spinner ? (
            <div className="pt-5">
              <Loading />
            </div>
          ) : null}
        </div>
      </aside>

      <div className="w-full h-[calc(100dvh-57px-1.5rem)] overflow-y-scroll">
        <Carousel
          loaded={
            images[activeImageset as keyof typeof setImages].filter(
              (img: Blob) => img instanceof Blob === true
            ).length
          }
          user={user}
          activeImageset={activeImageset}
          images={images}
          setImages={setImages}
          setNotice={setNotice}
          setSpinner={setSpinner}
        />
      </div>
    </div>
  );
}
