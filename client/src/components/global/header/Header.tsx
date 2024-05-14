import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import rabbit from "../../../assets/media/gifs/glwr-lenticular.gif";
import Instagram from "../../../assets/media/icons/Instagram";

export default function Header({ page }: { page: number }) {
  const listData = [
    {
      path: "/",
      element: (
        <img
          src={rabbit}
          alt="A white rabbit against a black background shimmering from left to right"
          className="max-h-[50px]"
        />
      ),
    },
    { path: "/photo", element: "PHOTOGRAPHY" },
    { path: "/design", element: "DESIGN" },
    { path: "/artwork", element: "ARTWORK" },
    { path: "...", element: "CONTACT" }, // TODO add href/path
  ];

  const listItemVariants = {
    active: `${page === 1 ? "text-blu" : page === 2 ? "text-ylw" : page === 3 ? "text-red-600" : null} border-b-0`,
    std: "border-b-[1px]",
  };

  return (
    <header className="text-white italic">
      <nav className="flex">
        <ul className="flex justify-evenly w-full">
          {listData.map((item, index) => {
            return (
              <li
                className={`${page === index ? listItemVariants.active : listItemVariants.std} border-r-[1px] border-solid border-white flex items-center justify-center w-full`}
                key={uuidv4()}
              >
                <Link
                  to={item.path}
                  className={index === 0 ? undefined : "w-full text-center"}
                >
                  {item.element}
                </Link>
              </li>
            );
          })}
        </ul>

        <a
          href="https://www.instagram.com/goodluckwhiterabbit/"
          className={`${page === 4 ? "border-l-[1px]" : ""} w-[50px] flex items-center justify-center border-b-[1px] border-solid`}
        >
          <Instagram mobile={false} />
        </a>
      </nav>
    </header>
  );
}
