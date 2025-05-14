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
    targetClient._id
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

  // try {
  //   // TODO do we really need this? can't we just count what's in data?
  //   const response = await fetch(
  //     `${host}/admin/users/${targetClient._id}/${newTargetImageset}/getCount`,
  //     {
  //       method: "GET",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       credentials: "include",
  //     }
  //   );

  //   const newCounts = await response.json();

  //   if (newCounts && (response.status === 200 || response.status === 304)) {
  //     // trigger state updates
  //     const args: {
  //       clients: { _id: string }[];
  //       targetClient: { _id: string; fileCounts: number };
  //       targetImageset: string;
  //       setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
  //       setTargetClient: Dispatch<
  //         SetStateAction<{ _id: string; fileCounts: number }>
  //       >;
  //       val: number;
  //     } = {
  //       clients,
  //       targetClient,
  //       targetImageset: newTargetImageset,
  //       setClients,
  //       setTargetClient,
  //       val: newCounts,
  //     };

  //     updateOrderState(args);
  //   }
  // } catch (error) {
  //   setNotice({
  //     status: true,
  //     message:
  //       "There was an issue updating the number of files your client has in storage. Upon your next addition, the system will correct itself.",
  //     logout: { status: false, path: null },
  //   });
  // }

  // const nextOrderedImagesets = {
  //   ...orderedImagesets,
  //   [newTargetImageset]: data.files,
  // };
  // setOrderedImagesets(nextOrderedImagesets);
  // setSpinner(false);
  // return;
};
