import { Dispatch, SetStateAction } from "react";

export interface handleLinksSubmitTypes {
  clients: { _id: string }[];
  error: { state: boolean; status: number; message: string };
  inputVals: { previews: string; full: string; socials: string; snips: string };
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setActivePane: Dispatch<SetStateAction<string>>;
  setError: Dispatch<
    SetStateAction<{ state: boolean; status: number; message: string }>
  >;
  setInputVals: Dispatch<
    SetStateAction<{
      previews: string;
      full: string;
      socials: string;
      snips: string;
    }>
  >;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  targetClient: Dispatch<SetStateAction<{ _id: string }[]>>;
}
