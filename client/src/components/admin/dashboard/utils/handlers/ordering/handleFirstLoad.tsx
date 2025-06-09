import { Dispatch, SetStateAction } from "react";
import { updateOrderState } from "./updateOrderState";
import { executeGenerationChain } from "../../../../../global/utils/executeGenerationChain";

export const handleFirstLoad = async ({ ...params }) => {
  const {
    clients,
    newTargetImageset,
    orderedImagesets,
    setClients,
    setNotice,
    setOrderedImagesets,
    setSpinner,
    setStarted,
    setTargetClient,
    setTargetImageset,
    targetClient,
  } = params;

  setTargetImageset(newTargetImageset);
  setStarted(true);
  setSpinner(true);

  const data = await executeGenerationChain(
    orderedImagesets[newTargetImageset as keyof typeof orderedImagesets],
    newTargetImageset,
    setNotice,
    0,
    10,
    targetClient._id,
    "sm"
  );

  if (data.stored > 0 && data.files) {
    // abitrary test to confirm we got data back

    // trigger state updates
    const args: {
      clients: { _id: string }[];
      targetClient: { _id: string; fileCounts: { [key: string]: number } };
      targetImageset: string;
      setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
      setTargetClient: Dispatch<
        SetStateAction<{ _id: string; fileCounts: { [key: string]: number } }>
      >;
      val: number;
    } = {
      clients,
      targetClient,
      targetImageset: newTargetImageset,
      setClients,
      setTargetClient,
      val: data.stored,
    };

    updateOrderState(args);

    const nextOrderedImagesets = {
      ...orderedImagesets,
      [newTargetImageset]: data.files,
    };
    setOrderedImagesets(nextOrderedImagesets);
  }

  return setSpinner(false);
};
