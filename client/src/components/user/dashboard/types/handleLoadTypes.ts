import { Dispatch, SetStateAction } from "react";

export interface handleLoadTypes {
  activeImageset: string;
  images: File[];
  imageset: File[];
  setDisabled: Dispatch<SetStateAction<boolean>>;
  setImages: Dispatch<SetStateAction<File[]>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStaticKeys: Dispatch<SetStateAction<string[]>>;
  staticKeys: string[];
  userId: string;
}
