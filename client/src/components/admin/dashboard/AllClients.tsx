import { v4 as uuidv4 } from "uuid";
import Upload from "../../../assets/media/icons/Upload";
import Copy from "../../../assets/media/icons/Copy";
import Edit from "../../../assets/media/icons/Edit";
import Delete from "../../../assets/media/icons/Delete";
import Order from "../../../assets/media/icons/Order";

export default function AllClients({ ...props }) {
  const { clients, setDeleteModalToggle } = props;

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

  return (
    <table className="w-full mt-5">
      <thead>
        <tr className="text-left text-gray">
          <th>NAME</th>
          <th>ADDED</th>
          <th>CODE</th>
          <th>SNEAKS</th>
          <th>FULL</th>
          <th>SOCIALS</th>
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
                    className="border border-solid border-gray xl:hover:border-white xl:transition-colors xl:focus:border-white xl:focus:outline-none p-2 ml-3"
                  >
                    <Copy className="w-[20px] h-[20px]" />
                  </button>
                </td>

                <td>
                  {client.files.sneaks ? (
                    <button
                      type="button"
                      className="border border-solid border-green-600 xl:hover:border-ylw xl:transition-colors xl:focus:border-ylw xl:focus:outline-none p-2"
                    >
                      <Order className="w-[20px] h-[20px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="border border-solid border-gray xl:hover:border-ylw xl:transition-colors xl:focus:border-ylw xl:focus:outline-none p-2"
                    >
                      <Upload className="w-[20px] h-[20px]" />
                    </button>
                  )}
                </td>

                <td>
                  {client.files.full ? (
                    <button
                      type="button"
                      className="border border-solid border-green-600 xl:hover:border-ylw xl:transition-colors xl:focus:border-ylw xl:focus:outline-none p-2"
                    >
                      <Order className="w-[20px] h-[20px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="border border-solid border-gray xl:hover:border-ylw xl:transition-colors xl:focus:border-ylW xl:focus:outline-none p-2"
                    >
                      <Upload className="w-[20px] h-[20px]" />
                    </button>
                  )}
                </td>

                <td>
                  {client.files.socials ? (
                    <button
                      type="button"
                      className="border border-solid border-green-600 xl:hover:border-ylw xl:transition-colors xl:focus:border-ylw xl:focus:outline-none p-2"
                    >
                      <Order className="w-[20px] h-[20px]" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="border border-solid border-gray xl:hover:border-ylw xl:transition-colors xl:focus:border-ylw xl:focus:outline-none p-2"
                    >
                      <Upload className="w-[20px] h-[20px]" />
                    </button>
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    className="border border-solid border-blu xl:hover:bg-blu xl:transition-colors xl:focus:bg-blu xl:focus:outline-none p-2"
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
                    className="border border-solid border-red-600 xl:hover:bg-red-600 xl:transition-colors xl:focus:bg-red-600 xl:focus:outline-none p-2"
                  >
                    <Delete className="w-[20px] h-[20px]" />
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
