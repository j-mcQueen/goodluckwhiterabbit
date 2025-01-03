import { v4 as uuidv4 } from "uuid";
import { dashboard_btns, icons } from "./styles/styles";
import { dashboard_client } from "./types/types";

import Copy from "../../../assets/media/icons/Copy";
import Edit from "../../../assets/media/icons/Edit";
import Close from "../../../assets/media/icons/Close";
import Mail from "../../../assets/media/icons/Mail";

export default function AllClients({ ...props }) {
  const {
    clients,
    notice,
    setNotice,
    setActivePane,
    setTargetClient,
    setDeleteModalToggle,
  } = props;

  const handleCopy = async (code: string) => {
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

  const handleClick = (client: object) => {
    setTargetClient(client);
    setActivePane("EDIT");
  };

  return (
    <table className="w-full mt-5 border-collapse ">
      <thead>
        <tr className="text-left text-rd">
          <th className="pl-3">NAME</th>
          <th className="pb-2">DATE</th>
          <th>CODE</th>
          <th>FILES</th>
          <th>COPY</th>
          <th>EDIT</th>
          <th>SEND</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        {clients.map((client: dashboard_client, index: number) => {
          return (
            <tr
              key={uuidv4()}
              className={`text-white border-t-[1px] ${index < clients.length - 1 ? "border-b-[1px]" : ""} border-solid border-white`}
            >
              <td className="align-middle pl-3 tracking-wider">
                {client.name.toUpperCase()}
              </td>

              <td className="align-middle">{client.added}</td>

              <td className="align-middle">{client.code}</td>

              <td className="align-middle">
                <span
                  className={`${client.fileCounts.previews > 0 ? "text-rd" : "text-white"}`}
                >
                  S: {client.fileCounts.previews},&nbsp;
                </span>
                <span
                  className={`${client.fileCounts.full > 0 ? "text-rd" : "text-white"}`}
                >
                  K: {client.fileCounts.full},&nbsp;
                </span>
                <span
                  className={`${client.fileCounts.socials > 0 ? "text-rd" : "text-white"}`}
                >
                  C: {client.fileCounts.socials},&nbsp;
                </span>
                <span
                  className={`${client.fileCounts.snips > 0 ? "text-rd" : "text-white"}`}
                >
                  S: {client.fileCounts.snips}
                </span>
              </td>

              <td className="align-middle">
                <button
                  disabled={notice.status}
                  onClick={() => handleCopy(client.code)}
                  type="button"
                  className={dashboard_btns}
                >
                  <Copy className={icons} />
                </button>
              </td>

              <td className="align-middle">
                <button
                  type="button"
                  className={dashboard_btns}
                  onClick={() => {
                    handleClick(client);
                  }}
                >
                  <Edit className={icons} />
                </button>
              </td>

              <td>
                <button type="button" className={dashboard_btns}>
                  <Mail className={icons} />
                </button>
              </td>

              <td>
                <button
                  onClick={() =>
                    setDeleteModalToggle({
                      active: true,
                      target: client._id,
                      name: client.name,
                    })
                  }
                  type="button"
                  className={dashboard_btns}
                >
                  <Close className={icons} />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
