import { useState } from "react";
import PortfolioFileInfo from "./PortfolioFileInfo";
import PortfolioAdminGrid from "./PortfolioAdminGrid";

// One grid for every group now (PortfolioAdminGrid.tsx), memo-managed or
// not - no more hasMemo branch here, no more layoutVersion/onMemoCreated
// plumbing. The grid fetches its own data and derives hasMemo locally, so
// this container is just wiring: which group, and the taxonomy state
// PortfolioFileInfo and the grid's own count-updating handlers need.
const PortfolioOrderContainer = ({ ...props }) => {
  const {
    category,
    dragTarget,
    setNotice,
    setTargetSubcategory,
    targetSubcategory,
    targetGroupId,
    taxonomy,
    setTaxonomy,
    bulkUploadSignal,
  } = props;

  // PortfolioAdminGrid.tsx paginates, so "how many files are displayed"
  // isn't the same as the group's total stored count - the grid reports its
  // own real loaded-image count back up here as it loads/changes.
  const [loadedImageCount, setLoadedImageCount] = useState(0);

  return (
    <div className="flex flex-col flex-1 min-h-0 min-w-0">
      <PortfolioFileInfo
        renderCount={loadedImageCount}
        spinner={false}
        targetSubcategory={targetSubcategory}
        targetGroupId={targetGroupId}
      />

      <PortfolioAdminGrid
        category={category}
        sub={targetSubcategory.name}
        groupId={targetGroupId}
        dragTarget={dragTarget}
        targetSubcategory={targetSubcategory}
        setTargetSubcategory={setTargetSubcategory}
        taxonomy={taxonomy}
        setTaxonomy={setTaxonomy}
        setNotice={setNotice}
        bulkUploadSignal={bulkUploadSignal}
        onLoadedImageCountChange={setLoadedImageCount}
      />
    </div>
  );
};
export default PortfolioOrderContainer;
