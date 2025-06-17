/* eslint-disable no-constant-condition */
import { determineHost as host } from "../../../global/utils/determineHost";
import streamSaver from "streamsaver";

export const handleDownloadAll = async ({ ...params }) => {
  const { activeImageset, user, setNotice, setRetrieving } = params;
  setRetrieving({ state: true, complete: false });

  const stream = streamSaver.createWriteStream(
    `${user.name}_${activeImageset}.zip`
  );
  const writer = stream.getWriter();
  let reader;
  try {
    const response = await fetch(
      `${host}/user/${user._id}/${activeImageset}/ogs`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    reader = response.body?.getReader();
  } catch (error) {
    setRetrieving({ state: false, complete: false });
    return setNotice({
      status: true,
      message: "Zip creation failed.",
      logout: { status: false, path: null },
    });
  }

  const pump = async () => {
    while (true) {
      // expectation is that done will eventually be true, hence the bypass comment above
      const { done, value } = await reader!.read();
      if (done) {
        await writer.close();
        break;
      }

      await writer.write(value);
    }
  };

  try {
    await pump();
    setRetrieving({ state: false, complete: true });
  } catch (error) {
    setRetrieving({ state: false, complete: false });
    setNotice({
      status: true,
      message: "Progressive download of ZIP failed.",
      logout: { status: false, path: null },
    });
  }
};
