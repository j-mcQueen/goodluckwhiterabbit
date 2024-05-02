import { v4 as uuidv4 } from "uuid";

export default function Dropdown({ ...props }) {
  const { categoryData, setActiveProject } = props;

  return (
    <>
      <label htmlFor="projects" className="h-[1px] margin-[-1px] p-0 w-[1px]">
        Choose a project
      </label>

      <select
        name="projects"
        id="projects"
        className="bg-black text-white border border-solid border-blu p-3 my-5"
      >
        {/* TODO can't add padding to the right side of the select arrow. Solution could be to set appearance: none and add an icon instead */}
        {categoryData.map(
          (category: { title: string; links: [] }, index: number) => {
            return (
              <optgroup key={uuidv4()} label={category.title}>
                {category.links.map(
                  (link: {
                    subject: string;
                    path: string;
                    category: string;
                  }) => {
                    return (
                      <option
                        onClick={() =>
                          setActiveProject({
                            project: link.path,
                            category: link.category,
                          })
                        }
                        key={uuidv4()}
                        value={link.subject}
                      >
                        {link.subject}
                      </option>
                    );
                  }
                )}

                {index === category.links.length ? <></> : <hr />}
              </optgroup>
            );
          }
        )}
      </select>
    </>
  );
}
