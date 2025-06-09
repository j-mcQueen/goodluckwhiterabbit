import { Dispatch, SetStateAction } from "react";
import { determineHost as host } from "../../../../../global/utils/determineHost";
import { executeGenerationChain } from "../../../../../global/utils/executeGenerationChain";
import { generateKeys } from "../../../../../global/utils/generateKeys";
import { updateOrderState } from "./updateOrderState";

export const handleLoad = async ({ ...params }) => {
  const {
    clients,
    order,
    renderCount,
    setClients,
    setNotice,
    setOrder,
    setRenderCount,
    setSpinner,
    setStaticKeys,
    setTargetClient,
    staticKeys,
    targetClient,
    targetImageset,
  } = params;

  if (renderCount === targetClient.fileCounts[targetImageset]) {
    const nextOrder = [...order, ...Array(10).fill({})];
    setOrder(nextOrder);
  } else if (renderCount < targetClient.fileCounts[targetImageset]) {
    setSpinner(true);

    const imagesetLength = order.length;
    const data = await executeGenerationChain(
      order,
      targetImageset,
      setNotice,
      imagesetLength,
      imagesetLength + 10,
      targetClient._id,
      "sm"
    );

    const count = renderCount + data.count;

    if (count >= targetClient.fileCounts[targetImageset]) {
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/updateFileCount/${targetImageset}/${count}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );
      const newCounts = await response.json();

      if (response.status === 200 || response.status === 304) {
        // trigger state updates
        const args: {
          clients: { _id: string }[];
          targetClient: { _id: string; fileCounts: { [key: string]: number } };
          targetImageset: string;
          setClients: Dispatch<SetStateAction<{ _id: string }[]>>;
          setTargetClient: Dispatch<
            SetStateAction<{
              _id: string;
              fileCounts: { [key: string]: number };
            }>
          >;
          val: number;
        } = {
          clients,
          targetClient,
          targetImageset,
          setClients,
          setTargetClient,
          val: newCounts[targetImageset],
        };

        updateOrderState(args);
      }
    }

    const nextOrder = data.files;
    setOrder(nextOrder);

    setRenderCount(count);
    setSpinner(false);
  }

  const generatedKeys = generateKeys();
  const nextKeys = [...staticKeys, ...generatedKeys];
  return setStaticKeys(nextKeys);
};
