// sister to executeGenerationChain
export const generatePortfolioBatch = async (data: {
  keys: string[];
  urls: string[];
}) => {
  const groupRegex = /\/(\d{3})\//;

  const nextFiles = await Promise.all(
    data.urls.map(async (url, i) => {
      // data.keys[i] corresponds to data.urls[i]
      const group = data.keys[i].match(groupRegex)![1];

      // convert presigned url to file
      const response = await fetch(url, { method: "GET" });
      const blob = await response.blob();

      return { blob, group };
    }),
  );

  return nextFiles;
};
