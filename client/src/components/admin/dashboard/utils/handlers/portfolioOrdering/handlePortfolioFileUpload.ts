import { determineHost as host } from "../../../../../global/utils/determineHost";
import { updatePortfolioOrderState } from "./updatePortfolioOrderState";
import { handlePortfolioFileUploadTypes } from "../../../types/handlePortfolioFileUploadTypes";

// upload-a-dropped-file half of the old handlePortfolioDrop.ts (the other
// half, handleSwap, was built on the old order-array index model and
// doesn't apply to PortfolioAdminGrid.tsx). Used both for replacing an
// existing tile's content and for appending a brand-new upload via the
// trailing gap marker / an empty slot - the caller decides `isReplace`
// (and, for a replace, `position`); for an append, the backend derives and
// returns the position, since the client may only have a partial, paginated
// view of the group.
export const handlePortfolioFileUpload = async ({
  ...params
}: handlePortfolioFileUploadTypes) => {
  let blob;
  let position: number | null = null;
  try {
    const formData = new FormData();
    formData.append("isReplace", String(params.isReplace));
    if (params.isReplace) {
      formData.append("position", String(params.position));
    }
    formData.append("file", params.file);

    const response = await fetch(
      `${host}/admin/portfolio/${params.category}/${params.sub}/${params.groupId}/uploadFile`,
      {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      },
    );

    switch (response.status) {
      case 200: {
        const data = await response.json();
        const bytes = Uint8Array.from(atob(data.image), (c) =>
          c.charCodeAt(0),
        );
        blob = new Blob([bytes], { type: "image/webp" });
        position = data.position;
        break;
      }

      case 401:
        throw new Error("401");

      default:
        throw new Error("Other");
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

  if (blob instanceof Blob && position !== null) {
    const activeGroup = params.targetSubcategory.groups.find(
      (group: { groupId: string; count: number }) =>
        group.groupId === params.groupId,
    );
    const currentCount = activeGroup?.count ?? 0;

    updatePortfolioOrderState({
      targetSubcategory: params.targetSubcategory,
      targetGroupId: params.groupId,
      val: params.isReplace ? currentCount : currentCount + 1,
      taxonomy: params.taxonomy,
      setTaxonomy: params.setTaxonomy,
      setTargetSubcategory: params.setTargetSubcategory,
    });
    return { blob, position };
  }

  return null;
};
