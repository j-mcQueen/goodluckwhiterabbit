import { useEffect, useState } from "react";
import { userDashboardHeaderItems } from "./data/header/items";
import { useNavigate } from "react-router-dom";
import { convertToFile } from "../../admin/dashboard/utils/convertToFile";
import { handleDownload } from "./utils/handleDownload";
import JSZip from "jszip";

import Header from "../../global/header/Header";
import MobileHeader from "../../global/header/mobile/Header";
import Views from "./Views";
import StarFilled from "../../../assets/media/icons/StarFilled";
import Loading from "../../global/Loading";

export default function UserDashboard() {
  const navigate = useNavigate();
  const host =
    import.meta.env.VITE_ENV === "production"
      ? import.meta.env.VITE_API_URL
      : "http://localhost:3000/api";

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
  const [loaded, setLoaded] = useState(false); // prevents "nothing to display" message from inadvertently appearing
  const [favourites, setFavourites] = useState([]);
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
        const response = await fetch(`${host}/user/${id}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        if (data) {
          setSpinner(false);
          switch (response.status) {
            case 200:
            case 304:
              if (data.files) files = data.files;
              if (data.name) setUsername(data.name);
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
      setLoaded(true);
    };
    loadImages();
  }, [navigate, host]);

  const createZip = async (
    fileset: { url: string; filename: string; mime: string }[]
  ) => {
    const zip = new JSZip();

    for (let i = 0; i < fileset.length; i++) {
      const image = convertToFile(
        fileset[i].url,
        fileset[i].filename,
        fileset[i].mime
      );
      zip.file(fileset[i].filename, image);
    }

    return await zip.generateAsync({ type: "base64" });
  };

  return (
    <div className="w-outer h-outer overflow-scroll">
      {mobile ? (
        <MobileHeader
          host={host}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          host={host}
          logout={true}
          data={userDashboardHeaderItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}

      {spinner ? (
        <div className="text-rd text-center text-xl pt-5">
          <Loading />
        </div>
      ) : loaded ? (
        <>
          {allImagesets[activeImageset as keyof typeof allImagesets].length >
          0 ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-white xl:text-2xl py-5 max-w-[240px] pl-3">
                    {username.toUpperCase()}
                  </h1>

                  {getError.status ? (
                    <div className="py-5">
                      <p className="text-rd text-lg">{getError.message}</p>
                    </div>
                  ) : null}
                </div>

                <div className="text-white flex flex-col gap-5 items-start pl-3">
                  <button
                    type="button"
                    className="border border-solid border-white text-lg py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
                    onClick={async () => {
                      const url = await createZip(
                        allImagesets[
                          activeImageset as keyof typeof allImagesets
                        ]
                      );

                      return handleDownload(
                        `data:application/zip;base64,${url}`,
                        `${username}-${activeImageset}.zip`
                      );
                    }}
                  >
                    DOWNLOAD: ALL
                  </button>

                  <button
                    type="button"
                    className="border border-solid border-white text-lg flex gap-1 items-center py-1 px-3 xl:hover:border-rd xl:focus:border-rd transition-colors"
                    onClick={async () => {
                      const url = await createZip(favourites);
                      return handleDownload(
                        `data:application/zip;base64,${url}`,
                        `${username}-${activeImageset}.zip`
                      );
                    }}
                  >
                    DOWNLOAD: <StarFilled className="w-5 h-5" red={true} />
                  </button>
                </div>
              </div>

              <main>
                <Views
                  imagesets={allImagesets}
                  activeImageset={activeImageset}
                  favourites={favourites}
                  setFavourites={setFavourites}
                />
              </main>
            </>
          ) : (
            <div className="h-[calc(100dvh-1.5rem-59px)] flex items-center justify-center">
              <hgroup className="text-white flex flex-col items-center justify-stretch">
                <h1 className="text-6xl font-liquid drop-shadow-glo tracking-widest opacity-80">
                  magic is on the way
                </h1>

                <p className="text-xl w-3/5 text-justify pt-5">
                  WE'RE WORKING HARD TO GET THESE PHOTOGRAPHS READY FOR THE
                  GRAND REVEAL - YOU'LL RECEIVE AN EMAIL WHEN THERE ARE UPDATES.
                  THANK YOU FOR YOUR PATIENCE!
                </p>
              </hgroup>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
