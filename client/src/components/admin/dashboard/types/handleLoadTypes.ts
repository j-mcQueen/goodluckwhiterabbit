import { Dispatch, SetStateAction } from "react";

export interface handleLoadTypes {
  clients: { _id: string }[];
  host: string;
  order: (object | File)[];
  renderCount: number;
  setOrder: Dispatch<SetStateAction<object | File[]>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  targetClient: {
    _id: string;
    fileCounts: {
      previews: number;
      full: number;
      socials: number;
      snips: number;
    };
  };
  targetImageset: string;
}
