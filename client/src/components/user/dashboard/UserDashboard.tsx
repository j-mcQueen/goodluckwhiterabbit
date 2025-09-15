import { useEffect, useState } from "react";
import { determineHost as host } from "../../global/utils/determineHost";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";
import { determineTabs } from "./utils/determineTabs";
import { updateActiveTab } from "./utils/updateActiveTab";
import { motion } from "framer-motion";

import SelectGallery from "./SelectGallery";
import Header from "../../global/header/Header";
import MobileHeader from "../../global/header/mobile/Header";
import Views from "./Views";
import Notice from "../../admin/dashboard/modals/Notice";

export default function UserDashboard() {
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const [user, setUser] = useState({
    _id: "",
    fileCounts: {},
  });
  const [activeTab, setActiveTab] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeImageset, setActiveImageset] = useState("");
  const [spinner, setSpinner] = useState(false);
  const [notice, setNotice] = useState<{
    status: boolean;
    message: string;
    logout: { status: boolean; path: string | null };
  }>({
    status: false,
    message: "",
    logout: { status: false, path: null },
  });
  const [initialized, setInitialized] = useState(false);

  const [images, setImages] = useState({
    snapshots: [],
    keepsake: [],
    core: [],
    socials: [],
  });

  useEffect(() => {
    document.title = "CLIENT GALLERIES — GOOD LUCK WHITE RABBIT";
  }, []);

  useEffect(() => {
    const keys = Object.keys(user.fileCounts);
    setActiveImageset(keys[activeTab]);
  }, [activeTab, user]);

  useEffect(() => {
    const getUser = async () => {
      setSpinner(true);

      const url = document.location.href;
      const regex = /\/user\/([a-zA-Z0-9]+)\//;
      const id = url.match(regex)![1];

      try {
        const response = await fetch(`${host}/user/${id}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          switch (response.status) {
            case 200:
            case 304:
              setUser(data);
              break;

            case 500:
              setNotice(data);
              break;

            default:
              throw new Error("Other");
          }

          return setSpinner(false);
        }
      } catch (error) {
        setNotice({
          status: true,
          message:
            "Something went wrong. Please refresh the page and try again. If the problem persists, please contact GLWR.",
          logout: { status: false, path: null },
        });
        return setSpinner(false);
      }
    };
    getUser();
  }, []);

  const handleSelect = async (targetImageset: string) => {
    updateActiveTab({ targetImageset, setActiveTab, user });
    setActiveIndex(0);
    setInitialized(true);
    setActiveImageset(targetImageset);
    setSpinner(true);

    const data = await executeGenerationChain(
      Array(10).fill({}),
      targetImageset,
      setNotice,
      0,
      10,
      user._id,
      "lg"
    );
    setImages({ ...images, [targetImageset]: data.files });
    if (data.files) setSpinner(false);
  };

  return !initialized ? (
    <SelectGallery
      handleSelect={handleSelect}
      initialized={initialized}
      user={user}
    />
  ) : (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-outer h-outer"
    >
      {mobile ? (
        <MobileHeader
          logout={true}
          data={determineTabs(Object.keys(user.fileCounts))}
          counts={Object.values(user.fileCounts)}
          activeTab={activeTab}
          setActiveIndex={setActiveIndex}
          setActiveTab={setActiveTab}
          handleSelect={handleSelect}
          images={images}
        />
      ) : (
        <Header
          logout={true}
          data={determineTabs(Object.keys(user.fileCounts))}
          activeTab={activeTab}
          setActiveIndex={setActiveIndex}
          setActiveTab={setActiveTab}
          handleSelect={handleSelect}
          images={images}
          dashboard={Object.values(user.fileCounts)}
        />
      )}

      {notice.status === true ? (
        <Notice notice={notice} setNotice={setNotice} />
      ) : null}

      <main>
        <Views
          activeImageset={activeImageset}
          activeIndex={activeIndex}
          images={images}
          setActiveIndex={setActiveIndex}
          setImages={setImages}
          setNotice={setNotice}
          setSpinner={setSpinner}
          spinner={spinner}
          user={user}
        />
      </main>
    </motion.div>
  );
}
