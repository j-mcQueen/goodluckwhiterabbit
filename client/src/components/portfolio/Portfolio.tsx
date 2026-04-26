import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { triggerBatch } from "./utils/triggerBatch";
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
  const bodyRef = useRef<HTMLElement>();
  const loadTrackerRef = useRef(false); // tracks when to pull first set of images

  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(index);
  const [activeSub, setActiveSub] = useState<number>(0);
  const [activeGroup, setActiveGroup] = useState<number>(0); // an index
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

  useEffect(() => {
    // provide mechanism for initial images to autoload upon primary category change
    async function fetchData() {
      try {
        await triggerBatch(
          String(activeSub),
          activeTab,
          1,
          setImages,
          setNotice,
          true,
          0,
        );
      } catch (error) {
        setNotice({
          status: true,
          loading: false,
          message: `There was a problem. It's possible there might not be images here. More info: ${error}`,
        });
      }
    }

    if (!loadTrackerRef.current) {
      // only triggers when the primary category has changed
      loadTrackerRef.current = true;
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setActiveGroup(0);
      fetchData();
      return;
    } else return;
  }, [activeSub, activeTab]);

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
          loadTrackerRef={loadTrackerRef}
          logout={false}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          activeTab={activeTab}
          data={headerItems}
          dashboard={false}
          loadTrackerRef={loadTrackerRef}
          logout={false}
          setActiveTab={setActiveTab}
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
