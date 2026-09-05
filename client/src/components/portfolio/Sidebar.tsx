import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { resolveGroupId } from "./utils/resolveGroupId";
import { resolveGroupHasMemo } from "./utils/resolveGroupHasMemo";
import { loadPortfolioBlocksForGroup } from "./utils/loadPortfolioBlocksForGroup";

import BrowseColumns from "./BrowseColumns";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
    browseSub,
    browseTab,
    route,
    sidebarData,
    setActiveGroup,
    setActiveGroupId,
    setActiveSub,
    setActiveTab,
    setBlocks,
    setNextStartIndex,
    setNotice,
    setSidebarOpen,
    sidebarRect,
  } = props;

  const navigate = useNavigate();

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

  const handleSubcategoryClick = async (j: number) => {
    if (j === highlightSub) return; // already shown - stay open on its groups

    const groupId = resolveGroupId(sidebarData, route, j, 0);
    if (!groupId) return; // subcategory has no groups yet

    if (bodyRef) {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }

    try {
      const hasMemo = resolveGroupHasMemo(sidebarData, route, j, groupId);
      const { blocks, nextStartIndex } = await loadPortfolioBlocksForGroup({
        activeSub: subcategories[j],
        activeTab: browseTab,
        groupId,
        hasMemo,
        setNotice,
      });

      if (blocks.length > 0) {
        setBlocks(blocks);
        setNextStartIndex(nextStartIndex);
      }

      setActiveSub(j);
      setActiveGroup(0);
      setActiveGroupId(groupId);

      if (!isActiveCategory) {
        setActiveTab(browseTab);
        navigate(route);
      }

      setSidebarOpen(false);
    } catch (error) {
      setNotice({
        status: true,
        loading: false,
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleGroupClick = async (k: number) => {
    const groupId = resolveGroupId(sidebarData, route, highlightSub, k);
    if (!groupId) return;

    if (bodyRef) {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }

    try {
      const hasMemo = resolveGroupHasMemo(sidebarData, route, highlightSub, groupId);
      const { blocks, nextStartIndex } = await loadPortfolioBlocksForGroup({
        activeSub: subcategories[highlightSub],
        activeTab: browseTab,
        groupId,
        hasMemo,
        setNotice,
      });

      if (blocks.length > 0) {
        setBlocks(blocks);
        setNextStartIndex(nextStartIndex);
      }

      if (!isActiveCategory) setActiveSub(highlightSub);
      setActiveGroup(k);
      setActiveGroupId(groupId);

      if (!isActiveCategory) {
        setActiveTab(browseTab);
        navigate(route);
      }

      setSidebarOpen(false);
    } catch (error) {
      setNotice({
        status: true,
        loading: false,
        message: "Something went wrong. Please try again.",
      });
    }
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
