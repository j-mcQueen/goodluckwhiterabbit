import { useState } from "react";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDropTypes } from "./types/handleDropTypes";
import { handleDrop } from "./utils/handlers/ordering/handleDrop";
import { handleDelete } from "./utils/handlers/ordering/handleDelete";
import { handleDeleteTypes } from "./types/handleDeleteTypes";

import Close from "../../../assets/media/icons/Close";
import Loading from "../../global/Loading";

export default function OrderItem({ ...props }) {
  const {
    clients,
    dragTarget,
    file,
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
  } = props;

  const [dropPending, setDropPending] = useState(false);

  return (
    <div
      className={`${file instanceof Blob === false ? "h-[300px] w-[200px] min-h-[300px]" : "min-h-[300px] max-h-[350px]"} border border-solid overflow-hidden`}
      onDragStart={(e) =>
        file instanceof Blob ? handleDragStart(e, "order", index) : null
      }
      onDrop={async (e) => {
        setDropPending(true);

        const draggedIndex = Number(e.dataTransfer.getData("text/index"));
        const source = e.dataTransfer.getData("text/source");

        const args: handleDropTypes = {
          clients,
          draggedIndex,
          dragTarget,
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

        if (blob instanceof Blob) setDropPending(false);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {file instanceof Blob ? (
        <button
          onClick={async () => {
            const args: handleDeleteTypes = {
              clients,
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
            await handleDelete(args);

            const updatedOrder = [...order];
            updatedOrder[index] = {};
            const nextLoaded = renderCount - 1;

            setRenderCount(nextLoaded);
            setOrder(updatedOrder);
          }}
          className="absolute bg-black m-1 border border-solid border-rd p-1"
        >
          <Close className="w-4 h-4" />
        </button>
      ) : null}

      {dropPending ? (
        <div className="flex h-full items-center justify-center">
          <Loading />
        </div>
      ) : null}

      <img
        loading="lazy"
        draggable={true}
        className={`${file instanceof Blob === false ? "hidden" : "block object-cover min-h-[300px] max-h-[350px]"}`}
        src={file instanceof Blob ? URL.createObjectURL(file) : ""}
      />
    </div>
  );
}
