export type PortfolioCategory = "PHOTO" | "ART" | "DESIGN";

// Photography and Design share one field shape; Art is structurally
// different (title+year on one line, details block instead of prose body,
// plus Inquire and SOLD, independent of each other) - see spec §7/§8.
// Inquire is Art-only: you inquire about buying a specific artwork, not a
// specific wedding photo - Photo/Design already has the sitewide contact
// mechanism (header mail icon) for that. All fields are independently
// optional (spec §7).
export type PhotoDesignMemoFields = {
  title: string;
  subheading: string;
  body: string;
};

export type ArtMemoFields = {
  title: string;
  year: string;
  body: string;
  inquire: boolean;
  sold: boolean;
};

export type MemoFields = PhotoDesignMemoFields | ArtMemoFields;

export const emptyMemoFields = (category: PortfolioCategory): MemoFields =>
  category === "ART"
    ? { title: "", year: "", body: "", inquire: false, sold: false }
    : { title: "", subheading: "", body: "" };
