import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import { handleDragStart } from "./utils/handlers/handleDragStart";
import { handleDropTypes } from "./types/handleDropTypes";
import { handleDrop } from "./utils/handlers/ordering/handleDrop";
import { handleDelete } from "./utils/handlers/ordering/handleDelete";
import { handleDeleteTypes } from "./types/handleDeleteTypes";

import { orderItemDelete } from "../../global/styles/buttons";

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
    setStaticKeys,
    setTargetClient,
    staticKeys,
    targetClient,
    targetImageset,
  } = props;

  const [dropPending, setDropPending] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [imgLoaded, setImgLoaded] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setImgLoaded(false);

    if (!(file instanceof Blob)) {
      setImgSrc("");
      return;
    }

    const url = URL.createObjectURL(file);
    setImgSrc(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  // framer-motion reserves onDragStart for its own pointer-based drag gestures,
  // so the native HTML5 drag handler is attached directly instead of via JSX
  useEffect(() => {
    const node = itemRef.current;
    if (!node) return;

    const onNativeDragStart = (e: DragEvent) => {
      if (file instanceof Blob) {
        handleDragStart(e as unknown as React.DragEvent<HTMLDivElement>, "order", index);
      }
    };

    node.addEventListener("dragstart", onNativeDragStart);
    return () => node.removeEventListener("dragstart", onNativeDragStart);
  }, [file, index]);

  return (
    <motion.div
      ref={itemRef}
      layout
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${
        file instanceof Blob === false
          ? "h-[300px] w-[200px] min-h-[300px]"
          : imgLoaded
            ? "min-h-[300px] max-h-[350px]"
            : "w-0 min-h-[300px] max-h-[350px]"
      } shrink-0 border border-solid overflow-hidden`}
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

        const result = await handleDrop(args);
        const updatedOrder = [...order];

        if (result?.type === "swap") {
          updatedOrder[index] = order[draggedIndex];
          updatedOrder[draggedIndex] = order[index];
          setOrder(updatedOrder);

          const updatedKeys = [...staticKeys];
          updatedKeys[index] = staticKeys[draggedIndex];
          updatedKeys[draggedIndex] = staticKeys[index];
          setStaticKeys(updatedKeys);
        } else if (result?.type === "upload") {
          const wasEmpty = !(file instanceof Blob);
          updatedOrder[index] = result.blob;
          setOrder(updatedOrder);
          if (wasEmpty) setRenderCount(renderCount + 1);

          const updatedKeys = [...staticKeys];
          updatedKeys[index] = uuidv4();
          setStaticKeys(updatedKeys);
        }

        setDropPending(false);
      }}
      onDragOver={(e) => e.preventDefault()}
    >
      {file instanceof Blob ? (
        <button
          type="button"
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
            const result = await handleDelete(args);

            if (result?.success) {
              const updatedOrder = [...order];
              updatedOrder[index] = {};
              setRenderCount(renderCount - 1);
              setOrder(updatedOrder);
            }
          }}
          className={orderItemDelete}
        >
          <Close className="w-4 h-4" />
        </button>
      ) : null}

      {dropPending ? (
        <div className="flex h-full items-center justify-center">
          <Loading />
        </div>
      ) : null}

      <AnimatePresence mode="wait">
        {file instanceof Blob && (
          <motion.img
            key={imgSrc}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: imgLoaded ? 1 : 0, scale: imgLoaded ? 1 : 0.95 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            loading="lazy"
            draggable={true}
            className="block object-cover min-h-[300px] max-h-[350px]"
            src={imgSrc}
            onLoad={() => setImgLoaded(true)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
