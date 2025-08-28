import { file_info_heading } from "./types/types";
import Loading from "../../global/Loading";

const FileInfo = ({ ...props }) => {
  const { spinner, renderCount, targetClient, targetImageset } = props;

  const headingText: file_info_heading = {
    snapshots: "SNAPSHOTS",
    keepsake: "KEEPSAKE",
    core: "CORE",
    snips: "SOCIAL",
  };

  return (
    <header className="flex justify-between items-center w-full py-5 px-5">
      <h2 className="xl:text-2xl tracking-tight">
        {headingText[targetImageset as keyof file_info_heading]}
      </h2>

      <ul className="flex gap-5 text-xl">
        {spinner ? (
          <li>
            <Loading />
          </li>
        ) : null}

        <li>
          <span className="text-rd">
            {targetClient.fileCounts[targetImageset]}
          </span>{" "}
          FILES IN STORAGE
        </li>

        <li>
          <span className="text-rd">{renderCount}</span> FILES DISPLAYED
        </li>
      </ul>
    </header>
  );
};
export default FileInfo;
