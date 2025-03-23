import { useState } from "react";
import { handleDownloadAll } from "./utils/handleDownloadAll";

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
  const [disabled, setDisabled] = useState(false);
  const [retrieving, setRetrieving] = useState(false);

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
              imageset.filter((item: object) => item instanceof File === true)
                .length
            }{" "}
            / {user.fileCounts[activeImageset]}
          </p>

          <button
            type="button"
            className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:drop-shadow-red xl:focus:text-rd xl:focus:border-rd transition-colors mt-5"
            onClick={() => {
              const args = {
                activeImageset,
                link: user.links[activeImageset],
                name: user.name,
                setRetrieving,
              };

              handleDownloadAll(args);
            }}
          >
            DOWNLOAD: ALL
          </button>

          {retrieving ? (
            <p className="text-yellow-400 max-w-[245px] px-5 pt-5">
              Please keep portal open while your zip file downloads... Slow and
              steady wins the race!
            </p>
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
          images={images}
          setImages={setImages}
          setNotice={setNotice}
          setDisabled={setDisabled}
          setSpinner={setSpinner}
          imageset={imageset}
          userId={user._id}
          activeImageset={activeImageset}
          fileCounts={user.fileCounts[activeImageset]}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
