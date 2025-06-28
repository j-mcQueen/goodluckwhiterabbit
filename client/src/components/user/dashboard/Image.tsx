import { InView } from "react-intersection-observer";
import { SharedImageProps } from "./types/SharedImageProps";
import { ImagePropsFromScroller } from "./types/ImagePropsFromScroller";
import { handleIntersection } from "./utils/handleIntersection";

import ImageItem from "./ImageItem";

export default function Image({
  ...props
}: Partial<SharedImageProps & ImagePropsFromScroller>) {
  const {
    activeImage = {},
    activeImageset,
    carousel,
    i,
    images = {},
    imageset = [],
    last,
    setImages,
    setNotice,
    setSpinner,
    setStaticKeys,
    user = { _id: "", fileCounts: {} },
  } = props;

  return i === last && carousel === false ? (
    <InView
      as="div"
      onChange={(inView, entry) => {
        if (entry.intersectionRatio === 1) {
          // prevent callback from firing immediately on first load
          return;
        }

        const args = {
          activeImageset,
          images,
          inView,
          last,
          setImages,
          setNotice,
          setSpinner,
          setStaticKeys,
          user,
        };

        handleIntersection(args);
      }}
      className="relative z-0 xl:pt-20"
    >
      <ImageItem
        activeImage={activeImage}
        activeImageset={activeImageset}
        carousel={carousel}
        imageset={imageset}
        user={user}
        setNotice={setNotice}
      />
    </InView>
  ) : (
    <div className="relative z-0 xl:pt-20">
      <ImageItem
        activeImage={activeImage}
        activeImageset={activeImageset}
        carousel={carousel}
        imageset={imageset}
        user={user}
        setNotice={setNotice}
      />
    </div>
  );
}
