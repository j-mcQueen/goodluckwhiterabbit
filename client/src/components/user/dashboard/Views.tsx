import { useState } from "react";
import { handleDownload } from "./utils/handleDownload";
import { createZip } from "./utils/createZip";
import { generateFileBatch } from "./utils/generateFileBatch";

import StarFilled from "../../../assets/media/icons/StarFilled";
import Carousel from "./views/Carousel";
import Grid from "./views/Grid";

export default function Views({ ...props }) {
  const { user, images, setImages, activeImageset } = props;
  const [favourites, setFavourites] = useState([]);
  const [loaded, setLoaded] = useState(images[activeImageset].files.length);
  const [disabled, setDisabled] = useState(false);

  const handleClick = async () => {
    setDisabled(true);
    await generateFileBatch(
      images[activeImageset],
      loaded,
      setLoaded,
      setImages
    );
    setDisabled(false);
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-white xl:text-2xl py-5 max-w-[240px] pl-3">
            {user.name.toUpperCase()}
          </h1>
        </div>

        <div className="text-white flex flex-col gap-5 items-start pl-3">
          {user.files[activeImageset].count ===
          images[activeImageset].files.length ? (
            // encourages user to look through all their files first before downloading
            // hugely resource intensive operation if immediately available
            <button
              type="button"
              className="border border-solid border-white text-lg py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
              onClick={async () => {
                const url = await createZip(
                  images[activeImageset as keyof typeof images]
                );

                return handleDownload(
                  `data:application/zip;base64,${url}`,
                  `${user.name}-${activeImageset}.zip`
                );
              }}
            >
              DOWNLOAD: ALL
            </button>
          ) : null}

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

        <div>
          <p>
            LOADED: {loaded} / {user.files[activeImageset].count}
          </p>

          <button type="button" disabled={disabled} onClick={handleClick}>
            LOAD MORE
          </button>
        </div>
      </div>

      <Carousel
        favourites={favourites}
        setFavourites={setFavourites}
        images={images}
        activeImageset={activeImageset}
      />

      <div className="text-rd text-lg text-center py-20">
        <p>SCROLL FOR GRID &#8595;</p>
      </div>

      <Grid
        favourites={favourites}
        setFavourites={setFavourites}
        images={images}
        setImages={setImages}
        activeImageset={activeImageset}
      />
    </>
  );
}
