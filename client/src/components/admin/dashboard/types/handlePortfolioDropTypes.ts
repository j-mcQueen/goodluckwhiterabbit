import { Dispatch, SetStateAction } from "react";
import { portfolio_subcategory } from "./portfolioTypes";

export interface handlePortfolioDropTypes {
  category: string;
  draggedIndex: number;
  dragTarget: File;
  index: number;
  order: (Blob | object)[];
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(Blob | object)[]>>;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  setTaxonomy: Dispatch<SetStateAction<portfolio_subcategory[]>>;
  source: string;
  targetGroupId: string;
  targetSubcategory: portfolio_subcategory;
  taxonomy: portfolio_subcategory[];
}
