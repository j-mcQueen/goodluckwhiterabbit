import { useEffect, useState } from "react";
import PortfolioFileInfo from "./PortfolioFileInfo";
import PortfolioImageOrder from "./PortfolioImageOrder";

const PortfolioOrderContainer = ({ ...props }) => {
  const {
    category,
    dragTarget,
    orderedGroup,
    setNotice,
    setSpinner,
    setTargetSubcategory,
    spinner,
    targetSubcategory,
    targetGroupId,
    taxonomy,
    setTaxonomy,
  } = props;

  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(
      orderedGroup.filter((item: object | Blob) => item instanceof Blob)
        .length,
    );
  }, [orderedGroup]);

  return (
    <div className="flex flex-col">
      <PortfolioFileInfo
        renderCount={renderCount}
        spinner={spinner}
        targetSubcategory={targetSubcategory}
        targetGroupId={targetGroupId}
      />

      <PortfolioImageOrder
        category={category}
        dragTarget={dragTarget}
        renderCount={renderCount}
        setRenderCount={setRenderCount}
        setNotice={setNotice}
        targetSubcategory={targetSubcategory}
        setTargetSubcategory={setTargetSubcategory}
        targetGroupId={targetGroupId}
        orderedGroup={orderedGroup}
        setSpinner={setSpinner}
        taxonomy={taxonomy}
        setTaxonomy={setTaxonomy}
      />
    </div>
  );
};
export default PortfolioOrderContainer;
