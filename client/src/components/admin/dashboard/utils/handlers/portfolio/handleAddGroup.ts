import { determineHost as host } from "../../../../../global/utils/determineHost";
import { portfolio_subcategory } from "../../../types/portfolioTypes";

export const handleAddGroup = async ({ ...params }) => {
  const {
    subId,
    name,
    targetSubcategory,
    setTargetSubcategory,
    taxonomy,
    setTaxonomy,
    setError,
    setSpinner,
  } = params;

  setSpinner(true);

  try {
    const response = await fetch(
      `${host}/admin/portfolio/subcategories/${subId}/groups`,
      {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      },
    );
    const data = await response.json();

    setSpinner(false);

    if (response.status === 201) {
      const updatedSubcategory = {
        ...targetSubcategory,
        groups: [...targetSubcategory.groups, data],
      };
      setTargetSubcategory(updatedSubcategory);
      setTaxonomy(
        taxonomy.map((sub: portfolio_subcategory) =>
          sub._id === subId ? updatedSubcategory : sub,
        ),
      );
      setError({ state: false, message: "" });
      return true;
    }

    setError({ state: true, message: data.error ?? "Something went wrong." });
    return false;
  } catch (error) {
    setSpinner(false);
    setError({
      state: true,
      message: "Something went wrong. Please try again.",
    });
    return false;
  }
};
