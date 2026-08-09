import { determineHost as host } from "../../../../../global/utils/determineHost";

// pure layout array-index swap - no S3 call, since display order in a
// memo-managed group is the array sequence itself, not S3 position values
// (spec §2.2). Used for every drag-reorder within this queue view: image-
// image, image-memo, and memo-memo alike, since this endpoint is agnostic
// to entry type.
export const handleSwapPortfolioLayout = async ({
  category,
  sub,
  groupId,
  from,
  to,
  setNotice,
}: {
  category: string;
  sub: string;
  groupId: string;
  from: number;
  to: number;
  setNotice: (notice: { status: boolean; message: string; logout: { status: boolean; path: string | null } }) => void;
}) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/layout/swap/${from}/${to}`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      },
    );

    if (response.status === 200) return true;

    if (response.status === 401) {
      setNotice({
        status: true,
        message: "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
        logout: { status: true, path: "/admin" },
      });
      return false;
    }

    setNotice({
      status: true,
      message: "Something went wrong reordering the queue - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong reordering the queue - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
