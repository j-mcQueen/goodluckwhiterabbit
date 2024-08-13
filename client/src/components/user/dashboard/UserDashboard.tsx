import { useState } from "react";
import { userDashboardHeaderItems } from "./data/header/items";
import Header from "../../global/header/Header";
import MobileHeader from "../../global/header/mobile/Header";

export default function UserDashboard() {
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const [activeTab, setActiveTab] = useState(0);

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

      <main>
        <section></section>
      </main>
    </div>
  );
}
