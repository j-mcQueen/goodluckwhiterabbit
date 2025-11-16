import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Header from "../global/header/Header";
import Sidebar from "./Sidebar";
import Body from "./Body";

export default function Portfolio({ ...props }) {
  const { route, index } = props;
  const navigate = useNavigate();
  const headerItems = ["PHOTO", "ART", "DESIGN"];

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
      <Header
        logout={false}
        data={headerItems}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dashboard={false}
      />

      <main className="flex">
        <Sidebar activeTab={activeTab} route={route} />

        <Body />
      </main>
    </div>
  );
}
