import { useLayoutEffect, useRef } from "react";
import Close from "../../../../assets/media/icons/Close";

export default function SubmitDialog({ ...props }) {
  const {
    submitOpen,
    submitStatus,
    setSubmitOpen,
    setSubmitStatus,
    uploadProgress,
    bulkFails,
  } = props;

  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    // update DOM before browser paint
    if (submitOpen) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, submitOpen]);

  return submitOpen ? (
    <dialog
      ref={dialog}
      className="text-white bg-black absolute left-0 right-0 top-0 bottom-0 text-center border border-solid border-white p-3 z-20 backdrop:bg-[rgba(0,0,0,0.75)] w-72"
      onClose={() => {
        setSubmitOpen(false);
        setSubmitStatus(null);
        return;
      }}
    >
      {submitStatus === 0 ? (
        // pending
        <div className="flex flex-col gap-5">
          <span className="animate-blink opacity-0 text-rd">&#9607;</span>
          <p>UPLOAD IN PROGRESS</p>
          <p>PLEASE KEEP WINDOW OPEN UNTIL COMPLETION</p>
          <p>
            {uploadProgress < 100
              ? `STATUS: ${uploadProgress}%`
              : "FINALIZING..."}
          </p>
        </div>
      ) : submitStatus === 1 ? (
        // complete
        <div className="flex flex-col gap-3">
          <p>YOUR UPLOAD HAS BEEN COMPLETED.</p>
          <p>PRESS ESCAPE TO CLOSE.</p>
          {bulkFails.length > 0 && (
            <>
              <p>NOTE - THESE FILE(S) FAILED TO UPLOAD:</p>
              {bulkFails.map((filename: string) => (
                <p key={filename}>{filename}</p>
              ))}
            </>
          )}
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between pb-2">
            <h3>UPLOAD FILES</h3>

            <button
              type="button"
              onClick={() => {
                setSubmitOpen(false);
                setSubmitStatus(null);
                return;
              }}
              className="group focus:outline-none border border-solid border-white p-2"
            >
              <Close
                className={
                  "w-[18px] h-[18px] xl:group-hover:drop-shadow-red xl:group-hover:fill-rd xl:group-focus:drop-shadow-red xl:group-focus:fill-rd xl:transition-colors"
                }
              />
            </button>
          </div>

          <p className="pt-4 pb-5">
            SOSU, YOU'RE ABOUT TO UPLOAD A BATCH OF UNORDERED FILES. PLS CLICK
            TO CONFIRM.
          </p>

          <button
            type="submit"
            className="border border-solid border-white w-full pl-2 py-2 focus:outline-none focus:text-rd"
          >
            CONFIRM
          </button>
        </div>
      )}
    </dialog>
  ) : null;
}
