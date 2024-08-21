import { useState } from "react";

import Prev from "../../../../assets/media/icons/Prev";
import Next from "../../../../assets/media/icons/Next";
import Download from "../../../../assets/media/icons/Download";
import StarFilled from "../../../../assets/media/icons/StarFilled";
import Star from "../../../../assets/media/icons/Star";

export default function Carousel({ ...props }) {
  const { imagesets, activeImageset, favourites, setFavourites } = props;
  const [activeImage, setActiveImage] = useState(0);

  const handleToggle = () => {
    if (!favourites.includes(imagesets[activeImageset][activeImage])) {
      setFavourites([...favourites, imagesets[activeImageset][activeImage]]);
    } else {
      const filtered = favourites.filter(
        (item: object) => item !== imagesets[activeImageset][activeImage]
      );
      setFavourites(filtered);
    }
  };

  return (
    <section className="py-5">
      <div className="flex items-center justify-between px-5">
        {activeImage > 0 ? (
          <button type="button" onClick={() => setActiveImage(activeImage - 1)}>
            <Prev className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}

        <div className="relative flex basis-[80dvw] justify-center overflow-hidden">
          <div>
            <img
              src={imagesets[activeImageset][activeImage]?.url}
              alt={imagesets[activeImageset][activeImage]?.filename}
              className="max-h-[500px]"
            />

            <div className="text-white flex justify-between pt-2">
              <button
                type="button"
                className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>

              <button
                type="button"
                className="border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors"
                onClick={() => handleToggle()}
              >
                {favourites.includes(imagesets[activeImageset][activeImage]) ? (
                  <StarFilled className="w-5 h-5" red={true} />
                ) : (
                  <Star className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {activeImage !== imagesets[activeImageset].length - 1 ? (
          <button type="button" onClick={() => setActiveImage(activeImage + 1)}>
            <Next className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}
      </div>
    </section>
  );
}
