import PortfolioSubcategory from "../../models/portfolioSubcategory.js";

// keyed by the Mongo `category` enum value; `path`/`title` mirror the legacy
// client/src/components/portfolio/data/sidebar/data.ts shape so the public
// endpoint can be a drop-in replacement for that static file.
const CATEGORY_META = {
  PHOTO: { path: "/photo", title: "PHOTOGRAPHY" },
  ART: { path: "/art", title: "ART" },
  DESIGN: { path: "/design", title: "DESIGN" },
};

export const loadPortfolioTaxonomy = async () => {
  return PortfolioSubcategory.find().sort({ category: 1, order: 1 }).lean();
};

// shape: { "/photo": { title, subcategories: string[], menu: { [name]: groupId }[] }, ... }
export const formatPublicTaxonomy = (subcategoryDocs) => {
  const sidebarData = {};
  for (const meta of Object.values(CATEGORY_META)) {
    sidebarData[meta.path] = { title: meta.title, subcategories: [], menu: [] };
  }

  const byCategory = {};
  for (const sub of subcategoryDocs) {
    (byCategory[sub.category] ??= []).push(sub);
  }

  for (const [category, meta] of Object.entries(CATEGORY_META)) {
    const subs = [...(byCategory[category] ?? [])].sort((a, b) => a.order - b.order);

    sidebarData[meta.path].subcategories = subs.map((sub) => sub.name);
    sidebarData[meta.path].menu = subs.map((sub) => {
      const groupMap = {};
      for (const group of [...sub.groups].sort((a, b) => a.order - b.order)) {
        groupMap[group.name] = group.groupId;
      }
      return groupMap;
    });
  }

  return sidebarData;
};

// richer shape for the admin manager: real ids to target edit/delete/upload calls against
export const formatAdminTaxonomy = (subcategoryDocs) => {
  return subcategoryDocs.map((sub) => ({
    _id: sub._id,
    category: sub.category,
    name: sub.name,
    order: sub.order,
    groups: [...sub.groups]
      .sort((a, b) => a.order - b.order)
      .map((group) => ({
        groupId: group.groupId,
        name: group.name,
        order: group.order,
        count: group.count,
      })),
  }));
};
