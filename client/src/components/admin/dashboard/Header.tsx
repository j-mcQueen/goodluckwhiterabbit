import { useNavigate } from "react-router-dom";
import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";

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
        className="font-inter italic font-bold bg-white xl:hover:bg-red-600 xl:focus:bg-red-600 xl:focus:text-white xl:focus:outline-none xl:hover:text-white  xl:transition-colors border border-solid border-black py-3 px-5"
      >
        LOGOUT
      </button>
    </header>
  );
}
