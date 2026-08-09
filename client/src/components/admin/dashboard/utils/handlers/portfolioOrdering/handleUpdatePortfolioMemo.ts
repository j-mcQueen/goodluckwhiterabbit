import { determineHost as host } from "../../../../../global/utils/determineHost";

// re-save only ever touches memo content (backend never touches `layout`
// here) - this is what makes "returns to its original queue position" true
// by construction rather than something this handler needs to arrange
export const handleUpdatePortfolioMemo = async ({
  memoId,
  html,
  setNotice,
}: {
  memoId: string;
  html: string;
  setNotice: (notice: { status: boolean; message: string; logout: { status: boolean; path: string | null } }) => void;
}) => {
  try {
    const response = await fetch(`${host}/admin/portfolio/memo/${memoId}`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ html }),
    });

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
      message: "Something went wrong saving this memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong saving this memo - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
