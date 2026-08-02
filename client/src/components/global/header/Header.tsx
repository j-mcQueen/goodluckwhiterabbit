import { useNavigate } from "react-router-dom";
import { determineHost as host } from "../utils/determineHost";
import { Dispatch, SetStateAction } from "react";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";
import Eject from "../../../assets/media/icons/Eject";
import ContactButton from "../../portfolio/ContactButton";

export default function Header({
  ...props
}: {
  activeTab: number;
  dashboard: boolean | number[];
  data: string[];
  logout: boolean;
  handleSelect?: ([key]: string) => void;
  setActiveIndex?: Dispatch<SetStateAction<number>>;
  setActiveTab: Dispatch<SetStateAction<number>>;
  setContactOpen?: Dispatch<SetStateAction<boolean>>;
  images?: { [key: string]: Blob[] };
  loadTrackerRef?: React.MutableRefObject<boolean>;
}) {
  const {
    logout,
    data,
    setActiveIndex,
    activeTab,
    setActiveTab,
    dashboard,
    handleSelect,
    setContactOpen,
    images,
    loadTrackerRef,
  } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-white border-b-black",
    std: "border-b-white/20",
  };

  const buttonVariants = {
    disabled: "opacity-25 w-full h-full tracking-widest",
    regular:
      "xl:hover:text-rd focus:text-rd transition-colors w-full h-full tracking-widest",
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
        <div className="border-r border-b border-solid border-white/20 min-w-sidebar flex justify-center">
          <img
            src={rabbit}
            alt="A white rabbit against a black background shimmering from left to right"
            className="max-h-14"
          />
        </div>

        <ul className="flex justify-evenly w-full text-xl">
          {data.map((tab: string, index: number) => {
            return (
              <li
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${dashboard && dashboard[index as keyof typeof dashboard] === 0 && index !== data.length - 1 ? "border-r-white/20 inline" : ""}  border-r border-b border-solid border-white/20 w-full flex items-center justify-center relative`}
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
                      : buttonVariants.regular
                  }
                  onClick={() => {
                    if (loadTrackerRef) loadTrackerRef.current = false; // open path for image autoload
                    setActiveTab(index);

                    if (logout === true) {
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
                      const newRoute = {
                        0: "/photo",
                        1: "/art",
                        2: "/design",
                      };

                      return navigate(newRoute[index as keyof typeof newRoute]);
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
            className="xl:hover:text-rd focus:text-rd transition-colors px-[18px] border-b border-solid border-white/20 tracking-widest group"
            onClick={() => handleLogout()}
          >
            <Eject className="w-5 h-5 group-hover:fill-rd group-focus:fill-rd group-hover:drop-shadow-red group-focus:drop-shadow-red transition-colors" />
          </button>
        ) : (
          <div className="flex border-b border-solid border-white/20">
            <a
              href="https://www.instagram.com/goodluckwhiterabbit/"
              className={`px-5 flex items-center justify-center border-r border-solid border-white/20 max-h-[58px] max-w-[58px]`}
            >
              <Instagram />
            </a>

            <ContactButton setContactOpen={setContactOpen} />
          </div>
        )}
      </nav>
    </header>
  );
}
