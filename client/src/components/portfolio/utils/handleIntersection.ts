import { generateKeys } from "../../global/utils/generateKeys";
import { prepIndexing } from "./prepIndexing";
import { triggerIntersection } from "./triggerIntersection";

export const handleIntersection = async ({ ...params }) => {
  const {
    activeGroup,
    activeSub,
    activeTab,
    existingImages,
    nextStartIndex,
    inView,
    setExistingImages,
    setLoadedImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
    setThresholds,
    staticKeys,
    thresholds,
  } = params;

  try {
    const args = {
      activeGroup,
      activeSub,
      activeTab,
      existingImages,
      inView,
      setExistingImages,
      setNotice,
      nextStartIndex,
    };
    const result = await triggerIntersection(args);

    if (!result || "earlyExit" in result) {
      setNotice({ status: false, loading: false, message: null });
      setNextStartIndex(existingImages[activeGroup].length);
      return;
    }

    const entries: Array<[string, Array<Blob>]> = Object.entries(result);
    const indexing = prepIndexing({ entries, thresholds });

    const diff = Math.abs(staticKeys.length - indexing.counter);
    if (diff > 0) {
      // only generate the extra keys needed
      const keyBatch = generateKeys(diff);
      setStaticKeys((keys: string[]) => [...keys, ...keyBatch]);
    }

    setNextStartIndex(result[entries.length - 1].length);
    setLoadedImages((prev: Blob[]) => [...prev, ...indexing.newBlobs]);
    setThresholds(indexing.newThresholds);
  } catch (error) {
    console.log(error, "Intersection trigger error");

    return setNotice({
      status: true,
      loading: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
