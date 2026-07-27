import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { triggerBatch } from "./utils/triggerBatch";
import { mobile } from "../global/utils/determineViewport";
import { generateKeys } from "../global/utils/generateKeys";
import { determineHost as host } from "../global/utils/determineHost";
import { PortfolioSidebarData } from "./types/PortfolioSidebarData";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import ContactDialog from "./ContactDialog";
import Nav from "./mobile/Nav";
import NoticeDialog from "./NoticeDialog";

const EMPTY_SIDEBAR_DATA: PortfolioSidebarData = {
  "/photo": { title: "", subcategories: [], menu: [] },
  "/art": { title: "", subcategories: [], menu: [] },
  "/design": { title: "", subcategories: [], menu: [] },
};

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
  const [staticKeys, setStaticKeys] = useState<string[]>(generateKeys(10));
  const [nextStartIndex, setNextStartIndex] = useState<number>(10);
  const [sidebarData, setSidebarData] =
    useState<PortfolioSidebarData>(EMPTY_SIDEBAR_DATA);
  const [notice, setNotice] = useState<{
    status: boolean;
    loading: boolean;
    message: string | null;
  }>({
    status: false,
    loading: false,
    message: null,
  });

  const activeSubName = sidebarData[route]?.subcategories[activeSub] ?? "";

  useEffect(() => {
    const fetchTaxonomy = async () => {
      try {
        const response = await fetch(`${host}/portfolio/taxonomy`, {
          method: "GET",
          headers: { Accept: "application/json" },
        });
        if (response.status === 200) {
          setSidebarData(await response.json());
        }
      } catch (error) {
        // leave sidebarData at its empty default - the sidebar/nav render
        // with no subcategories rather than crashing
      }
    };

    fetchTaxonomy();
  }, []);

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
        const nextImages = await triggerBatch(
          activeSubName,
          activeTab,
          1,
          setImages,
          setNotice,
          true,
          0,
        );

        if (nextImages) {
          setStaticKeys(generateKeys(nextImages.length));
          setNextStartIndex(nextImages.length);
        }
      } catch (error) {
        setNotice({
          status: true,
          loading: false,
          message: `There was a problem. It's possible there might not be images here. More info: ${error}`,
        });
      }
    }

    // wait for the taxonomy fetch to resolve a real subcategory name before
    // fetching images - this re-runs once sidebarData finishes loading
    if (!activeSubName) return;

    if (!loadTrackerRef.current) {
      // only triggers when the primary category has changed
      loadTrackerRef.current = true;
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      setActiveGroup(0);
      fetchData();
      return;
    } else return;
  }, [activeSub, activeTab, activeSubName]);

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
          sidebarData={sidebarData}
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

      <main className="flex flex-col xl:flex-row h-[calc(100dvh-51px-1.5rem)]">
        {mobile ? null : (
          <Sidebar
            activeGroup={activeGroup}
            activeSub={activeSub}
            activeSubName={activeSubName}
            activeTab={activeTab}
            bodyRef={bodyRef}
            images={images}
            mobile={mobile}
            route={route}
            sidebarData={sidebarData}
            setActiveGroup={setActiveGroup}
            setActiveSub={setActiveSub}
            setImages={setImages}
            setNextStartIndex={setNextStartIndex}
            setNotice={setNotice}
            setStaticKeys={setStaticKeys}
          />
        )}

        <Body
          activeGroup={activeGroup}
          activeSub={activeSubName}
          activeTab={activeTab}
          bodyRef={bodyRef}
          images={images}
          nextStartIndex={nextStartIndex}
          setActiveGroup={setActiveGroup}
          setImages={setImages}
          setNextStartIndex={setNextStartIndex}
          setNotice={setNotice}
          setStaticKeys={setStaticKeys}
          staticKeys={staticKeys}
        />
      </main>
    </div>
  );
}
