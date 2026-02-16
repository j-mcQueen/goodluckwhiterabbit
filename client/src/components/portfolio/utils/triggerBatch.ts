import { Dispatch, SetStateAction } from "react";
import { execute } from "./execute";
import { mobile } from "../../global/utils/determineViewport";

export const triggerBatch = async (
  activeSub: string,
  activeTab: number,
  images: { [key: string]: Blob[] },
  nextGroup: number,
  setImages: Dispatch<SetStateAction<{ [key: string]: Blob[] }>>,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >,
  start: number,
  subIndex?: number,
  setActiveSub?: Dispatch<SetStateAction<number>>,
) => {
  setNotice({ status: true, loading: true, message: "LOADING..." });
  const group = nextGroup.toString().padStart(3, "0");
  const tabMap = { 0: "PHOTO", 1: "ART", 2: "DESIGN" };
  const size = mobile ? "sm" : "lg";
  const subs = {
    "0": "WEDDINGS",
    "1": "EVENTS",
    "2": "FILM",
    "3": "COMMERCIAL",
    "4": "EDITORIAL",
  };

  if (
    group in images &&
    Object.hasOwn(images[group as keyof typeof images], start)
  ) {
    // selected images exist within state
    setNotice({ status: false, loading: false, message: null });
    return;
  }

  const nextImages = await execute(
    tabMap[activeTab as keyof typeof tabMap],
    images,
    group,
    setNotice,
    size,
    start,
    subs[activeSub as keyof typeof subs],
  );

  if (setActiveSub && subIndex) setActiveSub(subIndex);

  if (
    group in nextImages.files &&
    Object.hasOwn(nextImages.files[group as keyof typeof nextImages], start)
  ) {
    // new images have been generated
    setImages(nextImages.files);
    setNotice({ status: false, loading: false, message: null });
    return nextImages.files;
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
