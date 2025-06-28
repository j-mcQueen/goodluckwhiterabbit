import { executeGenerationChain } from "../../../global/utils/executeGenerationChain";

export const loadBatch = async ({ ...params }) => {
  const {
    activeIndex = undefined,
    activeImageset,
    images,
    setActiveIndex = undefined,
    setImages,
    setNotice,
    setSpinner,
    start,
    user,
  } = params;

  setSpinner(true);

  const data = await executeGenerationChain(
    images[activeImageset],
    activeImageset,
    setNotice,
    start + 1, // start
    start + 11, // end
    user._id,
    "lg"
  );

  if (data.stored > 0 && data.files instanceof Array) {
    setImages({ ...images, [activeImageset]: data.files });
    if (setActiveIndex && activeIndex) setActiveIndex(activeIndex + 1);
  }

  return setSpinner(false);
};
