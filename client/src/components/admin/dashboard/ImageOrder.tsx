import { useEffect, useRef, useState } from "react";
import { handleLoad } from "./utils/handlers/ordering/handleLoad";
import { handleLoadTypes } from "./types/handleLoadTypes";
import { generateKeys } from "../../global/utils/generateKeys";
import { loadBatchButton } from "../../global/styles/buttons";
import { measurePortfolioImageRatio } from "../../global/memo/measurePortfolioImageRatio";
import { packPortfolioRun, COLUMNS } from "../../global/utils/packPortfolioRun";

import OrderItem from "./OrderItem";

const GRID_GAP_PX = 20; // must match the gap-5 on the packed grid below
const ROW_HEIGHT_RATIO = 0.85; // matches PortfolioAdminGrid.tsx's portrait-friendly target ratio

export default function ImageOrder({ ...props }) {
  const {
    clients,
    dragTarget,
    setClients,
    setNotice,
    renderCount,
    setRenderCount,
    targetClient,
    setTargetClient,
    targetImageset,
    orderedImageset,
    setSpinner,
  } = props;

  const [order, setOrder] = useState(orderedImageset);
  const [staticKeys, setStaticKeys] = useState(generateKeys(10));

  useEffect(() => {
    setOrder(orderedImageset);
  }, [orderedImageset]);

  // ratios drive column span (landscape spans 2, portrait/square spans 1),
  // matching PortfolioAdminGrid.tsx's live-site-style packing. Cached by
  // blob identity (not array index) so a drag-swap - which moves the same
  // blob to a different index - never re-measures it.
  const ratioCacheRef = useRef(new WeakMap<Blob, number>());
  // value itself is never read - calling the setter alone forces the
  // re-render needed to pick up newly-cached ratios
  const [, setRatioVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const missing = order.filter(
      (file: unknown): file is Blob =>
        file instanceof Blob && !ratioCacheRef.current.has(file),
    );
    if (missing.length === 0) return;

    Promise.all(
      missing.map(async (file: Blob) => {
        const ratio = await measurePortfolioImageRatio(file);
        ratioCacheRef.current.set(file, ratio);
      }),
    ).then(() => {
      if (!cancelled) setRatioVersion((v) => v + 1);
    });

    return () => {
      cancelled = true;
    };
  }, [order]);

  const getRatio = (file: unknown) =>
    file instanceof Blob ? (ratioCacheRef.current.get(file) ?? 1) : 1;

  // drives row height from the grid's own measured width, same reasoning as
  // PortfolioAdminGrid.tsx - this grid shares its row with a reserved-width
  // queue panel, so it can't use a viewport-relative row height
  const [gridWidth, setGridWidth] = useState(0);
  const [gridWrapperNode, setGridWrapperNode] = useState<HTMLDivElement | null>(
    null,
  );

  useEffect(() => {
    if (!gridWrapperNode) return;
    const observer = new ResizeObserver((observerEntries) => {
      const width = observerEntries[0]?.contentRect.width;
      if (typeof width === "number") setGridWidth(width);
    });
    observer.observe(gridWrapperNode);
    return () => observer.disconnect();
  }, [gridWrapperNode]);

  const colWidth =
    gridWidth > 0 ? (gridWidth - GRID_GAP_PX * (COLUMNS - 1)) / COLUMNS : 0;
  const rowHeightPx =
    colWidth > 0 ? Math.round(colWidth / ROW_HEIGHT_RATIO) : 300;

  const packing = packPortfolioRun(
    order.map((file: Blob | object, index: number) => ({
      key: String(staticKeys[index] ?? index),
      ratio: getRatio(file),
    })),
  );

  return (
    <div className="flex items-stretch flex-1 min-h-0">
      <div className="text-white p-3 flex flex-col flex-1 min-w-0 min-h-0">
        <div className="flex flex-col flex-1 min-h-0">
          <div
            ref={setGridWrapperNode}
            className="flex-1 min-h-0 overflow-y-auto"
          >
            <div
              className="grid grid-cols-3 gap-3"
              style={{ gridAutoRows: `${rowHeightPx}px` }}
            >
              {order.map((file: Blob | object, index: number) => {
                const placement = packing.placements[index];

                return (
                  <OrderItem
                    key={staticKeys[index] ?? index}
                    clients={clients}
                    dragTarget={dragTarget}
                    file={file}
                    index={index}
                    order={order}
                    renderCount={renderCount}
                    setClients={setClients}
                    setNotice={setNotice}
                    setOrder={setOrder}
                    setRenderCount={setRenderCount}
                    setStaticKeys={setStaticKeys}
                    setTargetClient={setTargetClient}
                    staticKeys={staticKeys}
                    style={{
                      gridColumn: `${placement.column} / span ${placement.columnSpan}`,
                      gridRow: `${placement.row} / span 1`,
                    }}
                    targetClient={targetClient}
                    targetImageset={targetImageset}
                  />
                );
              })}
            </div>
          </div>

          <button
            onClick={async () => {
              const args: handleLoadTypes = {
                clients,
                order,
                renderCount,
                staticKeys,
                setClients,
                setOrder,
                setRenderCount,
                setSpinner,
                setStaticKeys,
                setTargetClient,
                targetClient,
                targetImageset,
              };

              await handleLoad(args);
            }}
            type="button"
            className={loadBatchButton}
          >
            LOAD NEXT BATCH
          </button>
        </div>
      </div>
    </div>
  );
}
