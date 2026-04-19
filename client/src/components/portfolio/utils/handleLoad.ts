import { Dispatch, SetStateAction } from "react";

export const handleLoad = (
  e: React.SyntheticEvent<HTMLImageElement>,
  setRatio: Dispatch<SetStateAction<number>>,
) => {
  const { naturalWidth, naturalHeight } = e.currentTarget;
  setRatio(naturalWidth / naturalHeight);
};
