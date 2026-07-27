import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { handlePortfolioLoad } from "../utils/handlers/portfolioOrdering/handlePortfolioLoad";
import { handlePortfolioLoadTypes } from "../types/handlePortfolioLoadTypes";
import { generateKeys } from "../../../global/utils/generateKeys";
import { primaryCta } from "../../../global/styles/buttons";

import PortfolioOrderItem from "./PortfolioOrderItem";

export default function PortfolioImageOrder({ ...props }) {
  const {
    category,
    dragTarget,
    setNotice,
    renderCount,
    setRenderCount,
    targetSubcategory,
    setTargetSubcategory,
    targetGroupId,
    orderedGroup,
    setSpinner,
    taxonomy,
    setTaxonomy,
  } = props;

  const [order, setOrder] = useState(orderedGroup);
  const [staticKeys, setStaticKeys] = useState(generateKeys(10));

  useEffect(() => {
    setOrder(orderedGroup);
  }, [orderedGroup]);

  return (
    <div className="flex items-start">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            layoutScroll
            className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll h-[700px] relative"
          >
            {order.map((file: Blob | object, index: number) => {
              return (
                <PortfolioOrderItem
                  key={staticKeys[index] ?? index}
                  category={category}
                  dragTarget={dragTarget}
                  file={file}
                  index={index}
                  order={order}
                  renderCount={renderCount}
                  setNotice={setNotice}
                  setOrder={setOrder}
                  setRenderCount={setRenderCount}
                  setStaticKeys={setStaticKeys}
                  setTargetSubcategory={setTargetSubcategory}
                  staticKeys={staticKeys}
                  targetGroupId={targetGroupId}
                  targetSubcategory={targetSubcategory}
                  taxonomy={taxonomy}
                  setTaxonomy={setTaxonomy}
                />
              );
            })}
          </motion.div>

          <button
            onClick={async () => {
              const args: handlePortfolioLoadTypes = {
                category,
                order,
                renderCount,
                staticKeys,
                setNotice,
                setOrder,
                setRenderCount,
                setSpinner,
                setStaticKeys,
                setTargetSubcategory,
                targetGroupId,
                targetSubcategory,
              };

              await handlePortfolioLoad({ ...args, taxonomy, setTaxonomy });
            }}
            type="button"
            className={`${primaryCta} px-4 py-2 mt-8 mb-5`}
          >
            LOAD NEXT BATCH
          </button>
        </div>
      </div>
    </div>
  );
}
