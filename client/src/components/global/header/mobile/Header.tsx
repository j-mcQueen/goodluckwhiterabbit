import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";

import rabbit from "../../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../../assets/media/icons/Instagram";

export default function MobileHeader({ ...props }) {
  const { logout, data, activeTab, setActiveTab, host } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-t-0",
    std: "border-t",
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
        <div className="flex justify-center w-full">
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
            className="absolute text-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-52px)] translate-y-[51px] flex flex-col items-center z-50"
          >
            <ul className="w-full h-full flex flex-col justify-evenly z-10">
              {data.map((tab: string, index: number) => {
                return (
                  <li
                    className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${index === data.length - 1 ? "border-b" : ""} border-solid border-white flex h-full bg-black`}
                    key={uuidv4()}
                  >
                    <button
                      type="button"
                      className="w-full h-full flex items-center justify-center"
                      onClick={() => {
                        setActiveTab(index);
                        setActive(false);
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
                className="text-rd focus:text-rd transition-colors flex justify-center py-3"
                onClick={() => handleLogout()}
              >
                EXIT
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
