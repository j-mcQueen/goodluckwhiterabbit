import { Dispatch, SetStateAction } from "react";

export interface ImagePropsFromScroller {
  i: number;
  images: { [key: string]: Array<object> };
  last: number;
  setImages: Dispatch<SetStateAction<{ [key: string]: Array<object> }>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStaticKeys: Dispatch<SetStateAction<string[]>>;
}
