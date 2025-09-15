export interface dashboard_client {
  name: string;
  added: string;
  email: string;
  category: string;
  code: string;
  fileCounts: {
    snapshots: number;
    keepsake: number;
    core: number;
    socials: number;
  };
  _id: string;
}

export interface file_info_heading {
  snapshots: string;
  keepsake: string;
  core: string;
  socials: string;
}
