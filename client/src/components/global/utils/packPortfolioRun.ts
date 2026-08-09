// Explicit-placement equivalent of the public grid's CSS dense packing
// (Body.tsx: xl:grid-flow-dense, Unit.tsx: xl:col-span-2 above a 1.3 aspect
// ratio) for a single memo-bounded run of images. Computed explicitly,
// rather than left to `grid-auto-flow: dense`, so a memo boundary can never
// be crossed by auto-placement (see spec §2.1) - this only ever runs on a
// run adjacent to a real memo; zero-memo groups never call this.
//
// Restricted case that keeps this simple: every item is exactly 1 row tall,
// row height is uniform, and column span is only ever 1 or 2 of 3 columns -
// no general 2D bin packing needed, just a scan for the first open slot.

export const COLUMNS = 3;
export const SPAN_THRESHOLD = 1.3; // matches Unit.tsx's SPAN_THRESHOLD

export type RunImageItem = {
  key: string;
  ratio: number; // width/height; defaults to 1 (portrait/square, span 1) before the image has loaded, matching Unit.tsx's initial state
};

export type PackedImage = {
  key: string;
  row: number; // 1-indexed, relative to this run only
  column: number; // 1-indexed
  columnSpan: 1 | 2;
};

export type RunPacking = {
  placements: PackedImage[];
  rowCount: number;
  isWidowRow: boolean; // trailing row doesn't fill all 3 columns
  widowKeys: string[]; // keys of the items in that trailing row, if isWidowRow
};

export const packPortfolioRun = (items: RunImageItem[]): RunPacking => {
  if (items.length === 0) {
    return { placements: [], rowCount: 0, isWidowRow: false, widowKeys: [] };
  }

  const occupied = new Set<string>(); // "row,col"
  const placements: PackedImage[] = [];
  let rowCount = 1;

  for (const item of items) {
    const columnSpan: 1 | 2 = item.ratio >= SPAN_THRESHOLD ? 2 : 1;

    let placedRow = -1;
    let placedCol = -1;

    for (let row = 1; placedRow === -1; row++) {
      for (let col = 1; col <= COLUMNS - columnSpan + 1; col++) {
        let fits = true;
        for (let span = 0; span < columnSpan; span++) {
          if (occupied.has(`${row},${col + span}`)) {
            fits = false;
            break;
          }
        }
        if (fits) {
          placedRow = row;
          placedCol = col;
          break;
        }
      }
    }

    for (let span = 0; span < columnSpan; span++) {
      occupied.add(`${placedRow},${placedCol + span}`);
    }
    placements.push({ key: item.key, row: placedRow, column: placedCol, columnSpan });
    rowCount = Math.max(rowCount, placedRow);
  }

  let trailingRowColumns = 0;
  for (let col = 1; col <= COLUMNS; col++) {
    if (occupied.has(`${rowCount},${col}`)) trailingRowColumns += 1;
  }

  const isWidowRow = trailingRowColumns < COLUMNS;
  const widowKeys = isWidowRow
    ? placements.filter((placement) => placement.row === rowCount).map((placement) => placement.key)
    : [];

  return { placements, rowCount, isWidowRow, widowKeys };
};
