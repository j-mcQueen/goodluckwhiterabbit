import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "framer-motion";
import { resolveGroupId } from "./utils/resolveGroupId";
import { resolveGroupIndex } from "./utils/resolveGroupIndex";
import { resolvePortfolioSlugs, buildPortfolioPath } from "./utils/resolvePortfolioPath";
import { resolveGroupHasMemo } from "./utils/resolveGroupHasMemo";
import { loadPortfolioBlocksForGroup } from "./utils/loadPortfolioBlocksForGroup";
import { mobile } from "../global/utils/determineViewport";
import { determineHost as host } from "../global/utils/determineHost";
import { playSound } from "../global/utils/sound";
import { PortfolioSidebarData } from "./types/PortfolioSidebarData";
import { PortfolioBlock } from "./types/PortfolioBlock";
import { DISABLED_CATEGORY_ROUTES } from "./disabledCategories";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import ContactDialog from "./ContactDialog";
import Nav from "./mobile/Nav";
import NoticeDialog from "./NoticeDialog";

const EMPTY_SIDEBAR_DATA: PortfolioSidebarData = {
  "/photo": { title: "", subcategories: [], menu: [], groupHasMemo: [] },
  "/art": { title: "", subcategories: [], menu: [], groupHasMemo: [] },
  "/design": { title: "", subcategories: [], menu: [], groupHasMemo: [] },
};

const CATEGORY_ROUTES = ["/photo", "/art", "/design"];

