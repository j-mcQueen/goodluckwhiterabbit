import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleLinksSubmit = async ({ ...params }) => {
  params.e.preventDefault();
  params.setSpinner(true);

  try {
    const response = await fetch(
      `${host}/admin/users/${params.targetClient._id}/addLinks`,
      {
        method: "POST",
        body: JSON.stringify({ ...params.inputVals }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    const data = await response.json();

    if (data) {
      params.setSpinner(false);
      if (response.status === 200 || response.status === 304) {
        params.setError({ state: false, status: 200, message: "" });

        const clientIndex = params.clients.findIndex(
          (client: { _id: string }) => client._id === params.targetClient._id
        );
        const clients = [...params.clients];
        clients[clientIndex].links = data;
        params.setClients(clients);
        params.setActivePane("ALL");
      } else {
        throw new TypeError();
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return params.setError({
        state: true,
        status: 500,
        message: error.message,
      });
    }
  }
};
