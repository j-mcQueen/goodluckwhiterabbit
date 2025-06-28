import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { generateKeys } from "../../../global/utils/generateKeys";

import Image from "../Image";

export default function Scroller({ ...props }) {
  const {
    activeImageset,
    images,
    imageset,
    setImages,
    setNotice,
    setSpinner,
    user,
  } = props;

  const [staticKeys, setStaticKeys] = useState(generateKeys);

  return (
    <section className="w-full xl:h-[calc(100dvh-57px-1.5rem)] overflow-y-scroll pt-2">
      <div className="flex flex-wrap justify-center items-center gap-y-10 xl:gap-y-12 relative overflow-hidden px-2">
        {imageset
          .filter((image: object) => image instanceof Blob === true)
          .map((image: object, index: number) => {
            return (
              <Fragment key={staticKeys[index]}>
                <Image
                  activeImage={image}
                  activeImageset={activeImageset}
                  carousel={false}
                  i={index}
                  images={images}
                  imageset={imageset}
                  last={staticKeys.length - 1}
                  setImages={setImages}
                  setNotice={setNotice}
                  setSpinner={setSpinner}
                  setStaticKeys={setStaticKeys}
                  user={user}
                />
              </Fragment>
            );
          })}
      </div>
    </section>
  );
}
