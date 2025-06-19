import { determineHost as host } from "../../../global/utils/determineHost";

export const handleDownload = async ({ ...params }) => {
  const { id, imageset, index, setNotice } = params;

  const s3Object = { url: "", name: "" };
  try {
    const response = await fetch(`${host}/user/${id}/${imageset}/og/${index}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const data = await response.json();

    switch (response.status) {
      case 200:
      case 304:
        if (data.files === false) return data;
        s3Object.url = data.url;
        s3Object.name = data.name;
        break;

      case 500:
        throw new Error("500");

      default:
        throw new Error("Other");
    }
  } catch (error) {
    return setNotice({
      status: true,
      message: "Download failed. Please refresh and try again.",
      logout: { status: false, path: null },
    });
  }

  if (s3Object.url.length > 0) {
    const response = await fetch(s3Object.url, { method: "GET" });
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    // workaround to handle file downloads without causing visual lag derived from display of data URL
    const anchor = document.createElement("a");
    // ensure tag isn't displayed visually in the browser
    anchor.setAttribute("style", "display: none");
    // set the necessary attributes for download + attach temporarily to DOM
    anchor.href = objectUrl;
    anchor.download = s3Object.name;
    document.body.appendChild(anchor);
    // trigger download
    anchor.click();
    // cleanup
    URL.revokeObjectURL(objectUrl);
    return document.body.removeChild(anchor);
  }
};
