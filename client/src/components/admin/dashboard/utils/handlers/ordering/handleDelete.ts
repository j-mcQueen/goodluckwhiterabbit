import { Dispatch, SetStateAction } from "react";
import { updateOrderState } from "./updateOrderState";
import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleDelete = async ({ ...params }) => {
  try {
    const response = await fetch(
      `${host}/admin/users/${params.targetClient._id}/${params.targetImageset}/${params.index}/delete`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();

    if (data && (response.status === 200 || response.status === 304)) {
      console.log(params.targetClient.fileCounts[params.targetImageset] - 1);
      const args: {
        clients: { _id: string }[];
        targetClient: { _id: string; fileCounts: number };
        targetImageset: string;
        setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
        setTargetClient: Dispatch<
          SetStateAction<{ _id: string; fileCounts: number }>
        >;
        val: number;
      } = {
        clients: params.clients,
        targetClient: params.targetClient,
        targetImageset: params.targetImageset,
        setClients: params.setClients,
        setTargetClient: params.setTargetClient,
        val: params.targetClient.fileCounts[params.targetImageset] - 1,
      };

      updateOrderState(args);
      return;
    }
  } catch (error) {
    return params.setNotice({
      status: true,
      message:
        "There was an error deleting this image. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
  }
};
