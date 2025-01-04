import { updateFileCount } from "../../updateFileCounts";

export const handleDelete = async ({ ...params }) => {
  try {
    const response = await fetch(
      `${params.host}/admin/users/${params.targetClient._id}/${params.targetImageset}/${params.index}/${params.filename}/delete`,
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
      const updatedOrder = [...params.order];
      updatedOrder[params.index] = {};
      params.setOrder(updatedOrder);

      // update imagesetCount
      const nextImagesetCount =
        params.targetClient.fileCounts[
          params.targetImageset as keyof typeof params.targetClient.fileCounts
        ] - 1;
      const newCounts = await updateFileCount(
        params.host,
        params.targetClient,
        params.targetImageset,
        nextImagesetCount
      );

      const updatedTargetClient = { ...params.targetClient };
      updatedTargetClient.fileCounts = newCounts;
      params.setTargetClient(updatedTargetClient);

      const nextClients = params.clients.map((client: { _id: string }) => {
        return client._id === params.targetClient._id
          ? updatedTargetClient
          : client;
      });
      params.setClients(nextClients);

      const nextLoaded = params.renderCount - 1;
      params.setRenderCount(nextLoaded);
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
