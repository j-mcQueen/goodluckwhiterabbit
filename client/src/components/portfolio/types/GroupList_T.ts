import { Dispatch, SetStateAction } from "react";

export interface GroupList_T {
  activeGroup: number;
  activeSub: string;
  activeTab: number;
  className?: string;
  groups: string[];
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
  ) => void;
  images: { [key: string]: Blob[] };
  setActiveGroup: Dispatch<SetStateAction<number>>;
  setImages: Dispatch<SetStateAction<{ [key: string]: Blob[] }>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >;
}
