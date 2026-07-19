export interface PRLabel {
  name: string;
  color: string;
}

export interface RawGitHubPR {
  id: number;
  number: number;
  title: string;
  html_url: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  repository_url: string;
  labels: PRLabel[];
  pull_request?: {
    merged_at: string | null;
    url: string;
  };
}
