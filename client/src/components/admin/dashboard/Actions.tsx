import { useEffect, useRef, useState } from "react";
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
  const originalClientsList = useRef(clients);
  const [sortStyle, setSortStyle] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (clients.length > 0 && !originalClientsList.current) {
      originalClientsList.current = [...clients]; // store a copy once
    }
  }, [clients]);

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
              new Date(b.added).getTime() - new Date(a.added).getTime()
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

  const handleSearch = () => {
    const filtered = originalClientsList.current.filter(
      (client: { name: string }) =>
        client.name.toLowerCase().includes(searchInput.toLowerCase())
    );

    setClients(filtered);
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
              onChange={(e) => {
                setSearchInput(e.target.value);

                if (e.target.value === "") {
                  setClients([...originalClientsList.current]);
                }
              }}
              placeholder="SEARCH ARCHIVE"
              className="bg-black border border-solid border-white xl:hover:border-rd focus:border-rd focus:outline-none transition-colors text-white p-[10px] max-h-[40px] flex-grow placeholder:text-white text-lg"
            />
          </label>

          <div className="flex gap-2">
            {sortTabs.map((item, index) => {
              return (
                <SortTab
                  key={item.name}
                  index={index}
                  text={item.name}
                  pattern={item.pattern}
                />
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => handleSearch()}
        className="w-10 h-10 border border-solid flex justify-center p-[10px] focus:border-rd xl:hover:border-rd xl:transition-colors xl:focus:outline-none group"
      >
        <Search className={icons} />
      </button>

      <button
        onClick={() => {
          setActivePane("ADD");
          new Audio(clicky).play();
        }}
        type="button"
        className="w-10 h-10 border border-solid flex justify-center items-center focus:border-rd xl:transition-all xl:hover:border-rd xl:focus:outline-none group"
      >
        <Add className={icons} />
      </button>
    </div>
  );
}
