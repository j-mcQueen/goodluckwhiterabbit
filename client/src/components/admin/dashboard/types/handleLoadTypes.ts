import { Dispatch, SetStateAction } from "react";

export interface handleLoadTypes {
  clients: { _id: string }[];
  order: (object | File)[];
  renderCount: number;
  staticKeys: string[];
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setOrder: Dispatch<SetStateAction<object | File[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStaticKeys: Dispatch<SetStateAction<string[]>>;
  setTargetClient: Dispatch<
    SetStateAction<{
      _id: string;
      fileCounts: {
        snapshots: number;
        keepsake: number;
        core: number;
        socials: number;
      };
    }>
  >;
  targetClient: {
    _id: string;
    fileCounts: {
      snapshots: number;
      keepsake: number;
      core: number;
      socials: number;
    };
  };
  targetImageset: string;
}
