import { generateKeys } from "../../../global/utils/generateKeys";
import { loadBatch } from "./loadBatch";

export const handleIntersection = async ({ ...params }) => {
  const {
    activeImageset,
    images,
    inView,
    last,
    setImages,
    setNotice,
    setSpinner,
    setStaticKeys,
    user,
  } = params;

  if (inView && last < user.fileCounts[activeImageset]) {
    const args = {
      activeImageset,
      images,
      setImages,
      setNotice,
      setSpinner,
      start: last,
      user,
    };

    loadBatch(args);

    // ensure newly generated images have keys when they are rendered
    const keyBatch = generateKeys();
    setStaticKeys((keys: string[]) => [...keys, ...keyBatch]);
  }
};
