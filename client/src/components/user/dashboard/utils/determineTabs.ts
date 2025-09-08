export const determineTabs = (data: string[]) => {
  const nameMap = {
    snapshots: "SNAPSHOTS",
    keepsake: "KEEPSAKE PREVIEW",
    core: "CORE COLLECTION",
    socials: "SOCIALS",
  };

  return data.map((item: string) => nameMap[item as keyof typeof nameMap]);
};
