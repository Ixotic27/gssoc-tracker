"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, FolderGit2, Star, User } from "lucide-react";
import { ds, fontMono } from "@/lib/ds";
import Image from "next/image";
import { SubscribeButton } from "@/components/SubscribeModal";

const REPO_URL = "https://github.com/PRODHOSH/gssoc-tracker";

type Mode = "repo" | "username";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("repo");
  const [input, setInput] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit(e: FormEvent) {
    e.preventDefault();
    const raw = input.trim().replace(/^@/, "");
    if (!raw) return;
    setState("loading");

    try {
      if (mode === "repo") {
        const parts = raw.replace(/^https?:\/\/github\.com\//, "").split("/");
        if (parts.length < 2 || !parts[0] || !parts[1]) {
          setErrMsg("Enter a valid repo in owner/repo format (e.g. PRODHOSH/gssoc-tracker)");
          setState("error");
          return;
        }
        const [owner, repo] = parts;
        const res = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
        if (res.status === 404) { setErrMsg("Repository not found"); setState("error"); return; }
        if (!res.ok) { setErrMsg("Couldn't reach GitHub. Try again."); setState("error"); return; }
        router.push(`/project-admin/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
      } else {
        const res = await fetch(`/api/github-user?username=${encodeURIComponent(raw)}`);
        if (res.status === 404) { setErrMsg("GitHub user not found"); setState("error"); return; }
        if (!res.ok) { setErrMsg("Couldn't reach GitHub. Try again."); setState("error"); return; }
        router.push(`/project-admin/${encodeURIComponent(raw)}`);
      }
    } catch {
      setErrMsg("Couldn't reach the API. Try again.");
      setState("error");
    }
  }

  return (
    <div className="dark" style={{
      minHeight: "100vh",
      background: "var(--color-canvas-night)",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      fontFamily: "var(--font-sans)",
      padding: "80px 24px 160px",
      position: "relative",
    }}>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: "100%", maxWidth: 480, textAlign: "center", margin: "auto 0" }}
      >
        {/* Icon */}
        <div style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 52, height: 52, borderRadius: 14,
          background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)",
          marginBottom: 24,
        }}>
          <FolderGit2 size={24} color="#818cf8" />
        </div>

        <h1 style={{
          margin: "0 0 8px",
          fontSize: "clamp(26px, 5vw, 36px)", fontWeight: 700,
          color: "#fff", letterSpacing: "-0.03em", lineHeight: 1.1,
        }}>
          GSSoC PA Tracker
        </h1>

        <p style={{ margin: "0 0 36px", fontSize: 15, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
          Track Project Admin activity, scores &amp; repo health for GSSoC 2026
        </p>

        {/* Mode Toggle */}
        <div style={{
          display: "inline-flex", borderRadius: 10, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          marginBottom: 20, background: "rgba(255,255,255,0.03)",
        }}>
          {([
            { id: "repo" as Mode, label: "Search by Repo", icon: <FolderGit2 size={13} /> },
            { id: "username" as Mode, label: "Search by Admin", icon: <User size={13} /> },
          ]).map((m) => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setInput(""); setState("idle"); setErrMsg(""); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", border: "none", cursor: "pointer",
                fontSize: 13, fontWeight: 600,
                background: mode === m.id ? "rgba(129,140,248,0.15)" : "transparent",
                color: mode === m.id ? "#818cf8" : "rgba(255,255,255,0.35)",
                transition: "all 0.15s",
              }}
            >
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  {mode === "repo"
                    ? <FolderGit2 width={14} height={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                    : <User width={14} height={14} style={{ color: "rgba(255,255,255,0.25)" }} />
                  }
                </div>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => { setInput(e.target.value); setState("idle"); setErrMsg(""); }}
                  placeholder={mode === "repo" ? "owner/repo (e.g. PRODHOSH/gssoc-tracker)" : "GitHub username…"}
                  autoFocus
                  autoComplete="off"
                  suppressHydrationWarning
                  style={{
                    width: "100%", height: 48,
                    paddingLeft: 38, paddingRight: 14,
                    borderRadius: 10,
                    border: `1.5px solid ${state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)"}`,
                    background: "rgba(255,255,255,0.04)",
                    color: "#fff", fontSize: 15,
                    fontFamily: fontMono, outline: "none",
                    transition: "border-color 0.15s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(129,140,248,0.45)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = state === "error" ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.08)")}
                />
              </div>

              <button
                type="submit"
                disabled={state === "loading" || !input.trim()}
                style={{
                  height: 48, padding: "0 22px",
                  borderRadius: 10, border: "none",
                  background: state === "loading" ? "rgba(129,140,248,0.55)" : "#818cf8",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: state === "loading" || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
                  transition: "background 0.13s",
                  opacity: !input.trim() ? 0.5 : 1,
                }}
              >
                {state === "loading"
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Loading…</>
                  : "View Stats →"}
              </button>
            </form>

            {state === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginTop: 10, fontSize: 13, color: "#f87171" }}
              >
                <AlertCircle size={13} /> {errMsg}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Bottom bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          padding: "14px 24px 18px",
          background: "linear-gradient(to top, rgba(23,23,23,0.95) 70%, transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <a
            href="https://github.com/PRODHOSH"
            target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", padding: "6px 12px", borderRadius: ds.rFull, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}
          >
            <Image src="https://avatars.githubusercontent.com/PRODHOSH" alt="PRODHOSH" width={22} height={22} unoptimized style={{ borderRadius: "50%", display: "block" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
              Built by <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>@PRODHOSH</span>
            </span>
          </a>

          <a
            href={REPO_URL} target="_blank" rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 6, textDecoration: "none", padding: "6px 14px", borderRadius: ds.rFull, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)", transition: "all 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(202,138,4,0.5)"; e.currentTarget.style.color = "#fbbf24"; e.currentTarget.style.background = "rgba(202,138,4,0.06)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
          >
            <Star size={13} /> Star on GitHub
          </a>

          <SubscribeButton />
        </div>

        <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
          Not affiliated with GirlScript Summer of Code or GirlScript Foundation ·{" "}
          <a href="/terms" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "underline" }}>Terms &amp; Privacy</a>
        </p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
