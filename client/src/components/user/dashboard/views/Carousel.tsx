import { useState } from "react";

import Prev from "../../../../assets/media/icons/Prev";
import Next from "../../../../assets/media/icons/Next";
import Image from "../Image";

export default function Carousel({ ...props }) {
  const { imagesets, activeImageset, favourites, setFavourites } = props;
  const [activeImage, setActiveImage] = useState(0);

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
          <Image
            activeImage={imagesets[activeImageset][activeImage]}
            favourites={favourites}
            setFavourites={setFavourites}
          />
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
