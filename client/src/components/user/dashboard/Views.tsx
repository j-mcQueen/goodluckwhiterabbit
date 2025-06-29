import { useState } from "react";
import { mobile } from "./utils/determineViewport";

import Carousel from "./views/Carousel";
import Scroller from "./views/Scroller";
import Sidebar from "./Sidebar";

export default function Views({ ...props }) {
  const {
    user,
    images,
    activeImageset,
    setImages,
    setNotice,
    setSpinner,
    spinner,
  } = props;

  const [retrieving, setRetrieving] = useState({
    state: false,
    complete: false,
  });

  return (
    <div className="flex xl:flex-row flex-col max-h-[calc(100dvh-57px-1.5rem)]">
      <Sidebar
        activeImageset={activeImageset}
        images={images}
        retrieving={retrieving}
        setNotice={setNotice}
        setRetrieving={setRetrieving}
        spinner={spinner}
        user={user}
      />

      {!mobile ? (
        <Carousel
          activeImageset={activeImageset}
          images={images}
          loaded={
            images[activeImageset as keyof typeof setImages].filter(
              (img: Blob) => img instanceof Blob === true
            ).length
          }
          setImages={setImages}
          setNotice={setNotice}
          setSpinner={setSpinner}
          user={user}
        />
      ) : (
        <Scroller
          activeImageset={activeImageset}
          images={images}
          imageset={images[activeImageset]}
          setImages={setImages}
          setNotice={setNotice}
          setSpinner={setSpinner}
          user={user}
        />
      )}
    </div>
  );
}
