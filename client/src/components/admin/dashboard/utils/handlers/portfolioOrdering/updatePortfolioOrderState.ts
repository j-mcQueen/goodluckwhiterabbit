export const updatePortfolioOrderState = ({ ...params }) => {
  // ensure the active subcategory reflects the group's up-to-date count
  const updatedGroups = params.targetSubcategory.groups.map(
    (group: { groupId: string; count: number }) =>
      group.groupId === params.targetGroupId
        ? { ...group, count: params.val }
        : group,
  );
  const updatedSubcategory = {
    ...params.targetSubcategory,
    groups: updatedGroups,
  };
  params.setTargetSubcategory(updatedSubcategory);

  // reflect the change in the full taxonomy list
  const nextTaxonomy = params.taxonomy.map((sub: { _id: string }) =>
    sub._id === params.targetSubcategory._id ? updatedSubcategory : sub,
  );
  params.setTaxonomy(nextTaxonomy);
};
