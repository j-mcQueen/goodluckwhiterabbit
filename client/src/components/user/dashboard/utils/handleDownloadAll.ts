export const handleDownloadAll = ({ ...params }) => {
  const map = {
    previews: "SNAPSHOTS",
    full: "KEEPSAKE",
    socials: "CORE",
    snips: "SNIPS",
  };

  params.setRetrieving(true);
  // workaround to handle file downloads without causing visual lag derived from display of data URL
  const anchor = document.createElement("a");
  // ensure tag isn't displayed visually in the browser
  anchor.setAttribute("style", "display: none");
  // set the necessary attributes for download + attach temporarily to DOM
  anchor.href = params.link;
  anchor.download = `${params.name}_${map[params.activeImageset as keyof typeof map]}.zip`;
  document.body.appendChild(anchor);
  // trigger download
  anchor.click();
  // cleanup
  return document.body.removeChild(anchor);
};
