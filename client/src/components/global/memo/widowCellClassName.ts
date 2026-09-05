// Sizes a widow-row image cell to match the photo grid's own column width
// and row height exactly, so a centered widow row (Body.tsx's plain-block
// case, PortfolioMemoSegments.tsx's own-group case) reads as a
// continuation of that grid, not a shrunken preview - unlike
// WidowMemoPair's own images, which are deliberately smaller (paired
// directly against memo text, not standing in for the grid itself).
//
// xl:h-[39vw] mirrors the grid's own xl:auto-rows-[39vw]; the width
// formula accounts for the row's 0.5rem (gap-2) gaps between up to 3
// columns, same math as the grid's own minmax(320px,1fr) columns produce
// in practice (the 320px floor is ignored here - at the xl breakpoint and
// up it essentially never binds). Below xl the grid is already
// grid-cols-1 (single column, natural height), so this only constrains
// width/height from xl up; the caller is responsible for stacking these
// full-width below that (see Body.tsx/PortfolioMemoSegments.tsx's
// responsive className passed to WidowImagesRow).
export const widowCellClassName = (columnSpan: 1 | 2): string =>
  `overflow-hidden w-full xl:h-[39vw] ${
    columnSpan === 2
      ? "xl:w-[calc((100%-16px)/3*2+8px)]"
      : "xl:w-[calc((100%-16px)/3)]"
  }`;
