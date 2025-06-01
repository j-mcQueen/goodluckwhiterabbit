import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleAdd = async ({ ...params }) => {
  const {
    clients,
    e,
    errors,
    inputValues,
    setActivePane,
    setClients,
    setErrors,
    setSpinner,
  } = params;

  e.preventDefault();
  setSpinner(true);

  try {
    const response = await fetch(`${host}/admin/add`, {
      method: "POST",
      body: JSON.stringify({ ...inputValues }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();

    if (data) {
      setSpinner(false);
      switch (response.status) {
        case 200:
          // A client has been added
          setErrors({
            takenEmail: { state: false, status: 200, message: "" },
            formValidation: { state: false, status: 200, message: "" }, // this should always be false
            other: { state: false, status: 200, message: "" },
          });

          setClients([
            ...clients,
            {
              name: data.name,
              code: data.code,
              category: data.category,
              _id: data._id,
              fileCounts: data.fileCounts,
              added: data.added,
            },
          ]);

          setActivePane("ALL");
          break;

        case 401:
          // form validation errors
          setErrors({
            ...errors,
            formValidation: {
              state: true,
              status: data.status,
              message: data.message,
            },
          });
          break;

        case 409:
          // Client email already in use
          setErrors({
            ...errors,
            takenEmail: {
              state: true,
              status: data.status,
              message: data.message,
            },
          });
          break;

        default:
          throw new TypeError(data.message);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return setErrors({
        ...errors,
        other: { state: true, status: 500, message: error.message },
      });
    }
  }
};
