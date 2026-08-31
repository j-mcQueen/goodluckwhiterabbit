import { triggerBatch } from "./triggerBatch";

export const triggerIntersection = async ({ ...params }) => {
  const {
    activeGroupId,
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
      activeGroupId,
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
