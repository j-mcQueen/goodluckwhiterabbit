import { determineHost as host } from "../../../../../global/utils/determineHost";

export const handleAddSubcategory = async ({ ...params }) => {
  const { category, name, taxonomy, setTaxonomy, setError, setSpinner } =
    params;

  setSpinner(true);

  try {
    const response = await fetch(
      `${host}/admin/portfolio/${category}/subcategories`,
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
      setTaxonomy([...taxonomy, data]);
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
