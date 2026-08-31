import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import { triggerBatch } from "./utils/triggerBatch";
import { resolveGroupId } from "./utils/resolveGroupId";
import { resolveGroupIndex } from "./utils/resolveGroupIndex";
import { mobile } from "../global/utils/determineViewport";
import { generateKeys } from "../global/utils/generateKeys";
import { determineHost as host } from "../global/utils/determineHost";
import { playSound } from "../global/utils/sound";
import { PortfolioSidebarData } from "./types/PortfolioSidebarData";
import { DISABLED_CATEGORY_ROUTES } from "./disabledCategories";

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

const CATEGORY_ROUTES = ["/photo", "/art", "/design"];

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO", "ART", "DESIGN"];

  const navigate = useNavigate();
  const location = useLocation();
  const bodyRef = useRef<HTMLElement>();
  const mainRef = useRef<HTMLElement>(null);
  const loadTrackerRef = useRef(false); // tracks when to pull first set of images

  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarRect, setSidebarRect] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<number>(index);
  const [browseTab, setBrowseTab] = useState<number>(index);
  const [browseSub, setBrowseSub] = useState<number>(0);
  const [activeSub, setActiveSub] = useState<number>(
    (location.state as { subIndex?: number } | null)?.subIndex ?? 0,
  );
  const [activeGroup, setActiveGroup] = useState<number>(0); // a position in the sidebar list - cosmetic only
  const [activeGroupId, setActiveGroupId] = useState<string | undefined>(
    undefined,
  ); // real S3 groupId - authoritative for all data-fetching decisions
  const [images, setImages] = useState<{ blob: Blob; group: string }[]>([]);
  const [staticKeys, setStaticKeys] = useState<string[]>(generateKeys(10));
  const [nextStartIndex, setNextStartIndex] = useState<number>(10);
  const [sidebarData, setSidebarData] =
    useState<PortfolioSidebarData>(EMPTY_SIDEBAR_DATA);
  const [mobileSubIndex, setMobileSubIndex] = useState<number>(0);
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

  // mobile nav is scoped to the current route (no primary-category
  // switching), so position only needs to track subcategory + group within it
  const handleMobileGroupSelect = (
    subIndex: number,
    groupIndex: number,
    groupId: string,
  ) => {
    setMobileSubIndex(subIndex);
    setActiveGroup(groupIndex);
    setActiveGroupId(groupId);
  };

  // keeps the cosmetic sidebar/nav highlight index in sync when
  // activeGroupId changes without a known index - the only case is organic
  // scroll (Unit.tsx knows the real groupId of what just scrolled into view
  // but not its position in the sidebar list); click-driven changes already
  // set both directly, so this is a no-op for those
  useEffect(() => {
    if (!activeGroupId) return;

    const subIndexForLookup = mobile ? mobileSubIndex : activeSub;
    const derivedIndex = resolveGroupIndex(
      sidebarData,
      route,
      subIndexForLookup,
      activeGroupId,
    );

    if (derivedIndex !== undefined && derivedIndex !== activeGroup) {
      setActiveGroup(derivedIndex);
    }
  }, [activeGroupId, sidebarData, route, mobileSubIndex, activeSub, activeGroup]);

  // clicking your own active tab toggles its sidebar; clicking a different
  // tab opens/keeps open a *browse* session for that category without
  // committing (no route/activeTab change) until a pick is made within it
  const handleCategoryTabClick = (tabIndex: number) => {
    if (tabIndex !== browseTab) {
      setBrowseTab(tabIndex);
      setBrowseSub(0);
    }

    if (tabIndex === activeTab) {
      setSidebarOpen((prev) => !prev);
    } else {
      setSidebarOpen(true);
    }
  };

  // keeps the desktop sidebar overlay sized/positioned to exactly match the
  // active category tab in the header, so it reads as a dropdown from that tab
  const handleActiveTabRectChange = (
    rect: { left: number; width: number } | null,
  ) => {
    const mainRect = mainRef.current?.getBoundingClientRect();

    if (!rect || !mainRect) {
      setSidebarRect(null);
      return;
    }

    setSidebarRect({ left: rect.left - mainRect.left, width: rect.width });
  };

  const mobileSubName = sidebarData[route]?.subcategories[mobileSubIndex] ?? "";
  const mobileGroupName =
    Object.keys(sidebarData[route]?.menu[mobileSubIndex] ?? {})[activeGroup] ??
    "";

  const mobileBreadcrumb =
    mobile && mobileSubName && mobileGroupName
      ? {
          category: headerItems[index],
          subcategory: mobileSubName,
          group: mobileGroupName,
        }
      : null;

  // a category tab is only navigable once the admin has actually added a
  // subcategory to it - matches the existing "COMING SOON" disabled-tab
  // convention already used by Header/ListItem for the user dashboard.
  // Categories in DISABLED_CATEGORY_ROUTES are forced unavailable regardless
  // of content (temporary manual override).
  const categoryAvailability = CATEGORY_ROUTES.map((categoryRoute) =>
    !DISABLED_CATEGORY_ROUTES.includes(categoryRoute) &&
    (sidebarData[categoryRoute]?.subcategories.length ?? 0) > 0
      ? 1
      : 0,
  );

  useEffect(() => {
    if (DISABLED_CATEGORY_ROUTES.includes(route)) {
      navigate("/");
    }
  }, [route, navigate]);

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
    // don't fight the disabled-category redirect above - without this guard,
    // this effect re-navigates to the disabled route on the same tick since
    // activeTab still holds that category's index, clobbering the redirect
    if (DISABLED_CATEGORY_ROUTES.includes(route)) return;

    const newRoute = {
      0: "/photo",
      1: "/art",
      2: "/design",
    };

    const target = newRoute[activeTab as keyof typeof newRoute];

    // already here (true on every mount, since activeTab starts out synced
    // to route) - skip the redundant same-path navigate, which would wipe
    // any incoming location.state (e.g. the landing page's subIndex/
    // playSoundOnLoad) before anything downstream gets a chance to read it
    if (target === route) return;

    navigate(target);
  }, [activeTab, navigate, route]);

  useEffect(() => {
    // provide mechanism for initial images to autoload upon primary category change
    async function fetchData() {
      const groupId = resolveGroupId(sidebarData, route, activeSub, 0);
      if (!groupId) return; // subcategory has no groups yet

      try {
        const nextImages = await triggerBatch(
          activeSubName,
          activeTab,
          groupId,
          setImages,
          setNotice,
          true,
          0,
        );

        if (nextImages) {
          setStaticKeys(generateKeys(nextImages.length));
          setNextStartIndex(nextImages.length);

          // only the landing page's subcategory pick asks for this - normal
          // in-portfolio category/tab switches stay silent
          if (
            (location.state as { playSoundOnLoad?: boolean } | null)
              ?.playSoundOnLoad
          ) {
            playSound();
          }
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
      setActiveGroupId(resolveGroupId(sidebarData, route, activeSub, 0));
      fetchData();
      return;
    } else return;
  }, [activeSub, activeTab, activeSubName, location.state, route, sidebarData]);

  return (
    <div className="w-[calc(100dvw-var(--frame)-2px)] h-[calc(100dvh-var(--frame))] overflow-hidden relative">
      <ContactDialog
        contactOpen={contactOpen}
        setContactOpen={setContactOpen}
      />
      <NoticeDialog notice={notice} setNotice={setNotice} />

      {mobile ? (
        <Nav
          activeGroupIndex={activeGroup}
          activeSubIndex={mobileSubIndex}
          categoryIndex={index}
          onGroupSelect={handleMobileGroupSelect}
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
          dashboard={categoryAvailability}
          loadTrackerRef={loadTrackerRef}
          logout={false}
          onActiveTabRectChange={handleActiveTabRectChange}
          onCategoryTabClick={handleCategoryTabClick}
          setActiveTab={setActiveTab}
          setContactOpen={setContactOpen}
        />
      )}

      <main
        ref={mainRef}
        className="relative flex flex-col xl:flex-row h-[calc(100dvh-51px-var(--frame))]"
      >
        <AnimatePresence>
          {!mobile && sidebarOpen && (
            <Sidebar
              key="portfolio-sidebar"
              activeGroup={activeGroup}
              activeSub={activeSub}
              activeTab={activeTab}
              bodyRef={bodyRef}
              browseSub={browseSub}
              browseTab={browseTab}
              route={CATEGORY_ROUTES[browseTab]}
              sidebarData={sidebarData}
              sidebarRect={sidebarRect}
              setActiveGroup={setActiveGroup}
              setActiveGroupId={setActiveGroupId}
              setActiveSub={setActiveSub}
              setActiveTab={setActiveTab}
              setImages={setImages}
              setNextStartIndex={setNextStartIndex}
              setNotice={setNotice}
              setSidebarOpen={setSidebarOpen}
              setStaticKeys={setStaticKeys}
            />
          )}
        </AnimatePresence>

        <Body
          activeGroupId={activeGroupId}
          activeSub={activeSubName}
          activeTab={activeTab}
          bodyRef={bodyRef}
          breadcrumb={mobileBreadcrumb}
          images={images}
          nextStartIndex={nextStartIndex}
          setActiveGroupId={setActiveGroupId}
          setContactOpen={setContactOpen}
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
