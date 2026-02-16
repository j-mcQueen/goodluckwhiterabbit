import { Fragment, useState } from "react";
import Unit from "./Unit";

export default function Body({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    images,
    setActiveGroup,
    setImages,
    setNotice,
  } = props;

  const [loadedImages, setLoadedImages] = useState([]);
  const [staticKeys, setStaticKeys] = useState([]);

  return (
    <section>
      <div>
        {loadedImages.map((image: Blob, index: number) => {
          return (
            <Fragment key={staticKeys[index]}>
              <Unit
                activeGroup={activeGroup}
                activeSub={activeSub}
                activeTab={activeTab}
                existingImages={images}
                image={image}
                index={index}
                lastIndex={loadedImages.length - 1}
                setActiveGroup={setActiveGroup}
                setExistingImages={setImages}
                setLoadedImages={setLoadedImages}
                setNotice={setNotice}
                setStaticKeys={setStaticKeys}
                staticKeys={staticKeys}
              />
            </Fragment>
          );
        })}
      </div>
    </section>
  );
}
