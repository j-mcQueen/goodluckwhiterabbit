import { triggerBatch } from "./triggerBatch";

export const triggerIntersection = async ({ ...params }) => {
  const {
    activeGroup,
    activeSub,
    activeTab,
    images,
    inView,
    setImages,
    setNotice,
    start,
  } = params;

  if (inView) {
    const result = await triggerBatch(
      activeSub,
      activeTab,
      images,
      activeGroup,
      setImages,
      setNotice,
      start,
    );

    if (result && result instanceof Object) {
      return result;
    } else {
      // triggerBatch exited early
      return { earlyExit: true };
    }
  } else return;
};
