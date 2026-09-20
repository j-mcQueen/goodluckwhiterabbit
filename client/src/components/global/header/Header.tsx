import { useNavigate } from "react-router-dom";
import { determineHost as host } from "../utils/determineHost";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";
import Eject from "../../../assets/media/icons/Eject";
import ContactButton from "../../portfolio/ContactButton";

export default function Header({
  ...props
}: {
  activeTab: number;
  anchorTab?: number; // tab whose rect is reported via onActiveTabRectChange; defaults to activeTab
  dashboard: boolean | number[];
  data: string[];
  logout: boolean;
  handleSelect?: ([key]: string) => void;
  setActiveIndex?: Dispatch<SetStateAction<number>>;
  setActiveTab: Dispatch<SetStateAction<number>>;
  setContactOpen?: Dispatch<SetStateAction<boolean>>;
  images?: { [key: string]: Blob[] };
  loadTrackerRef?: React.MutableRefObject<boolean>;
  onActiveTabRectChange?: (
    rect: { left: number; width: number } | null,
  ) => void;
  onCategoryTabClick?: (index: number) => void;
}) {
  const {
    logout,
    data,
    setActiveIndex,
    activeTab,
    anchorTab = activeTab,
    setActiveTab,
    dashboard,
    handleSelect,
    setContactOpen,
    images,
    loadTrackerRef,
    onActiveTabRectChange,
    onCategoryTabClick,
  } = props;
  const navigate = useNavigate();

  const [anchorTabNode, setAnchorTabNode] = useState<HTMLLIElement | null>(
    null,
  );

  // reports the anchor tab's (the one being browsed, else the active one)
  // viewport rect up to Portfolio, which uses it to size/position the desktop
  // sidebar overlay to match
  useEffect(() => {
    if (!anchorTabNode || !onActiveTabRectChange) return;

    const report = () => {
      const rect = anchorTabNode.getBoundingClientRect();
      onActiveTabRectChange({ left: rect.left, width: rect.width });
    };

    report();

    const observer = new ResizeObserver(report);
    observer.observe(anchorTabNode);
    return () => observer.disconnect();
  }, [anchorTabNode, onActiveTabRectChange]);

  const listItemVariants = {
    active: "text-white border-b-black",
    std: "border-b-white",
  };

  const buttonVariants = logout
    ? {
        disabled: "opacity-20 w-full h-full tracking-widest",
        active:
          "text-rd xl:hover:text-rd xl:focus:text-rd transition-colors w-full h-full tracking-vt xl:focus:outline-none drop-shadow-red xl:focus:drop-shadow-red xl:hover:drop-shadow-red",
        inactive:
          "text-white/70 xl:hover:opacity-100 xl:focus:opacity-100 xl:hover:text-rd xl:focus:text-rd transition-colors w-full h-full tracking-vt xl:focus:outline-none drop-shadow-glo xl:focus:drop-shadow-red xl:hover:drop-shadow-red",
      }
    : {
        disabled: "text-gray/50 w-full h-full tracking-widest",
        active:
          "text-white transition-colors w-full h-full tracking-vt xl:focus:outline-none drop-shadow-glo",
        inactive:
          "text-gray xl:hover:text-white xl:focus:text-white transition-colors w-full h-full tracking-vt xl:focus:outline-none",
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

  return (
    <header className="text-white">
      <nav className="flex">
        <div
          className={`border-r border-b border-solid border-white flex justify-center items-center ${logout ? "min-w-sidebar max-w-sidebar px-5" : "min-w-[189px]"}`}
        >
          {logout ? (
            <img
              src={rabbit}
              alt="A white rabbit against a black background shimmering from left to right"
              className="w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => navigate("/", { state: { toSegments: true } })}
              className="flex justify-center items-center"
            >
              <img
                src={rabbit}
                alt="A white rabbit against a black background shimmering from left to right"
                className="max-h-4"
              />
            </button>
          )}
        </div>

        <ul className="flex justify-evenly w-full text-xl">
          {data.map((tab: string, index: number) => {
            return (
              <li
                ref={(el) => {
                  if (index === anchorTab) setAnchorTabNode(el);
                }}
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${dashboard && dashboard[index as keyof typeof dashboard] === 0 && index !== data.length - 1 ? "border-r-white inline" : ""}  border-r border-b border-solid border-white w-full flex items-center justify-center relative`}
                key={tab}
              >
                <button
                  disabled={
                    dashboard &&
                    dashboard[index as keyof typeof dashboard] === 0
                      ? true
                      : false
                  }
                  type="button"
                  className={
                    dashboard &&
                    dashboard[index as keyof typeof dashboard] === 0
                      ? buttonVariants.disabled
                      : activeTab === index
                        ? buttonVariants.active
                        : buttonVariants.inactive
                  }
                  onClick={() => {
                    if (logout === true) {
                      if (loadTrackerRef) loadTrackerRef.current = false; // open path for image autoload
                      setActiveTab(index);

                      const map = {
                        SOCIALS: "socials",
                        "KEEPSAKE PREVIEW": "keepsake",
                        "CORE COLLECTION": "core",
                        SNAPSHOTS: "snapshots",
                      };

                      if (
                        images &&
                        images[
                          map[tab as keyof typeof map] as keyof typeof images
                        ].length === 0
                      ) {
                        handleSelect?.(map[tab as keyof typeof map]);
                      }

                      if (setActiveIndex) setActiveIndex(0);
                    } else {
                      onCategoryTabClick?.(index);
                    }
                  }}
                >
                  {tab}
                </button>
              </li>
            );
          })}
        </ul>

        {logout ? (
          <button
            type="button"
            className="xl:hover:text-rd focus:text-rd transition-colors p-[18px] border-b border-solid border-white tracking-widest group"
            onClick={() => handleLogout()}
          >
            <Eject className="w-5 h-5 group-hover:fill-rd group-focus:fill-rd group-hover:drop-shadow-red group-focus:drop-shadow-red transition-colors" />
          </button>
        ) : (
          <div className="flex border-b border-solid border-white">
            <a
              href="https://www.instagram.com/goodluckwhiterabbit/"
              className="px-5 flex items-center justify-center border-r border-solid border-white max-h-[58px] max-w-[58px] focus:outline-none group"
            >
              <Instagram className="min-w-4.5 min-h-4.5 xl:w-4.5 xl:h-4.5 overflow-visible xl:group-hover:fill-rd xl:group-hover:drop-shadow-red xl:group-focus:fill-rd xl:group-focus:drop-shadow-red xl:transition-colors" />
            </a>

            <ContactButton setContactOpen={setContactOpen} />
          </div>
        )}
      </nav>
    </header>
  );
}
