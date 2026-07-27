import { Dispatch, SetStateAction } from "react";
import { portfolio_subcategory } from "./portfolioTypes";

export interface handlePortfolioLoadTypes {
  category: string;
  order: (object | Blob)[];
  renderCount: number;
  staticKeys: string[];
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(object | Blob)[]>>;
  setRenderCount: Dispatch<SetStateAction<number>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStaticKeys: Dispatch<SetStateAction<string[]>>;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  targetGroupId: string;
  targetSubcategory: portfolio_subcategory;
}
