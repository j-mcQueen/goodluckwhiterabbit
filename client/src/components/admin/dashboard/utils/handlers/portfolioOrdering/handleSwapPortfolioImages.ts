import { determineHost as host } from "../../../../../global/utils/determineHost";

// S3 content-rename swap (adminSwapPortfolioImages, unchanged) - used for
// image-to-image drags in a memo-free group specifically. `from`/`to` are
// S3 position numbers here, not layout array indices: this trades which
// file lives at each position, so a memo-free group's public-facing order
// (still 100% S3 position, per the write-path-split decision) stays
// automatically in sync with what the admin sees, with zero changes to
// the public site.
export const handleSwapPortfolioImages = async ({
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
  from: string;
  to: string;
  setNotice: (notice: {
    status: boolean;
    message: string;
    logout: { status: boolean; path: string | null };
  }) => void;
}) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/${sub}/${groupId}/swap/${from}/${to}`,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        credentials: "include",
      },
    );

    if (response.status === 200 || response.status === 304) return true;

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
      message: "Something went wrong reordering these images - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong reordering these images - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
