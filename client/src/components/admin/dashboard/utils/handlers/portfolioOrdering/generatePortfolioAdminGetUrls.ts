import { Dispatch, SetStateAction } from "react";
import { determineHost as host } from "../../../../../global/utils/determineHost";

// admin-only, credentialed counterpart to the public
// generatePortfolioGetUrls.ts - hits adminGetPortfolioGroupImages, which is
// strictly scoped to one group (no cross-group spillover, a true per-group
// `stored` count) rather than the public infinite-scroll endpoint.
export const generatePortfolioAdminGetUrls = async (
  category: string,
  sub: string,
  groupId: string,
  size: string,
  start: number,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >,
) => {
  let presigns;
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/${size}/${start}/`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
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
          const filenames = data.skipped.join(" ");

          setNotice({
            status: true,
            message: `We could not receive permission to retrieve these files: ${filenames}`,
            logout: { status: false, path: null },
          });
        }
        break;

      case 401:
        setNotice({
          status: true,
          message:
            "Your session has expired, so we're logging you out to keep things secure. Please login again to continue.",
          logout: { status: true, path: "/admin" },
        });
        return { files: false };

      case 500:
        setNotice(data);
        return { files: false };

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
    return { files: false };
  }

  return presigns;
};
