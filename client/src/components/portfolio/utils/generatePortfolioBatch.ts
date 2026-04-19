// sister to executeGenerationChain
export const generatePortfolioBatch = async (data: {
  keys: string[];
  urls: string[];
}) => {
  // create a shallow copy of existing files to be extended
  const nextFiles = [];
  const groupRegex = /\/(\d{3})\//;

  for (let i = 0; i < data.urls.length; i++) {
    // data.keys[i] corresponds to data.urls[i]
    const group = data.keys[i].match(groupRegex)![1];

    // convert presigned url to file
    const response = await fetch(data.urls[i], { method: "GET" });
    const blob = await response.blob();

    nextFiles.push({ blob, group });
  }

  return nextFiles;
};
