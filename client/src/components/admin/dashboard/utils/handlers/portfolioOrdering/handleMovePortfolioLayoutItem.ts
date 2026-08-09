import { determineHost as host } from "../../../../../global/utils/determineHost";

// relocates one layout entry (splice out, splice in) rather than swapping
// two - used when an existing memo tile is dragged onto a gap marker
// (spec: this changed plan's "move mechanic" decision). `to` is a gap
// index (0..layout.length), matching the same numbering handleCreatePortfolioMemo
// already uses for insertion, not an existing-element index.
export const handleMovePortfolioLayoutItem = async ({
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
  setNotice: (notice: {
    status: boolean;
    message: string;
    logout: { status: boolean; path: string | null };
  }) => void;
}) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/layout/move/${from}/${to}`,
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
      message: "Something went wrong moving the memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong moving the memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
