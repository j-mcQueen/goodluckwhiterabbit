import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { resolveGroupId } from "../utils/resolveGroupId";
import { resolveGroupHasMemo } from "../utils/resolveGroupHasMemo";
import { loadPortfolioBlocksForGroup } from "../utils/loadPortfolioBlocksForGroup";

import TopBar from "../../global/header/mobile/TopBar";
import Instagram from "../../../assets/media/icons/Instagram";
import ContactButton from "../ContactButton";
import BrowseColumns from "../BrowseColumns";

export default function Nav({ ...props }) {
  const {
    activeGroupIndex,
    activeSubIndex,
    categoryIndex,
    onGroupSelect,
    route,
    setBlocks,
    setContactOpen,
    setNextStartIndex,
    setNotice,
    sidebarData,
  } = props;

  const [isOpen, setIsOpen] = useState({ main: false });

  const subcategories: string[] = sidebarData[route]?.subcategories ?? [];
  const groups: string[] = Object.keys(
    sidebarData[route]?.menu[activeSubIndex] ?? {},
  );

  const handleSubcategoryClick = async (j: number) => {
    if (j === activeSubIndex) return; // already active - stay open on its groups

    const groupId = resolveGroupId(sidebarData, route, j, 0);
    if (!groupId) return; // subcategory has no groups yet

    const hasMemo = resolveGroupHasMemo(sidebarData, route, j, groupId);
    const { blocks, nextStartIndex } = await loadPortfolioBlocksForGroup({
      activeSub: subcategories[j],
      activeTab: categoryIndex,
      groupId,
      hasMemo,
      isMemoGroup: (id: string) => resolveGroupHasMemo(sidebarData, route, j, id),
      setNotice,
    });

    if (blocks.length > 0) {
      setBlocks(blocks);
      setNextStartIndex(nextStartIndex);
    }

    onGroupSelect?.(j, 0, groupId);
    setIsOpen({ main: false });
  };

  const handleGroupClick = async (k: number) => {
    const groupId = resolveGroupId(sidebarData, route, activeSubIndex, k);
    if (!groupId) return;

    const hasMemo = resolveGroupHasMemo(sidebarData, route, activeSubIndex, groupId);
    const { blocks, nextStartIndex, empty } = await loadPortfolioBlocksForGroup({
      activeSub: subcategories[activeSubIndex],
      activeTab: categoryIndex,
      groupId,
      hasMemo,
      isMemoGroup: (id: string) => resolveGroupHasMemo(sidebarData, route, activeSubIndex, id),
      setNotice,
    });

    if (empty) return; // notice already raised - stay on the current group

    if (blocks.length > 0) {
      setBlocks(blocks);
      setNextStartIndex(nextStartIndex);
    }

    onGroupSelect?.(activeSubIndex, k, groupId);
    setIsOpen({ main: false });
  };

  return (
    <header className="border-b border-solid border-white">
      <TopBar
        isMobilePortfolio={true}
        isOpen={isOpen.main}
        logout={false}
        setIsOpen={setIsOpen}
      />

      <AnimatePresence mode="wait">
        {isOpen.main && (
          <motion.nav
            key="mobile-portfolio-nav"
            initial={{ x: -100, opacity: 0, visibility: "hidden", y: 52 }}
            animate={{ x: 0, opacity: 1, visibility: "visible" }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute text-white w-[calc(100dvw-var(--frame)-2px)] h-[calc(100dvh-var(--frame)-52px)] flex flex-col justify-between items-center z-50 bg-black top-0"
          >
            <BrowseColumns
              subcategories={subcategories}
              groups={groups}
              selectedSub={activeSubIndex}
              onSubcategoryClick={handleSubcategoryClick}
              activeSubIndex={activeSubIndex}
              activeGroupIndex={activeGroupIndex}
              handleGroupClick={handleGroupClick}
            />

            <div className="flex items-center justify-around w-full h-[50px] border-t border-solid border-white">
              <div className="w-full h-full flex items-center justify-center border-r border-solid border-white relative">
                <a
                  className="w-full h-full flex items-center justify-center"
                  href="https://www.instagram.com/goodluckwhiterabbit/"
                >
                  <div className="max-w-[24px] max-h-[24px]">
                    <Instagram className="w-[24px] h-[24px] overflow-visible" />
                  </div>
                </a>
              </div>

              <ContactButton setContactOpen={setContactOpen} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