// matches the Sidebar's exit spring - outgoing content fades over the same
// span, so both are gone before LOADING appears
const CONTENT_FADE_MS = 400;

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO", "ART", "DESIGN"];

  const navigate = useNavigate();
  const location = useLocation();
  const { sub: subParam, group: groupParam } = useParams();
  const bodyRef = useRef<HTMLElement>();
  const mainRef = useRef<HTMLElement>(null);

  const [contactOpen, setContactOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarRect, setSidebarRect] = useState<{
    left: number;
    width: number;
  } | null>(null);
  const [browseTab, setBrowseTab] = useState<number>(index);
  const [browseSub, setBrowseSub] = useState<number>(0);
  const [blocks, setBlocks] = useState<PortfolioBlock[]>([]);
  const [nextStartIndex, setNextStartIndex] = useState<number>(10);
  // true while a navigation has faded the outgoing content out and the
  // incoming content hasn't been committed yet
  const [contentHidden, setContentHidden] = useState<boolean>(false);
  // the category/subcategory the rendered `blocks` actually belong to -
  // Body pages and lays out from this rather than from the URL, since the
  // two briefly disagree mid-navigation (the URL only moves once a click's
  // content has loaded, and back/forward moves the URL before it has)
  const [displayed, setDisplayed] = useState<{ tab: number; subIndex: number }>({
    tab: index,
    subIndex: 0,
  });
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

  // `${route}|${subIndex}|${groupId}` of what's currently on screen - the
  // URL effect below skips loading when the URL already points at it,
  // which is what lets clicks (load, then navigate) and scrolling (replace
  // the URL, no load) update the URL without a reload. A ref rather than
  // location.state: history entries keep their state, so a flag stored
  // there would wrongly suppress a load on back/forward.
  const loadedTargetRef = useRef<string | null>(null);
  // only the newest load may commit - a slower earlier one (a click, then
  // back before it resolved) must not land on top of it
  const loadSeqRef = useRef(0);
  // scroll reports from the outgoing content are ignored while a load is in
  // flight, or they'd rewrite the URL the user just navigated to
  const loadingRef = useRef(false);
  const soundPlayedRef = useRef(false);
  // read inside loadGroup without making it depend on `blocks`
  const hasContentRef = useRef(false);
  hasContentRef.current = blocks.length > 0;

  // the URL is the source of truth for the subcategory/group shown as
  // active in the sidebar, mobile nav and header - desktop and mobile share
  // it (there's no separate mobile subcategory index)
  const urlTarget = resolvePortfolioSlugs(sidebarData, route, subParam, groupParam);
  const activeSub = urlTarget?.subIndex ?? 0;
  const activeGroup = urlTarget?.groupIndex ?? 0;

  const displayedRoute = CATEGORY_ROUTES[displayed.tab];
  const displayedSubName =
    sidebarData[displayedRoute]?.subcategories[displayed.subIndex] ?? "";

  // loads a group into view - shared by clicks and the URL effect, so the
  // fetch/empty/error handling lives in exactly one place. Resolves true
  // once the group is on screen; false when it was empty (a notice has
  // been raised), failed, or was superseded by a newer load.
  const loadGroup = useCallback(
    async (targetRoute: string, subIndex: number, groupId: string) => {
      const seq = ++loadSeqRef.current;
      loadingRef.current = true;

      // the outgoing content fades out first (alongside the sidebar's own
      // exit), so LOADING appears over an empty body and the jump back to
      // the top happens while nothing is visible - rather than as a smooth
      // scroll up through the old content while the new content swaps in
      if (hasContentRef.current) {
        setContentHidden(true);
        await new Promise((resolve) => setTimeout(resolve, CONTENT_FADE_MS));
        if (seq !== loadSeqRef.current) return false;
      }

      const tab = CATEGORY_ROUTES.indexOf(targetRoute);
      const isMemoGroup = (id: string) =>
        resolveGroupHasMemo(sidebarData, targetRoute, subIndex, id);

      try {
        const { blocks: nextBlocks, nextStartIndex: resolvedStart, empty } =
          await loadPortfolioBlocksForGroup({
            activeSub: sidebarData[targetRoute]?.subcategories[subIndex] ?? "",
            activeTab: tab,
            groupId,
            hasMemo: isMemoGroup(groupId),
            isMemoGroup,
            setNotice,
          });

        if (seq !== loadSeqRef.current) return false;
        loadingRef.current = false;
        if (empty) {
          // notice already raised - stay on the current group, right where
          // it was left (it was only hidden, never scrolled)
          setContentHidden(false);
          return false;
        }

        bodyRef.current?.scrollTo({ top: 0 });
        setBlocks(nextBlocks);
        setNextStartIndex(resolvedStart);
        setDisplayed({ tab, subIndex });
        loadedTargetRef.current = `${targetRoute}|${subIndex}|${groupId}`;
        setContentHidden(false);
        return true;
      } catch (error) {
        if (seq !== loadSeqRef.current) return false;
        loadingRef.current = false;
        setContentHidden(false);
        setNotice({
          status: true,
          loading: false,
          message: "Something went wrong. Please try again.",
        });
        return false;
      }
    },
    [sidebarData],
  );

  // sidebar/mobile-nav picks: load first, then push the URL, so an empty
  // group never leaves a history entry (or a URL) pointing at it
  const handleNavigate = async (
    targetRoute: string,
    subIndex: number,
    groupIndex: number,
  ) => {
    const groupId = resolveGroupId(sidebarData, targetRoute, subIndex, groupIndex);
    if (!groupId) return false; // subcategory has no groups yet

    const loaded = await loadGroup(targetRoute, subIndex, groupId);
    if (!loaded) return false;

    const path = buildPortfolioPath(sidebarData, targetRoute, subIndex, groupIndex);
    // re-picking the group already in the URL refreshes it in place rather
    // than stacking a duplicate history entry
    navigate(path, { replace: path === window.location.pathname });
    return true;
  };

  // organic scroll into another group (Body's scroll line check reports the
  // real groupId of whatever crossed its line) - replaces the URL without
  // loading anything, since that content is already on screen
  const handleGroupScrolledIntoView = (groupId: string) => {
    if (loadingRef.current) return false;

    const groupIndex = resolveGroupIndex(
      sidebarData,
      displayedRoute,
      displayed.subIndex,
      groupId,
    );
    if (groupIndex === undefined) return false;

    loadedTargetRef.current = `${displayedRoute}|${displayed.subIndex}|${groupId}`;
    const path = buildPortfolioPath(
      sidebarData,
      displayedRoute,
      displayed.subIndex,
      groupIndex,
    );
    if (path !== window.location.pathname) navigate(path, { replace: true });
    return true;
  };

  // clicking the tab whose sidebar is currently showing closes it; clicking
  // any other tab (or any tab while closed) opens a *browse* session for that
  // category without committing (no URL change) until a pick is made within it
  const handleCategoryTabClick = (tabIndex: number) => {
    if (sidebarOpen && tabIndex === browseTab) {
      setSidebarOpen(false);
      return;
    }

    if (tabIndex !== browseTab) {
      setBrowseTab(tabIndex);
      setBrowseSub(0);
    }

    setSidebarOpen(true);
  };

  // keeps the desktop sidebar overlay sized/positioned to exactly match the
  // browsed category tab in the header, so it reads as a dropdown from that tab
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

  const activeSubName = sidebarData[route]?.subcategories[activeSub] ?? "";
  const activeGroupName =
    Object.keys(sidebarData[route]?.menu[activeSub] ?? {})[activeGroup] ?? "";

  const mobileBreadcrumb =
    mobile && activeSubName && activeGroupName
      ? {
          category: headerItems[index],
          subcategory: activeSubName,
          group: activeGroupName,
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

  // a category change that didn't come from a pick in the dropdown
  // (back/forward) leaves a stale browse session behind - re-anchor it
  useEffect(() => {
    setBrowseTab(index);
    setBrowseSub(0);
    setSidebarOpen(false);
  }, [index]);

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

  // URL -> content: direct links, the landing page's subcategory pick, and
  // back/forward all arrive here. Clicks and scrolling have already put the
  // content on screen by the time they change the URL, so loadedTargetRef
  // matches and this does nothing for them.
  useEffect(() => {
    // don't fight the disabled-category redirect above
    if (DISABLED_CATEGORY_ROUTES.includes(route)) return;

    // waits for the taxonomy - this re-runs once sidebarData has loaded
    const target = resolvePortfolioSlugs(sidebarData, route, subParam, groupParam);
    if (!target) return;

    // bare category/subcategory URLs, renamed or unknown slugs, and stray
    // casing all settle on the one canonical URL for what will be shown -
    // carrying location.state through so playSoundOnLoad survives
    const canonical = buildPortfolioPath(
      sidebarData,
      route,
      target.subIndex,
      target.groupIndex,
    );
    if (canonical !== location.pathname) {
      navigate(canonical, { replace: true, state: location.state });
      return;
    }

    if (!target.groupId) return; // subcategory has no groups yet
    if (loadedTargetRef.current === `${route}|${target.subIndex}|${target.groupId}`) {
      return;
    }

    // only the landing page's subcategory pick asks for this - normal
    // in-portfolio navigation stays silent
    const wantsSound = Boolean(
      (location.state as { playSoundOnLoad?: boolean } | null)?.playSoundOnLoad,
    );

    loadGroup(route, target.subIndex, target.groupId).then((loaded) => {
      if (loaded && wantsSound && !soundPlayedRef.current) {
        soundPlayedRef.current = true;
        playSound();
      }
    });
  }, [
    groupParam,
    loadGroup,
    location.pathname,
    location.state,
    navigate,
    route,
    sidebarData,
    subParam,
  ]);

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
          activeSubIndex={activeSub}
          onNavigate={(subIndex: number, groupIndex: number) =>
            handleNavigate(route, subIndex, groupIndex)
          }
          route={route}
          setContactOpen={setContactOpen}
          sidebarData={sidebarData}
        />
      ) : (
        <Header
          activeTab={index}
          anchorTab={browseTab}
          data={headerItems}
          dashboard={categoryAvailability}
          logout={false}
          onActiveTabRectChange={handleActiveTabRectChange}
          onCategoryTabClick={handleCategoryTabClick}
          setActiveTab={() => {}} // portfolio tabs only open the browse dropdown (onCategoryTabClick)
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
              activeTab={index}
              browseSub={browseSub}
              browseTab={browseTab}
              onNavigate={handleNavigate}
              route={CATEGORY_ROUTES[browseTab]}
              sidebarData={sidebarData}
              sidebarRect={sidebarRect}
              setSidebarOpen={setSidebarOpen}
            />
          )}
        </AnimatePresence>

        <Body
          activeSub={displayedSubName}
          activeSubIndex={displayed.subIndex}
          activeTab={displayed.tab}
          blocks={blocks}
          bodyRef={bodyRef}
          hidden={contentHidden}
          breadcrumb={mobileBreadcrumb}
          nextStartIndex={nextStartIndex}
          route={displayedRoute}
          onGroupInView={handleGroupScrolledIntoView}
          setBlocks={setBlocks}
          setContactOpen={setContactOpen}
          setNextStartIndex={setNextStartIndex}
          setNotice={setNotice}
          sidebarData={sidebarData}
        />
      </main>
    </div>
  );
}
