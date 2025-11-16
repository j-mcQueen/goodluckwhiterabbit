import { Fragment } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { useState } from "react";

export default function Menu({ ...props }) {
  const { data } = props;

  const [activeCategory, setActiveCategory] = useState(0);

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
                <div className="w-full h-full flex items-end">
                  <button
                    type="button"
                    onClick={() => setActiveCategory(index)}
                    className={`border border-white border-solid p-3 py-5 w-[56px] h-full ${index === data.length - 1 ? "border-b-0" : null} ${index === activeCategory ? "border-r-black text-rd " : null} xl:hover:text-rd xl:hover:transition-colors`}
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
