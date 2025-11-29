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

  const subcategories = [
    "WEDDINGS",
    "EVENTS",
    "FILM",
    "COMMERCIAL",
    "EDITORIAL",
  ];

  // 4 scenarios need accounted for:
  // 1. User loads into page and views first set of images on photography + weddings page
  // 2. User scrolls to load next set of images (handleIntersection)
  // 3. User clicks on a sidebar item to load a different category
  // 4. What happens to the UI when a user loads enough images to scroll to the next sub-category

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
                  {Object.keys(data[index]).map(
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
                    {subcategories[index]}
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
