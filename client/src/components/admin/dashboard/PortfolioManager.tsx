import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { determineHost as host } from "../../global/utils/determineHost";
import { imageset_select_btns } from "./styles/styles";
import { portfolio_subcategory } from "./types/portfolioTypes";
import { handlePortfolioFirstLoad } from "./utils/handlers/portfolioOrdering/handlePortfolioFirstLoad";
import { handlePortfolioFirstLoadTypes } from "./types/handlePortfolioFirstLoadTypes";
import { portfolioBulkUpload } from "./utils/handlers/portfolioOrdering/portfolioBulkUpload";

import SubcategoryManager from "./portfolio/SubcategoryManager";
import GroupManager from "./portfolio/GroupManager";
import PortfolioOrderContainer from "./portfolio/PortfolioOrderContainer";
import PortfolioDeleteModal from "./portfolio/PortfolioDeleteModal";
import ImageQueue from "./ImageQueue";
import SubmitDialog from "./modals/SubmitDialog";

const CATEGORIES = ["PHOTO", "ART", "DESIGN"];
const EMPTY_DELETE_TOGGLE = {
  active: false,
  type: "",
  subId: "",
  groupId: "",
  name: "",
  estimate: "",
};

export default function PortfolioManager({ ...props }) {
  const { setNotice } = props;

  const [taxonomy, setTaxonomy] = useState<portfolio_subcategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [targetSubcategory, setTargetSubcategory] =
    useState<portfolio_subcategory | null>(null);
  const [targetGroupId, setTargetGroupId] = useState("");
  const [started, setStarted] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const [dragTarget, setDragTarget] = useState({});
  const [order, setOrder] = useState<(Blob | object)[]>(Array(10).fill({}));
  const [queue, setQueue] = useState<File[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [bulkFails, setBulkFails] = useState<string[]>([]);
  const [deleteModalToggle, setDeleteModalToggle] = useState(
    EMPTY_DELETE_TOGGLE,
  );

  useEffect(() => {
    const getTaxonomy = async () => {
      try {
        const response = await fetch(`${host}/admin/portfolio/taxonomy`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (response.status === 200) {
          setTaxonomy(data);
        } else if (response.status === 401) {
          setNotice({
            status: true,
            message:
              "Your session has expired, so we're logging you out to keep things secure. Please login again to continue.",
            logout: { status: true, path: "/admin" },
          });
        }
      } catch (error) {
        setNotice({
          status: true,
          message:
            "There was an unexpected error loading the portfolio taxonomy. Please refresh and try again.",
          logout: { status: false, path: null },
        });
      }
    };

    getTaxonomy();
  }, [setNotice]);

  const activeGroup = targetSubcategory?.groups.find(
    (group) => group.groupId === targetGroupId,
  );

  const resetToCategories = () => {
    setActiveCategory(null);
    setTargetSubcategory(null);
    setTargetGroupId("");
    setStarted(false);
    setOrder(Array(10).fill({}));
  };

  const resetToSubcategories = () => {
    setTargetSubcategory(null);
    setTargetGroupId("");
    setStarted(false);
    setOrder(Array(10).fill({}));
  };

  const resetToGroups = () => {
    setTargetGroupId("");
    setStarted(false);
    setOrder(Array(10).fill({}));
  };

  return (
    <div className="text-white border border-solid border-white w-[85dvw] xl:w-[75dvw]">
      {activeCategory ? (
        <nav className="flex gap-3 flex-wrap p-3 border-b border-solid border-white text-sm tracking-widest opacity-80">
          <button
            type="button"
            onClick={resetToCategories}
            className="xl:hover:text-rd focus:text-rd focus:outline-none transition-colors"
          >
            ◄ CATEGORIES
          </button>

          {targetSubcategory ? (
            <button
              type="button"
              onClick={resetToSubcategories}
              className="xl:hover:text-rd focus:text-rd focus:outline-none transition-colors"
            >
              ◄ {activeCategory} SUBCATEGORIES
            </button>
          ) : null}

          {started ? (
            <button
              type="button"
              onClick={resetToGroups}
              className="xl:hover:text-rd focus:text-rd focus:outline-none transition-colors"
            >
              ◄ {targetSubcategory?.name} GROUPS
            </button>
          ) : null}
        </nav>
      ) : null}

      {deleteModalToggle.active ? (
        <PortfolioDeleteModal
          deleteModalToggle={deleteModalToggle}
          setDeleteModalToggle={setDeleteModalToggle}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          targetSubcategory={targetSubcategory}
          setTargetSubcategory={setTargetSubcategory}
          setNotice={setNotice}
        />
      ) : null}

      {!activeCategory ? (
        <div className="flex flex-col items-center gap-5 p-5">
          <h2 className="pb-2 tracking-widest">CHOOSE A CATEGORY:</h2>

          <div className="flex justify-center gap-5">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                className={imageset_select_btns}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : !targetSubcategory ? (
        <SubcategoryManager
          category={activeCategory}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          setDeleteModalToggle={setDeleteModalToggle}
          onSelectSubcategory={(sub: portfolio_subcategory) =>
            setTargetSubcategory(sub)
          }
        />
      ) : !started ? (
        <GroupManager
          targetSubcategory={targetSubcategory}
          setTargetSubcategory={setTargetSubcategory}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          setDeleteModalToggle={setDeleteModalToggle}
          onSelectGroup={async (groupId: string) => {
            const args: handlePortfolioFirstLoadTypes = {
              category: activeCategory,
              newTargetGroupId: groupId,
              order,
              setNotice,
              setOrder,
              setSpinner,
              setStarted,
              setTargetGroupId,
              setTargetSubcategory,
              targetSubcategory,
            };

            await handlePortfolioFirstLoad({ ...args, taxonomy, setTaxonomy });
          }}
        />
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSubmitStatus(0);

            try {
              const data = await portfolioBulkUpload(
                queue,
                activeCategory,
                targetSubcategory.name,
                targetGroupId,
                activeGroup?.count ?? 0,
                (percent: number) => setUploadProgress(percent),
              );

              setSubmitStatus(1);
              setUploadProgress(null);
              setBulkFails(data.failed);

              // paint the newly-uploaded files into their slots immediately
              // using the local File objects, rather than waiting on a
              // refetch - mirrors EditClient.tsx's bulk-upload handling
              const existingCount = activeGroup?.count ?? 0;
              const updatedOrder = [...order];
              const succeededSet = new Set(data.succeeded);
              let nextPosition = existingCount;
              queue.forEach((file) => {
                if (succeededSet.has(file.name)) {
                  updatedOrder[nextPosition] = file;
                  nextPosition += 1;
                }
              });
              setOrder(updatedOrder);

              const updatedGroups = targetSubcategory.groups.map((group) =>
                group.groupId === targetGroupId
                  ? { ...group, count: data.newCount }
                  : group,
              );
              const updatedSubcategory = {
                ...targetSubcategory,
                groups: updatedGroups,
              };
              setTargetSubcategory(updatedSubcategory);
              setTaxonomy(
                taxonomy.map((sub) =>
                  sub._id === updatedSubcategory._id ? updatedSubcategory : sub,
                ),
              );

              if (data.failed.length > 0) {
                const failedNames = new Set(data.failed);
                setQueue((prev) => prev.filter((file) => failedNames.has(file.name)));
              } else {
                (e.target as HTMLFormElement).reset();
                setQueue([]);
              }
            } catch (error) {
              setSubmitStatus(null);
              setUploadProgress(null);
              setNotice({
                status: true,
                message: `There was a problem with your upload. More details: ${error}`,
                logout: { status: false, path: null },
              });
              return;
            }
          }}
          className="pb-10 border-spacing-0"
        >
          <SubmitDialog
            submitOpen={submitOpen}
            submitStatus={submitStatus}
            setSubmitOpen={setSubmitOpen}
            setSubmitStatus={setSubmitStatus}
            uploadProgress={uploadProgress}
            bulkFails={bulkFails}
          />

          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, translateY: -25 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 0.25 }}
              className="border border-solid border-white flex"
            >
              <PortfolioOrderContainer
                category={activeCategory}
                dragTarget={dragTarget}
                setNotice={setNotice}
                setSpinner={setSpinner}
                targetSubcategory={targetSubcategory}
                setTargetSubcategory={setTargetSubcategory}
                targetGroupId={targetGroupId}
                orderedGroup={order}
                spinner={spinner}
                taxonomy={taxonomy}
                setTaxonomy={setTaxonomy}
              />

              <ImageQueue
                queue={queue}
                setDragTarget={setDragTarget}
                setQueue={setQueue}
                setSubmitOpen={setSubmitOpen}
              />
            </motion.div>
          </AnimatePresence>
        </form>
      )}
    </div>
  );
}
