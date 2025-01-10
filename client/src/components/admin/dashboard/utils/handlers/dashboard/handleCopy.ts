import { Dispatch, SetStateAction } from "react";

export const handleCopy = async (
  code: string,
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: string | null };
    }>
  >
) => {
  try {
    await navigator.clipboard.writeText(code);
    const copied = await navigator.clipboard.readText();

    if (copied === code) {
      setNotice({
        status: true,
        message: "The code has been copied to the clipboard! (say it fast)",
        logout: { status: false, path: null },
      });
    }
  } catch (err) {
    setNotice({
      status: true,
      message:
        "Whoops! Something went wrong. The code has not been copied to the clipboard. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
  }
};
