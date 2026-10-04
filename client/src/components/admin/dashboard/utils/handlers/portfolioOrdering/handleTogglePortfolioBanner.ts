import { determineHost as host } from "../../../../../global/utils/determineHost";

// sets one image's banner flag - display-only layout metadata (no S3 call),
// read by the stacked ART/DESIGN live render to drop its width cap and crop
// to fill. Keyed by S3 position, same as delete/replace.
export const handleTogglePortfolioBanner = async ({
  category,
  sub,
  groupId,
  position,
  banner,
  setNotice,
}: {
  category: string;
  sub: string;
  groupId: string;
  position: string;
  banner: boolean;
  setNotice: (notice: { status: boolean; message: string; logout: { status: boolean; path: string | null } }) => void;
}) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/${position}/banner`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ banner }),
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
      message: "Something went wrong updating the banner setting - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong updating the banner setting - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
