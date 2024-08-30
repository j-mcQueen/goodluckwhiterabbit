import { handleDownload } from "./utils/handleDownload";

import Download from "../../../assets/media/icons/Download";
import Star from "../../../assets/media/icons/Star";
import StarFilled from "../../../assets/media/icons/StarFilled";

export default function Image({ ...props }) {
  const { activeImage, setFavourites, favourites } = props;

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

  return (
    <div className="relative">
      <img
        src={activeImage?.url}
        alt={activeImage?.filename}
        className="h-[80dvh]"
      />

      <div className="text-white flex justify-between pt-2">
        <button
          type="button"
          className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
          onClick={() => handleDownload(activeImage.url, activeImage.filename)}
        >
          <Download className="w-5 h-5" />
        </button>

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
      </div>
    </div>
  );
}
