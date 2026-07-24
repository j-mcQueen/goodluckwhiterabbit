import { Dispatch, SetStateAction } from "react";
import { updateOrderState } from "./updateOrderState";
import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleDrop = async ({ ...params }) => {
  if (params.source === "order" && params.index === params.draggedIndex) return; // dropped back onto its own position

  return params.source === "order" ? handleSwap(params) : handleQueueUpload(params);
};

const handleSwap = async (params: any) => {
  try {
    const response = await fetch(
      `${host}/admin/users/${params.targetClient._id}/${params.targetImageset}/swap/${params.draggedIndex}/${params.index}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    if (data && (response.status === 200 || response.status === 304)) {
      return { type: "swap" as const };
    }

    if (response.status === 401) {
      return params.setNotice({
        status: true,
        message:
          "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
        logout: { status: true, path: "/admin" },
      });
    }

    return params.setNotice({
      status: true,
      message: "Something went wrong - please try again.",
      logout: { status: false, path: null },
    });
  } catch (error) {
    return params.setNotice({
      status: true,
      message: "Something went wrong - please try again.",
      logout: { status: false, path: null },
    });
  }
};

const handleQueueUpload = async (params: any) => {
  let blob;
  try {
    const formData = new FormData();
    formData.append("_id", params.targetClient._id);
    formData.append("imageset", params.targetImageset);
    formData.append("index", params.index);
    formData.append("file", params.dragTarget);

    const response = await fetch(`${host}/admin/uploadFile`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    });
    const data = await response.blob();

    if (data) {
      switch (response.status) {
        case 200:
        case 304:
          blob = data;
          break;

        case 401:
          throw new Error("401");

        default:
          throw new Error("Other");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "401") {
        return params.setNotice({
          status: true,
          message:
            "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
          logout: { status: true, path: "/admin" },
        });
      } else {
        return params.setNotice({
          status: true,
          message: "Something went wrong - please try again.",
          logout: { status: false, path: null },
        });
      }
    }
  }

  if (blob instanceof Blob) {
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
      val: params.targetClient.fileCounts[params.targetImageset] + 1,
    };

    updateOrderState(args);
    return { type: "upload" as const, blob };
  }
};
