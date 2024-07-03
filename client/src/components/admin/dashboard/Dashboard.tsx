import { useEffect, useState } from "react";
import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";
import DeleteModal from "./DeleteModal";
import Actions from "./Actions";
import ImageOrder from "./ImageOrder";

export default function AdminDashboard() {
  const [activePane, setActivePane] = useState({ pane: "ALL", edit: null });
  const [clients, setClients] = useState([]);
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

    if (activePane.pane === "ALL") getAllClients();
  }, [activePane.pane]);

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      <Header />

      <section className="flex justify-center items-center text-white">
        <>
          <ImageOrder activePane={activePane} setActivePane={setActivePane} />
          {/* {activePane.pane === "ALL" ? (
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
                setDeleteModalToggle={setDeleteModalToggle}
              />
            </div>
          ) : activePane.pane === "ADD" ? (
            <AddClient
              clients={clients}
              setClients={setClients}
              setActivePane={setActivePane}
            />
          ) : activePane.pane === "UPLOAD" ? (
            <></>
          ) : null} */}
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
