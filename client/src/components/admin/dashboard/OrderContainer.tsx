import { useEffect, useState } from "react";
import FileInfo from "./FileInfo";
import ImageOrder from "./ImageOrder";

const OrderContainer = ({ ...props }) => {
  const {
    clients,
    host,
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
        (item: object | File) => item instanceof File
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
        host={host}
        clients={clients}
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
