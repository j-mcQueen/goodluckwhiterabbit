import { v4 as uuidv4 } from "uuid";
import Copy from "../../../assets/media/icons/Copy";
import Edit from "../../../assets/media/icons/Edit";
import Delete from "../../../assets/media/icons/Delete";
import Close from "../../../assets/media/icons/Close";

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

  // TODO clicking order button should display the "ImageOrder" component for that particular imageset
  // TODO clicking upload button should display an "UploadImages" component for that particular imageset, and perform a put request to the user
  // TODO add email button so Kailey can copy their email quickly
  // TODO CHANGE "ADDED" TAB TO "EMAIL" and display email in the list. Display date added in the edit client page
  // TODO implement capability to search by dates too
  // TODO create button that takes Kailey to a page which allows her to "preview" what the client sees
  // TODO change trashcan icon to a X

  return (
    <table className="w-full mt-5">
      <thead>
        <tr className="text-left text-gray">
          <th>NAME</th>
          <th>ADDED</th>
          <th>CODE</th>
        </tr>
      </thead>

      <tbody>
        {clients.map(
          (client: {
            name: string;
            added: string;
            code: string;
            files: { sneaks: boolean; full: boolean; socials: boolean };
            _id: string;
          }) => {
            return (
              <tr key={uuidv4()} className="font-inter text-white">
                <td>{client.name}</td>
                <td>{client.added}</td>

                <td>
                  {client.code}

                  <button
                    onClick={() => handleCopy(client.code)}
                    type="button"
                    className="border border-solid xl:hover:drop-shadow-ylw xl:hover:border-ylw xl:transition-all xl:focus:border-white xl:focus:outline-none p-2 ml-3"
                  >
                    <Copy className="w-[20px] h-[20px]" />
                  </button>
                </td>

                <td>
                  <button
                    type="button"
                    className="border border-solid border-cyn drop-shadow-cyn xl:hover:border-blu xl:transition-all xl:focus:border-blu xl:focus:outline-none p-2 xl:hover:drop-shadow-blu"
                    onClick={() => {
                      setTargetClient(client);
                      setActivePane("EDIT");
                    }}
                  >
                    <Edit className="w-[20px] h-[20px]" />
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
                    className="border border-solid border-mag drop-shadow-mag xl:hover:drop-shadow-red xl:hover:border-red-600 xl:transition-all xl:focus:border-red-600 xl:focus:outline-none p-2"
                  >
                    <Close customColor="#FFF" className="w-[20px] h-[20px]" />
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
