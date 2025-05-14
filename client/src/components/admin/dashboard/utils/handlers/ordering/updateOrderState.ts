export const updateOrderState = async ({ ...params }) => {
  // ensure active has up-to-date file counts
  const updatedTargetClient = { ...params.targetClient };
  updatedTargetClient.fileCounts[params.targetImageset] = params.val;
  params.setTargetClient(updatedTargetClient);

  // reflect changes in client list
  const nextClients = params.clients.map((client: { _id: string }) => {
    return client._id === params.targetClient._id
      ? updatedTargetClient
      : client;
  });
  params.setClients(nextClients);
};
