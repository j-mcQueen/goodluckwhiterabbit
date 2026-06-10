import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { triggerBatch } from "./utils/triggerBatch";
import { mobile } from "../global/utils/determineViewport";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import ContactDialog from "./ContactDialog";
import Nav from "./mobile/Nav";
import NoticeDialog from "./NoticeDialog";

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO"];

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
      <ContactDialog
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
      />
      <NoticeDialog notice={notice} setNotice={setNotice} />

      {mobile ? (
        <Nav
          categories={headerItems}
          route={route}
          setContactOpen={setContactOpen}
          setImages={setImages}
          setNotice={setNotice}
        />
      ) : (
        <Header
          activeTab={activeTab}
          data={headerItems}
          dashboard={false}
          loadTrackerRef={loadTrackerRef}
          logout={false}
          setActiveTab={setActiveTab}
          setContactOpen={setContactOpen}
        />
      )}

      <main className="flex flex-col xl:flex-row h-[calc(100dvh-56px-1.5rem)]">
        {mobile ? null : (
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
        )}

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
