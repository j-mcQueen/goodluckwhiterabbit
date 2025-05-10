import { Dispatch, SetStateAction } from "react";
import { determineHost } from "./determineHost";

export const generateImagesetGetUrls = async (
  start: number,
  end: number,
  activeImageset: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >,
  userId: string | undefined
) => {
  const host = determineHost;

  let presigns;
  try {
    const response = await fetch(
      `${host}/users/${userId}/${activeImageset}/${start}/${end}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
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
