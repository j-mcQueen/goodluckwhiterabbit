import { determineHost as host } from "../../../../../global/utils/determineHost";
import { updatePortfolioOrderState } from "./updatePortfolioOrderState";

export const handlePortfolioDelete = async ({ ...params }) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${params.category}/${params.targetSubcategory.name}/${params.targetGroupId}/${params.index}/delete`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    if (data && (response.status === 200 || response.status === 304)) {
      const activeGroup = params.targetSubcategory.groups.find(
        (group: { groupId: string; count: number }) =>
          group.groupId === params.targetGroupId,
      );

      updatePortfolioOrderState({
        targetSubcategory: params.targetSubcategory,
        targetGroupId: params.targetGroupId,
        val: activeGroup.count - 1,
        taxonomy: params.taxonomy,
        setTaxonomy: params.setTaxonomy,
        setTargetSubcategory: params.setTargetSubcategory,
      });
      return { success: true as const };
    }

    return params.setNotice({
      status: true,
      message:
        "There was an error deleting this image. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
  } catch (error) {
    return params.setNotice({
      status: true,
      message:
        "There was an error deleting this image. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
  }
};
