import { Fragment, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { motion } from "framer-motion";
import Up from "../../../assets/media/icons/Up";

export default function Dropdown({ ...props }) {
  const { categoryData, activeProject, setActiveProject } = props;
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
    <div className="flex flex-col text-white py-5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-black text-white border border-solid border-blu p-3 flex justify-center gap-2"
      >
        PROJECTS
        <Up active={open} />
      </button>

      <div className="relative">
        <ul
          className={`${open ? "block" : "hidden"} absolute top-0 w-full border border-solid border-blu border-t-0 bg-black max-h-[500px] overflow-y-scroll overflow-x-hidden`}
        >
          {categoryData.map(
            (category: { title: string; links: [] }, index: number) => {
              return (
                <Fragment key={uuidv4()}>
                  <motion.li
                    variants={animationVariants}
                    initial="initial"
                    whileInView="animate"
                    viewport={{
                      once: true,
                    }}
                    custom={index}
                    className="p-5 text-lg leading-none"
                  >
                    {category.title}

                    <ul>
                      {category.links.map(
                        (
                          link: {
                            subject: string;
                            path: string;
                            category: string;
                          },
                          j: number
                        ) => {
                          return (
                            <li key={uuidv4()}>
                              <motion.button
                                variants={animationVariants}
                                initial="initial"
                                whileInView="animate"
                                viewport={{
                                  once: true,
                                }}
                                custom={j}
                                onClick={() =>
                                  setActiveProject({
                                    project: link.path,
                                    category: link.category,
                                  })
                                }
                                className={`${activeProject.project === link.path ? "text-blu" : "text-gray"} text-sm font-inter flex flex-col pt-5`}
                              >
                                {link.subject}
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
