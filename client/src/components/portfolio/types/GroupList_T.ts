import { Dispatch, SetStateAction } from "react";

export interface GroupList_T {
  activeGroup: number;
  activeSub: string;
  activeTab: number;
  bodyRef: React.RefObject<HTMLElement> | null;
  className?: string;
  groups: string[];
  handleClick: (
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
  ) => void;
  setActiveGroup: Dispatch<SetStateAction<number>>;
  setImages: Dispatch<SetStateAction<{ blob: Blob; group: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >;
}
