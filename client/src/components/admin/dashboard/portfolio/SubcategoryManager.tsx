import { useState } from "react";
import { handleAddSubcategory } from "../utils/handlers/portfolio/handleAddSubcategory";
import { imageset_select_btns } from "../styles/styles";
import { deleteBadge } from "../../../global/styles/buttons";
import { portfolio_subcategory } from "../types/portfolioTypes";

import Loading from "../../../global/Loading";
import Close from "../../../../assets/media/icons/Close";

export default function SubcategoryManager({ ...props }) {
  const { category, taxonomy, setTaxonomy, setDeleteModalToggle, onSelectSubcategory } =
    props;

  const [name, setName] = useState("");
  const [error, setError] = useState({ state: false, message: "" });
  const [spinner, setSpinner] = useState(false);

  const subcategories = taxonomy.filter(
    (sub: portfolio_subcategory) => sub.category === category,
  );

  return (
    <div className="flex flex-col items-center gap-5 text-white p-5">
      <h2 className="pb-2 tracking-widest">
        SUBCATEGORIES IN <span className="text-rd">{category}</span>
      </h2>

      <div className="flex flex-wrap justify-center gap-3 max-w-[60dvw]">
        {subcategories.map((sub: portfolio_subcategory) => {
          const totalImages = sub.groups.reduce(
            (sum: number, group: { count: number }) => sum + group.count,
            0,
          );

          return (
            <div key={sub._id} className="relative">
              <button
                type="button"
                className={imageset_select_btns}
                onClick={() => onSelectSubcategory(sub)}
              >
                {sub.name}
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeleteModalToggle({
                    active: true,
                    type: "subcategory",
                    subId: sub._id,
                    groupId: "",
                    name: sub.name,
                    estimate: `${sub.groups.length} group${sub.groups.length === 1 ? "" : "s"}, ~${totalImages} image${totalImages === 1 ? "" : "s"}`,
                  })
                }
                className={deleteBadge}
              >
                <Close className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {subcategories.length === 0 ? (
          <p className="opacity-60">NO SUBCATEGORIES YET</p>
        ) : null}
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const success = await handleAddSubcategory({
            category,
            name,
            taxonomy,
            setTaxonomy,
            setError,
            setSpinner,
          });
          if (success) setName("");
        }}
        className="flex gap-3 items-center"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="NEW SUBCATEGORY NAME"
          minLength={1}
          maxLength={50}
          className="bg-black border border-solid border-white text-white xl:hover:border-rd focus:border-rd p-2 focus:outline-none placeholder:text-white transition-colors uppercase"
          required
        />
        <button
          type="submit"
          className="border border-solid px-3 py-2 xl:hover:text-rd xl:hover:drop-shadow-red focus:text-rd focus:outline-none transition-colors"
        >
          {spinner ? <Loading /> : "ADD SUBCATEGORY"}
        </button>
      </form>

      {error.state ? <p className="text-rd">{error.message}</p> : null}
    </div>
  );
}
