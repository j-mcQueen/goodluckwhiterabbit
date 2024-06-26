import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion, AnimatePresence } from "framer-motion";

import rabbit from "../../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../../assets/media/icons/Instagram";
import { Link } from "react-router-dom";

export default function MobileHeader({ page }: { page: number }) {
  const [active, setActive] = useState(false);

  const listData = [
    { path: "/photo", element: "PHOTOGRAPHY" },
    { path: "/design", element: "DESIGN" },
    { path: "/artwork", element: "ARTWORK" },
  ];

  const listItemVariants = {
    active: `${page === 1 ? "bg-blu text-white" : page === 2 ? "bg-ylw" : page === 3 ? "bg-red-600" : null}`,
    std: "",
  };

  useEffect(() => {
    // prevent body scrolling when nav modal is open
    document.body.style.overflowY = active ? "hidden" : "unset";
    document.documentElement.style.overflowY = active ? "hidden" : "unset";
  }, [active]);

  return (
    <header
      className={`${active ? "border-black" : "border-white"} flex border-b-[1px] border-solid transition-colors`}
    >
      <div className="flex justify-between w-full">
        <div className="flex justify-center w-full">
          <Link to={"/"}>
            <img
              src={rabbit}
              alt="A white rabbit against a black background shimmering from left to right"
              className="max-h-[50px]"
            />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setActive(!active)}
          className={`${active ? "bg-white" : "bg-black"} min-w-[50px] h-[50px] border-l-[1px] border-solid border-white flex items-center justify-center transition-colors`}
        >
          <div
            className={`${active ? "rotate-45 bg-black" : "-rotate-45 bg-white"} w-[25px] h-[1px] transition-all`}
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
            className="absolute bg-white w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-52px)] translate-y-[51px] flex flex-col items-center"
          >
            <ul className="w-full h-full flex flex-col  justify-evenly">
              {listData.map((item, index: number) => {
                return (
                  <li
                    className={`${page === index + 1 ? listItemVariants.active : listItemVariants.std} ${index === listData.length - 1 ? "border-b-[1px]" : ""} border-t-[1px] border-solid border-black flex h-full`}
                    key={uuidv4()}
                  >
                    <Link
                      to={item.path}
                      className="w-full h-full flex items-center justify-center italic"
                    >
                      {item.element}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="flex justify-between w-full min-h-[50px]">
              <div className="min-w-[50px] flex items-center justify-center border-r-[1px] border-solid border-black">
                <a href="https://www.instagram.com/goodluckwhiterabbit/">
                  <Instagram mobile={true} />
                </a>
              </div>

              <a
                href=""
                className="flex items-center justify-center italic w-full h-[50px]"
              >
                CONTACT
              </a>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
