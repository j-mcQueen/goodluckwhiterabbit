import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleCreatePortfolioMemo = async ({
  category,
  sub,
  groupId,
  html,
  position,
  setNotice,
}: {
  category: string;
  sub: string;
  groupId: string;
  html: string;
  position: number;
  setNotice: (notice: { status: boolean; message: string; logout: { status: boolean; path: string | null } }) => void;
}) => {
  try {
    const response = await fetch(`${host}/admin/portfolio/${category}/${sub}/${groupId}/memo`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ html, position }),
    });

    if (response.status === 200) {
      return await response.json();
    }

    if (response.status === 401) {
      setNotice({
        status: true,
        message: "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
        logout: { status: true, path: "/admin" },
      });
      return null;
    }

    setNotice({
      status: true,
      message: "Something went wrong creating this memo - please try again.",
      logout: { status: false, path: null },
    });
    return null;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong creating this memo - please try again.",
      logout: { status: false, path: null },
    });
    return null;
  }
};
