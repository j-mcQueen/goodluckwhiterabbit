import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import Up from "../../../assets/media/icons/Up";

export default function Dropdown({ ...props }) {
  const {
    activeCategory,
    activeProject,
    categoryData,
    setActiveCategory,
    setActiveProject,
  } = props;

  const [open, setOpen] = useState(false);

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

  return (
    <div className="flex flex-col text-white py-5 tracking-widest">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-black text-white border border-solid border-white p-3 flex justify-center gap-2 z-10"
      >
        <span className="text-2xl leading-none">COLLECTIONS</span>
        <Up active={open} />
      </button>

      <div className="relative">
        <ul
          className={`${open ? "block" : "hidden"} w-full border border-solid border-blu border-t-0 bg-black max-h-[500px] overflow-y-scroll overflow-x-hidden`}
        >
          {categoryData.map(
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
                    className="p-5 text-2xl leading-none"
                  >
                    {category.title}

                    <ul>
                      {category.projects.map(
                        (
                          project: {
                            name: string;
                            key: string;
                          },
                          j: number
                        ) => {
                          return (
                            <li key={project.key}>
                              <motion.button
                                variants={animationVariants}
                                initial="initial"
                                whileInView="animate"
                                viewport={{
                                  once: true,
                                }}
                                custom={j}
                                onClick={() => {
                                  setActiveCategory(index);
                                  setActiveProject(j);
                                }}
                                className={`${activeCategory === index && activeProject === j ? "text-blu" : "text-gray"} text-lg font-inter flex flex-col pt-5`}
                              >
                                {project.name}
                              </motion.button>
                            </li>
                          );
                        }
                      )}
                    </ul>
                  </motion.li>

                  {index !== categoryData.length - 1 ? (
                    <hr className="block border-t-[1px] border-solid border-blu h-[0.5px]" />
                  ) : (
                    <></>
                  )}
                </Fragment>
              );
            }
          )}
        </ul>
      </div>
    </div>
  );
}
