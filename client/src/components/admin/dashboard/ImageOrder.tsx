import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDelete } from "./utils/handlers/ordering/handleDelete";
import { handleDeleteTypes } from "./types/handleDeleteTypes";
import { handleLoad } from "./utils/handlers/ordering/handleLoad";
import { handleLoadTypes } from "./types/handleLoadTypes";
import { handleDrop } from "./utils/handlers/ordering/handleDrop";
import { handleDropTypes } from "./types/handleDropTypes";

import Close from "../../../assets/media/icons/Close";

export default function ImageOrder({ ...props }) {
  const {
    host,
    clients,
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

  return (
    <div className="flex items-start">
      <div className="text-white p-3 min-w-[40vw] flex flex-col items-center justify-center overflow-scroll">
        <div className="flex flex-col items-center ">
          <div className="flex flex-wrap justify-center max-w-[60dvw] gap-5 px-5 overflow-scroll relative">
            {order.map((file: File | object, index: number) => {
              return (
                <div key={uuidv4()}>
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
                    onDragStart={(e) =>
                      file instanceof File
                        ? handleDragStart(e, file, "order", index)
                        : null
                    }
                    onDrop={async (e) => {
                      const draggedIndex = Number(
                        e.dataTransfer.getData("text/index")
                      );
                      const source = e.dataTransfer.getData("text/source");
                      const file = e.dataTransfer.files[0];
                      const fFile = e.dataTransfer.files[1]; // full res file

                      const args: handleDropTypes = {
                        clients,
                        draggedIndex,
                        fFile,
                        file,
                        host,
                        index,
                        order,
                        renderCount,
                        setClients,
                        setNotice,
                        setOrder,
                        setRenderCount,
                        setTargetClient,
                        source,
                        targetClient,
                        targetImageset,
                      };

                      handleDrop(args);

                      const updatedOrder = [...order];
                      updatedOrder[index] = file;
                      setOrder(updatedOrder);
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    className={`${file instanceof File === false ? "h-[300px] w-[200px] min-h-[300px]" : "min-h-[300px] max-h-[350px]"} border border-solid`}
                    src={file instanceof File ? URL.createObjectURL(file) : ""}
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
                setOrder,
                setSpinner,
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
