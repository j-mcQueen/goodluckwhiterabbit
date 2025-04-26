export const updateDropState = async ({ ...params }) => {
  // update images locked into order
  const nextImagesetCount =
    params.targetClient.fileCounts[params.targetImageset] + 1;

  // ensure active has up-to-date file counts
  const updatedTargetClient = { ...params.targetClient };
  updatedTargetClient.fileCounts = nextImagesetCount;
  params.setTargetClient(updatedTargetClient);

  // reflect changes in client list
  const nextClients = params.clients.map((client: { _id: string }) => {
    return client._id === params.targetClient._id
      ? updatedTargetClient
      : client;
  });
  params.setClients(nextClients);
};
