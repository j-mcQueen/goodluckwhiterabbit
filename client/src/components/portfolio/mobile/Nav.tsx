import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerBatch } from "../utils/triggerBatch";

import TopBar from "../../global/header/mobile/TopBar";
import Instagram from "../../../assets/media/icons/Instagram";
import ContactButton from "../ContactButton";
import ListItem from "./ListItem";

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
  const [selectedSub, setSelectedSub] = useState<number>(0);

  // seed the browse selection with the currently active subcategory every
  // time the nav is opened, so it renders pre-expanded to the user's position
  useEffect(() => {
    if (isOpen.main) setSelectedSub(activeSubIndex);
  }, [isOpen.main, activeSubIndex]);

  const subcategories: string[] = sidebarData[route]?.subcategories ?? [];
  const groups: string[] = Object.keys(
    sidebarData[route]?.menu[selectedSub] ?? {},
  );

  const handleGroupClick = async (k: number) => {
    const nextImages = await triggerBatch(
      subcategories[selectedSub],
      categoryIndex,
      k + 1, // groups are 1-indexed on S3 (matches GroupList's j + 1)
      setImages,
      setNotice,
      true,
      0,
    );

    onGroupSelect?.(selectedSub, k);
    setIsOpen({ main: false });

    return nextImages;
  };

  const rowStyles = (j: number, length: number) =>
    `${j === 0 ? "border-t-0" : ""} ${j === length - 1 ? "border-b-0" : ""} border border-white border-solid border-l-0 border-r-0 -my-[0.5px] w-full min-h-[54.2px] flex items-center overflow-hidden`;

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
            <div className="flex w-full h-full overflow-hidden">
              <ul className="w-1/2 h-full flex flex-col justify-evenly overflow-y-auto border-r border-solid border-white">
                {subcategories.map((subcategory: string, j: number) => (
                  <div
                    className={rowStyles(j, subcategories.length)}
                    key={subcategory}
                  >
                    <ListItem
                      active={j === activeSubIndex}
                      label={subcategory}
                      handleClick={() => setSelectedSub(j)}
                    />
                  </div>
                ))}
              </ul>

              <AnimatePresence mode="wait">
                <motion.ul
                  key={selectedSub}
                  initial={{ x: 40, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 40, opacity: 0 }}
                  transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                  className="w-1/2 h-full flex flex-col justify-evenly overflow-y-auto"
                >
                  {groups.map((group: string, k: number) => (
                    <div className={rowStyles(k, groups.length)} key={group}>
                      <ListItem
                        active={
                          selectedSub === activeSubIndex &&
                          k === activeGroupIndex
                        }
                        label={group}
                        handleClick={() => handleGroupClick(k)}
                      />
                    </div>
                  ))}
                </motion.ul>
              </AnimatePresence>
            </div>

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
