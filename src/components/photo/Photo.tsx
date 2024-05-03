import { useState } from "react";
import { projects } from "../photo/data/projects";

import Header from "../global/header/Header";
import MobileHeader from "../global/header/mobile/Header";
import Sidebar from "../global/sidebar/Sidebar";
import Content from "./Content";
import Title from "../global/title/Title";
import Dropdown from "../global/dropdown/Dropdown";

export default function Photo() {
  const mobile = window.matchMedia("(max-width: 1080px)").matches;
  const activePage = 1;

  const categoryData = [
    { img: "", imgAlt: "", title: "I. COMMERCIAL", links: projects.commercial },
    { img: "", imgAlt: "", title: "II. EDITORIAL", links: projects.editoral },
    {
      img: "",
      imgAlt: "",
      title: "II. 35MM FILM ARCHIVE",
      links: projects.film,
    },
    { img: "", imgAlt: "", title: "II. EVENTS", links: projects.events },
  ];

  const [activeProject, setActiveProject] = useState({
    project: "taglialatella",
    category: "commercial",
  });

  // create top-level state to hold active subject
  // when a user clicks on a list item, active subject is updated
  // create a component to hold area that photos will load in
  // when active subject is updated, component is rendered with data for that subject e.g. tag galleries
  // for now, we can create objects for each section's images that import all the photos locally, then export each image set in an object
  // a better solution may be to use a CDN
  // User can click "load more" button to render the next 6/9/12 images

  // to create a masonry-style grid, apply an inline style of column-count: 3 on the container and set the displaly value of each item to inline-block

  return (
    <div className="w-[calc(100dvw-1.5rem-2px)] h-[calc(100dvh-1.5rem-2px)]">
      {mobile === true ? (
        <MobileHeader page={activePage} />
      ) : (
        <Header page={activePage} />
      )}

      <main className="flex xl:flex-row flex-col xl:overflow-y-scroll p-5">
        {mobile === true ? (
          <>
            <Title
              page={activePage}
              subtext={
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore  magna aliqua."
              }
              title={"PHOTOGRAPHY WORK"}
            />

            <Dropdown
              categoryData={categoryData}
              activeProject={activeProject}
              setActiveProject={setActiveProject}
            />
          </>
        ) : (
          <Sidebar
            title={"PHOTOGRAPHY WORK"}
            subtext={
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore  magna aliqua."
            }
            page={activePage}
            categoryData={categoryData}
            activeProject={activeProject}
            setActiveProject={setActiveProject}
          />
        )}

        <Content activeProject={activeProject} />
      </main>
    </div>
  );
}
