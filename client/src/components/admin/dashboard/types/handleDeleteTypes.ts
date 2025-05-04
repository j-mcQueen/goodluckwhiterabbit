import { Dispatch, SetStateAction } from "react";

export interface handleDeleteTypes {
  clients: { _id: string }[];
  host: string;
  index: number;
  order: (File | object)[];
  renderCount: number;
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(File | object)[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setTargetClient: Dispatch<SetStateAction<{ _id: string }>>;
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
