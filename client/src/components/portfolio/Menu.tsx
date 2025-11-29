import { Fragment } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Menu({ ...props }) {
  const { data } = props;

  const [activeSub, setActiveSub] = useState(0); // updates when sidebar items are clicked
  const [activeGroup, setActiveGroup] = useState(0); // updates when we have pulled images in the next group

  const animationVariants = {
    initial: {
      x: -20,
      opacity: 0,
    },
    animate: (index: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: 0.05 * index },
    }),
  };

  // 4 scenarios need accounted for:
  // 1. User loads into page and views first set of images on photography + weddings page
  // 2. User scrolls to load next set of images (handleIntersection)
  // 3. User clicks on a sidebar item to load a different category
  // 4. What happens to the UI when a user loads enough images to scroll to the next sub-category

  const groups = [
    {
      "MAUREEN + JOE": "001",
      "MARILEE + JAMES": "002",
      "9 ORCHARD": "003",
      MONROE: "004",
      "": "005",
      "THE RIVER CAFE": "006",
      "M&R I": "007",
      "FANDI MATA": "008",
      "LE FANFARE": "009",
      "CARROLL GARDEN": "010",
      TUFFET: "011",
      "TIME 100": "012",
      "THE BOX HOUSE": "013",
      "M&R II": "014",
      "BK WINERY": "015",
      "501 UNION": "016",
      "THE SANCTUARY": "017",
      "RY x MW x TAG": "018",
    },
    {
      "EVENT 1": "001",
      "EVENT 2": "002",
      "EVENT 3": "003",
      "EVENT 4": "004",
    },
    {
      "FILM 1": "001",
      "FILM 2": "002",
      "FILM 3": "003",
      "FILM 4": "004",
    },
    {
      "COMMERCIAL 1": "001",
      "COMMERCIAL 2": "002",
      "COMMERCIAL 3": "003",
      "COMMERCIAL 4": "004",
    },
    {
      "EDITORIAL 1": "001",
      "EDITORIAL 2": "002",
      "EDITORIAL 3": "003",
      "EDITORIAL 4": "004",
    },
  ];

  return (
    <ul className="flex flex-row-reverse h-full [writing-mode:sideways-lr]">
      {data.map(
        (
          category: {
            title: string;
            projects: [];
          },
          index: number
        ) => {
          return (
            <Fragment key={category.title}>
              <motion.li
                variants={animationVariants}
                initial="initial"
                whileInView="animate"
                viewport={{
                  once: true,
                }}
                custom={index}
                className={`tracking-widest leading-none h-full -my-[0.5px]`}
              >
                <ul
                  className={`${activeSub !== index ? "invisible" : ""} overflow-x-scroll max-w-[189px] [writing-mode:vertical-rl]`}
                >
                  {Object.keys(groups[index]).map(
                    (project: string, j: number) => {
                      return (
                        <li
                          key={project}
                          className={`${j === 17 ? "border-l-0" : ""} border border-solid border-white -mx-[1px] w-[56px] flex items-center justify-center xl:transition-colors`}
                        >
                          <button
                            type="button"
                            onClick={() => setActiveGroup(j)}
                            className={`${j === activeGroup && activeSub === index ? "text-cyan-400" : null} xl:hover:text-cyan-400 xl:transition-colors`}
                          >
                            {project}
                          </button>
                        </li>
                      );
                    }
                  )}
                </ul>

                <div className="h-full flex items-end">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveGroup(0);
                      setActiveSub(index);
                    }}
                    className={`border border-white border-solid p-3 py-5 w-[56px] h-full ${index === data.length - 1 ? "border-b-0" : null} ${index === activeSub ? "border-r-black text-ylw " : null} xl:hover:text-ylw xl:hover:transition-colors [writing-mode:vertical-rl]`}
                  >
                    {category.title}
                  </button>
                </div>
              </motion.li>
            </Fragment>
          );
        }
      )}
    </ul>
  );
}
