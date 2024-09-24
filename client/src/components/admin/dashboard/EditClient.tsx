import { useState } from "react";
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

  const [targetImageset, setTargetImageset] = useState("previews"); // this value is passed to ImageOrder component
  const [spinner, setSpinner] = useState(false);

  const [orderedImagesets, setOrderedImagesets] = useState({
    previews: {
      count: targetClient.files["previews"].count,
      files: Array(targetClient.files["previews"].count).fill({}),
    },
    full: {
      count: targetClient.files["full"].count,
      files: Array(targetClient.files["full"].count).fill({}),
    },
    socials: {
      count: targetClient.files["socials"].count,
      files: Array(targetClient.files["socials"].count).fill({}),
    },
  });
  // orderedImageset is contained within the dummy array inside clients

  // TODO implement search function that will notify Kailey about duplicate files
  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees

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

      <div>
        <div className="flex justify-between">
          <div className="font-liquid">
            <button
              type="button"
              className={`${targetImageset === "previews" ? "bg-rd" : ""} font-liquid border border-solid border-white border-b-0 text-center py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => setTargetImageset("previews")}
            >
              <span className="tracking-widest opacity-80 drop-shadow-glo">
                preview
              </span>

              <label className="opacity-0 w-0">
                <input type="file" name="previews" className="w-0 opacity-0" />
                {/* when we change the image order, we are updating the files object of these inputs */}
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "full" ? "bg-rd" : ""} border-t-[1px] border-solid border-white text-center py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => setTargetImageset("full")}
            >
              <span className="tracking-widest opacity-80 drop-shadow-glo">
                gallery
              </span>
              <label className="opacity-0 w-0">
                <input type="file" name="full" className="w-0 opacity-0" />
              </label>
            </button>

            <button
              type="button"
              className={`${targetImageset === "socials" ? "bg-rd" : ""} border border-solid border-white border-b-0 text-center py-2 px-3 xl:hover:bg-rd focus:bg-red focus:outline-none transition-all`}
              onClick={() => setTargetImageset("socials")}
            >
              <span className="tracking-widest opacity-80 drop-shadow-glo">
                social
              </span>

              <label className="opacity-0 w-0">
                <input type="file" name="socials" className="w-0 opacity-0" />
              </label>
            </button>
          </div>

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
            className="font-liquid border border-solid border-b-0 border-white xl:hover:bg-rd focus:bg-rd focus:outline-none flex items-center justify-center transition-all px-3"
          >
            <span className="tracking-widest opacity-80 drop-shadow-glo">
              return
            </span>
          </button>
        </div>

        <div className="border border-solid border-white">
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
        </div>
      </div>
    </form>
  );
}
