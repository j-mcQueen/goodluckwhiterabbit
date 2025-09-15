import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { imageset_select_btns } from "./styles/styles";
import { handleFirstLoadTypes } from "./types/handleFirstLoadTypes";
import { handleFirstLoad } from "./utils/handlers/ordering/handleFirstLoad";

import ImageQueue from "./ImageQueue";
import OrderContainer from "./OrderContainer";

export default function EditClient({ ...props }) {
  const { clients, setClients, setNotice, targetClient, setTargetClient } =
    props;

  const nameMap = {
    snapshots: "SNAPSHOTS",
    keepsake: "KEEPSAKE PREVIEW",
    core: "CORE COLLECTION",
    socials: "SOCIALS",
  };

  const [targetImageset, setTargetImageset] = useState("");
  const [started, setStarted] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [dragTarget, setDragTarget] = useState({});

  const [orderedImagesets, setOrderedImagesets] = useState({
    snapshots: Array(10).fill({}),
    keepsake: Array(10).fill({}),
    core: Array(10).fill({}),
    socials: Array(10).fill({}),
  });

  const [queuedImages, setQueuedImages] = useState(() => {
    if (targetClient.queue !== undefined) {
      return [...targetClient.queue[targetImageset]];
    } else return [];
  });

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
            className="flex justify-center gap-5 text-center"
          >
            {Object.keys(targetClient.fileCounts).map((name) => {
              return (
                <button
                  key={name}
                  type="button"
                  className={`${targetImageset === `${name}` ? "text-rd drop-shadow-red" : ""} ${imageset_select_btns}`}
                  onClick={async () => {
                    const args: handleFirstLoadTypes = {
                      clients,
                      newTargetImageset: name,
                      orderedImagesets,
                      setClients,
                      setNotice,
                      setOrderedImagesets,
                      setSpinner,
                      setStarted,
                      setTargetClient,
                      setTargetImageset,
                      targetClient,
                    };

                    await handleFirstLoad(args);
                  }}
                  disabled={targetImageset === name ? true : false}
                >
                  {nameMap[name as keyof typeof nameMap]}

                  <label className="opacity-0 w-0">
                    <input type="file" name={name} className="w-0 opacity-0" />
                  </label>
                </button>
              );
            })}
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
