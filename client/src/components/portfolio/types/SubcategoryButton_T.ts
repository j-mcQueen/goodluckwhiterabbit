import { Dispatch, SetStateAction } from "react";

export interface SubcategoryButton_T {
  activeSub: string;
  activeTab: number;
  bodyRef: React.RefObject<HTMLElement> | null;
  className?: string;
  disabled?: boolean;
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
    subIndex?: number,
    setActiveSub?: Dispatch<SetStateAction<number>>,
  ) => void;
  index: number;
  label: string;
  setActiveGroup: Dispatch<SetStateAction<number>>;
  setActiveSub: Dispatch<SetStateAction<number>>;
  setImages: Dispatch<SetStateAction<{ blob: Blob; group: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >;
}
