import { useEffect, useState } from "react";
import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";
import DeleteModal from "./DeleteModal";
import Actions from "./Actions";
import EditClient from "./EditClient";

export default function AdminDashboard() {
  const [activePane, setActivePane] = useState("ALL");
  const [clients, setClients] = useState([]);
  const [targetClient, setTargetClient] = useState({});
  const [clientFilterResult, setClientFilterResult] = useState([]);
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
