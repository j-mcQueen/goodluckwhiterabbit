import { Dispatch, SetStateAction } from "react";

export interface handleFirstLoadTypes {
  clients: { _id: string }[];
  newTargetImageset: string;
  orderedImagesets: {
    previews: (Blob | object)[];
    full: (Blob | object)[];
    socials: (Blob | object)[];
    snips: (Blob | object)[];
  };
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrderedImagesets: Dispatch<
    SetStateAction<{
      previews: (Blob | object)[];
      full: (Blob | object)[];
      socials: (Blob | object)[];
      snips: (Blob | object)[];
    }>
  >;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStarted: Dispatch<SetStateAction<boolean>>;
  setTargetClient: Dispatch<SetStateAction<{ _id: string }>>;
  setTargetImageset: Dispatch<SetStateAction<string>>;
  targetClient: {
    _id: string;
  };
}
