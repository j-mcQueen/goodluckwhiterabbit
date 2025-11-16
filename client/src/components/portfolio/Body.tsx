// import { useEffect, useState } from "react";

export default function Body() {
  // const { activeCategory, activeProject } = props;

  // const [content, setContent] = useState([]);

  // useEffect(() => {
  //   const fetchImages = async () => {
  //     // implementation demands that image folder name, file name, and exported variable names containing images all match
  //     const mobile = window.matchMedia("(max-width: 1080px)").matches;
  //     const indexMap = {
  //       category: {
  //         0: "photo",
  //         1: "art",
  //         2: "design",
  //       },
  //       project: {
  //         0: "wedding",
  //         1: "commercial",
  //         2: "film",
  //         3: "events",
  //       },
  //     };

  //     let images;
  //     try {
  //       images = mobile
  //         ? await import(
  //             `../../assets/media/images/portfolio/${indexMap.category[activeCategory.category as keyof typeof indexMap.category]}/${indexMap.project[activeProject as keyof typeof indexMap.project]}/data_m.ts`
  //           )
  //         : await import(
  //             `../../assets/media/images/portfolio/${indexMap.category[activeCategory.project as keyof typeof indexMap.category]}/${indexMap.project[activeProject as keyof typeof indexMap.project]}/data_d.ts`
  //           );

  //       return setContent(images[activeProject.project]);
  //     } catch (e) {
  //       // TODO implement better error catching - what do you want to happen if there's an error?
  //       console.log(e, "!");
  //     }
  //   };

  //   fetchImages();
  // }, [activeProject, activeCategory]);

  return (
    <section>
      <div></div>
    </section>
  );
}
