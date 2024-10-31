import { useEffect, useState } from "react";
import { userDashboardHeaderItems } from "./data/header/items";
import { determineHost as host } from "../../global/utils/determineHost";
import { executeGenerationChain } from "../../global/utils/executeGenerationChain";
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
    fileCounts: { previews: 0, full: 0, socials: 0 },
  });
  const [activeTab, setActiveTab] = useState(0);
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
    previews: [],
    full: [],
    socials: [],
  });

  useEffect(() => {
    document.title = "CLIENT GALLERIES — GOOD LUCK WHITE RABBIT";
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 0:
        setActiveImageset("previews");
        break;

      case 1:
        setActiveImageset("full");
        break;

      case 2:
        setActiveImageset("socials");
        break;
    }
  }, [activeTab]);

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
    setInitialized(true);
    setActiveImageset(targetImageset);
    setSpinner(true);

    const data = await executeGenerationChain(
      Array(10).fill({}),
      targetImageset,
      setNotice,
      0,
      10,
      user._id
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
      className="w-outer h-outer overflow-scroll"
    >
      {mobile ? (
        <MobileHeader
          host={host}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboard={[
            user.fileCounts["previews"],
            user.fileCounts["full"],
            user.fileCounts["socials"],
          ]}
        />
      ) : (
        <Header
          host={host}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboard={[
            user.fileCounts["previews"],
            user.fileCounts["full"],
            user.fileCounts["socials"],
          ]}
        />
      )}

      {notice.status === true ? (
        <Notice notice={notice} setNotice={setNotice} />
      ) : null}

      <main>
        <Views
          activeImageset={activeImageset}
          images={images}
          imageset={images[activeImageset as keyof typeof images]}
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
