import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { icons } from "./styles/styles";

import Add from "../../../assets/media/icons/Add";
import Search from "../../../assets/media/icons/Search";
import clicky from "../../../assets/media/sounds/CLICKY_.wav";

export default function Actions({ ...props }) {
  const { clients, setClients, setActivePane } = props;
  const sortTabs = [
    { name: "DATE", pattern: "date" },
    { name: "A-Z", pattern: "alphabetical" },
  ];
  const [sortStyle, setSortStyle] = useState(0);

  const SortTab = ({ ...props }) => {
    const { index, text, pattern } = props;

    const handleClick = (index: number, pattern: string) => {
      setSortStyle(index);

      const existingClients = [...clients];
      let sorted;
      switch (pattern) {
        case "date":
          sorted = existingClients.sort(
            (a: { added: string }, b: { added: string }) =>
              new Date(a.added).getTime() - new Date(b.added).getTime()
          );
          break;

        case "alphabetical":
          sorted = existingClients.sort(
            (a: { name: string }, b: { name: string }) =>
              a.name.localeCompare(b.name)
          );
          break;
      }
      return setClients(sorted);
    };

    return (
      <button
        type="button"
        className={`${sortStyle === index ? "bg-white text-black" : "bg-black text-white"} py-1 px-2 border border-solid border-white xl:hover:bg-white xl:hover:text-black focus:text-rd focus:outline-none transition-colors`}
        onClick={() => handleClick(index, pattern)}
      >
        {text}
      </button>
    );
  };

  return (
    <div className="flex items-start gap-3 p-3">
      <div className="flex flex-grow">
        <div className="w-full">
          <label className="flex pb-2">
            <span className="h-[1px] w-[1px] m-[-1px] absolute overflow-hidden">
              SEARCH CLIENTS
            </span>

            <input
              type="search"
              name="search"
              id=""
              placeholder="SEARCH ARCHIVE"
              className="bg-black border border-solid border-white xl:hover:border-rd focus:border-rd focus:outline-none transition-colors text-white p-[10px] max-h-[40px] flex-grow placeholder:text-white"
            />
          </label>

          <div className="flex gap-2">
            {sortTabs.map((item, index) => {
              return (
                <SortTab
                  key={uuidv4()}
                  index={index}
                  text={item.name}
                  pattern={item.pattern}
                />
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="w-10 h-10 border border-l-0 border-solid flex justify-center p-[10px] focus:border-rd xl:hover:border-rd xl:transition-colors xl:focus:outline-none group"
        >
          <Search className={icons} />
        </button>
      </div>

      <button
        onClick={() => {
          setActivePane("ADD");
          new Audio(clicky).play();
        }}
        type="button"
        className="w-10 h-10 border border-solid flex justify-center items-center focus:border-rd xl:transition-all xl:hover:border-rd xl:focus:outline-none"
      >
        <Add className={icons} />
      </button>
    </div>
  );
}
