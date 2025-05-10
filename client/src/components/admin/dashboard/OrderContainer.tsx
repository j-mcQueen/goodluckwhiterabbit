import { useEffect, useState } from "react";
import FileInfo from "./FileInfo";
import ImageOrder from "./ImageOrder";

const OrderContainer = ({ ...props }) => {
  const {
    clients,
    dragTarget,
    orderedImagesets,
    setClients,
    setNotice,
    setSpinner,
    setTargetClient,
    spinner,
    targetClient,
    targetImageset,
  } = props;

  const [renderCount, setRenderCount] = useState(0);

  useEffect(() => {
    setRenderCount(
      orderedImagesets[targetImageset].filter(
        (item: object | Blob) => item instanceof Blob
      ).length
    );
  }, [orderedImagesets, targetImageset]);

  return (
    <div className="flex flex-col">
      <FileInfo
        renderCount={renderCount}
        spinner={spinner}
        targetClient={targetClient}
        targetImageset={targetImageset}
      />

      <ImageOrder
        clients={clients}
        dragTarget={dragTarget}
        setClients={setClients}
        renderCount={renderCount}
        setRenderCount={setRenderCount}
        setNotice={setNotice}
        targetClient={targetClient}
        setTargetClient={setTargetClient}
        targetImageset={targetImageset}
        orderedImageset={orderedImagesets[targetImageset]}
        setSpinner={setSpinner}
      />
    </div>
  );
};
export default OrderContainer;
