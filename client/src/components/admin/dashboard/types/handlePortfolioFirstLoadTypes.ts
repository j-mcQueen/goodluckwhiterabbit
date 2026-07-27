import { Dispatch, SetStateAction } from "react";
import { portfolio_subcategory } from "./portfolioTypes";

export interface handlePortfolioFirstLoadTypes {
  category: string;
  newTargetGroupId: string;
  order: (Blob | object)[];
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
  setOrder: Dispatch<SetStateAction<(Blob | object)[]>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
  setStarted: Dispatch<SetStateAction<boolean>>;
  setTargetGroupId: Dispatch<SetStateAction<string>>;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  targetSubcategory: portfolio_subcategory;
}
