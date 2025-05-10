import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";
import { imageset_select_btns } from "./styles/styles";
import { determineHost } from "../../global/utils/determineHost";
// import { handleFirstLoadTypes } from "./types/handleFirstLoadTypes";
// import { handleFirstLoad } from "./utils/handlers/ordering/handleFirstLoad";

import ImageQueue from "./ImageQueue";
import OrderContainer from "./OrderContainer";

export default function EditClient({ ...props }) {
  const { clients, setClients, setNotice, targetClient, setTargetClient } =
    props;

  const [targetImageset, setTargetImageset] = useState("");
  const [started, setStarted] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [dragTarget, setDragTarget] = useState({});

  const [orderedImagesets, setOrderedImagesets] = useState({
    previews: Array(10).fill({}),
    full: Array(10).fill({}),
    socials: Array(10).fill({}),
    snips: Array(10).fill({}),
  });

  const [queuedImages, setQueuedImages] = useState(() => {
    if (targetClient.queue !== undefined) {
      return [...targetClient.queue[targetImageset]];
    } else return [];
  });

  const handleClick = async (newTargetImageset: string) => {
    // TODO extract into handler fn
    setTargetImageset(newTargetImageset);
    setStarted(true);
    setSpinner(true);

    const host = determineHost;

    const data = await executeGenerationChain(
      orderedImagesets[newTargetImageset as keyof typeof orderedImagesets],
      newTargetImageset,
      setNotice,
      0,
      10,
      targetClient._id
    );

    try {
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/${newTargetImageset}/getCount`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      const newCounts = await response.json();

      if (newCounts && (response.status === 200 || response.status === 304)) {
        const nextTargetClient = { ...targetClient };
        nextTargetClient.fileCounts[newTargetImageset] = newCounts;
        setTargetClient(nextTargetClient);

        const nextClients = clients.map((client: { _id: string }) => {
          return client._id === targetClient._id ? nextTargetClient : client;
        });
        setClients(nextClients);
      }
    } catch (error) {
      setNotice({
        status: true,
        message:
          "There was an issue updating the number of files your client has in storage. Upon your next addition, the system will correct itself.",
        logout: { status: false, path: null },
      });
    }

    const nextOrderedImagesets = {
      ...orderedImagesets,
      [newTargetImageset]: data.files,
    };
    setOrderedImagesets(nextOrderedImagesets);
    setSpinner(false);
    return;
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
      }}
      className="pb-10 border-spacing-0"
    >
      <hgroup className="flex flex-col items-center pb-10">
        <h1 className="font-tnrBI xl:text-4xl pb-3 tracking-widest opacity-80 drop-shadow-glo">
          {targetClient.name.toUpperCase()}
        </h1>

        <p className="font-vt">DATE ADDED: {targetClient.added}</p>
      </hgroup>

      <div className="flex flex-col items-center">
        <div className="text-center pb-10">
          <AnimatePresence>
            {!started && (
              <motion.h2
                initial={{ opacity: 0, translateY: 25 }}
                animate={{ opacity: 1, translateY: 0 }}
                exit={{ opacity: 0, translateY: -25 }}
                transition={{ duration: 0.25 }}
                className="pb-5"
              >
                CHOOSE AN IMAGE SET TO WORK WITH:
              </motion.h2>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, translateY: 25 }}
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0, translateY: -25 }}
            transition={{ duration: 0.25 }}
            className="flex gap-5 text-center"
          >
            <button
              type="button"
              className={`${targetImageset === "previews" ? "text-rd drop-shadow-red" : ""} ${imageset_select_btns} `}
              // onClick={async () => {
              //   const args: handleFirstLoadTypes = {
              //     clients,
              //     host,
              //     newTargetImageset: "previews",
              //     orderedImagesets,
              //     setClients,
              //     setNotice,
              //     setOrderedImagesets,
              //     setSpinner,
              //     setStarted,
              //     setTargetClient,
              //     setTargetImageset,
              //     targetClient,
              //   };

              //   await handleFirstLoad(args);

              //   // handleClick("previews");
              // }}
              onClick={() => handleClick("previews")}
              disabled={targetImageset === "previews" ? true : false}
            >
              SNAPSHOTS
              <label className="opacity-0 w-0">
                <input type="file" name="previews" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "full" ? "text-rd drop-shadow-red" : ""} ${imageset_select_btns}`}
              onClick={() => handleClick("full")}
              disabled={targetImageset === "full" ? true : false}
            >
              KEEPSAKE PREVIEW
              <label className="opacity-0 w-0">
                <input type="file" name="full" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "socials" ? "text-rd drop-shadow-red" : ""} ${imageset_select_btns}`}
              onClick={() => handleClick("socials")}
              disabled={targetImageset === "socials" ? true : false}
            >
              CORE COLLECTION
              <label className="opacity-0 w-0">
                <input type="file" name="socials" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "snips" ? "text-rd drop-shadow-red" : ""} ${imageset_select_btns}`}
              onClick={() => handleClick("snips")}
              disabled={targetImageset === "snips" ? true : false}
            >
              SNIPS
              <label className="opacity-0 w-0">
                <input type="file" name="snips" className="w-0 opacity-0" />
              </label>
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {started && (
            <motion.div
              initial={{ opacity: 0, translateY: -25 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.25 }}
              className="border border-solid border-white flex"
            >
              <OrderContainer
                clients={clients}
                dragTarget={dragTarget}
                queuedImages={queuedImages}
                targetClient={targetClient}
                targetImageset={targetImageset}
                setClients={setClients}
                setDragTarget={setDragTarget}
                setNotice={setNotice}
                setTargetClient={setTargetClient}
                orderedImagesets={orderedImagesets}
                setQueuedImages={setQueuedImages}
                spinner={spinner}
                setSpinner={setSpinner}
              />

              <ImageQueue setDragTarget={setDragTarget} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
