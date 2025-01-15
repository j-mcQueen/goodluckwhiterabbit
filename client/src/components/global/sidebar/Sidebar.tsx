import { useState } from "react";

import Category from "../../portfolio/photo/Category";
import Title from "../title/Title";

export default function Sidebar({ ...props }) {
  const {
    title,
    subtext,
    page,
    activeProject,
    categoryData,
    setActiveProject,
  } = props;

  const [activeCtgs, setActiveCtgs] = useState({
    0: false,
    1: false,
    2: false,
  });

  return (
    <aside className="xl:max-w-[25dvw] pb-10 xl:pb-0">
      <Title page={page} title={title} subtext={subtext} />

      <ul className="flex flex-col items-center xl:items-start justify-center gap-20 xl:gap-10 pb-10 xl:pt-8">
        {categoryData.map(
          (category: { title: string; links: [] }, index: number) => {
            return (
              <Category
                key={category.title}
                category={category}
                target={index}
                active={activeCtgs}
                setActive={setActiveCtgs}
                activeProject={activeProject}
                setActiveProject={setActiveProject}
              />
            );
          }
        )}
      </ul>
    </aside>
  );
}
