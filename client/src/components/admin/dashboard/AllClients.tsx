import { dashboard_btns, icons } from "./styles/styles";
import { dashboard_client } from "./types/types";
import { handleActionClick } from "./utils/handlers/dashboard/handleActionClick";
import { handleCopy } from "./utils/handlers/dashboard/handleCopy";
import { useNavigate } from "react-router-dom";
import { generateKeys } from "../../global/utils/generateKeys";

import Edit from "../../../assets/media/icons/Edit";
import Close from "../../../assets/media/icons/Close";
import Mail from "../../../assets/media/icons/Mail";

export default function AllClients({ ...props }) {
  const {
    clients,
    mobile,
    notice,
    setNotice,
    setActivePane,
    setTargetClient,
    setDeleteModalToggle,
  } = props;

  const navigate = useNavigate();
  const keys = generateKeys();

  const FileCount = ({ ...props }) => {
    const { name, count, index, len } = props;

    const nameMap = {
      snapshots: `SNAP: `,
      keepsake: `KEEP: `,
      core: `CORE: `,
      socials: `SOCIAL: `,
    };

    return (
      <span className={`${index < len - 1 ? "pr-3" : null}`}>
        {nameMap[name as keyof typeof nameMap]}{" "}
        <span className={`${count > 0 ? "text-rd" : "text-white"}`}>
          {count}
        </span>
      </span>
    );
  };

  const TableHead = () => {
    return mobile ? (
      <thead>
        <tr className="text-left text-rd">
          <th className="pl-3 pb-1">NAME</th>
          <th>CATEGORY</th>
          <th>CODE</th>
          <th></th>
        </tr>
      </thead>
    ) : (
      <thead>
        <tr className="text-left text-rd">
          <th className="pl-3">NAME</th>
          <th>CATEGORY</th>
          <th className="pb-2">DATE</th>
          <th>CODE</th>
          <th>FILES</th>
          <th>EDIT</th>
          <th>SEND</th>
          <th></th>
        </tr>
      </thead>
    );
  };

  const TableRow = ({ ...props }) => {
    const { client, entries, index } = props;
    const keys = generateKeys();

    return mobile ? (
      <tr
        key={client.code}
        className={`text-white border-t-[1px] ${index < clients.length - 1 ? "border-b-[1px]" : ""} border-solid border-white text-base`}
      >
        <td className="align-middle pl-3 tracking-wider w-1/2">
          {client.name.toUpperCase()}
        </td>

        <td className="align-middle w-1/4">{client.category}</td>

        <td className="align-middle w-1/4">
          <button
            disabled={notice.status}
            onClick={() => {
              handleCopy(client.code, setNotice);
              return navigate("/portal");
            }}
            type="button"
            className={`${dashboard_btns} py-0`}
          >
            {client.code}
          </button>
        </td>
      </tr>
    ) : (
      <tr
        key={client.code}
        className={`text-white border-t-[1px] ${index < clients.length - 1 ? "border-b-[1px]" : ""} border-solid border-white text-xl`}
      >
        <td className="align-middle pl-3 tracking-wider">
          {client.name.toUpperCase()}
        </td>

        <td className="align-middle">{client.category}</td>

        <td className="align-middle">{client.added}</td>

        <td className="align-middle">
          <button
            disabled={notice.status}
            onClick={() => handleCopy(client.code, setNotice)}
            type="button"
            className={`${dashboard_btns} py-0`}
          >
            {client.code}
          </button>
        </td>

        <td className="align-middle">
          {entries.map((item: (string | number)[], index: number) => {
            return (
              <FileCount
                key={keys[index]}
                name={item[0]}
                count={item[1]}
                index={index}
                len={entries.length}
              />
            );
          })}
        </td>

        <td className="align-middle">
          <button
            type="button"
            className={dashboard_btns}
            onClick={() =>
              handleActionClick(client, setTargetClient, "EDIT", setActivePane)
            }
          >
            <Edit className={icons} />
          </button>
        </td>

        <td className="align-middle">
          <a
            href={`mailto:${client.email}?subject=You've%20got%20photos!`}
            className={dashboard_btns}
          >
            <Mail className={icons} />
          </a>
        </td>

        <td className="align-middle">
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
  };

  return (
    <table className="w-full mt-5 border-collapse ">
      <TableHead />

      <tbody>
        {clients.map((client: dashboard_client, index: number) => {
          return (
            <TableRow
              key={keys[index]}
              client={client}
              entries={Object.entries(client.fileCounts)}
              index={index}
            />
          );
        })}
      </tbody>
    </table>
  );
}
