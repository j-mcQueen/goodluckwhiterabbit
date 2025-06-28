import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { generateKeys } from "../../../global/utils/generateKeys";

import Image from "../Image";

export default function Scroller({ ...props }) {
  const {
    imageset,
    activeImageset,
    user,
    // disabled,
    // spinner,
    // setSpinner,
    // setDisabled,
    // setImages,
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
                  activeImageset={activeImageset}
                  user={user}
                  activeImage={image}
                  imageset={imageset}
                  carousel={false}
                  i={index}
                  last={staticKeys.length - 1}
                />
              </Fragment>
            );
          })}
      </div>
    </section>
  );
}
