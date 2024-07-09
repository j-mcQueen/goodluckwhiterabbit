import { useNavigate } from "react-router-dom";
import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Eject from "../../../assets/media/icons/Eject";

export default function Header() {
  const navigate = useNavigate();
  const handleLogout = async () => {
    const response = await fetch("http://localhost:3000/admin/logout", {
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
        className="font-inter italic font-bold bg-black text-white border-white xl:hover:border-red-600 xl:focus:bg-red-600 xl:focus:text-white xl:focus:outline-none xl:hover:text-white  xl:transition-colors border border-solid w-10 h-10 flex items-center justify-center"
      >
        <Eject className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}
