import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";

export default function Header({ ...props }) {
  const { logout, data, activeTab, setActiveTab, host, dashboard } = props;
  const navigate = useNavigate();

  const listItemVariants = {
    active: "text-rd border-b-black",
    std: "border-b-white",
  };

  const buttonVariants = {
    disabled: "text-black bg-white line-through w-full h-full tracking-widest",
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

  // begin with the end in mind
  // what is the objective? header item button should be disabled if it is associated with a user dashboard header item and there are no files to show for that item
  // how can we determine if the header item is a user dashboard header item?
  // by a prop -> if the "dashboard" prop has been passed, it is a user dashboard header item
  // if it has been passed, then we now need to determine how many files for this item have been passed
  // how do we determine this?
  // we can't access the user.fileCounts object through the text available (data.tab) because they are inconsistent
  // what if in the dashboard prop we pass, it is an array of integers?

  // if a fileCounts prop has been passed and it is 0, disable the button

  // user dashboard header items will only have a length of 3 with indexes 0, 1, 2
  // in the data map below, if the header ite

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
                className={`${activeTab === index ? listItemVariants.active : listItemVariants.std} ${dashboard && dashboard[index] === 0 && index !== data.length - 1 ? "border-r-black" : ""} border-r border-b border-solid border-white w-full flex items-center justify-center`}
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
                  // className="xl:hover:text-rd focus:text-rd transition-colors w-full h-full tracking-widest"
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
