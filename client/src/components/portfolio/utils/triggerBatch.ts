import { Dispatch, SetStateAction } from "react";
import { execute } from "./execute";
import { mobile } from "../../global/utils/determineViewport";

export const triggerBatch = async (
  activeSub: string,
  activeTab: number,
  groupId: string, // real S3 groupId, already resolved by the caller - see resolveGroupId.ts
  setImages: Dispatch<SetStateAction<{ blob: Blob; group: string }[]>>,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >,
  sidebar: boolean,
  start: number,
  subIndex?: number,
  setActiveSub?: Dispatch<SetStateAction<number>>,
) => {
  setNotice({ status: true, loading: true, message: "LOADING..." });
  const tabMap = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };
  const size = mobile ? "sm" : "lg";

  const nextImages = await execute(
    tabMap[activeTab as keyof typeof tabMap],
    groupId,
    setNotice,
    size,
    start,
    activeSub, // already the resolved subcategory name, not an index
  );

  if (setActiveSub && subIndex !== undefined) setActiveSub(subIndex);

  // the backend only ever walks forward from the requested group through
  // the subcategory's *ordered* group sequence (see generatePortfolioUrls),
  // so anything it returns - whether from the requested group or one it
  // spilled into - is already valid, correctly-ordered content
  if (nextImages.length > 0) {
    setImages((prev) => {
      // setter fn ensures we don't mistakenly mutate
      return sidebar ? nextImages : [...prev, ...nextImages];
    });

    setNotice({ status: false, loading: false, message: null });

    return nextImages;
  } else {
    setNotice({
      status: true,
      loading: false,
      message:
        "Something went wrong. It appears there are no files within this collection.",
    });
    return;
  }
};
