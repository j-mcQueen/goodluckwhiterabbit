import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";

export default function Header({ ...props }) {
  const { logout, data, activeTab, setActiveTab, target } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-b-black",
    std: "border-b-white",
  };

  const handleLogout = async () => {
    const response = await fetch(`${target}/logout`, {
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
        <div className="border-r border-b border-solid border-white w-72 flex justify-center">
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
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} border-r border-b border-solid border-white w-full flex items-center justify-center`}
                key={uuidv4()}
              >
                <button
                  type="button"
                  className="xl:hover:text-rd focus:text-rd transition-colors w-full h-full tracking-widest"
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              </li>
            );
          })}
        </ul>

        {logout ? (
          <button
            type="button"
            className="xl:hover:text-rd focus:text-rd transition-colors px-5 border-b border-solid border-white font-liquid tracking-widest"
            onClick={() => handleLogout()}
          >
            exit
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
