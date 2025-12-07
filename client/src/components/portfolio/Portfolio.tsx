import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { mobile } from "../global/utils/determineViewport";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";
import MobileHeader from "../global/header/mobile/Header";

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const headerItems = ["PHOTO", "ART", "DESIGN"];

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(index);

  useEffect(() => {
    const newRoute = {
      0: "/photo",
      1: "/art",
      2: "/design",
    };

    return navigate(newRoute[activeTab.category as keyof typeof newRoute]);
  }, [activeTab, navigate, route]);

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem)] overflow-scroll overflow-x-hidden relative">
      {mobile ? (
        <MobileHeader
          activeTab={activeTab}
          data={headerItems}
          logout={false}
          setActiveTab={setActiveTab}
        />
      ) : (
        <Header
          logout={false}
          data={headerItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dashboard={false}
        />
      )}

      <main className="flex flex-col xl:flex-row">
        <Sidebar
          activeTab={activeTab}
          category={headerItems[index]}
          mobile={mobile}
          route={route}
        />

        <Body />
      </main>
    </div>
  );
}
