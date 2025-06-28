import { Dispatch, SetStateAction } from "react";

export interface SharedImageProps {
  activeImage: object;
  activeImageset: string;
  carousel: boolean;
  imageset: Array<object>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >;
  user: { _id: string; fileCounts: { [key: string]: number } };
}
