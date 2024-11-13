import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";
import Eject from "../../../assets/media/icons/Eject";
import Next from "../../../assets/media/icons/Next";

export default function Header({ ...props }) {
  const { logout, data, activeTab, setActiveTab, host, dashboard } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-b-black",
    std: "border-b-white",
  };

  const buttonVariants = {
    disabled: "opacity-40 w-full h-full tracking-widest",
    regular:
      "xl:hover:text-rd focus:text-rd transition-colors w-full h-full tracking-widest",
  };

  const handleLogout = async () => {
    const response = await fetch(`${host}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (response.status === 200) {
      return navigate("/portal");
    }
  };

  return (
    <header className="text-white">
      <nav className="flex">
        <div className="border-r border-b border-solid border-white min-w-[245px] flex justify-center">
          <img
            src={rabbit}
            alt="A white rabbit against a black background shimmering from left to right"
            className="max-h-14"
          />
        </div>

        <ul className="flex justify-evenly w-full font-liquid">
          {data.map((tab: string, index: number) => {
            return (
              <li
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${dashboard && dashboard[index] === 0 && index !== data.length - 1 ? "border-r-white inline" : ""} border-r border-b border-solid border-white w-full flex items-center justify-center relative`}
                key={uuidv4()}
              >
                <button
                  disabled={dashboard && dashboard[index] === 0 ? true : false}
                  type="button"
                  className={
                    dashboard && dashboard[index] === 0
                      ? buttonVariants.disabled
                      : buttonVariants.regular
                  }
                  onClick={() => setActiveTab(index)}
                >
                  {tab}

                  {dashboard && dashboard[index] === 0 ? (
                    <span className="absolute -translate-y-1">
                      <span className="font-vt text-sm tracking-normal flex items-center gap-1">
                        <Next className="w-4 h-4" /> <span>COMING SOON</span>
                      </span>
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {logout ? (
          <button
            type="button"
            className="xl:hover:text-rd focus:text-rd transition-colors px-[18px] border-b border-solid border-white font-liquid tracking-widest group"
            onClick={() => handleLogout()}
          >
            <Eject className="w-5 h-5 group-hover:fill-rd group-focus:fill-rd group-hover:drop-shadow-red group-focus:drop-shadow-red transition-colors" />
          </button>
        ) : (
          <a
            href="https://www.instagram.com/goodluckwhiterabbit/"
            className={`${activeTab === data.length - 1 ? "border-l" : ""} px-5 flex items-center justify-center border-b border-solid`}
          >
            <Instagram mobile={false} />
          </a>
        )}
      </nav>
    </header>
  );
}
