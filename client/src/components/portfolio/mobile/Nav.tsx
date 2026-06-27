import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sidebar_data } from "../data/sidebar/data";
import { triggerBatch } from "../utils/triggerBatch";

import TopBar from "../../global/header/mobile/TopBar";
import Instagram from "../../../assets/media/icons/Instagram";
import ContactButton from "../ContactButton";
import ListItem from "./ListItem";

export default function Nav({ ...props }) {
  const { categories, setContactOpen, setImages, setNotice } = props;

  const routeMap = {
    0: "/photo",
    1: "/art",
    2: "/design",
  };

  const setCntrStyles = (depth: number) => {
    return `${depth === 0 ? "border-b border-solid border-white" : ""} flex items-center w-full h-full min-w-[calc((100dvw-1.5rem-52px)/3)] overflow-hidden min-h-[54.2px]`;
  };

  const determineArr = (depth: number, i: number, j?: number) => {
    switch (depth) {
      case 1:
        return sidebar_data[routeMap[i as keyof typeof routeMap]].subcategories;

      case 2:
        return Object.keys(
          sidebar_data[routeMap[i as keyof typeof routeMap]].menu[j as number],
        );

      default:
        return [];
    }
  };

  const [isOpen, setIsOpen] = useState({
    main: false,
    subcategories: false,
    groups: false,
  });

  const [toggledIndexes, setToggledIndexes] = useState<{
    [key: string]: number | null;
  }>({
    subcategories: null,
    groups: null,
  });

  const handleClick = async (
    depth: number,
    i: number,
    j?: number,
    k?: number,
  ) => {
    interface Prev {
      [key: string]: boolean;
    }

    switch (depth) {
      case 0:
        setIsOpen((prev: Prev) => ({
          main: true,
          subcategories: !prev.subcategories,
          groups: false,
        }));

        setToggledIndexes({ subcategories: i, groups: null });
        break;

      case 1:
        setIsOpen((prev: Prev) => ({
          main: true,
          subcategories: true,
          groups: !prev.groups,
        }));

        setToggledIndexes((prev) => ({
          subcategories: prev.subcategories,
          groups: j!,
        }));
        break;

      case 2:
        setIsOpen({
          main: false,
          subcategories: true,
          groups: true,
        });

        return await triggerBatch(
          String(j), // activeSub
          i, // activeTab
          k!, // activeGroup
          setImages,
          setNotice,
          true,
          0,
        );
    }
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
            className="absolute text-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-52px)] flex flex-col justify-between items-center z-50 bg-black top-0"
          >
            <ul className="w-full h-full flex flex-col justify-evenly overflow-hidden">
              {categories.map((category: string, i: number) => {
                return (
                  <div className={setCntrStyles(0)} key={category}>
                    <ListItem
                      depth={0}
                      index={i}
                      label={category}
                      handleClick={() => handleClick(0, i)}
                    />

                    <AnimatePresence mode="wait">
                      {isOpen.subcategories &&
                        toggledIndexes.subcategories === i && (
                          <Fragment key="categories-and-groups">
                            <motion.ul
                              initial={{
                                x: 100,
                                opacity: 0,
                                visibility: "hidden",
                              }}
                              animate={{
                                x: 0,
                                opacity: 1,
                                visibility: "visible",
                              }}
                              exit={{ x: 100, opacity: 0 }}
                              transition={{
                                type: "spring",
                                bounce: 0,
                                duration: 0.4,
                              }}
                              className="w-full max-h-full flex flex-col overflow-y-auto"
                              key="active-subcategories"
                            >
                              {determineArr(1, i).map(
                                (subcategory: string, j: number) => {
                                  return (
                                    <div
                                      className={setCntrStyles(1)}
                                      key={subcategory}
                                    >
                                      <ListItem
                                        depth={1}
                                        index={j}
                                        label={subcategory}
                                        handleClick={() => handleClick(1, i, j)}
                                      />
                                    </div>
                                  );
                                },
                              )}
                            </motion.ul>

                            <AnimatePresence mode="wait">
                              {isOpen.groups && (
                                <motion.ul
                                  initial={{
                                    x: 100,
                                    opacity: 0,
                                    visibility: "hidden",
                                  }}
                                  animate={{
                                    x: 0,
                                    opacity: 1,
                                    visibility: "visible",
                                  }}
                                  exit={{ x: 100, opacity: 0 }}
                                  transition={{
                                    type: "spring",
                                    bounce: 0,
                                    duration: 0.4,
                                  }}
                                  className="w-full max-h-full flex flex-col overflow-y-auto"
                                  key="active-groups"
                                >
                                  {determineArr(
                                    2,
                                    i,
                                    toggledIndexes.subcategories,
                                  ).map((group: string, k: number) => {
                                    return (
                                      <div
                                        className={setCntrStyles(2)}
                                        key={group}
                                      >
                                        <ListItem
                                          depth={2}
                                          index={k}
                                          label={group}
                                          handleClick={() =>
                                            handleClick(
                                              2,
                                              i,
                                              toggledIndexes.subcategories!,
                                              k,
                                            )
                                          }
                                        />
                                      </div>
                                    );
                                  })}
                                </motion.ul>
                              )}
                            </AnimatePresence>
                          </Fragment>
                        )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </ul>

            <div className="flex items-center justify-around w-full h-[50px]">
              <div className="w-full h-full flex items-center justify-center border-r border-solid border-white relative">
                <a
                  className="w-full h-full flex items-center justify-center"
                  href="https://www.instagram.com/goodluckwhiterabbit/"
                >
                  <div className="max-w-[24px] max-h-[24px]">
                    <Instagram />
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
