import { determineHost as host } from "../../../global/utils/determineHost";

export const handleDownload = async ({ ...params }) => {
  let url = "";
  try {
    const response = await fetch(
      `${host}/user/${params.id}/${params.imageset}/original/${params.index}/${params.filename.slice(2)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );
    const data = await response.json();

    switch (response.status) {
      case 200:
      case 304:
        if (data.files === false) return data;
        url = data;
        break;

      case 500:
        throw new Error("500");

      default:
        throw new Error("Other");
    }
  } catch (error) {
    // TODO handle error
  }

  if (url.length > 0) {
    const name = params.filename.slice(2).replace("%2B", "+");
    const response = await fetch(url, { method: "GET" });
    const blob = await response.blob();
    const file = new File([blob], name, {
      type: params.type,
    });
    const objectUrl = URL.createObjectURL(file);

    // workaround to handle file downloads without causing visual lag derived from display of data URL
    const anchor = document.createElement("a");
    // ensure tag isn't displayed visually in the browser
    anchor.setAttribute("style", "display: none");
    // set the necessary attributes for download + attach temporarily to DOM
    anchor.href = objectUrl;
    anchor.download = name;
    document.body.appendChild(anchor);
    // trigger download
    anchor.click();
    // cleanup
    URL.revokeObjectURL(objectUrl);
    return document.body.removeChild(anchor);
  }
};
