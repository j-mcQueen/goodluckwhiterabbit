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
        <h1 className="text-white xl:text-2xl py-5 max-w-[240px] pl-3">
          {user.name.toUpperCase()}
        </h1>
      </div>

      <div className="absolute bottom-[25px] left-[25px] z-10 text-lg">
        {spinner ? <Loading /> : null}

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
            className="border border-solid border-white text-lg text-white py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
            onClick={async () => {
              const filtered = imageset.filter(
                (item: object) => item instanceof File === true
              );
              await createZip(filtered, `${user.name}-${activeImageset}.zip`);
            }}
          >
            DOWNLOAD: ALL
          </button>
        ) : (
          <button
            type="button"
            disabled={disabled}
            className="text-white border border-solid border-rd py-1 px-3 bg-black"
            onClick={handleClick}
          >
            LOAD MORE
          </button>
        )}
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
