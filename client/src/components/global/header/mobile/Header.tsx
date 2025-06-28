import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import rabbit from "../../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../../assets/media/icons/Instagram";
import Next from "../../../../assets/media/icons/Next";
import Eject from "../../../../assets/media/icons/Eject";

export default function MobileHeader({ ...props }) {
  const { logout, data, activeTab, setActiveTab, host, counts } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-t-0",
    std: "border-t",
  };

  const buttonVariants = {
    disabled: "opacity-25 w-full h-full tracking-widest",
    regular:
      "xl:hover:text-rd focus:text-rd transition-colors w-full h-full tracking-widest",
  };

  const RabbitElem = () => {
    return (
      <img
        src={rabbit}
        alt="A white rabbit against a black background shimmering from left to right"
        className="max-h-[50px]"
      />
    );
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
      className={`${active ? "border-white" : "border-white"} flex border-b border-solid transition-colors z-50`}
    >
      <div className="flex justify-between w-full">
        <div className="w-full">
          {logout ? (
            <RabbitElem />
          ) : (
            <Link to={"/"} className="w-full h-full flex justify-center">
              <RabbitElem />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`${active ? "bg-black" : "bg-white"} min-w-[50px] h-[50px] border-l border-solid border-white flex items-center justify-center transition-colors`}
        >
          <div
            className={`${active ? "rotate-45 bg-white" : "-rotate-45 bg-black"} w-[25px] h-[1px] transition-all`}
          ></div>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {active && (
          <motion.nav
            key="nav"
            initial={{ x: -100, opacity: 0, visibility: "hidden", y: 51 }}
            animate={{ x: 0, opacity: 1, visibility: "visible" }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="absolute text-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-52px)] translate-y-[51px] flex flex-col items-center z-50 bg-black"
          >
            <ul className="w-full h-full flex flex-col justify-evenly z-10">
              {data.map((tab: string, index: number) => {
                return (
                  <li
                    className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${index === data.length - 1 ? "border-b" : ""} border-solid border-white flex relative h-full bg-black`}
                    key={tab}
                  >
                    <button
                      type="button"
                      disabled={counts && counts[index] === 0}
                      className={
                        counts && counts[index] === 0
                          ? buttonVariants.disabled
                          : buttonVariants.regular
                      }
                      onClick={() => {
                        setActiveTab(index);
                        setActive(false);
                      }}
                    >
                      {tab}

                      {counts && counts[index] === 0 ? (
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
              <div className="flex justify-between w-full min-h-[50px] border-b border-solid border-white bg-black">
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
