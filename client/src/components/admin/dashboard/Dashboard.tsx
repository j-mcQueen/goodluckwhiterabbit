import { SetStateAction, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { determineHost as host } from "../../global/utils/determineHost";
import { mobile } from "../../global/utils/determineViewport";

import AllClients from "./AllClients";
import Header from "./Header";
import AddClient from "./AddClient";
import DeleteModal from "./DeleteModal";
import Actions from "./Actions";
import EditClient from "./EditClient";
import PortfolioManager from "./PortfolioManager";
import RejectedFiles from "./modals/RejectedFiles";
import Notice from "./modals/Notice";

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = "ADMIN DASHBOARD — GOOD LUCK WHITE RABBIT";
  }, []);

  const [clients, setClients] = useState([]);
  const [targetClient, setTargetClient] = useState({});

  // the active pane lives in the URL (?pane=) so a refresh keeps the admin
  // where they were - EDIT depends on an in-memory targetClient, so it falls
  // back to ALL when there isn't one (i.e. after a refresh)
  const paneParam = (searchParams.get("pane") ?? "ALL").toUpperCase();
  const activePane =
    (paneParam === "EDIT" && Object.keys(targetClient).length === 0) ||
    !["ALL", "ADD", "EDIT", "PORTFOLIO"].includes(paneParam)
      ? "ALL"
      : paneParam;

  const setActivePane = (value: SetStateAction<string>) => {
    const pane = typeof value === "function" ? value(activePane) : value;
    // changing pane drops the previous pane's params, e.g. PortfolioManager's
    setSearchParams(pane === "ALL" ? {} : { pane: pane.toLowerCase() });
  };

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

  useEffect(() => {
    const getAllClients = async () => {
      try {
        const response = await fetch(`${host}/admin/users`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          switch (response.status) {
            case 200:
            case 304:
              return setClients(
                data.sort(
                  (a: { added: string }, b: { added: string }) =>
                    new Date(b.added).getTime() - new Date(a.added).getTime(),
                ),
              );

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

    // runs once on mount rather than keying off location.state.login - the
    // pane/breadcrumb URL params change location (and drop its state) on
    // every navigation within the dashboard
    getAllClients();
  }, []);

  return (
    <main className="w-[calc(100dvw-var(--frame)-2px)] h-[calc(100dvh-var(--frame)-2px)] overflow-scroll overflow-x-hidden relative flex flex-col">
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

      <Header
        edit={activePane === "EDIT" || activePane === "PORTFOLIO"}
        setTargetClient={
          activePane === "EDIT" || activePane === "PORTFOLIO"
            ? setTargetClient
            : false
        }
        setActivePane={
          activePane === "EDIT" || activePane === "PORTFOLIO"
            ? setActivePane
            : false
        }
      />

      <section className="flex flex-col flex-1 min-h-0 justify-[safe_center] items-center text-white xl:mx-3">
        <>
          {activePane === "ALL" ? (
            <div className="text-white border border-solid border-white w-[85dvw] xl:w-[60dvw]">
              <Actions
                clients={clients}
                mobile={mobile}
                setClients={setClients}
                setClientFilterResult={setClientFilterResult}
                setActivePane={setActivePane}
              />

              <AllClients
                clients={
                  clientFilterResult.length > 0 ? clientFilterResult : clients
                }
                mobile={mobile}
                notice={notice}
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
            />
          ) : activePane === "EDIT" ? (
            <EditClient
              clients={clients}
              setClients={setClients}
              setNotice={setNotice}
              targetClient={targetClient}
              setTargetClient={setTargetClient}
              setActivePane={setActivePane}
            />
          ) : activePane === "PORTFOLIO" ? (
            <PortfolioManager setNotice={setNotice} />
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
