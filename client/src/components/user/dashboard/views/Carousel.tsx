import { useState } from "react";
import { executeGenerationChain } from "../../../global/utils/executeGenerationChain";

import Image from "../Image";
import Shift from "../../../../assets/media/icons/Shift";

export default function Carousel({ ...props }) {
  const {
    images,
    loaded,
    user,
    activeImageset,
    setImages,
    setNotice,
    setSpinner,
  } = props;

  const [activeImage, setActiveImage] = useState(0);

  const loadBatch = async () => {
    setSpinner(true);

    const data = await executeGenerationChain(
      images[activeImageset],
      activeImageset,
      setNotice,
      activeImage + 1,
      activeImage + 11,
      user._id,
      "lg"
    );

    if (data.stored > 0 && data.files instanceof Array) {
      setImages({ ...images, [activeImageset]: data.files });
      setActiveImage(activeImage + 1);
    }

    return setSpinner(false);
  };

  return (
    <section className="w-full xl:h-[calc(100dvh-57px-1.5rem)] overflow-y-scroll pt-2">
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
            fileCount={user.fileCounts[activeImageset]}
            userId={user._id}
            imageset={images[activeImageset]}
            activeImage={images[activeImageset][activeImage]}
            carousel={true}
            setNotice={setNotice}
          />
        </div>

        {activeImage < user.fileCounts[activeImageset] - 1 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => {
              if (activeImage < loaded - 1) {
                setActiveImage(activeImage + 1);
              } else if (
                activeImage === loaded - 1 &&
                loaded - 1 < user.fileCounts[activeImageset]
              ) {
                loadBatch();
              }
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
