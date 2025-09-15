import { loadBatch } from "../utils/loadBatch";

import Image from "../Image";
import Shift from "../../../../assets/media/icons/Shift";

export default function Carousel({ ...props }) {
  const {
    activeImageset,
    activeIndex,
    images,
    loaded,
    setActiveIndex,
    setImages,
    setNotice,
    setSpinner,
    user,
  } = props;

  return (
    <section className="w-full xl:h-[calc(100dvh-57px-1.5rem)] overflow-y-scroll pt-2">
      <div className="flex items-center justify-between px-5">
        {activeIndex > 0 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => setActiveIndex(activeIndex - 1)}
          >
            <Shift className="w-5 h-5 -rotate-90 xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd transition-all" />
          </button>
        ) : (
          <div className="w-5 h-5"></div>
        )}

        <div className="relative flex flex-col basis-[80dvw] items-center overflow-hidden">
          <Image
            activeImage={images[activeImageset][activeIndex]}
            activeImageset={activeImageset}
            carousel={true}
            imageset={images[activeImageset]}
            setNotice={setNotice}
            user={user}
          />
        </div>

        {activeIndex < user.fileCounts[activeImageset] - 1 ? (
          <button
            type="button"
            className="group border border-solid border-white p-1 xl:hover:border-red xl:focus:border-red focus:outline-none transition-colors "
            onClick={() => {
              if (activeIndex < loaded - 1) {
                setActiveIndex(activeIndex + 1);
              } else if (
                activeIndex === loaded - 1 &&
                loaded - 1 < user.fileCounts[activeImageset]
              ) {
                const args = {
                  activeIndex,
                  activeImageset,
                  images,
                  setActiveIndex,
                  setImages,
                  setNotice,
                  setSpinner,
                  start: activeIndex,
                  user,
                };

                loadBatch(args);
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
