import { useLayoutEffect, useRef, useState } from "react";
import { handleContactSubmit } from "./utils/handleContactSubmit";

import Close from "../../assets/media/icons/Close";

export default function ContactDialog({ ...props }) {
  const { contactOpen, setContactOpen } = props;
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);

  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    // update DOM before browser paint
    if (contactOpen) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [dialog, contactOpen]);

  return (
    <dialog
      ref={dialog}
      onClose={() => {
        setContactOpen(false);
        setSubmitSuccess(null);
        return;
      }}
      className="absolute top-0 bottom-0 bg-black border border-solid border-white p-3 text-white z-20 backdrop:bg-[rgba(0,0,0,0.6)]"
    >
      {!submitSuccess ? (
        <form
          onSubmit={async (e) => {
            const outcome = await handleContactSubmit(e);

            if (outcome.success) {
              setSubmitSuccess(true);

              setTimeout(() => {
                setContactOpen(false);
                setSubmitSuccess(null);
                return;
              }, 2500);
            } else return setSubmitSuccess(false);
          }}
          className="text-xl"
          autoComplete="on"
        >
          <div className="flex items-center justify-between pb-2">
            <h3 className="block">SEND AN INQUIRY</h3>

            <button
              type="button"
              onClick={() => {
                setContactOpen(false);
                setSubmitSuccess(null);
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

          <fieldset className="flex flex-col gap-3 w-[22rem]">
            <label htmlFor="name">
              <input
                type="text"
                name="name"
                id="name"
                placeholder="NAME *"
                autoComplete="on"
                className="bg-black border border-solid border-white focus:border-rd focus:outline-none w-full pl-2 py-2"
                required
              />
            </label>

            <label htmlFor="subject">
              <input
                type="text"
                name="subject"
                id="subject"
                placeholder="SUBJECT *"
                autoComplete="on"
                className="bg-black border border-solid border-white focus:border-rd focus:outline-none w-full pl-2 py-2"
                required
              />
            </label>

            <label htmlFor="email">
              <input
                type="email"
                name="email"
                id="email"
                placeholder="EMAIL *"
                autoComplete="on"
                className="bg-black border border-solid border-white focus:border-rd focus:outline-none w-full pl-2 py-2"
                required
              />
            </label>

            <label htmlFor="message">
              <textarea
                name="message"
                id="message"
                placeholder="MESSAGE *"
                className="bg-black border border-solid border-white focus:border-rd focus:outline-none h-48 w-full pl-2 py-2"
                required
              ></textarea>
            </label>
          </fieldset>

          <p
            className={`${submitSuccess === false ? "" : "hidden"} text-rd pb-2`}
          >
            SOMETHING WENT WRONG. CHECK INPUTS AND TRY AGAIN.
          </p>

          <button
            type="submit"
            className="border border-solid border-white w-full pl-2 py-2 focus:outline-none focus:text-rd"
          >
            SUBMIT
          </button>
        </form>
      ) : (
        <div className="flex flex-col items-center justify-between gap-3 text-xl">
          <p>YOUR INQUIRY HAS BEEN SUBMITTED</p>
          <p>THANK YOU !</p>
          <p className="text-2xl">☻</p>
        </div>
      )}
    </dialog>
  );
}
