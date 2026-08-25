import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerBatch } from "../utils/triggerBatch";

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
    setContactOpen,
    setImages,
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

    const nextImages = await triggerBatch(
      subcategories[j],
      categoryIndex,
      1,
      setImages,
      setNotice,
      true,
      0,
    );

    onGroupSelect?.(j, 0);
    setIsOpen({ main: false });

    return nextImages;
  };

  const handleGroupClick = async (k: number) => {
    const nextImages = await triggerBatch(
      subcategories[activeSubIndex],
      categoryIndex,
      k + 1, // groups are 1-indexed on S3
      setImages,
      setNotice,
      true,
      0,
    );

    onGroupSelect?.(activeSubIndex, k);
    setIsOpen({ main: false });

    return nextImages;
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
