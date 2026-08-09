import { determineHost as host } from "../../../../../global/utils/determineHost";

// removes only the one layout entry for this memoId - no image position is
// renumbered, so the grid re-flows around the closed gap for free (spec §2.4)
export const handleDeletePortfolioMemo = async ({
  category,
  sub,
  groupId,
  memoId,
  setNotice,
}: {
  category: string;
  sub: string;
  groupId: string;
  memoId: string;
  setNotice: (notice: { status: boolean; message: string; logout: { status: boolean; path: string | null } }) => void;
}) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/memo/${memoId}`,
      {
        method: "DELETE",
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
      message: "Something went wrong deleting this memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong deleting this memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
