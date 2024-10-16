import { useState } from "react";
import FileInfo from "./FileInfo";
import ImageOrder from "./ImageOrder";

const OrderContainer = ({ ...props }) => {
  const {
    clients,
    host,
    orderedImageset,
    setClients,
    setNotice,
    setSpinner,
    setTargetClient,
    spinner,
    targetClient,
    targetImageset,
  } = props;

  const [renderCount, setRenderCount] = useState(
    orderedImageset.filter((item: object | File) => item instanceof File).length
  );

  return (
    <div className="flex flex-col">
      <FileInfo
        renderCount={renderCount}
        spinner={spinner}
        targetClient={targetClient}
        targetImageset={targetImageset}
      />

      <ImageOrder
        host={host}
        clients={clients}
        setClients={setClients}
        renderCount={renderCount}
        setRenderCount={setRenderCount}
        setNotice={setNotice}
        targetClient={targetClient}
        setTargetClient={setTargetClient}
        targetImageset={targetImageset}
        orderedImageset={orderedImageset}
        // spinner={spinner}
        // queuedImages={queuedImages}
        setSpinner={setSpinner}
      />
    </div>
  );
};
export default OrderContainer;
