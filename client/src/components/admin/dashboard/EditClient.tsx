import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { imageset_select_btns } from "./styles/styles";
import { handleFirstLoadTypes } from "./types/handleFirstLoadTypes";
import { handleFirstLoad } from "./utils/handlers/ordering/handleFirstLoad";
import { bulkUpload } from "./utils/handlers/bulkUpload";

import ImageQueue from "./ImageQueue";
import OrderContainer from "./OrderContainer";
import SubmitDialog from "./modals/SubmitDialog";

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
  const [submitOpen, setSubmitOpen] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const [submitStatus, setSubmitStatus] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [bulkFails, setBulkFails] = useState<string[]>([]);

  const [orderedImagesets, setOrderedImagesets] = useState({
    snapshots: Array(10).fill({}),
    keepsake: Array(10).fill({}),
    core: Array(10).fill({}),
    socials: Array(10).fill({}),
  });

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        setSubmitStatus(0);

        try {
          const data = await bulkUpload(
            formData,
            targetClient,
            targetImageset,
            (percent: number) => setUploadProgress(percent),
          );

          setSubmitStatus(1);
          setUploadProgress(null);
          setBulkFails(data.failed);

          const matched = data.firstTen.map((filename) => {
            const queuedFile = queue.find((file) => file.name === filename);
            return queuedFile ?? {};
          });

          setOrderedImagesets((prev) => ({
            ...prev,
            [targetImageset]: matched,
          }));

          const nextTargetClient = {
            ...targetClient,
            fileCounts: {
              ...targetClient.fileCounts,
              [targetImageset]: data.newCount,
            },
          };
          setTargetClient(nextTargetClient);

          const nextClients = clients.map((client: { _id: string }) => {
            return client._id === nextTargetClient._id
              ? nextTargetClient
              : client;
          });
          setClients(nextClients);

          if (data.failed.length > 0) {
            // don't clear queue entirely - leave the failed ones so user can retry bulk upload with failed files
            const failedNames = new Set(data.failed);

            setQueue((prev) =>
              prev.filter((file) => failedNames.has(file.name)),
            );
          } else {
            (e.target as HTMLFormElement).reset();
            setQueue([]);
          }
        } catch (error) {
          setSubmitStatus(null);
          setUploadProgress(null);
          setNotice({
            status: true,
            message: `There was a problem with your upload. More details: ${error}`,
            logout: { status: false, path: null },
          });
          return;
        }
      }}
      className="pb-10 border-spacing-0"
    >
      <SubmitDialog
        submitOpen={submitOpen}
        submitStatus={submitStatus}
        setSubmitOpen={setSubmitOpen}
        setSubmitStatus={setSubmitStatus}
        uploadProgress={uploadProgress}
        bulkFails={bulkFails}
      />

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
                targetClient={targetClient}
                targetImageset={targetImageset}
                setClients={setClients}
                setDragTarget={setDragTarget}
                setNotice={setNotice}
                setTargetClient={setTargetClient}
                orderedImagesets={orderedImagesets}
                spinner={spinner}
                setSpinner={setSpinner}
              />

              <ImageQueue
                queue={queue}
                setDragTarget={setDragTarget}
                setQueue={setQueue}
                setSubmitOpen={setSubmitOpen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
