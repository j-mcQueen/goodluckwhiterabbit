import { useLayoutEffect, useRef, useState } from "react";
import { icons } from "../styles/styles";
import { primaryCta, modalCloseIcon } from "../../../global/styles/buttons";
import { textInput } from "../../../global/styles/forms";
import {
  ArtMemoFields,
  MemoFields,
  PortfolioCategory,
} from "../../../global/memo/types";

import Close from "../../../../assets/media/icons/Close";

export default function MemoDialog({
  category,
  initialFields,
  onClose,
  onSubmit,
}: {
  category: PortfolioCategory;
  initialFields: MemoFields;
  onClose: () => void;
  onSubmit: (fields: MemoFields) => Promise<void>;
}) {
  const [fields, setFields] = useState<MemoFields>(initialFields);
  const [pending, setPending] = useState(false);

  const isArt = category === "ART";
  const artFields = fields as ArtMemoFields;

  const handleSubmit = async () => {
    setPending(true);
    await onSubmit(fields);
    setPending(false);
  };

  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    // update DOM before browser paint
    dialog.current?.showModal();
  }, []);

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      className="absolute flex items-center justify-center bg-black text-white border border-solid border-white p-4 z-20 w-full max-w-[500px] backdrop:bg-[rgba(0,0,0,0.6)] backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-4 w-full">
        <div className="flex items-center justify-between">
          <h3 className="font-tnrBI drop-shadow-glo tracking-widest opacity-80 text-lg">
            MEMO
          </h3>
          <button type="button" onClick={onClose} className={modalCloseIcon}>
            <Close className={icons} />
          </button>
        </div>

        <label className="text-rd">
          {isArt ? "TITLE" : "TITLE/HEADING"}
          <input
            type="text"
            value={fields.title}
            onChange={(e) => setFields({ ...fields, title: e.target.value })}
            placeholder={
              isArt ? "E.G. A DREAM IS A WISH" : "E.G. MEMORIES AWAIT"
            }
            className={textInput}
          />
        </label>

        {isArt ? (
          <label className="text-rd">
            YEAR
            <input
              type="text"
              value={artFields.year}
              onChange={(e) =>
                setFields({ ...artFields, year: e.target.value })
              }
              placeholder="E.G. 2024"
              className={textInput}
            />
          </label>
        ) : (
          <label className="text-rd">
            SUB-HEADING
            <input
              type="text"
              value={(fields as { subheading: string }).subheading}
              onChange={(e) =>
                setFields({
                  ...fields,
                  subheading: e.target.value,
                } as MemoFields)
              }
              placeholder="E.G. RED BUTTE GARDEN"
              className={textInput}
            />
          </label>
        )}

        <label className="text-rd">
          {isArt ? "DETAILS (MEDIUM / DIMENSIONS / ETC.)" : "BODY TEXT"}
          <textarea
            value={fields.body}
            onChange={(e) => setFields({ ...fields, body: e.target.value })}
            rows={isArt ? 3 : 6}
            className={textInput}
          />
        </label>

        {isArt && (
          <label className="flex items-center gap-2 xl:hover:cursor-pointer">
            <input
              type="checkbox"
              checked={artFields.sold}
              onChange={(e) =>
                setFields({ ...artFields, sold: e.target.checked })
              }
            />
            SOLD?
          </label>
        )}

        <div className="flex items-center justify-between pt-2">
          {isArt ? (
            <label className="flex items-center gap-2 xl:hover:cursor-pointer">
              <input
                type="checkbox"
                checked={artFields.inquire}
                onChange={(e) =>
                  setFields({ ...artFields, inquire: e.target.checked })
                }
              />
              INQUIRE BUTTON
            </label>
          ) : (
            <div />
          )}

          <button
            type="button"
            disabled={pending}
            onClick={handleSubmit}
            className={`${primaryCta} px-4 py-2`}
          >
            {pending ? "SAVING..." : "SUBMIT"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
