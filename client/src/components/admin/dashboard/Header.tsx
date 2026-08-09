import { useNavigate } from "react-router-dom";
import { icons } from "./styles/styles";
import { iconFrame } from "../../global/styles/buttons";
import { handleActionClick } from "./utils/handlers/dashboard/handleActionClick";
import { determineHost as host } from "../../global/utils/determineHost";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Eject from "../../../assets/media/icons/Eject";
import Prev from "../../../assets/media/icons/Prev";

export default function Header({ ...props }) {
  const { edit, setTargetClient, setActivePane } = props;
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
    <header className="flex justify-between items-center p-3">
      <div className="h-10 min-w-[189px] flex items-center overflow-hidden">
        <img
          src={rabbit}
          alt="A leaping white rabbit"
          className="h-full xl:scale-[2] xl:translate-x-10"
        />
      </div>

      <div className="flex gap-5">
        {edit ? (
          <button
            type="button"
            onClick={() =>
              handleActionClick([], setTargetClient, "ALL", setActivePane)
            }
            className={iconFrame}
          >
            <Prev className={icons} />
          </button>
        ) : null}

        <button
          onClick={() => handleLogout()}
          type="button"
          className={iconFrame}
        >
          <Eject className={icons} />
        </button>
      </div>
    </header>
  );
}
