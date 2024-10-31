import { useEffect, useState } from "react";
import { handleDownload } from "./utils/handleDownload";
import { createZip } from "./utils/createZip";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";
import { AnimatePresence, motion } from "framer-motion";

import StarFilled from "../../../assets/media/icons/StarFilled";
import Carousel from "./views/Carousel";
import Grid from "./views/Grid";
import Loading from "../../global/Loading";

export default function Views({ ...props }) {
  const {
    user,
    images,
    imageset,
    setImages,
    activeImageset,
    setNotice,
    setSpinner,
    spinner,
  } = props;
  const [favourites, setFavourites] = useState([]);
  const [loaded, setLoaded] = useState(imageset.length);
  const [disabled, setDisabled] = useState(false);

  const handleClick = async () => {
    setSpinner(true);
    setDisabled(true);

    const data = await executeGenerationChain(
      imageset,
      activeImageset,
      setNotice,
      loaded,
      loaded + 10,
      user._id
    );

    setImages({ ...images, [activeImageset]: data.files });
    setLoaded((prevLoaded: number) => prevLoaded + 10);
    setDisabled(false);
    setSpinner(false);
  };

  useEffect(() => {
    setLoaded(imageset.length);
  }, [imageset]);

  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-center justify-between pr-3">
          <h1 className="text-white xl:text-2xl py-5 max-w-[240px] pl-3">
            {user.name.toUpperCase()}
          </h1>

          <div className="text-white flex items-center gap-5 pl-3">
            {spinner ? <Loading /> : null}

            <button
              type="button"
              className="border border-solid border-white text-lg flex gap-1 items-center py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
              onClick={async () => {
                const url = await createZip(favourites);
                return handleDownload(
                  `data:application/zip;base64,${url}`,
                  `${user.name}-${activeImageset}.zip`
                );
              }}
            >
              DOWNLOAD: <StarFilled className="w-5 h-5" red={true} />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-[25px] left-[25px] z-10 text-lg">
        <p className="text-white text-center pb-2">
          LOADED:{" "}
          {
            imageset.filter((item: object) => item instanceof File === true)
              .length
          }{" "}
          / {user.fileCounts[activeImageset]}
        </p>

        <AnimatePresence>
          {imageset.filter((item: object) => item instanceof File === true)
            .length < user.fileCounts[activeImageset] && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              disabled={disabled}
              className="text-white border border-solid border-rd py-1 px-3 bg-black"
              onClick={handleClick}
            >
              LOAD MORE
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {user.fileCounts[activeImageset] ===
            imageset.filter((item: object) => item instanceof File === true)
              .length && (
            // encourages user to look through all their files first before downloading
            // hugely resource intensive operation if immediately available
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              type="button"
              className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
              onClick={async () => {
                const url = await createZip(imageset);

                return handleDownload(
                  `data:application/zip;base64,${url}`,
                  `${user.name}-${activeImageset}.zip`
                );
              }}
            >
              DOWNLOAD: ALL
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <Carousel
        favourites={favourites}
        setFavourites={setFavourites}
        imageset={imageset}
      />

      <div className="text-rd text-lg text-center py-20">
        <p>SCROLL FOR GRID &#8595;</p>
      </div>

      <Grid
        favourites={favourites}
        setFavourites={setFavourites}
        imageset={imageset}
      />
    </>
  );
}
