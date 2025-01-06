import { useState } from "react";
import { handleLinksSubmit } from "./utils/handlers/dashboard/handleLinksSubmit";
import { form_inputs } from "./styles/styles";

import PaneHeader from "./PaneHeader";
import Loading from "../../global/Loading";

export default function AddLinks({ ...props }) {
  const { setActivePane, setClients, clients, targetClient } = props;
  const [spinner, setSpinner] = useState(false);
  const [error, setError] = useState({
    state: false,
    status: 200,
    message: "",
  });
  const [inputVals, setInputVals] = useState({
    previews: "https://drive.google.com/uc?export=download&id=",
    full: "https://drive.google.com/uc?export=download&id=",
    socials: "https://drive.google.com/uc?export=download&id=",
    snips: "https://drive.google.com/uc?export=download&id=",
  });

  return (
    <div className="text-white border border-solid border-white p-3 w-[40dvw]">
      <PaneHeader
        setActivePane={setActivePane}
        paneTitle={"SET DOWNLOAD LINKS"}
      />
      <form
        onSubmit={(e) => {
          // TODO add types to these args
          const args = {
            clients,
            e,
            error,
            inputVals,
            setClients,
            setActivePane,
            setError,
            setInputVals,
            setSpinner,
            targetClient,
          };

          handleLinksSubmit(args);
        }}
        method="post"
        className="flex flex-col gap-5"
        encType="multipart/form-data"
      >
        <label className="text-rd">
          SNAPSHOTS
          <input
            type="text"
            value={inputVals.previews}
            onChange={(e) =>
              setInputVals({ ...inputVals, previews: e.target.value })
            }
            name="snapshots"
            className={form_inputs}
          />
        </label>

        <label className="text-rd">
          KEEPSAKE PREVIEW
          <input
            value={inputVals.full}
            type="text"
            onChange={(e) =>
              setInputVals({ ...inputVals, full: e.target.value })
            }
            name="keepsake"
            className={form_inputs}
          />
        </label>

        <label className="text-rd">
          CORE COLLECTION
          <input
            value={inputVals.socials}
            type="text"
            onChange={(e) =>
              setInputVals({ ...inputVals, socials: e.target.value })
            }
            name="core"
            className={form_inputs}
          />
        </label>

        <label className="text-rd">
          SNIPS
          <input
            value={inputVals.snips}
            type="text"
            onChange={(e) =>
              setInputVals({ ...inputVals, snips: e.target.value })
            }
            name="snips"
            className={form_inputs}
          />
        </label>

        <div className="text-center">
          <button
            type="submit"
            className="border border-solid xl:hover:text-rd drop-shadow-glo xl:hover:drop-shadow-red xl:focus:text-rd xl:focus:drop-shadow-red py-3 px-5 transition-colors group"
          >
            <span className="font-tnrBI tracking-widest opacity-80">
              {spinner ? <Loading /> : "ADD"}
            </span>
          </button>
        </div>

        {error.state === true ? <p>{error.message}</p> : null}
      </form>
    </div>
  );
}
