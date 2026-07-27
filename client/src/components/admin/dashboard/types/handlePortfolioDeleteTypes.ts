import { Dispatch, SetStateAction } from "react";
import { portfolio_subcategory } from "./portfolioTypes";

export interface handlePortfolioDeleteTypes {
  category: string;
  index: number;
  order: (Blob | object)[];
  renderCount: number;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(Blob | object)[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  setTaxonomy: Dispatch<SetStateAction<portfolio_subcategory[]>>;
  targetGroupId: string;
  targetSubcategory: portfolio_subcategory;
  taxonomy: portfolio_subcategory[];
}
