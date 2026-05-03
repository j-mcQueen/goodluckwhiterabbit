import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { sidebar_data } from "../data/sidebar/data";
import { triggerBatch } from "../utils/triggerBatch";

import TopBar from "../../global/header/mobile/TopBar";
import Instagram from "../../../assets/media/icons/Instagram";

export default function MobilePortHeader({ ...props }) {
  const { categories, setImages, setNotice } = props;

  const routeMap = {
    0: "/photo",
    1: "/art",
    2: "/design",
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

  return (
    <header>
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
            className="absolute text-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-54px)] flex flex-col items-center z-50 bg-black"
          >
            <ul>
              {categories.map((category: string, i: number) => {
                return (
                  <Fragment key={category}>
                    <li>
                      <button
                        onClick={() => {
                          setIsOpen((prev) => ({
                            main: true,
                            subcategories: !prev.subcategories,
                            groups: false,
                          }));

                          setToggledIndexes({ subcategories: i, groups: null });
                        }}
                        type="button"
                      >
                        {category}
                      </button>
                    </li>

                    {isOpen.subcategories &&
                      toggledIndexes.subcategories === i && (
                        <motion.ul key="active-subcategories">
                          {sidebar_data[
                            routeMap[i as keyof typeof routeMap]
                          ].subcategories.map(
                            (subcategory: string, j: number) => {
                              return (
                                <Fragment key={subcategory}>
                                  <li>
                                    <button
                                      onClick={() => {
                                        setIsOpen((prev) => ({
                                          main: true,
                                          subcategories: true,
                                          groups: !prev.groups,
                                        }));

                                        setToggledIndexes((prev) => ({
                                          subcategories: prev.subcategories,
                                          groups: j,
                                        }));
                                      }}
                                      type="button"
                                    >
                                      {subcategory}
                                    </button>
                                  </li>

                                  {isOpen.groups &&
                                    toggledIndexes.groups === j && (
                                      <motion.ul key="active-groups">
                                        {Object.keys(
                                          sidebar_data[
                                            routeMap[j as keyof typeof routeMap]
                                          ].menu[j],
                                        ).map((group: string, k: number) => {
                                          return (
                                            <li key={group}>
                                              <button
                                                onClick={async () => {
                                                  setIsOpen({
                                                    main: false,
                                                    subcategories: true,
                                                    groups: true,
                                                  });

                                                  await triggerBatch(
                                                    String(j), // activeSub
                                                    i, // activeTab
                                                    k, // activeGroup
                                                    setImages,
                                                    setNotice,
                                                    true,
                                                    0,
                                                  );
                                                }}
                                                type="button"
                                              >
                                                {group}
                                              </button>
                                            </li>
                                          );
                                        })}
                                      </motion.ul>
                                    )}
                                </Fragment>
                              );
                            },
                          )}
                        </motion.ul>
                      )}
                  </Fragment>
                );
              })}
            </ul>

            <div>
              <a
                className="min-w-[50px] flex items-center justify-center border-r border-solid border-white"
                href="https://www.instagram.com/goodluckwhiterabbit/"
              >
                <Instagram />
              </a>

              <button
                className="flex items-center justify-center w-full h-[50px]"
                // onClick={}
                type="button"
              >
                CONTACT
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
