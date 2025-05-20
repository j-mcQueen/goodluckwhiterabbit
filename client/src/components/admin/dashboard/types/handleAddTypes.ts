import { Dispatch, FormEvent, SetStateAction } from "react";

export interface handleAddTypes {
  clients: { _id: string }[];
  e: FormEvent<HTMLFormElement>;
  errors: {
    takenEmail: object;
    formValidation: object;
    other: object;
  };
  inputValues: { clientname: string; clientemail: string; clientsets: object };
  setActivePane: Dispatch<SetStateAction<string>>;
  setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  setErrors: Dispatch<
    SetStateAction<{
      takenEmail: { state: boolean; status: number; message: string };
      formValidation: { state: boolean; status: number; message: string };
      other: { state: boolean; status: number; message: string };
    }>
  >;
  setSpinner: Dispatch<SetStateAction<boolean>>;
}
