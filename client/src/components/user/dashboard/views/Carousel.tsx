import { useState } from "react";

import Image from "../Image";
import Shift from "../../../../assets/media/icons/Shift";

export default function Carousel({ ...props }) {
  const { userId, activeImageset, imageset } = props;
  const [activeImage, setActiveImage] = useState(0);

  return (
    <section>
      <div className="flex items-center justify-between px-5">
        {activeImage > 0 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => setActiveImage(activeImage - 1)}
          >
            <Shift className="w-5 h-5 -rotate-90 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}

        <div className="relative flex flex-col basis-[80dvw] items-center overflow-hidden">
          <Image
            activeImageset={activeImageset}
            userId={userId}
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
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => {
              setActiveImage(activeImage + 1);
            }}
          >
            <Shift className="w-5 h-5 rotate-90 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}
      </div>
    </section>
  );
}
