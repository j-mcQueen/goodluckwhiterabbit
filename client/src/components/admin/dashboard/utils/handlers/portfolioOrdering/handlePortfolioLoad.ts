import { determineHost as host } from "../../../../../global/utils/determineHost";
import { generateKeys } from "../../../../../global/utils/generateKeys";
import { executePortfolioOrderChain } from "./executePortfolioOrderChain";
import { updatePortfolioOrderState } from "./updatePortfolioOrderState";

export const handlePortfolioLoad = async ({ ...params }) => {
  const {
    category,
    order,
    renderCount,
    setNotice,
    setOrder,
    setRenderCount,
    setSpinner,
    setStaticKeys,
    setTargetSubcategory,
    setTaxonomy,
    staticKeys,
    targetGroupId,
    targetSubcategory,
    taxonomy,
  } = params;

  const activeGroup = targetSubcategory.groups.find(
    (group: { groupId: string }) => group.groupId === targetGroupId,
  );
  const storedCount = activeGroup?.count ?? 0;

  if (renderCount === storedCount) {
    const nextOrder = [...order, ...Array(10).fill({})];
    setOrder(nextOrder);

    const nextKeys = [...staticKeys, ...generateKeys(10)];
    setStaticKeys(nextKeys);
  } else if (renderCount < storedCount) {
    setSpinner(true);

    const groupLength = order.length;

    // show empty, stable placeholder slots immediately, before fetching, so
    // each image can fill its own slot in place as it individually resolves
    const placeholderOrder = [...order, ...Array(10).fill({})];
    setOrder(placeholderOrder);

    const placeholderKeys = [...staticKeys, ...generateKeys(10)];
    setStaticKeys(placeholderKeys);

    const data = await executePortfolioOrderChain(
      placeholderOrder,
      category,
      targetSubcategory.name,
      targetGroupId,
      setNotice,
      groupLength,
      "sm",
      (position: number, blob: Blob) => {
        setOrder((prev: (Blob | object)[]) => {
          const next = [...prev];
          next[position] = blob;
          return next;
        });
      },
    );

    const count = renderCount + data.count;

    if (count >= data.stored) {
      const response = await fetch(
        `${host}/admin/portfolio/subcategories/${targetSubcategory._id}/groups/${targetGroupId}/updateCount/${data.stored}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
      );
      const updated = await response.json();

      if (response.status === 200 || response.status === 304) {
        updatePortfolioOrderState({
          targetSubcategory,
          targetGroupId,
          val: updated.count,
          taxonomy,
          setTaxonomy,
          setTargetSubcategory,
        });
      }
    }

    setRenderCount(count);
    setSpinner(false);
  }
};
