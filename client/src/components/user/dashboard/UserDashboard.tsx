import { useEffect, useState } from "react";
import { userDashboardHeaderItems } from "./data/header/items";
import { useNavigate } from "react-router-dom";

import Header from "../../global/header/Header";
import MobileHeader from "../../global/header/mobile/Header";
import Spinner from "../../../assets/media/icons/Spinner";
import Views from "./Views";

export default function UserDashboard() {
  const navigate = useNavigate();
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const [activeTab, setActiveTab] = useState(0);
  const [activeImageset, setActiveImageset] = useState("previews");
  const [spinner, setSpinner] = useState(false);
  const [getError, setGetError] = useState({ status: false, message: "" });
  const [allImagesets, setAllImagesets] = useState({
    previews: [],
    full: [],
    socials: [],
  });
  const [username, setUsername] = useState("");

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
    const loadImages = async () => {
      setSpinner(true);
      const url = document.location.href;
      const regex = /\/user\/([a-zA-Z0-9]+)\//;
      const id = url.match(regex)![1];

      let files;
      try {
        const response = await fetch(`http://localhost:3000/user/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          setSpinner(false);
          switch (response.status) {
            case 200:
            case 304:
              files = data.files;
              setUsername(data.name);
              break;

            case 404:
              return setGetError({ status: true, message: data.message });

            default:
              throw new TypeError(
                "There was an unexpected error. We are logging you out to keep things secure. Please log back in and try again. If the problem persists, contact support."
              );
          }
        }
      } catch (err) {
        setSpinner(false);
        setGetError({
          status: true,
          message: (err as Error).message,
        });

        setTimeout(() => {
          return navigate("/portal");
        }, 10000);
      }

      setAllImagesets(files);
    };

    if (allImagesets[activeImageset as keyof typeof allImagesets].length === 0)
      loadImages(); // only run the effect if the imageset has not been populated
  }, [activeImageset, allImagesets, navigate]);

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      {mobile ? (
        <MobileHeader
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      <div>
        <h1>{username}</h1>
      </div>

      <main>
        {spinner ? <Spinner className="w-[18px] h-[18px]" /> : null}
        {getError ? (
          <div className="">
            <p className="text-rd text-lg p-3">{getError.message}</p>
          </div>
        ) : null}

        <Views imagesets={allImagesets} />
      </main>
    </div>
  );
}
