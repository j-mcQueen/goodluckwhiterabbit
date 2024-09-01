import { handleDownload } from "./utils/handleDownload";

import Download from "../../../assets/media/icons/Download";
import Star from "../../../assets/media/icons/Star";
import StarFilled from "../../../assets/media/icons/StarFilled";

export default function ActionBar({ ...props }) {
  const { allImages, activeImage, favourites, setFavourites, carousel } = props;

  const handleToggle = () => {
    if (!favourites.includes(activeImage)) {
      setFavourites([...favourites, activeImage]);
    } else {
      const filtered = favourites.filter(
        (item: object) => item !== activeImage
      );
      setFavourites(filtered);
    }
  };

  const numberCount = (n: number) => {
    if (n >= 0 && n < 100) {
      return String(n).padStart(3, "0");
    } else if (n >= 100) {
      return n;
    }
  };

  return (
    <>
      <button
        type="button"
        className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
        onClick={() => handleDownload(activeImage.url, activeImage.filename)}
      >
        <Download className="w-5 h-5" />
      </button>

      {carousel ? (
        <p className="text-2xl">
          {numberCount(allImages.indexOf(activeImage) + 1)} /{" "}
          {numberCount(allImages.length)}
        </p>
      ) : null}

      <button
        type="button"
        className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
        onClick={() => handleToggle()}
      >
        {favourites.includes(activeImage) ? (
          <StarFilled className="w-5 h-5" red={true} />
        ) : (
          <Star className="w-5 h-5" />
        )}
      </button>
    </>
  );
}
