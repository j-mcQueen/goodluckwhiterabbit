import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Content({ ...props }) {
  const { activeProject } = props;
  const [content, setContent] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      // implementation demands that image folder name, file name, and exported variable names containing images all match
      let images;
      try {
        images = await import(
          `../../assets/media/images/${activeProject.category}/${activeProject.project}/${activeProject.project}.ts`
        );

        return setContent(images[activeProject.project]);
      } catch (e) {
        // TODO implement better error catching - what do you want to happen if there's an error?
        console.log(e, "!");
      }
    };

    fetchImages();
  }, [activeProject]);

  return (
    <section>
      {content.map((image) => {
        return (
          <p key={uuidv4()} className="text-white">
            {image}
          </p>
        );
      })}
    </section>
  );
}
