import { AnimatePresence, motion } from "framer-motion";

import Up from "../../../assets/media/icons/Up";

export default function Category({ ...props }) {
  const {
    category,
    target,
    active,
    setActive,
    activeProject,
    setActiveProject,
  } = props;

  return (
    <li className="flex flex-col text-white">
      <button
        onClick={() => setActive({ ...active, [target]: !active[target] })}
        type="button"
        className="flex justify-start gap-5"
      >
        <h2 className="italic text-xl xl:text-xl">{category.title}</h2>

        <Up active={active[target]} />
      </button>

      <AnimatePresence>
        {active[target] === true && (
          <motion.ul className="flex flex-col gap-5 xl:pt-8">
            {category.links.map(
              (project: {
                subject: string;
                path: string;
                category: string;
              }) => {
                return (
                  <li key={project.subject} className="text-gray-400">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveProject({
                          project: project.path,
                          category: project.category,
                        })
                      }
                      className={`${activeProject === project.path ? "text-blu" : null} xl:hover:text-blu xl:hover:transition-colors`}
                    >
                      {project.subject}
                    </button>
                  </li>
                );
              }
            )}
          </motion.ul>
        )}
      </AnimatePresence>
    </li>
  );
}
