import { Dispatch, SetStateAction } from "react";
import { portfolio_subcategory } from "./portfolioTypes";

export interface handlePortfolioFileUploadTypes {
  category: string;
  sub: string;
  groupId: string;
  // required when isReplace is true (identifies which existing image to
  // overwrite); omitted for a new append - the backend derives the position
  // itself in that case, since the client may not have the full group
  // loaded under pagination and can't reliably compute a collision-free one
  position?: number;
  file: File;
  isReplace: boolean;
  targetSubcategory: portfolio_subcategory;
  setTargetSubcategory: Dispatch<SetStateAction<portfolio_subcategory | null>>;
  taxonomy: portfolio_subcategory[];
  setTaxonomy: Dispatch<SetStateAction<portfolio_subcategory[]>>;
  setNotice: Dispatch<
    SetStateAction<{
      status: boolean;
      message: string;
      logout: { status: boolean; path: null | string };
    }>
  >;
}
