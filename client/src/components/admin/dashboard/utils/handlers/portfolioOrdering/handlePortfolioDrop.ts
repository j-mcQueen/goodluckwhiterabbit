import { determineHost as host } from "../../../../../global/utils/determineHost";
import { updatePortfolioOrderState } from "./updatePortfolioOrderState";
import { handlePortfolioDropTypes } from "../../../types/handlePortfolioDropTypes";

export const handlePortfolioDrop = async ({
  ...params
}: handlePortfolioDropTypes) => {
  if (params.source === "order" && params.index === params.draggedIndex) return; // dropped back onto its own position

  return params.source === "order"
    ? handleSwap(params)
    : handleQueueUpload(params);
};

const handleSwap = async (params: handlePortfolioDropTypes) => {
  try {
    const response = await fetch(
      `${host}/admin/portfolio/${params.category}/${params.targetSubcategory.name}/${params.targetGroupId}/swap/${params.draggedIndex}/${params.index}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    if (data && (response.status === 200 || response.status === 304)) {
      return { type: "swap" as const };
    }

    if (response.status === 401) {
      return params.setNotice({
        status: true,
        message:
          "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
        logout: { status: true, path: "/admin" },
      });
    }

    return params.setNotice({
      status: true,
      message: "Something went wrong - please try again.",
      logout: { status: false, path: null },
    });
  } catch (error) {
    return params.setNotice({
      status: true,
      message: "Something went wrong - please try again.",
      logout: { status: false, path: null },
    });
  }
};

const handleQueueUpload = async (params: handlePortfolioDropTypes) => {
  let blob;
  try {
    const formData = new FormData();
    formData.append("position", String(params.index));
    formData.append("file", params.dragTarget);

    const response = await fetch(
      `${host}/admin/portfolio/${params.category}/${params.targetSubcategory.name}/${params.targetGroupId}/uploadFile`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.blob();

    if (data) {
      switch (response.status) {
        case 200:
        case 304:
          blob = data;
          break;

        case 401:
          throw new Error("401");

        default:
          throw new Error("Other");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "401") {
        return params.setNotice({
          status: true,
          message:
            "You are unauthorized to take this action and are being logged out to keep things secure. Please log in and try again.",
          logout: { status: true, path: "/admin" },
        });
      } else {
        return params.setNotice({
          status: true,
          message: "Something went wrong - please try again.",
          logout: { status: false, path: null },
        });
      }
    }
  }

  if (blob instanceof Blob) {
    const activeGroup = params.targetSubcategory.groups.find(
      (group: { groupId: string; count: number }) =>
        group.groupId === params.targetGroupId,
    );
    const wasReplace = params.order[params.index] instanceof Blob;
    const currentCount = activeGroup?.count ?? 0;

    updatePortfolioOrderState({
      targetSubcategory: params.targetSubcategory,
      targetGroupId: params.targetGroupId,
      val: wasReplace ? currentCount : currentCount + 1,
      taxonomy: params.taxonomy,
      setTaxonomy: params.setTaxonomy,
      setTargetSubcategory: params.setTargetSubcategory,
    });
    return { type: "upload" as const, blob };
  }
};
