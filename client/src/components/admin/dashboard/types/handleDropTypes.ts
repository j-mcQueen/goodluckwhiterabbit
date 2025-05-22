import { Dispatch, SetStateAction } from "react";

export interface handleDropTypes {
  clients: { _id: string }[];
  draggedIndex: number;
  dragTarget: File;
  index: number;
  order: (Blob | object)[];
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(Blob | object)[]>>;
  setTargetClient: Dispatch<SetStateAction<{ _id: string }>>;
  source: string;
  targetClient: {
    _id: string;
    fileCounts: {
      snapshots: number;
      keepsake: number;
      core: number;
      snips: number;
    };
  };
  targetImageset: string;
}
