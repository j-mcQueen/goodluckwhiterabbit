import { v4 as uuidv4 } from "uuid";
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
          logout: false,
        });
      }
    } catch (err) {
      setNotice({
        status: true,
        message:
          "Whoops! Something went wrong. The code has not been copied to the clipboard. Please refresh the page and try again.",
        logout: false,
      });
    }
  };

  // TODO CHANGE "ADDED" TAB TO "EMAIL" and display email in the list.
  // TODO set up sendgrid to send emails with the click of a button, ask Kailey to provide email she wants to sign up and send email with
  // TODO implement capability to search by dates too
  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees

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
        {clients.map(
          (
            client: {
              name: string;
              added: string;
              code: string;
              files: { previews: number; full: number; socials: number };
              _id: string;
            },
            index: number
          ) => {
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
                    className={`${client.files.previews > 0 ? "text-rd" : "text-white"}`}
                  >
                    P: {client.files.previews},&nbsp;
                  </span>
                  <span
                    className={`${client.files.full > 0 ? "text-rd" : "text-white"}`}
                  >
                    G: {client.files.full},&nbsp;
                  </span>
                  <span
                    className={`${client.files.socials > 0 ? "text-rd" : "text-white"}`}
                  >
                    S: {client.files.socials}
                  </span>
                </td>

                <td className="align-middle">
                  <button
                    disabled={notice.status}
                    onClick={() => handleCopy(client.code)}
                    type="button"
                    className="border border-solid p-2 my-3 xl:hover:border-rd focus:border-rd outline-none transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </td>

                <td className="align-middle">
                  <button
                    type="button"
                    className="border border-solid p-2 my-3 xl:hover:border-rd focus:border-rd outline-none transition-colors"
                    onClick={() => {
                      setTargetClient(client);
                      setActivePane("EDIT");
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </td>

                <td>
                  <button
                    type="button"
                    className="border border-solid p-2 my-3 xl:hover:border-rd focus:border-rd outline-none transition-colors"
                  >
                    <Mail className="w-4 h-4" />
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
                    className="border border-solid p-2 my-3 xl:hover:border-rd focus:border-rd outline-none transition-colors"
                  >
                    <Close customColor="#FFF" className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            );
          }
        )}
      </tbody>
    </table>
  );
}
