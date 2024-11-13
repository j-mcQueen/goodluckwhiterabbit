import { useState } from "react";

import Prev from "../../../../assets/media/icons/Prev";
import Next from "../../../../assets/media/icons/Next";
import Image from "../Image";

export default function Carousel({ ...props }) {
  const { imageset } = props;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between px-5">
        {activeImage > 0 ? (
          <button
            type="button"
            className="group"
            onClick={() => setActiveImage(activeImage - 1)}
          >
            <Prev className="w-10 h-10 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-10 h-10"></div>
        )}

        <div className="relative flex flex-col basis-[80dvw] items-center overflow-hidden">
          <Image
            imageset={imageset}
            activeImage={imageset[activeImage]}
            carousel={true}
          />
        </div>

        {activeImage !==
        imageset.filter((item: object) => item instanceof File === true)
          .length -
          1 ? (
          <button
            type="button"
            className="group"
            onClick={() => setActiveImage(activeImage + 1)}
          >
            <Next className="w-10 h-10 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-10 h-10"></div>
        )}
      </div>
    </section>
  );
}
