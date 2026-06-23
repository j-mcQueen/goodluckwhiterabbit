// sister to generateImagesetGetUrls
import { Dispatch, SetStateAction } from "react";
import { determineHost as host } from "../../global/utils/determineHost";

export const generatePortfolioGetUrls = async (
  category: string, // e.g. PHOTO
  group: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      loading: boolean;
      message: string | null;
    }>
  >,
  size: string,
  start: number,
  sub: string, // e.g. WEDDINGS
) => {
  let presigns;
  try {
    const response = await fetch(
      `${host}/portfolio/${category}/${sub}/${group}/${size}/${start}/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      },
    );

    const data = await response.json();

    switch (response.status) {
      case 200:
      case 304:
        if (data.files === false) return data;
        presigns = data;

        if (data.skipped) {
          setNotice({
            status: true,
            loading: false,
            message: `We could not receive permission to retrieve these files: ${data.skipped.join(" ")}`,
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
      loading: false,
      message: "Something went wrong. Please refresh the page and try again.",
    });
  }

  return presigns;
};
