import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";
import DeleteModal from "./DeleteModal";
import Actions from "./Actions";
import EditClient from "./EditClient";
import RejectedFiles from "./modals/RejectedFiles";
import Notice from "./modals/Notice";
import { AnimatePresence, motion } from "framer-motion";

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  const [notice, setNotice] = useState<{
    status: boolean;
    message: string;
    logout: { status: boolean; path: string | null };
  }>({
    status: false,
    message: "",
    logout: { status: false, path: null },
  });

  // TODO how can we organise the pane data here? conditional rendering? we could organise all pane values into an array, then render the pane which matches state -> best option, since this will declutter the return statement

  useEffect(() => {
    const getAllClients = async () => {
      try {
        const response = await fetch("http://localhost:3000/admin/users", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          switch (response.status) {
            case 200:
            case 304:
              return setClients(data);

            case 401:
              setNotice({
                status: true,
                message:
                  "Your session has expired, so we're logging you out to keep things secure. Please login again to continue.",
                logout: { status: true, path: "/admin" },
              });
              break;

            default:
              throw new TypeError("Server rejected request.");
          }
        }
      } catch (err) {
        setNotice({
          status: true,
          message:
            "There was an unexpected error. We are logging you out to keep things secure. Please log back in and try again. If the problem persists, contact Jack.",
          logout: { status: true, path: "/admin" },
        });
      }
    };

    if (activePane === "ALL") getAllClients(); // TODO perhaps extend this to check if clients hasn't changed in length?
  }, [activePane, navigate]);

  return (
    <main className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)] overflow-scroll relative">
      {rejectedFiles.length > 0 ? (
        <RejectedFiles
          rejectedFiles={rejectedFiles}
          setRejectedFiles={setRejectedFiles}
        />
      ) : null}

      <AnimatePresence>
        {notice.status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Notice notice={notice} setNotice={setNotice} />
          </motion.div>
        )}
      </AnimatePresence>

      <Header />

      <section className="flex justify-center items-center text-white">
        <>
          {activePane === "ALL" ? (
            <div className="text-white border border-solid border-white w-[40dvw]">
              <Actions
                clients={clients}
                setClients={setClients}
                setClientFilterResult={setClientFilterResult}
                setActivePane={setActivePane}
              />

              <AllClients
                clients={
                  clientFilterResult.length > 0 ? clientFilterResult : clients
                }
                setNotice={setNotice}
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
