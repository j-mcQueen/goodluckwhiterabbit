import AllClients from "./AllClients";
import Header from "./Header";

export default function AdminDashboard() {
  // TODO create state which helps define where the admin is on the web app, e.g. "all-clients", "add-client", "edit-client", etc.
  // will help when transitioning between different "panes"
  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      <Header />

      <section className="flex justify-center items-center text-white">
        <div className="border border-solid border-white p-3">
          <AllClients />
        </div>
      </section>
    </main>
  );
}
