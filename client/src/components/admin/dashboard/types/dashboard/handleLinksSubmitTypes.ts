import { Dispatch, SetStateAction } from "react";

export interface handleLinksSubmitTypes {
  clients: { _id: string }[];
  error: { state: boolean; status: number; message: string };
  inputVals: {
    snapshots: string;
    keepsake: string;
    core: string;
    snips: string;
  };
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setActivePane: Dispatch<SetStateAction<string>>;
  setError: Dispatch<
    SetStateAction<{ state: boolean; status: number; message: string }>
  >;
  setInputVals: Dispatch<
    SetStateAction<{
      snapshots: string;
      keepsake: string;
      core: string;
      snips: string;
    }>
  >;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  targetClient: Dispatch<SetStateAction<{ _id: string }[]>>;
}
