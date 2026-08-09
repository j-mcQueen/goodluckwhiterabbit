import { emptyMemoFields, MemoFields, PortfolioCategory } from "./types";

// Reverses generateMemoHtml.ts, using the data-field attributes it writes -
// this is what lets the edit dialog re-open pre-filled with prior values
// even though the database only stores rendered markup, not structured
// fields (spec confirmed decision). Browser-only (DOMParser); this is only
// ever called from the admin edit dialog.
export const parseMemoHtml = (html: string, category: PortfolioCategory): MemoFields => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const textOf = (field: string) =>
    doc.querySelector(`[data-field="${field}"]`)?.textContent?.trim() ?? "";
  const has = (field: string) => doc.querySelector(`[data-field="${field}"]`) !== null;

  if (category === "ART") {
    return {
      title: textOf("title").replace(/,$/, ""),
      year: textOf("year"),
      body: textOf("body"),
      inquire: has("inquire"),
      sold: has("sold"),
    };
  }

  return {
    title: textOf("title"),
    subheading: textOf("subheading"),
    body: textOf("body"),
  };
};

export const memoFieldsFromHtml = (html: string | null, category: PortfolioCategory): MemoFields =>
  html ? parseMemoHtml(html, category) : emptyMemoFields(category);
