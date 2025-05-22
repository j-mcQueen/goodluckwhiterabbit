export interface dashboard_client {
  name: string;
  added: string;
  category: string;
  code: string;
  fileCounts: {
    previews: number;
    full: number;
    socials: number;
    snips: number;
  };
  _id: string;
}

export interface file_info_heading {
  previews: string;
  full: string;
  socials: string;
  snips: string;
}
