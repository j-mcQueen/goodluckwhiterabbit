import { useEffect, useState } from "react";
import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";

export default function AdminDashboard() {
  const [activePane, setActivePane] = useState("ALL");
  const [clients, setClients] = useState([]);

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

    getAllClients();
  }, []);

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      <Header />

      <section className="flex justify-center items-center text-white">
        <div className="border border-solid border-white p-3 w-[40dvw]">
          {activePane === "ALL" ? (
            <AllClients clients={clients} setActivePane={setActivePane} />
          ) : activePane === "ADD" ? (
            <AddClient
              clients={clients}
              setClients={setClients}
              setActivePane={setActivePane}
            />
          ) : activePane === "EDIT" ? (
            <></>
          ) : activePane === "EDIT-IMAGE" ? (
            <></>
          ) : activePane === "UPLOAD" ? (
            <></>
          ) : null}
        </div>
      </section>
    </main>
  );
}
