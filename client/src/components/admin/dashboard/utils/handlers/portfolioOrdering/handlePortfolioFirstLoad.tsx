import { updatePortfolioOrderState } from "./updatePortfolioOrderState";
import { executePortfolioOrderChain } from "./executePortfolioOrderChain";

export const handlePortfolioFirstLoad = async ({ ...params }) => {
  const {
    category,
    newTargetGroupId,
    order,
    setNotice,
    setOrder,
    setSpinner,
    setStarted,
    setTargetGroupId,
    setTargetSubcategory,
    setTaxonomy,
    targetSubcategory,
    taxonomy,
  } = params;

  setTargetGroupId(newTargetGroupId);

  if (order.some((item: Blob | object) => item instanceof Blob)) {
    return;
  }

  setStarted(true);
  setSpinner(true);

  const data = await executePortfolioOrderChain(
    order,
    category,
    targetSubcategory.name,
    newTargetGroupId,
    setNotice,
    0,
    "sm",
    (position: number, blob: Blob) => {
      setOrder((prev: (Blob | object)[]) => {
        const next = [...prev];
        next[position] = blob;
        return next;
      });
    },
  );

  if (data.stored > 0 && data.files) {
    updatePortfolioOrderState({
      targetSubcategory,
      targetGroupId: newTargetGroupId,
      val: data.stored,
      taxonomy,
      setTaxonomy,
      setTargetSubcategory,
    });
  }

  return setSpinner(false);
};
