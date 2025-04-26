import { useState } from "react";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDelete } from "./utils/handlers/ordering/handleDelete";
import { handleDeleteTypes } from "./types/handleDeleteTypes";
import { handleLoad } from "./utils/handlers/ordering/handleLoad";
import { handleLoadTypes } from "./types/handleLoadTypes";
import { handleDrop } from "./utils/handlers/ordering/handleDrop";
import { handleDropTypes } from "./types/handleDropTypes";
import { generateKeys } from "../../global/utils/generateKeys";

import Close from "../../../assets/media/icons/Close";

export default function ImageOrder({ ...props }) {
  const {
    host,
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
                <div
                  key={staticKeys[index]}
                  className={`${file instanceof Blob === false ? "h-[300px] w-[200px] min-h-[300px]" : "min-h-[300px] max-h-[350px]"} border border-solid`}
                  onDragStart={(e) =>
                    file instanceof Blob
                      ? handleDragStart(e, "order", index)
                      : null
                  }
                  onDrop={async (e) => {
                    const draggedIndex = Number(
                      e.dataTransfer.getData("text/index")
                    );
                    const source = e.dataTransfer.getData("text/source");

                    const args: handleDropTypes = {
                      clients,
                      draggedIndex,
                      dragTarget,
                      host,
                      index,
                      order,
                      setClients,
                      setNotice,
                      setOrder,
                      setTargetClient,
                      source,
                      targetClient,
                      targetImageset,
                    };

                    const blob = await handleDrop(args);

                    const updatedOrder = [...order];
                    updatedOrder[index] = blob;
                    const nextLoaded = renderCount + 1;

                    setRenderCount(nextLoaded);
                    setOrder(updatedOrder);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {file instanceof File ? (
                    <button
                      onClick={() => {
                        const args: handleDeleteTypes = {
                          clients,
                          filename: file.name,
                          host,
                          index,
                          order,
                          renderCount,
                          setClients,
                          setNotice,
                          setOrder,
                          setRenderCount,
                          setTargetClient,
                          targetClient,
                          targetImageset,
                        };

                        handleDelete(args);
                      }}
                      className="absolute bg-black m-1 border border-solid border-rd p-1"
                    >
                      <Close className="w-4 h-4" />
                    </button>
                  ) : null}

                  <img
                    loading="lazy"
                    draggable={true}
                    className={`${file instanceof Blob === false ? "hidden" : "block object-cover min-h-[300px] max-h-[350px]"}`}
                    src={file instanceof Blob ? URL.createObjectURL(file) : ""}
                  />
                </div>
              );
            })}
          </div>

          <button
            onClick={() => {
              const args: handleLoadTypes = {
                clients,
                host,
                order,
                renderCount,
                staticKeys,
                setOrder,
                setRenderCount,
                setSpinner,
                setStaticKeys,
                targetClient,
                targetImageset,
              };
              handleLoad(args);
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
