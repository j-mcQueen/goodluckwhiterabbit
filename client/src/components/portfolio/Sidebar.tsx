import { motion } from "framer-motion";

import BrowseColumns from "./BrowseColumns";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    browseSub,
    browseTab,
    onNavigate,
    route,
    sidebarData,
    setSidebarOpen,
    sidebarRect,
  } = props;

  // browsing a category other than the real active one previews it without
  // committing - the group column falls back to its first subcategory and
  // nothing shows as truly "active" until a pick is actually made
  const isActiveCategory = browseTab === activeTab;
  const highlightSub = isActiveCategory ? activeSub : browseSub;
  const highlightGroup = isActiveCategory ? activeGroup : 0;

  const subcategories: string[] = sidebarData[route]?.subcategories ?? [];
  const groups: string[] = Object.keys(
    sidebarData[route]?.menu[highlightSub] ?? {},
  );

  // picks commit through Portfolio's onNavigate, which loads the group and
  // only then moves the URL - the dropdown stays open if nothing was shown
  // (empty group, failed load), matching the old in-place behaviour
  const handleSubcategoryClick = async (j: number) => {
    if (j === highlightSub) return; // already shown - stay open on its groups
    if (await onNavigate(route, j, 0)) setSidebarOpen(false);
  };

  const handleGroupClick = async (k: number) => {
    if (await onNavigate(route, highlightSub, k)) setSidebarOpen(false);
  };

  return (
    <motion.aside
      initial={{ height: "0%", opacity: 0 }}
      animate={{ height: "100%", opacity: 1 }}
      exit={{ height: "0%", opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      style={{
        left: sidebarRect ? sidebarRect.left - 1 : 0,
        width: sidebarRect ? sidebarRect.width + 1 : "100%",
      }}
      className="-translate-y-[1px] absolute top-0 z-20 text-white overflow-hidden bg-black border-l border-r border-t border-solid border-white"
    >
      <BrowseColumns
        subcategories={subcategories}
        groups={groups}
        selectedSub={highlightSub}
        onSubcategoryClick={handleSubcategoryClick}
        activeSubIndex={highlightSub}
        activeGroupIndex={highlightGroup}
        handleGroupClick={handleGroupClick}
      />
    </motion.aside>
  );
}
