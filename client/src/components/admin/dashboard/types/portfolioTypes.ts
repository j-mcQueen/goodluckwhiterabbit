export interface portfolio_group {
  groupId: string;
  name: string;
  order: number;
  count: number;
}

export interface portfolio_subcategory {
  _id: string;
  category: string;
  name: string;
  order: number;
  groups: portfolio_group[];
}
