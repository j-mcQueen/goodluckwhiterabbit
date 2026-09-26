import { determineHost as host } from "../../../../../global/utils/determineHost";
import { portfolio_subcategory } from "../../../types/portfolioTypes";

// renames a group's display name only - see adminRenameGroup: groupId (the
// physical S3 folder name) never changes, so this is a pure taxonomy update
export const handleRenameGroup = async ({ ...params }) => {
  const {
    subId,
    groupId,
    name,
    targetSubcategory,
    setTargetSubcategory,
    taxonomy,
    setTaxonomy,
    setNotice,
  } = params;

  try {
    const response = await fetch(
      `${host}/admin/portfolio/subcategories/${subId}/groups/${groupId}/rename`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    if (response.status === 200) {
      const updatedSubcategory = {
        ...targetSubcategory,
        groups: targetSubcategory.groups.map(
          (group: { groupId: string; name: string }) =>
            group.groupId === groupId ? { ...group, name: data.name } : group,
        ),
      };
      setTargetSubcategory(updatedSubcategory);
      setTaxonomy(
        taxonomy.map((sub: portfolio_subcategory) =>
          sub._id === subId ? updatedSubcategory : sub,
        ),
      );
      return true;
    }

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
      message: "Something went wrong renaming this group - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message: "Something went wrong renaming this group - please try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
