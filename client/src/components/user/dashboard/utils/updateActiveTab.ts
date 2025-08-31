import { determineTabs } from "./determineTabs";

export const updateActiveTab = ({ ...params }) => {
  const { targetImageset, setActiveTab, user } = params;

  const tabs = determineTabs(Object.keys(user.fileCounts));
  const index = tabs.findIndex((item) =>
    item.toLowerCase().includes(targetImageset)
  );
  setActiveTab(index);
};
