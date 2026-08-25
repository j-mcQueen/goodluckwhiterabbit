import { motion } from "framer-motion";
import { triggerBatch } from "./utils/triggerBatch";
import { generateKeys } from "../global/utils/generateKeys";

import BrowseColumns from "./BrowseColumns";

export default function Sidebar({ ...props }) {
  const {
    activeGroup,
    activeSub,
    activeTab,
    bodyRef,
    route,
    sidebarData,
    setActiveGroup,
    setActiveSub,
    setImages,
    setNextStartIndex,
    setNotice,
    setSidebarOpen,
    setStaticKeys,
  } = props;

  const subcategories: string[] = sidebarData[route]?.subcategories ?? [];
  const groups: string[] = Object.keys(sidebarData[route]?.menu[activeSub] ?? {});

  const handleSubcategoryClick = async (j: number) => {
    if (j === activeSub) return; // already active - stay open on its groups

    if (bodyRef) {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }

    try {
      const nextImages = await triggerBatch(
        subcategories[j],
        activeTab,
        1,
        setImages,
        setNotice,
        true,
        0,
        j,
        setActiveSub,
      );

      if (nextImages) {
        setStaticKeys(generateKeys(nextImages.length));
        setNextStartIndex(nextImages.length);
      }

      setActiveGroup(0);
      setSidebarOpen(false);
    } catch (error) {
      setNotice({
        status: true,
        loading: false,
        message: "Something went wrong. Please try again.",
      });
    }
  };

  const handleGroupClick = async (k: number) => {
    if (bodyRef) {
      bodyRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }

    try {
      const nextImages = await triggerBatch(
        subcategories[activeSub],
        activeTab,
        k + 1,
        setImages,
        setNotice,
        true,
        0,
      );

      if (nextImages) {
        setStaticKeys(generateKeys(nextImages.length));
        setNextStartIndex(nextImages.length);
      }

      setActiveGroup(k);
      setSidebarOpen(false);
    } catch (error) {
      setNotice({
        status: true,
        loading: false,
        message: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <motion.aside
      initial={{ height: "0%", opacity: 0 }}
      animate={{ height: "100%", opacity: 1 }}
      exit={{ height: "0%", opacity: 0 }}
      transition={{ type: "spring", bounce: 0, duration: 0.4 }}
      className="absolute left-0 top-0 z-20 w-full text-white overflow-hidden bg-black"
    >
      <BrowseColumns
        subcategories={subcategories}
        groups={groups}
        selectedSub={activeSub}
        onSubcategoryClick={handleSubcategoryClick}
        activeSubIndex={activeSub}
        activeGroupIndex={activeGroup}
        handleGroupClick={handleGroupClick}
      />
    </motion.aside>
  );
}
