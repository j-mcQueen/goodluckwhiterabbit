import { useEffect, useState } from "react";
import { createZip } from "./utils/createZip";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";

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
    <div className="flex">
      <aside className="flex flex-col gap-5 min-w-[245px] max-h-[calc(100dvh-57px-1.5rem)] border-r border-solid border-white">
        <h1 className="text-white text-center xl:text-2xl pt-5">
          {user.name.toUpperCase()}
        </h1>

        <div className="text-center">
          <p className="text-white text-center pb-2">
            LOADED:{" "}
            {
              imageset.filter((item: object) => item instanceof File === true)
                .length
            }{" "}
            / {user.fileCounts[activeImageset]}
          </p>

          {user.fileCounts[activeImageset] ===
          imageset.filter((item: object) => item instanceof File === true)
            .length ? (
            // encourages user to look through all their files first before downloading
            // hugely resource intensive operation if immediately available
            <button
              type="button"
              className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors mt-5"
              onClick={async () => {
                const filtered = imageset.filter(
                  (item: object) => item instanceof File === true
                );
                await createZip(filtered, `${user.name}-${activeImageset}.zip`);
              }}
            >
              DOWNLOAD: ALL
            </button>
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
          userId={user._id}
          activeImageset={activeImageset}
          imageset={imageset}
        />

        <div className="text-rd text-lg text-center py-20">
          <p>SCROLL FOR GRID &#8595;</p>
        </div>

        <Grid
          spinner={spinner}
          imageset={imageset}
          userId={user._id}
          activeImageset={activeImageset}
          fileCounts={user.fileCounts[activeImageset]}
          disabled={disabled}
          handleClick={handleClick}
        />
      </div>
    </div>
  );
}
