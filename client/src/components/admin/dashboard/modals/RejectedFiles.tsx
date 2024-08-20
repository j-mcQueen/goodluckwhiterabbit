import { v4 as uuidv4 } from "uuid";
import Close from "../../../../assets/media/icons/Close";

export default function RejectedFiles({ ...props }) {
  const { rejectedFiles, setRejectedFiles } = props;
  return (
    <dialog className="block bg-black absolute z-50 bottom-[calc(1.5rem-2px)] p-4 border border-solid border-white text-white max-w-[300px] xl:max-w-[400px] max-h-[150px] overflow-scroll">
      <div className="flex items-start gap-1">
        <p className="font-inter">
          The client has been successfully added, but some files could not be
          uploaded. For your reference, here are the names of the files not
          uploaded:
        </p>

        <button
          type="button"
          onClick={() => setRejectedFiles([])}
          className="border border-solid border-mag p-2"
        >
          <Close className="w-[18px] h-[18px]" customColor="#FFF" />
        </button>
      </div>

      <ul className="pt-3 grid grid-cols-2 gap-2 justify-start">
        {rejectedFiles.map((filename: string) => {
          return <li key={uuidv4()}>{filename}</li>;
        })}
      </ul>
    </dialog>
  );
}
