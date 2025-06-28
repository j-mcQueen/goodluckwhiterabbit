import { InView } from "react-intersection-observer";
import ImageItem from "./ImageItem";

export default function Image({ ...props }) {
  const {
    activeImage,
    activeImageset,
    user,
    imageset,
    carousel,
    setNotice,
    i,
    last,
  } = props;

  const handleIntersection = (inView: boolean) => {
    // this is where the fun begins!
    if (inView && last < user.fileCounts[activeImageset]) {
      // TODO check if there are more images to be loaded
      console.log("yes!");
    }
  };

  return i === last ? (
    <InView
      as="div"
      onChange={(inView) => handleIntersection(inView)}
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
