import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { determineHost as host } from "../../utils/determineHost";

import Instagram from "../../../../assets/media/icons/Instagram";
import Next from "../../../../assets/media/icons/Next";
import Eject from "../../../../assets/media/icons/Eject";
import TopBar from "./TopBar";

export default function MobileHeader({
  ...props
}: {
  activeTab: number;
  logout: boolean;
  data: string[];
  setActiveIndex?: Dispatch<SetStateAction<number>>;
  setActiveTab: Dispatch<SetStateAction<number>>;
  counts?: boolean | number[];
  handleSelect?: ([key]: string) => void;
  images?: { [key: string]: Blob[] };
  loadTrackerRef?: React.MutableRefObject<boolean>;
}) {
  const {
    logout,
    data,
    activeTab,
    setActiveIndex,
    setActiveTab,
    counts,
    handleSelect,
    images,
    loadTrackerRef,
  } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd",
    std: "",
  };

  const buttonVariants = {
    disabled: "opacity-25 w-full h-full tracking-widest",
    regular: "focus:text-rd transition-colors w-full h-full tracking-widest",
  };

  const handleLogout = async () => {
    const response = await fetch(`${host}/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (response.status === 200) {
      return navigate("/portal");
    }
  };

  const [active, setActive] = useState(false);

  useEffect(() => {
    // prevent body scrolling when nav modal is open
    document.body.style.overflowY = active ? "hidden" : "unset";
    document.documentElement.style.overflowY = active ? "hidden" : "unset";
  }, [active]);

  return (
    <header
      className={`flex border-b border-solid border-white transition-colors z-50`}
    >
      <TopBar isOpen={active} logout={logout} setIsOpen={setActive} />

      <AnimatePresence mode="wait">
        {active && (
          <motion.nav
            key="nav"
            initial={{ x: -100, opacity: 0, visibility: "hidden", y: 52 }}
            animate={{ x: 0, opacity: 1, visibility: "visible" }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute text-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-54px)] flex flex-col items-center z-50 bg-black"
          >
            <ul className="w-full h-full flex flex-col justify-evenly">
              {data.map((tab: string, index: number) => {
                return (
                  <li
                    className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} border-b border-solid border-white flex relative h-full bg-black`}
                    key={tab}
                  >
                    <button
                      type="button"
                      disabled={
                        counts && counts[index as keyof typeof counts] === 0
                      }
                      className={
                        counts && counts[index as keyof typeof counts] === 0
                          ? buttonVariants.disabled
                          : buttonVariants.regular
                      }
                      onClick={() => {
                        if (loadTrackerRef) loadTrackerRef.current = false; // open path for image autoload
                        setActiveTab(index);
                        setActive(false);

                        if (logout === true) {
                          const map = {
                            SNIPS: "snips",
                            "KEEPSAKE PREVIEW": "keepsake",
                            "CORE COLLECTION": "core",
                            SNAPSHOTS: "snapshots",
                          };

                          if (
                            images &&
                            images[
                              map[
                                tab as keyof typeof map
                              ] as keyof typeof images
                            ].length === 0
                          ) {
                            handleSelect?.(map[tab as keyof typeof map]);
                          }

                          if (setActiveIndex) setActiveIndex(0);
                        }
                      }}
                    >
                      {tab}

                      {counts && counts[index as keyof typeof counts] === 0 ? (
                        <span className="absolute -translate-y-1">
                          <span className="font-vt text-sm tracking-widest flex items-center gap-1">
                            <Next className="w-4 h-4" />{" "}
                            <span>COMING SOON</span>
                          </span>
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>

            {logout ? (
              <button
                type="button"
                className={`text-rd focus:text-rd transition-colors flex justify-center py-3 w-full tracking-widest border-white border-b-[1px]`}
                onClick={() => handleLogout()}
              >
                <Eject className="w-5 h-5 group-hover:fill-rd group-focus:fill-rd group-hover:drop-shadow-red group-focus:drop-shadow-red transition-colors" />
              </button>
            ) : (
              <div className="flex justify-between w-full min-h-[50px] bg-black">
                <div className="min-w-[50px] flex items-center justify-center border-r border-solid border-white">
                  <a href="https://www.instagram.com/goodluckwhiterabbit/">
                    <Instagram />
                  </a>
                </div>

                <a
                  href="mailto:goodluckwhiterabbit@gmail.com"
                  className="flex items-center justify-center w-full h-[50px]"
                >
                  CONTACT
                </a>
              </div>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
