import { useNavigate } from "react-router-dom";
import { icons } from "./styles/styles";
import { handleActionClick } from "./utils/handlers/dashboard/handleActionClick";
import { determineHost } from "../../global/utils/determineHost";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Eject from "../../../assets/media/icons/Eject";
import Prev from "../../../assets/media/icons/Prev";

export default function Header({ ...props }) {
  const { edit, setTargetClient, setActivePane } = props;
  const navigate = useNavigate();

  const handleLogout = async () => {
    const host = determineHost;

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
      <img
        src={rabbit}
        alt="A leaping white rabbit"
        className="xl:max-h-[50px] xl:scale-[2] translate-x-10"
      />

      <div className="flex gap-5">
        {edit ? (
          <button
            type="button"
            onClick={() =>
              handleActionClick([], setTargetClient, "ALL", setActivePane)
            }
            className="xl:hover:border-rd focus:border-rd outline-none transition-colors border border-solid border-white w-10 h-10 flex items-center justify-center group"
          >
            <Prev className={icons} />
          </button>
        ) : null}

        <button
          onClick={() => handleLogout()}
          type="button"
          className="xl:hover:border-rd focus:border-rd outline-none transition-colors border border-solid border-white w-10 h-10 flex items-center justify-center group"
        >
          <Eject className={icons} />
        </button>
      </div>
    </header>
  );
}
