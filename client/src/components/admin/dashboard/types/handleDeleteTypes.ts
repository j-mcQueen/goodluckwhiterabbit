import { Dispatch, SetStateAction } from "react";

export interface handleDeleteTypes {
  clients: { _id: string }[];
  index: number;
  order: (Blob | object)[];
  renderCount: number;
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(Blob | object)[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setTargetClient: Dispatch<SetStateAction<{ _id: string }>>;
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
