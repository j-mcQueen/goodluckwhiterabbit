import { useState } from "react";
import { Fragment } from "react/jsx-runtime";
import { generateKeys } from "../../../global/utils/generateKeys";

import Image from "../Image";

export default function Scroller({ ...props }) {
  const {
    imageset,
    activeImageset,
    userId,
    fileCounts,
    // disabled,
    // spinner,
    // setSpinner,
    // setDisabled,
    // setImages,
  } = props;
  const [staticKeys, setStaticKeys] = useState(generateKeys);

  // TODO use the intersection observer to implement infinite scroll

  // TODO when the imageset gets updated, generate new keys and update staticKeys
  // useEffect(() => [images]);

  return (
    <section className="flex flex-col justify-center basis-[80dvw] xl:pb-10">
      <div className="flex flex-wrap justify-center items-center xl:gap-y-12 relative overflow-hidden px-2">
        {imageset
          .filter((image: object) => image instanceof Blob === true)
          .map((image: object, index: number) => {
            return (
              <Fragment key={staticKeys[index]}>
                <Image
                  activeImageset={activeImageset}
                  userId={userId}
                  activeImage={image}
                  imageset={imageset}
                  fileCount={fileCounts[activeImageset]}
                  carousel={false}
                />
              </Fragment>
            );
          })}
      </div>
    </section>
  );
}
