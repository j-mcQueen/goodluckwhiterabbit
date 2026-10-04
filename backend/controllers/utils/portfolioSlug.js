// mirrors client/src/components/global/utils/portfolioSlug.ts - group names
// become the public portfolio URL segment (/{category}/{sub}/{group}), so
// two groups in one subcategory must never slugify to the same string
export const toGroupSlug = (name) =>
  name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// returns an error message when `name` can't be used as a group name in
// `groups`, else null - `exceptGroupId` lets a rename keep its own slug
export const validateGroupSlug = (name, groups, exceptGroupId) => {
  const slug = toGroupSlug(name);
  if (!slug) return "Group name must contain at least one letter or number";

  const taken = groups.some(
    (group) => group.groupId !== exceptGroupId && toGroupSlug(group.name) === slug,
  );
  return taken ? "A group with that name already exists" : null;
};
