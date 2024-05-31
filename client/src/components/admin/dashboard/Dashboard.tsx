import { useState } from "react";
import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";

export default function AdminDashboard() {
  // TODO create state which helps define where the admin is on the web app, e.g. "all-clients", "add-client", "edit-client", etc.
  // will help when transitioning between different "panes"
  const [activePane, setActivePane] = useState("ALL");

  // when activePane changes, we updated what is inside the div
  // how can we organise the data here? conditional rendering? we could organise all values into an array, then render the pane which matches state -> best option, since this will declutter the return statement

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      <Header />

      <section className="flex justify-center items-center text-white">
        <div className="border border-solid border-white p-3 w-[40dvw]">
          {activePane === "ALL" ? (
            <AllClients setActivePane={setActivePane} />
          ) : activePane === "ADD" ? (
            <AddClient setActivePane={setActivePane} />
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
