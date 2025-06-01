export const determineTabs = (data: string[]) => {
  const nameMap = {
    snapshots: "SNAPSHOTS",
    keepsake: "KEEPSAKE PREVIEW",
    core: "CORE COLLECTION",
    snips: "SNIPS",
  };

  return data.map((item: string) => nameMap[item as keyof typeof nameMap]);
};
