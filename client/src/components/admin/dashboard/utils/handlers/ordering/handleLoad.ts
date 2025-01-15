import { executeGenerationChain } from "../../../../../global/utils/executeGenerationChain";
import { generateKeys } from "../../../../../global/utils/generateKeys";

export const handleLoad = async ({ ...params }) => {
  if (
    params.renderCount === params.targetClient.fileCounts[params.targetImageset]
  ) {
    const nextOrder = [...params.order, ...Array(10).fill({})];
    params.setOrder(nextOrder);
  } else if (
    params.renderCount < params.targetClient.fileCounts[params.targetImageset]
  ) {
    params.setSpinner(true);

    const imagesetLength = params.order.length;
    const data = await executeGenerationChain(
      params.order,
      params.targetImageset,
      params.setNotice,
      imagesetLength,
      imagesetLength + 10,
      params.targetClient._id
    );

    const count = params.renderCount + data.count;
    if (count > params.targetClient.fileCounts[params.targetImageset]) {
      const response = await fetch(
        `${params.host}/admin/users/${params.targetClient._id}/updateFileCount/${params.targetImageset}/${count}`,
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
        const nextTargetClient = { ...params.targetClient };
        nextTargetClient.fileCounts[params.targetImageset] =
          newCounts[params.targetImageset];
        params.setTargetClient(nextTargetClient);

        const nextClients = params.clients.map((client: { _id: string }) => {
          return client._id === params.targetClient._id
            ? nextTargetClient
            : client;
        });
        params.setClients(nextClients);
      }
    }

    const nextOrder = data.files;
    params.setOrder(nextOrder);

    const rendered = nextOrder.filter(
      (item: object | File) => item instanceof File
    ).length;
    params.setRenderCount(rendered);

    params.setSpinner(false);
  }

  const generatedKeys = generateKeys();
  const nextKeys = [...params.staticKeys, ...generatedKeys];
  return params.setStaticKeys(nextKeys);
};
