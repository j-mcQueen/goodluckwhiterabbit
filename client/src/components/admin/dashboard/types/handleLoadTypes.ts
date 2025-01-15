import { Dispatch, SetStateAction } from "react";

export interface handleLoadTypes {
  clients: { _id: string }[];
  host: string;
  order: (object | File)[];
  renderCount: number;
  staticKeys: string[];
  setOrder: Dispatch<SetStateAction<object | File[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStaticKeys: Dispatch<SetStateAction<string[]>>;
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
