import { useEffect, useState } from "react";
import { userDashboardHeaderItems } from "./data/header/items";
import { determineHost } from "./utils/determineHost";

import Header from "../../global/header/Header";
import MobileHeader from "../../global/header/mobile/Header";
import Views from "./Views";
import Loading from "../../global/Loading";
import Splash from "./Splash";
import Notice from "../../admin/dashboard/modals/Notice";

export default function UserDashboard() {
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const [user, setUser] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [activeImageset, setActiveImageset] = useState("previews");
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
  const [activated, setActivated] = useState({
    previews: false,
    full: false,
    socials: false,
  });
  const [images, setImages] = useState({
    previews: { urls: [], files: [] },
    full: { urls: [], files: [] },
    socials: { urls: [], files: [] },
  });

  const [userRetrieved, setUserRetrieved] = useState(false);

  useEffect(() => {
    document.title = "CLIENT GALLERIES — GOOD LUCK WHITE RABBIT";
  }, []);

  useEffect(() => {
    switch (activeTab) {
      case 0:
        setActiveImageset("previews");
        setActivated({ previews: true, full: false, socials: false });
        break;

      case 1:
        setActiveImageset("full");
        setActivated({ previews: false, full: true, socials: false });
        break;

      case 2:
        setActiveImageset("socials");
        setActivated({ previews: false, full: false, socials: true });
        break;
    }
  }, [activeTab]);

  useEffect(() => {
    const getUser = async () => {
      setSpinner(true);

      const host = determineHost();
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
              setUserRetrieved(true);
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

    // TODO retrieve user information
    // we are trying to determine whether an imageset has files uploaded to it
    // if true, then we display a "splash" page with a button on it which when clicked, runs the function to generate presigned urls for that imageset, which in turn runs the function to generate files from those urls, which in turn renders the first set of images to the user
    // in order for this to work properly, when an admin adds clients, the count of files inside the user data should contain the number of files actually uploaded rather than how many files were first added at the start
  }, []);

  return (
    <div className="w-outer h-outer overflow-scroll">
      {mobile ? (
        <MobileHeader
          host={determineHost()}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          host={determineHost()}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {notice.status === true ? (
        <Notice notice={notice} setNotice={setNotice} />
      ) : null}

      {spinner === true ? (
        // user is being retrieved, so indicate to the user that an action is progress
        <div className="text-rd text-center text-xl pt-5">
          <Loading />
        </div>
      ) : null}

      {userRetrieved === true &&
      activated[activeImageset as keyof typeof activated] === false ? (
        // data has been retrieved, but user has not clicked the enter button yet
        <Splash
          user={user}
          setImages={setImages}
          activated={activated}
          setActivated={setActivated}
          setNotice={setNotice}
          activeImageset={activeImageset}
        />
      ) : null}

      {userRetrieved === true &&
      activated[activeImageset as keyof typeof activated] === true ? (
        // data has been retrieved and the user has performed the action to see their images
        <main>
          <Views
            user={user}
            images={images[activeImageset as keyof typeof images]}
            setImages={setImages}
            activeImageset={activeImageset}
          />
        </main>
      ) : null}
    </div>
  );
}
