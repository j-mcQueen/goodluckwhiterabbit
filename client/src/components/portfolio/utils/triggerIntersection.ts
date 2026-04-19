import { triggerBatch } from "./triggerBatch";

export const triggerIntersection = async ({ ...params }) => {
  const {
    activeGroup,
    activeSub,
    activeTab,
    inView,
    setImages,
    setNotice,
    nextStartIndex,
  } = params;

  if (inView) {
    const result = await triggerBatch(
      activeSub,
      activeTab,
      activeGroup,
      setImages,
      setNotice,
      false,
      nextStartIndex,
    );

    if (result && result instanceof Object) {
      return result;
    } else {
      // triggerBatch exited early
      return { earlyExit: true };
    }
  } else return;
};
