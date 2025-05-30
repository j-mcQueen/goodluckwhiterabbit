import { useState } from "react";
import { handleLoad } from "./utils/handlers/ordering/handleLoad";
import { handleLoadTypes } from "./types/handleLoadTypes";
import { generateKeys } from "../../global/utils/generateKeys";

import OrderItem from "./OrderItem";

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
  const [staticKeys, setStaticKeys] = useState(generateKeys);

  return (
    <div className="flex items-start">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll h-[1200px] relative">
            {order.map((file: Blob | string, index: number) => {
              return (
                <OrderItem
                  key={staticKeys[index]}
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
                  setTargetClient={setTargetClient}
                  targetClient={targetClient}
                  targetImageset={targetImageset}
                />
              );
            })}
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
            className="font-tnrBI tracking-widest opacity-80 drop-shadow-glo border border-solid px-4 py-2 xl:hover:text-rd xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red transition-colors mt-8 mb-5"
          >
            LOAD NEXT BATCH
          </button>
        </div>
      </div>
    </div>
  );
}
