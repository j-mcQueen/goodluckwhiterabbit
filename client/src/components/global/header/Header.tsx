import { useNavigate } from "react-router-dom";
import { determineHost as host } from "../utils/determineHost";
import { Dispatch, SetStateAction } from "react";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";
import Eject from "../../../assets/media/icons/Eject";
import Next from "../../../assets/media/icons/Next";

export default function Header({
  ...props
}: {
  activeTab: number;
  dashboard: boolean | string[];
  data: string[];
  logout: boolean;
  handleSelect?: ([key]: string) => void;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  setActiveTab: Dispatch<SetStateAction<number>>;
  images?: { [key: string]: Blob[] };
}) {
  const {
    logout,
    data,
    setActiveIndex,
    activeTab,
    setActiveTab,
    dashboard,
    handleSelect,
    images,
  } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-b-black",
    std: "border-b-white",
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
        <div className="border-r border-b border-solid border-white min-w-[245px] flex justify-center">
          <img
            src={rabbit}
            alt="A white rabbit against a black background shimmering from left to right"
            className="max-h-14"
          />
        </div>

        <ul className="flex justify-evenly w-full font-liquid">
          {data.map((tab: string, index: number) => {
            return (
              <li
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${dashboard && dashboard[index as keyof typeof dashboard] === 0 && index !== data.length - 1 ? "border-r-white inline" : ""} border-r border-b border-solid border-white w-full flex items-center justify-center relative`}
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
                    }
                  }}
                >
                  {tab}

                  {dashboard &&
                  dashboard[index as keyof typeof dashboard] === 0 ? (
                    <span className="absolute -translate-y-1">
                      <span className="font-vt text-sm tracking-normal flex items-center gap-1">
                        <Next className="w-4 h-4" /> <span>COMING SOON</span>
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
            className="xl:hover:text-rd focus:text-rd transition-colors px-[18px] border-b border-solid border-white font-liquid tracking-widest group"
            onClick={() => handleLogout()}
          >
            <Eject className="w-5 h-5 group-hover:fill-rd group-focus:fill-rd group-hover:drop-shadow-red group-focus:drop-shadow-red transition-colors" />
          </button>
        ) : (
          <a
            href="https://www.instagram.com/goodluckwhiterabbit/"
            className={`${activeTab === data.length - 1 ? "border-l" : ""} px-5 flex items-center justify-center border-b border-solid`}
          >
            <Instagram />
          </a>
        )}
      </nav>
    </header>
  );
}
