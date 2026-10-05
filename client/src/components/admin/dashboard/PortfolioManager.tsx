import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { determineHost as host } from "../../global/utils/determineHost";
import { imageset_select_btns } from "./styles/styles";
import { portfolio_subcategory } from "./types/portfolioTypes";
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

  const [searchParams, setSearchParams] = useSearchParams();
  const [taxonomy, setTaxonomy] = useState<portfolio_subcategory[]>([]);
  const [taxonomyLoaded, setTaxonomyLoaded] = useState(false);
  const [targetSubcategory, setTargetSubcategory] =
    useState<portfolio_subcategory | null>(null);

  // the breadcrumb position lives in the URL (?cat=&sub=&group=) so it
  // survives a refresh and the browser back button steps back through it
  const catParam = searchParams.get("cat");
  const activeCategory =
    catParam && CATEGORIES.includes(catParam) ? catParam : null;
  const subParam = activeCategory ? searchParams.get("sub") : null;
  const targetGroupId = subParam ? searchParams.get("group") ?? "" : "";
  // targetSubcategory is still held in state so children can update it in
  // place - only trust it once it matches the URL, otherwise it's stale
  // (e.g. mid back-navigation) or still being restored from the taxonomy
  const activeSubcategory =
    targetSubcategory && targetSubcategory._id === subParam
      ? targetSubcategory
      : null;
  const started = Boolean(activeSubcategory && targetGroupId);
  const [dragTarget, setDragTarget] = useState({});
  const [queue, setQueue] = useState<File[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [bulkFails, setBulkFails] = useState<string[]>([]);
  const [deleteModalToggle, setDeleteModalToggle] =
    useState(EMPTY_DELETE_TOGGLE);
  // one-shot signal for PortfolioAdminGrid.tsx to catch itself up after a
  // bulk upload - deliberately NOT the group's plain `count`, which changes
  // for other incidental reasons (e.g. resolving during navigation) and
  // would make the grid auto-load its entire backlog on those too
  const [bulkUploadSignal, setBulkUploadSignal] = useState<{
    key: number;
    newLayoutLength: number;
  } | null>(null);

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
          setTaxonomyLoaded(true);
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

  const setPosition = (
    position: { cat?: string; sub?: string; group?: string },
    replace = false,
  ) => {
    setSearchParams(
      (prev) => {
        // keep Dashboard.tsx's ?pane= and anything else outside the breadcrumb
        const next = new URLSearchParams(prev);
        for (const key of ["cat", "sub", "group"] as const) {
          const value = position[key];
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      },
      { replace },
    );
  };

  // restore the subcategory object from the URL once the taxonomy is in (on
  // refresh, or when back/forward changes the URL), and drop any part of the
  // URL that no longer resolves, e.g. a since-deleted subcategory or group
  useEffect(() => {
    if (!taxonomyLoaded) return;

    if (catParam !== activeCategory) {
      setPosition({}, true);
      return;
    }
    if (!activeCategory || !subParam) return;

    const sub = taxonomy.find(
      (entry) => entry._id === subParam && entry.category === activeCategory,
    );
    if (!sub) {
      setPosition({ cat: activeCategory }, true);
      return;
    }
    if (
      targetGroupId &&
      !sub.groups.some((group) => group.groupId === targetGroupId)
    ) {
      setPosition({ cat: activeCategory, sub: sub._id }, true);
    }

    setTargetSubcategory((prev) => (prev?._id === sub._id ? prev : sub));
    // setPosition is recreated every render but only wraps setSearchParams
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taxonomyLoaded, taxonomy, catParam, activeCategory, subParam, targetGroupId]);

  const resetToCategories = () => {
    setTargetSubcategory(null);
    setPosition({});
  };

  const resetToSubcategories = () => {
    setTargetSubcategory(null);
    setPosition({ cat: activeCategory ?? undefined });
  };

  const resetToGroups = () => {
    setPosition({
      cat: activeCategory ?? undefined,
      sub: activeSubcategory?._id,
    });
  };

  return (
    <div className="text-white border border-solid border-white w-[85dvw] xl:w-full xl:mb-3 flex-1 min-h-0 flex flex-col">
      {activeCategory ? (
        <nav className="flex gap-3 flex-wrap p-3 border-b border-solid border-white text-sm tracking-widest opacity-80">
          <button
            type="button"
            onClick={resetToCategories}
            className="xl:hover:text-rd focus:text-rd focus:outline-none transition-colors"
          >
            ◄ CATEGORIES
          </button>

          {activeSubcategory ? (
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
              ◄ {activeSubcategory?.name} GROUPS
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
          targetSubcategory={activeSubcategory}
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
                onClick={() => setPosition({ cat: category })}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      ) : subParam && !activeSubcategory ? (
        // restoring the subcategory from the URL - render nothing rather than
        // flashing the subcategory list first
        null
      ) : !activeSubcategory ? (
        <SubcategoryManager
          category={activeCategory}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          setDeleteModalToggle={setDeleteModalToggle}
          onSelectSubcategory={(sub: portfolio_subcategory) => {
            setTargetSubcategory(sub);
            setPosition({ cat: activeCategory, sub: sub._id });
          }}
        />
      ) : !started ? (
        <GroupManager
          targetSubcategory={activeSubcategory}
          setTargetSubcategory={setTargetSubcategory}
          taxonomy={taxonomy}
          setTaxonomy={setTaxonomy}
          setDeleteModalToggle={setDeleteModalToggle}
          setNotice={setNotice}
          onSelectGroup={(groupId: string) => {
            // PortfolioAdminGrid.tsx fetches its own data on mount from
            // category/sub/groupId - nothing more to load here
            setPosition({
              cat: activeCategory,
              sub: activeSubcategory._id,
              group: groupId,
            });
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
                activeSubcategory.name,
                targetGroupId,
                (percent: number) => setUploadProgress(percent),
              );

              setSubmitStatus(1);
              setUploadProgress(null);
              setBulkFails(data.failed);
              setBulkUploadSignal({
                key: Date.now(),
                newLayoutLength: data.newLayoutLength,
              });

              const updatedGroups = activeSubcategory.groups.map((group) =>
                group.groupId === targetGroupId
                  ? { ...group, count: data.newCount }
                  : group,
              );
              const updatedSubcategory = {
                ...activeSubcategory,
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
                setQueue((prev) =>
                  prev.filter((file) => failedNames.has(file.name)),
                );
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
          className="flex-1 min-h-0 flex flex-col"
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
              className="flex flex-1 min-h-0"
            >
              <PortfolioOrderContainer
                category={activeCategory}
                dragTarget={dragTarget}
                setNotice={setNotice}
                targetSubcategory={activeSubcategory}
                setTargetSubcategory={setTargetSubcategory}
                targetGroupId={targetGroupId}
                taxonomy={taxonomy}
                setTaxonomy={setTaxonomy}
                bulkUploadSignal={bulkUploadSignal}
              />

              <ImageQueue
                queue={queue}
                setDragTarget={setDragTarget}
                setQueue={setQueue}
                setSubmitOpen={setSubmitOpen}
                compress={false}
              />
            </motion.div>
          </AnimatePresence>
        </form>
      )}
    </div>
  );
}
