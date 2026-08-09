import { determineHost as host } from "../utils/determineHost";

// One small, dedicated check per group-entry, deliberately kept separate
// from getPortfolioTaxonomy's response shape - that shape is depended on by
// several existing, unrelated components (Sidebar.tsx, GroupList.tsx,
// MenuItem.tsx, mobile nav) and changing it to carry a memo flag would put
// all of those on the hook for a feature they don't use. This costs one
// small request per group transition instead.
export const checkPortfolioGroupHasMemo = async (
  category: string,
  sub: string,
  groupId: string,
): Promise<boolean> => {
  try {
    const response = await fetch(`${host}/portfolio/${category}/${sub}/${groupId}/hasMemo`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "include",
    });
    if (response.status !== 200) return false;
    const data = await response.json();
    return Boolean(data.hasMemo);
  } catch (error) {
    return false; // falls back to the untouched existing render path
  }
};
