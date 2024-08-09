import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";
import DeleteModal from "./DeleteModal";
import Actions from "./Actions";
import EditClient from "./EditClient";

import Close from "../../../assets/media/icons/Close";

export default function AdminDashboard() {
  const [activePane, setActivePane] = useState("ALL");
  const [clients, setClients] = useState([]);
  const [targetClient, setTargetClient] = useState({});
  const [clientFilterResult, setClientFilterResult] = useState([]);
  const [rejectedFiles, setRejectedFiles] = useState([]);
  const [deleteModalToggle, setDeleteModalToggle] = useState({
    active: false,
    target: "",
    name: "",
  });

  // TODO how can we organise the pane data here? conditional rendering? we could organise all pane values into an array, then render the pane which matches state -> best option, since this will declutter the return statement

  useEffect(() => {
    const getAllClients = async () => {
      try {
        //
        const response = await fetch("http://localhost:3000/admin/users", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.status === 200 && data) {
          //
          setClients(data);
          return;
        }
      } catch (err) {
        // TODO inform user that something went wrong and for security reasons, they are being logged out
      }
    };

    if (activePane === "ALL") getAllClients(); // TODO perhaps extend this to check if clients hasn't changed in length?
  }, [activePane]);

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      {rejectedFiles.length > 0 ? (
        <dialog className="block bg-black absolute z-50 bottom-[calc(1.5rem-2px)] p-4 border border-solid border-white text-white max-w-[300px] xl:max-w-[400px] max-h-[150px] overflow-scroll">
          <div className="flex items-start gap-1">
            <p className="font-inter">
              The client has been successfully added, but some files could not
              be uploaded. For your reference, here are the names of the files
              not uploaded:
            </p>

            <button
              type="button"
              onClick={() => setRejectedFiles([])}
              className="border border-solid border-mag p-2"
            >
              <Close className="w-[18px] h-[18px]" customColor="#FFF" />
            </button>
          </div>

          <ul className="pt-3 grid grid-cols-2 gap-2 justify-start">
            {rejectedFiles.map((filename: string) => {
              return <li key={uuidv4()}>{filename}</li>;
            })}
          </ul>
        </dialog>
      ) : null}

      <Header />

      <section className="flex justify-center items-center text-white">
        <>
          {activePane === "ALL" ? (
            <div className="text-white border border-solid border-white p-3 w-[40dvw]">
              <Actions
                setClientFilterResult={setClientFilterResult}
                setActivePane={setActivePane}
              />

              <AllClients
                clients={
                  clientFilterResult.length > 0 ? clientFilterResult : clients
                }
                setActivePane={setActivePane}
                setTargetClient={setTargetClient}
                setDeleteModalToggle={setDeleteModalToggle}
              />
            </div>
          ) : activePane === "ADD" ? (
            <AddClient
              clients={clients}
              setClients={setClients}
              setActivePane={setActivePane}
              setRejectedFiles={setRejectedFiles}
            />
          ) : activePane === "EDIT" ? (
            <EditClient
              targetClient={targetClient}
              setTargetClient={setTargetClient}
              setActivePane={setActivePane}
            />
          ) : null}
        </>
      </section>

      {deleteModalToggle.active === true ? (
        <DeleteModal
          clients={clients}
          setClients={setClients}
          deleteModalToggle={deleteModalToggle}
          setDeleteModalToggle={setDeleteModalToggle}
        />
      ) : null}
    </main>
  );
}
