import { useNavigate } from "react-router-dom";
import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Eject from "../../../assets/media/icons/Eject";

export default function Header({ ...props }) {
  const { host } = props;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const response = await fetch(`${host}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (response.status === 200) {
      return navigate("/admin");
    }
  };

  return (
    <header className="flex justify-between p-3">
      <img src={rabbit} alt="Sample image" className="xl:max-h-[50px]" />

      <button
        onClick={() => handleLogout()}
        type="button"
        className="xl:hover:border-rd focus:border-rd outline-none transition-colors border border-solid border-white w-10 h-10 flex items-center justify-center"
      >
        <Eject className="w-4 h-4" />
      </button>
    </header>
  );
}
