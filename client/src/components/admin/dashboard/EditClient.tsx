import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";
import ImageOrder from "./ImageOrder";

export default function EditClient({ ...props }) {
  const {
    clients,
    setClients,
    setNotice,
    host,
    targetClient,
    setTargetClient,
    setActivePane,
  } = props;

  const [targetImageset, setTargetImageset] = useState("");
  const [started, setStarted] = useState(false);
  const [spinner, setSpinner] = useState(false);

  const [orderedImagesets, setOrderedImagesets] = useState({
    previews: Array(10).fill({}),
    full: Array(10).fill({}),
    socials: Array(10).fill({}),
  });
  // orderedImageset is contained within the dummy array inside clients

  // TODO implement search function that will notify Kailey about duplicate files
  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees

  const handleClick = async (newTargetImageset: string) => {
    setTargetImageset(newTargetImageset);
    setStarted(true);
    setSpinner(true);

    const data = await executeGenerationChain(
      orderedImagesets[newTargetImageset as keyof typeof orderedImagesets],
      newTargetImageset,
      setNotice,
      0,
      targetClient._id
    );

    try {
      const response = await fetch(
        `${host}/admin/users/${targetClient._id}/updateFileCount/${newTargetImageset}/${data.count}`,
        {
          method: "POST",
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
        nextTargetClient.fileCounts = newCounts;
        setTargetClient(nextTargetClient);
      }
    } catch (error) {
      setNotice({
        status: true,
        message: "",
        logout: { status: false, path: null },
      });
    }

    setOrderedImagesets({
      ...orderedImagesets,
      [newTargetImageset]: data.files,
    });
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
        <h1 className="font-liquid xl:text-4xl pb-3 tracking-widest opacity-80 drop-shadow-glo">
          {targetClient.name.toLowerCase()}
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
                CHOOSEN AN IMAGE SET TO WORK WITH:
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
              className={`${targetImageset === "previews" ? "bg-rd" : ""} border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => handleClick("previews")}
              disabled={targetImageset === "previews" ? true : false}
            >
              PREVIEWS
              <label className="opacity-0 w-0">
                <input type="file" name="previews" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "full" ? "bg-rd" : ""} border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => handleClick("full")}
              disabled={targetImageset === "full" ? true : false}
            >
              GALLERY
              <label className="opacity-0 w-0">
                <input type="file" name="full" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "socials" ? "bg-rd" : ""} border border-solid border-white py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => handleClick("socials")}
              disabled={targetImageset === "socials" ? true : false}
            >
              SOCIALS
              <label className="opacity-0 w-0">
                <input type="file" name="socials" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              onClick={() => {
                const nextClients = clients.map((client: { _id: string }) => {
                  if (client._id === targetClient._id) {
                    return { ...client, files: orderedImagesets };
                  } else return client;
                });

                setClients(nextClients);
                setTargetClient([]);
                setActivePane("ALL");
              }}
              className="border border-solid border-rd xl:hover:bg-rd xl:hover:border-white focus:bg-rd focus:outline-none flex items-center justify-center transition-all px-3"
            >
              RETURN
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {started && (
            <motion.div
              initial={{ opacity: 0, translateY: -25 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.25 }}
              className="border border-solid border-white"
            >
              <ImageOrder
                host={host}
                setNotice={setNotice}
                targetClient={targetClient}
                setTargetClient={setTargetClient}
                targetImageset={targetImageset}
                orderedImagesets={orderedImagesets}
                setOrderedImagesets={setOrderedImagesets}
                spinner={spinner}
                setSpinner={setSpinner}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
