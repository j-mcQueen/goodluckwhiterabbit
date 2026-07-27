// shape returned by GET /api/portfolio/taxonomy - matches the legacy
// hardcoded sidebar_data (data/sidebar/data.ts) so callers didn't need
// rewriting when the source moved from a static file to a live fetch
export interface PortfolioSidebarData {
  [route: string]: {
    title: string;
    subcategories: string[];
    menu: { [name: string]: string }[];
  };
}
