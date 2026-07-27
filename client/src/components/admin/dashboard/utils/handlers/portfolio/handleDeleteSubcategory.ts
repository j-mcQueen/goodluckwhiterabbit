import { determineHost as host } from "../../../../../global/utils/determineHost";
import { portfolio_subcategory } from "../../../types/portfolioTypes";

export const handleDeleteSubcategory = async ({ ...params }) => {
  const { subId, taxonomy, setTaxonomy, setNotice } = params;

  try {
    const response = await fetch(
      `${host}/admin/portfolio/subcategories/${subId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const data = await response.json();

    if (response.status === 200 && data.success) {
      setTaxonomy(
        taxonomy.filter((sub: portfolio_subcategory) => sub._id !== subId),
      );
      return true;
    }

    setNotice({
      status: true,
      message:
        "There was an error deleting this subcategory. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
    return false;
  } catch (error) {
    setNotice({
      status: true,
      message:
        "There was an error deleting this subcategory. Please refresh the page and try again.",
      logout: { status: false, path: null },
    });
    return false;
  }
};
