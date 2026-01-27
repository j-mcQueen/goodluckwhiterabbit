import { Dispatch, SetStateAction } from "react";

export interface SubcategoryButton_T {
  activeSub: string;
  activeTab: number;
  className?: string;
  disabled?: boolean;
  handleClick: (
    activeSub: string,
    activeTab: number,
    images: { [key: string]: Blob[] },
    nextGroup: number,
    setActiveGroup: Dispatch<SetStateAction<number>>,
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
  ) => void;
  images: { [key: string]: Blob[] };
  index: number;
  label: string;
  setActiveGroup: Dispatch<SetStateAction<number>>;
  setActiveSub: Dispatch<SetStateAction<number>>;
  setImages: Dispatch<SetStateAction<{ [key: string]: Blob[] }>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >;
}
