import { v4 as uuidv4 } from "uuid";
import Copy from "../../../assets/media/icons/Copy";
import Edit from "../../../assets/media/icons/Edit";
import Close from "../../../assets/media/icons/Close";
import Mail from "../../../assets/media/icons/Mail";

export default function AllClients({ ...props }) {
  const { clients, setActivePane, setTargetClient, setDeleteModalToggle } =
    props;

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      const copied = await navigator.clipboard.readText();

      if (copied === code) {
        // TODO display success message to user
        console.log("success");
      }
    } catch (err) {
      // TODO display copy error to user
      console.log(err);
    }
  };

  // TODO CHANGE "ADDED" TAB TO "EMAIL" and display email in the list. Display date added in the edit client page
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
          (client: {
            name: string;
            added: string;
            code: string;
            files: { previews: boolean; full: boolean; socials: boolean };
            _id: string;
          }) => {
            return (
              <tr
                key={uuidv4()}
                className={`text-white border-t-[1px] border-b-[1px] border-solid border-white`}
              >
                <td className="align-middle pl-3 tracking-wider">
                  {client.name.toUpperCase()}
                </td>

                <td className="align-middle">{client.added}</td>

                <td className="align-middle">{client.code}</td>

                <td className="align-middle">P: 0, G: 0, S: 0</td>

                <td className="align-middle">
                  <button
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
