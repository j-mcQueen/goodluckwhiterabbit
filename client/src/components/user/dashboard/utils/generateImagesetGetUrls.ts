import { Dispatch, SetStateAction } from "react";

export const generateImagesetGetUrls = async (
  activeImageset: string,
  setNotice: Dispatch<SetStateAction<object>>
) => {
  const host =
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_API_URL
      : "http://localhost:3000/api";
  // turn on loading component and extract user id from URL
  const url = document.location.href;
  const regex = /\/user\/([a-zA-Z0-9]+)\//;
  const id = url.match(regex)![1];

  let presigns;
  try {
    const response = await fetch(`${host}/users/${id}/${activeImageset}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();

    switch (response.status) {
      case 200:
      case 304:
        if (data.files === false) return data;
        presigns = data.presigns;

        if (data.skipped) {
          const filenames = data.skipped.join(" ");

          setNotice({
            status: true,
            message: `We could not receive permission to retrieve these files: ${filenames}`,
            logout: { status: false, path: null },
          });
        }
        break;

      case 500:
        setNotice(data);
        break;

      default:
        throw new Error("Other");
    }
  } catch (error) {
    setNotice({
      status: true,
      message:
        "Something went wrong. To keep things secure, we are logging you out. Please log back in and try again.",
      logout: { status: true, path: "/admin" },
    });
  }

  return presigns;
};
