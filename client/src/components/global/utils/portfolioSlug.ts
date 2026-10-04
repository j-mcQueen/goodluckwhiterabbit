// URL slugs for the public portfolio (/{category}/{sub}/{group}). Must stay
// in sync with backend/controllers/utils/portfolioSlug.js, which enforces
// group-slug uniqueness within a subcategory on create/rename - the same
// key-shape coupling the S3 regexes already have between client and server.

// "MILK & ROSES I" -> "milk-roses-i"; "CAFÉ" -> "cafe"
export const toGroupSlug = (name: string): string =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// subcategory names are already restricted to [A-Z0-9_-] and unique per
// category (see adminAddSubcategory), so lowercasing is collision-free -
// collapsing "_" into "-" like toGroupSlug would not be ("A_B" vs "A-B")
export const toSubSlug = (name: string): string => name.toLowerCase();
