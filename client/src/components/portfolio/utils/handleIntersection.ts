import { generateKeys } from "../../global/utils/generateKeys";
import { calcNextStart } from "./calcNextStart";
import { triggerIntersection } from "./triggerIntersection";

export const handleIntersection = async ({ ...params }) => {
  const {
    activeGroup,
    activeSub,
    activeTab,
    inView,
    nextStartIndex,
    setImages,
    setNextStartIndex,
    setNotice,
    setStaticKeys,
  } = params;

  try {
    const args = {
      activeGroup,
      activeSub,
      activeTab,
      inView,
      setImages,
      setNotice,
      nextStartIndex,
    };
    const result = await triggerIntersection(args);

    if (!result || "earlyExit" in result) {
      setNotice({ status: false, loading: false, message: null });
      return;
    }

    const nextStart = calcNextStart(activeGroup, result, nextStartIndex);
    setNextStartIndex(nextStart);

    // only generate the extra keys needed
    const keyBatch = generateKeys(result.length);
    setStaticKeys((keys: string[]) => [...keys, ...keyBatch]);

    return result;
  } catch (error) {
    return setNotice({
      status: true,
      loading: false,
      message: "Something went wrong. Please try again.",
    });
  }
};
