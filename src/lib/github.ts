/**
 * Shared GitHub helpers used across the PA app.
 * Extracted from pr-tracker.ts so the PA-only build doesn't need contributor logic.
 */

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio: string | null;
  location: string | null;
  company: string | null;
  created_at: string;
}

async function ghFetch(url: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(url, { headers, cache: "no-store" });
}

export async function fetchGitHubUser(username: string): Promise<GitHubUser> {
  const res = await ghFetch(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );
  if (res.status === 404) throw new Error("USER_NOT_FOUND");
  if (res.status === 403 || res.status === 429) throw new Error("RATE_LIMITED");
  if (!res.ok) throw new Error(`API_ERROR:${res.status}`);
  return res.json() as Promise<GitHubUser>;
}
