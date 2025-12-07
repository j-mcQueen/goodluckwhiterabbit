// import { handleMenuClick } from "./utils/handleMenuClick";
// import { MenuGroupClick } from "./types/MenuGroupClickTypes";
export default function GroupList({
  groups,
  activeGroup,
  className = "",
  onSelect,
}: {
  groups: string[];
  activeGroup: number;
  className?: string;
  onSelect: (index: number) => void;
}) {
  // onClick={async () => {
  //   const args: MenuGroupClick = {
  //     category,
  //     end,
  //     group: data[project],
  //     size: mobile ? "lg" : "sm",
  //     start,
  //     sub: subcategories[index],
  //   };

  //   setActiveGroup(j);
  //   await handleMenuClick(args);
  // }}

  return (
    <ul
      className={`
        flex flex-col-reverse 
        [writing-mode:vertical-rl]`}
    >
      {groups.map((group, j) => (
        <li
          key={group}
          className={`${className} ${j === 0 ? "border-l-0" : ""} ${j === groups.length - 1 ? "border-r-0" : ""} border border-solid border-white w-[64px] -mx-[0.5px] flex items-center justify-center`}
        >
          <button
            className={j === activeGroup ? "text-mage" : ""}
            onClick={() => onSelect(j)}
          >
            {group}
          </button>
        </li>
      ))}
    </ul>
  );
}
