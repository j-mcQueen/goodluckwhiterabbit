import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { mobile } from "../global/utils/determineViewport";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import MobileHeader from "../global/header/mobile/Header";
import Notice from "../global/Notice";

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO", "ART", "DESIGN"];

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(index);
  const [activeSub, setActiveSub] = useState<number | null>(0);
  const [activeGroup, setActiveGroup] = useState<number | null>(0); // an index
  const [images, setImages] = useState<{ [key: string]: Blob[] }>({});
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

    return navigate(newRoute[activeTab.category as keyof typeof newRoute]);
  }, [activeTab, navigate, route]);

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem)] overflow-scroll overflow-x-hidden relative">
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

      <main className="flex flex-col xl:flex-row">
        <Sidebar
          activeGroup={activeGroup}
          activeSub={activeSub}
          activeTab={activeTab}
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
          images={images}
          setActiveGroup={setActiveGroup}
          setImages={setImages}
          setNotice={setNotice}
        />
      </main>
    </div>
  );
}
