import { determineHost as host } from "../../../../../global/utils/determineHost";
import { portfolio_subcategory } from "../../../types/portfolioTypes";

export const handleDeleteGroup = async ({ ...params }) => {
  const {
    subId,
    groupId,
    targetSubcategory,
    setTargetSubcategory,
    taxonomy,
    setTaxonomy,
    setNotice,
  } = params;

  try {
    const response = await fetch(
      `${host}/admin/portfolio/subcategories/${subId}/groups/${groupId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const data = await response.json();

    if (response.status === 200 && data.success) {
      const updatedSubcategory = {
        ...targetSubcategory,
        groups: targetSubcategory.groups.filter(
          (group: { groupId: string }) => group.groupId !== groupId,
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

    setNotice({
      status: true,
      message:
        "There was an error deleting this group. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message:
        "There was an error deleting this group. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
