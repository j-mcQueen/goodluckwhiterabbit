import { Dispatch, SetStateAction } from "react";
import { execute } from "./execute";
import { mobile } from "../../global/utils/determineViewport";

export const triggerBatch = async (
  activeSub: string,
  activeTab: number,
  nextGroup: number,
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
  const group = String(nextGroup).padStart(3, "0");
  const tabMap = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };
  const size = mobile ? "sm" : "lg";
  const subs = {
    "0": "WEDDINGS",
    "1": "EVENTS",
    "2": "FILM",
    "3": "COMMERCIAL",
    "4": "EDITORIAL",
  };

  const nextImages = await execute(
    tabMap[activeTab as keyof typeof tabMap],
    group,
    setNotice,
    size,
    start,
    subs[activeSub as keyof typeof subs],
  );

  if (setActiveSub && subIndex) setActiveSub(subIndex);

  const containsGroup = nextImages.some(
    (image: { blob: Blob; group: string }) => image.group === group,
  );

  if (containsGroup || Number(nextImages[0].group) === Number(group) + 1) {
    // edge case coverage where we have old values and a new group at start
    // new images have been generated

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
