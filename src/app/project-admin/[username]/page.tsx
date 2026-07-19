import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, AlertTriangle, Info, RefreshCw, FolderGit2, GitMerge, Tag, Trophy, BookOpen, ExternalLink, Users, Star } from "lucide-react";
import { ds, fontMono, ROLE_STYLE } from "@/lib/ds";
import { fetchGitHubUser } from "@/lib/github";
import { GSSOC_REPO_SET } from "@/data/gssoc-repos";
import { buildProjectAdminData } from "@/lib/project-admin-tracker";
import { GitHubProfileCard } from "@/components/pr-tracker/GitHubProfileCard";
import { AdminScoringGuide } from "@/components/project-admin/AdminScoringGuide";
import { SubscribeButton } from "@/components/SubscribeModal";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const decoded = decodeURIComponent(username);
  try {
    const user = await fetchGitHubUser(decoded);
    const title = `@${user.login} — PA Activity Tracker · GSSoC 2026`;
    const description = `View estimated GSSoC 2026 Project Admin activity tracking for @${user.login}. Points are approximate.`;
    return {
      title,
      description,
    };
  } catch {
    return { title: "PA Activity Tracker | GSSoC Tracker" };
  }
}

export default async function ProjectAdminDashboard({ params }: Props) {
  const { username } = await params;
  const decoded = decodeURIComponent(username);

  let user = null;
  let errorCode: string | null = null;

  try {
    user = await fetchGitHubUser(decoded);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "USER_NOT_FOUND") return notFound();
    errorCode = msg.startsWith("RATE_LIMITED") ? "RATE_LIMITED" : "API_ERROR";
  }

  if (errorCode) return <ErrorPage username={decoded} code={errorCode} />;
  if (!user) return notFound();

  // Find user's repositories registered in GSSoC 2026
  const userRepos = Array.from(GSSOC_REPO_SET).filter((repoKey) => {
    return repoKey.split("/")[0] === user.login.toLowerCase();
  });

  const repoScores = await Promise.all(
    userRepos.map(async (repoKey) => {
      const [owner, repo] = repoKey.split("/");
      try {
        const data = await buildProjectAdminData(owner, repo);
        return { repoKey, data, error: null };
      } catch (err) {
        return { repoKey, data: null, error: err instanceof Error ? err.message : "Error fetching repo stats" };
      }
    })
  );

  const totalPoints = repoScores.reduce((sum, item) => sum + (item.data?.totalPoints ?? 0), 0);
  const totalMerged = repoScores.reduce((sum, item) => sum + (item.data?.totalMerged ?? 0), 0);
  const totalContributors = repoScores.reduce((sum, item) => sum + (item.data?.uniqueContributors ?? 0), 0);

  const fetchedAt = new Date().toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

  return (
    <div style={{ minHeight: "100vh", background: ds.canvasSoft, fontFamily: "var(--font-sans)", color: ds.ink }}>
      {/* Sticky nav */}
      <div style={{
        background: ds.canvas,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ds.hairlineCool}`,
        padding: "0 24px",
        height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 20,
        boxShadow: "0 1px 4px rgba(23,23,23,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            color: ds.inkMute, textDecoration: "none", fontSize: 13,
            padding: "4px 8px", borderRadius: ds.rSm,
          }}>
            <ArrowLeft size={13} /> Search
          </Link>
          <div style={{ width: 1, height: 16, background: ds.hairline }} />
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: "rgba(129,140,248,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FolderGit2 size={12} color="#818cf8" />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: ds.ink, letterSpacing: "-0.01em" }}>
              PA Activity Tracker
            </span>
            <span style={{
              fontSize: 12, color: ds.inkMute2, fontFamily: fontMono,
              background: ds.canvasSoft,
              padding: "1px 7px", borderRadius: ds.rFull,
              border: `1px solid ${ds.hairlineCool}`,
            }}>
              @{user.login}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: ds.inkFaint }}>
            <Clock size={10} /> {fetchedAt}
          </span>
          <a
            href={`/project-admin/${encodeURIComponent(decoded)}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: ds.rSm,
              border: `1px solid ${ds.hairlineCool}`,
              fontSize: 12, fontWeight: 500, color: ds.inkMute,
              textDecoration: "none", background: ds.canvas,
            }}
          >
            <RefreshCw size={11} /> Refresh
          </a>
        </div>
      </div>

      {/* Page body */}
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 64px" }}>
        
        {/* Profile Card */}
        <GitHubProfileCard 
          user={user} 
          rank="Elite Contributor" 
          totalPoints={totalPoints}
          badgeOverride={{
            label: "Project Admin",
            emoji: "⚙️",
            pill: ROLE_STYLE["project-admin"].bg,
            pillText: ROLE_STYLE["project-admin"].color,
            pillBorder: ROLE_STYLE["project-admin"].border,
            glow: "rgba(99,102,241,0.12)"
          }}
          pointsLabel="Admin Points"
          pointsColor="#4f46e5"
        />

        {/* Dual-role notice */}
        <div style={{
          background: "linear-gradient(90deg, rgba(62,207,142,0.04) 0%, rgba(99,102,241,0.04) 100%)",
          border: `1px solid ${ds.hairlineCool}`,
          borderRadius: ds.rLg,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12
        }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: ds.ink }}>Also a Contributor?</span>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: ds.inkMute }}>
              Track your GSSoC 2026 points from submitted PRs on your contributor dashboard.
            </p>
          </div>
          <a 
            href={`https://gssoc-tracker.vercel.app/pr-tracker/${encodeURIComponent(decoded)}`}
            style={{
              padding: "6px 14px",
              borderRadius: ds.rSm,
              border: `1.5px solid ${ds.primary}`,
              background: "transparent",
              color: ds.primaryDeep,
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 0.15s"
            }}
          >
            Contributor Dashboard →
          </a>
        </div>

        {/* Disclaimer Banner */}
        <div style={{
          background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.3)",
          borderRadius: ds.rLg,
          padding: "12px 18px",
          marginBottom: 16,
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}>
          <Info size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 13, fontWeight: 600, color: "#92400e" }}>
              Estimated Points — Not Official
            </p>
            <p style={{ margin: 0, fontSize: 12, color: "#a16207", lineHeight: 1.5 }}>
              These scores are approximations based on GitHub activity. They may not match the official GSSoC leaderboard due to undisclosed scoring constraints (streaks, community tasks, form-based data, etc.).
            </p>
          </div>
        </div>

        {/* Aggregate Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
          <StatCard icon={<Trophy size={16} />} label="Total Admin Points" value={totalPoints} sub="Sum of all repos" color="#4f46e5" bg="rgba(99,102,241,0.06)" />
          <StatCard icon={<BookOpen size={16} />} label="Registered Projects" value={userRepos.length} sub="Matching repos" color="#818cf8" bg="rgba(129,140,248,0.06)" />
          <StatCard icon={<GitMerge size={16} />} label="Merged GSSoC PRs" value={totalMerged} sub="Across all projects" color={ds.primaryDeep} bg="rgba(62,207,142,0.06)" />
          <StatCard icon={<Users size={16} />} label="Contributors" value={totalContributors} sub="Active on your projects" color="#8b5cf6" bg="rgba(139,92,246,0.06)" />
        </div>

        {/* Repos Breakdown */}
        <p style={{ margin: "0 0 12px", fontSize: 11, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Registered Projects &amp; Activity Breakdown
        </p>

        {repoScores.length === 0 ? (
          <div style={{ background: ds.canvas, border: `1px solid ${ds.hairlineCool}`, borderRadius: ds.rXl, padding: 48, textAlign: "center" }}>
            <FolderGit2 size={36} color={ds.inkMute2} style={{ marginBottom: 12 }} />
            <h3 style={{ margin: "0 0 6px", fontSize: 16, fontWeight: 600, color: ds.ink }}>No registered projects found</h3>
            <p style={{ margin: 0, fontSize: 13, color: ds.inkMute, maxWidth: 440, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              You are not the owner of any GSSoC 2026 registered repositories in the official registry. If this is an error, check the registered name on the GirlScript portal.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {repoScores.map(({ repoKey, data, error }) => {
              if (error) {
                return (
                  <div key={repoKey} style={{ background: ds.canvas, border: `1.5px solid #fee2e2`, borderRadius: ds.rLg, padding: "16px 20px", display: "flex", alignItems: "center", gap: 10 }}>
                    <AlertTriangle size={16} color="#ef4444" />
                    <span style={{ fontSize: 13, color: "#b91c1c", fontWeight: 500 }}>
                      Error loading stats for {repoKey}: {error}
                    </span>
                  </div>
                );
              }

              if (!data) return null;
              const [owner, repo] = repoKey.split("/");

              // Count difficulty levels
              const counts = { beginner: 0, intermediate: 0, advanced: 0, critical: 0 };
              data.validPRs.forEach((pr) => {
                if (pr.difficulty === "level:beginner") counts.beginner++;
                else if (pr.difficulty === "level:intermediate") counts.intermediate++;
                else if (pr.difficulty === "level:advanced") counts.advanced++;
                else if (pr.difficulty === "level:critical") counts.critical++;
              });

              return (
                <div key={repoKey} style={{
                  background: ds.canvas,
                  border: `1px solid ${ds.hairlineCool}`,
                  borderRadius: ds.rXl,
                  boxShadow: "0 2px 8px rgba(23,23,23,0.04)",
                  overflow: "hidden"
                }}>
                  {/* Repo Header */}
                  <div style={{
                    padding: "16px 20px",
                    background: ds.canvasSoft,
                    borderBottom: `1px solid ${ds.hairlineCool}`,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FolderGit2 size={16} color="#4f46e5" />
                      <span style={{ fontSize: 16, fontWeight: 700, color: ds.ink }}>{repoKey}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Link 
                        href={`/project-admin/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`}
                        style={{
                          fontSize: 12,
                          color: "#4f46e5",
                          textDecoration: "none",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4
                        }}
                      >
                        Project Details <ExternalLink size={11} />
                      </Link>
                    </div>
                  </div>

                  {/* Repo Breakdown Stats */}
                  <div style={{ padding: "20px 24px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 20 }}>
                      <MiniBreakdownCard label="Beginner PRs" count={counts.beginner} points={counts.beginner * 70} />
                      <MiniBreakdownCard label="Intermediate PRs" count={counts.intermediate} points={counts.intermediate * 85} />
                      <MiniBreakdownCard label="Advanced PRs" count={counts.advanced} points={counts.advanced * 105} />
                      <MiniBreakdownCard label="Critical PRs" count={counts.critical} points={counts.critical * 130} />
                    </div>

                    {/* Repo Total */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: `1px solid ${ds.hairlineCool}`,
                      paddingTop: 16,
                      flexWrap: "wrap",
                      gap: 12
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <span style={{ fontSize: 12, color: ds.inkMute2 }}>
                          Merged GSSoC PRs: <strong style={{ color: ds.ink }}>{data.totalMerged}</strong>
                        </span>
                        <span style={{ width: 1, height: 12, background: ds.hairline }} />
                        <span style={{ fontSize: 12, color: ds.inkMute2 }}>
                          Contributors: <strong style={{ color: ds.ink }}>{data.uniqueContributors}</strong> active
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: ds.inkMute }}>Repo Total:</span>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#4f46e5", fontFamily: fontMono }}>
                          {data.totalPoints.toLocaleString()} pts
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Scoring Guide note */}
        <div style={{ marginTop: 28 }}>
          <AdminScoringGuide />
        </div>

        {/* Footer row of buttons */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 64,
          marginBottom: 12,
          paddingTop: 24,
          borderTop: `1px solid ${ds.hairlineCool}`,
        }}>
          {/* Built by PRODHOSH */}
          <a
            href="https://github.com/PRODHOSH"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: ds.rFull,
              border: `1px solid ${ds.hairlineCool}`,
              background: ds.canvasSoft,
            }}
          >
            <Image
              src="https://avatars.githubusercontent.com/PRODHOSH"
              alt="PRODHOSH"
              width={22}
              height={22}
              unoptimized
              style={{ borderRadius: "50%", display: "block" }}
            />
            <span style={{ fontSize: 12, color: ds.inkMute }}>
              Built by <span style={{ color: ds.ink, fontWeight: 600 }}>@PRODHOSH</span>
            </span>
          </a>

          {/* Star on GitHub */}
          <a
            href="https://github.com/PRODHOSH/gssoc-tracker"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              textDecoration: "none",
              padding: "6px 14px",
              borderRadius: ds.rFull,
              border: `1px solid ${ds.hairlineCool}`,
              background: ds.canvasSoft,
              fontSize: 12,
              fontWeight: 500,
              color: ds.inkMute,
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(202,138,4,0.5)";
              e.currentTarget.style.color = "#ca8a04";
              e.currentTarget.style.background = "rgba(202,138,4,0.06)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = ds.hairlineCool;
              e.currentTarget.style.color = ds.inkMute;
              e.currentTarget.style.background = ds.canvasSoft;
            }}
          >
            <Star size={13} /> Star on GitHub
          </a>

          {/* Get alerts */}
          <SubscribeButton />
        </div>

        {/* Footer text */}
        <p style={{ textAlign: "center", fontSize: 12, color: ds.inkFaint, lineHeight: 1.7, margin: 0 }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation ·{" "}
          <a href="/terms" style={{ color: ds.inkMute2, textDecoration: "underline" }}>Terms &amp; Privacy</a>
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color, bg }: {
  icon: React.ReactNode; label: string;
  value: string | number; sub?: string;
  color: string; bg: string;
}) {
  return (
    <div style={{
      background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg, padding: "16px 18px",
      boxShadow: "0 1px 4px rgba(23,23,23,0.04)",
      borderLeft: `3px solid ${color}`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: bg, borderRadius: "0 0 0 80px", pointerEvents: "none" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12, position: "relative" }}>
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: ds.rSm, background: bg, color: color, flexShrink: 0 }}>
          {icon}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          {label}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 800, color: ds.ink, fontFamily: fontMono, lineHeight: 1, letterSpacing: "-0.02em", position: "relative" }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {sub && <p style={{ margin: "6px 0 0", fontSize: 11, color: ds.inkMute2, position: "relative" }}>{sub}</p>}
    </div>
  );
}

function MiniBreakdownCard({ label, count, points }: { label: string; count: number; points: number }) {
  return (
    <div style={{
      background: ds.canvasSoft,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rMd,
      padding: "10px 12px",
    }}>
      <span style={{ display: "block", fontSize: 10, color: ds.inkMute2, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 4 }}>
        {label}
      </span>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: ds.ink, fontFamily: fontMono }}>
          {count}
        </span>
        <span style={{ fontSize: 11, fontWeight: 600, color: points > 0 ? ds.primaryDeep : ds.inkFaint }}>
          +{points} pts
        </span>
      </div>
    </div>
  );
}


function ErrorPage({ username, code }: { username: string; code: string }) {
  const isRateLimit = code === "RATE_LIMITED";
  return (
    <div style={{
      minHeight: "100vh", background: ds.canvasSoft,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--font-sans)", padding: 24,
    }}>
      <div style={{
        background: ds.canvas, border: `1px solid ${ds.hairlineCool}`,
        borderRadius: ds.rXl, padding: "44px 52px", textAlign: "center", maxWidth: 460,
        boxShadow: "0 4px 24px rgba(23,23,23,0.08)",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: isRateLimit ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <AlertTriangle size={22} color={isRateLimit ? "#f59e0b" : "#ef4444"} />
        </div>
        <h1 style={{ margin: "0 0 10px", fontSize: 20, fontWeight: 700, color: ds.ink }}>
          {isRateLimit ? "Rate limit reached" : "Something went wrong"}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, color: ds.inkMute, lineHeight: 1.65 }}>
          {isRateLimit
            ? "GitHub API rate limit exceeded. Add a GH_TOKEN env var to get 5,000 req/hr, or wait a few minutes."
            : `Failed to fetch GSSoC Project Admin data for @${username}.`}
        </p>
        <a href="" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "9px 20px", borderRadius: ds.rSm,
          background: ds.primary, color: ds.onPrimary,
          textDecoration: "none", fontSize: 14, fontWeight: 600,
        }}>
          <RefreshCw size={14} /> Try again
        </a>
      </div>
    </div>
  );
}
