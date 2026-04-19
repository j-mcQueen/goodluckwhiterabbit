import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mobile } from "../global/utils/determineViewport";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import MobileHeader from "../global/header/mobile/Header";
import Notice from "../global/Notice";
import Mail from "../../assets/media/icons/Mail";
import Contact from "./Contact";

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO", "ART", "DESIGN"];

  const navigate = useNavigate();
  const bodyRef = useRef();
  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(index);
  const [activeSub, setActiveSub] = useState<number | null>(0);
  const [activeGroup, setActiveGroup] = useState<number | null>(0); // an index
  const [images, setImages] = useState<{ blob: Blob; group: string }[]>([]);
  const [notice, setNotice] = useState<{
    status: boolean;
    loading: boolean;
    message: string | null;
  }>({
    status: false,
    loading: false,
    message: null,
  });

  useEffect(() => {
    const newRoute = {
      0: "/photo",
      1: "/art",
      2: "/design",
    };

    return navigate(newRoute[activeTab as keyof typeof newRoute]);
  }, [activeTab, navigate, route]);

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem)] overflow-hidden relative">
      <Contact contactOpen={contactOpen} setContactOpen={setContactOpen} />

      <div className="border border-white border-solid absolute bottom-0 right-0 -m-[0.5px] bg-black">
        <button
          type="button"
          onClick={() => setContactOpen((prev) => !prev)}
          className="text-white text-lg xl:hover:text-rd xl:transition-colors group flex items-center"
        >
          <Mail
            className={
              "w-[18px] h-[18px] xl:group-hover:drop-shadow-red xl:group-hover:fill-rd xl:group-focus:drop-shadow-red xl:group-focus:fill-rd xl:transition-colors m-5"
            }
          />
        </button>
      </div>

      <AnimatePresence>
        {notice.status && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Notice notice={notice} setNotice={setNotice} />
          </motion.div>
        )}
      </AnimatePresence>

      {mobile ? (
        <MobileHeader
          activeTab={activeTab}
          data={headerItems}
          logout={false}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          logout={false}
          data={headerItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboard={false}
        />
      )}

      <main className="flex flex-col xl:flex-row h-[calc(100dvh-56px-1.5rem)]">
        <Sidebar
          activeGroup={activeGroup}
          activeSub={activeSub}
          activeTab={activeTab}
          bodyRef={bodyRef}
          images={images}
          mobile={mobile}
          route={route}
          setActiveGroup={setActiveGroup}
          setActiveSub={setActiveSub}
          setImages={setImages}
          setNotice={setNotice}
        />

        <Body
          activeGroup={activeGroup}
          activeSub={activeSub}
          activeTab={activeTab}
          bodyRef={bodyRef}
          images={images}
          setActiveGroup={setActiveGroup}
          setImages={setImages}
          setNotice={setNotice}
        />
      </main>
    </div>
  );
}
