import { determineHost as host } from "../../../../../global/utils/determineHost";
import { portfolio_group } from "../../../types/portfolioTypes";

// relocates one group to a new gap position within its subcategory - same
// mechanic as handleMovePortfolioLayoutItem, one level up. `to` is a gap
// index (0..groups.length), not an existing-element index. The response
// always echoes the authoritative post-move `groups` array (order-sorted),
// so the caller never has to predict the reorder itself.
export const handleMovePortfolioGroup = async ({
  subId,
  groupId,
  to,
  setNotice,
}: {
  subId: string;
  groupId: string;
  to: number;
  setNotice: (notice: {
    status: boolean;
    message: string;
    logout: { status: boolean; path: string | null };
  }) => void;
}): Promise<portfolio_group[] | false> => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/subcategories/${subId}/groups/${groupId}/move/${to}`,
      {
        method: "POST",
        headers: { Accept: "application/json" },
        credentials: "include",
      },
    );
    const data = await response.json();

    if (response.status === 200) return data.groups as portfolio_group[];

    if (response.status === 401) {
      setNotice({
        status: true,
        message:
          "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
        logout: { status: true, path: "/admin" },
      });
      return false;
    }

    setNotice({
      status: true,
      message: "Something went wrong moving this group - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong moving this group - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
