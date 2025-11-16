import { sidebar_data } from "./data/sidebar/data";

import Menu from "./Menu";

export default function Sidebar({ ...props }) {
  const { activeTab, route } = props;

  const categoryData = sidebar_data[route as keyof typeof sidebar_data].menu;

  return (
    <aside className="flex flex-col xl:min-w-[245px] xl:max-w-[245px] h-[calc(100dvh-57px-1.5rem)] text-white">
      <p
        className={`${activeTab !== 0 ? "h-full" : null} flex xl:block items-center justify-between px-5 pb-5 pt-3 border-r border-solid border-white text-lg leading-tight`}
      >
        {sidebar_data[route as keyof typeof sidebar_data].bio}
      </p>

      {activeTab === 0 ? <Menu data={categoryData} /> : null}
    </aside>
  );
}
