import { HelpCircle } from "lucide-react";
import { ds } from "@/lib/ds";

export function AdminScoringGuide() {
  return (
    <div style={{
      background: ds.canvas,
      border: `1px solid ${ds.hairlineCool}`,
      borderRadius: ds.rLg,
      padding: "20px 24px"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <HelpCircle size={16} color="#4f46e5" />
        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: ds.ink }}>
          Points System
        </h4>
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: ds.inkMute, lineHeight: 1.5 }}>
        A Project Admin&apos;s score is calculated as the sum of all contributor points earned from merged, approved PRs in their project repository.
      </p>

      <div>
        <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 6 }}>
          Contributor PR Points (Earned by Admin)
        </span>
        <p style={{ margin: "0 0 8px", fontSize: 12, color: ds.inkMute, lineHeight: 1.5 }}>
          Each merged PR earns: <strong style={{ color: ds.ink }}>50 (base) + (difficulty × quality multiplier) + type bonus</strong>, capped at 175 pts.
          Only merged PRs with <code style={{ fontSize: 11, background: ds.canvasSoft, padding: "1px 5px", borderRadius: 4 }}>gssoc:approved</code> label count towards the total.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginTop: 16, borderTop: `1px solid ${ds.hairlineCool}`, paddingTop: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Difficulty Labels
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: ds.inkMute, display: "flex", flexDirection: "column", gap: 3 }}>
            <li>level:beginner: <strong style={{ color: ds.ink }}>20 pts</strong></li>
            <li>level:intermediate: <strong style={{ color: ds.ink }}>35 pts</strong></li>
            <li>level:advanced: <strong style={{ color: ds.ink }}>55 pts</strong></li>
            <li>level:critical: <strong style={{ color: ds.ink }}>80 pts</strong></li>
          </ul>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Quality Multipliers
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: ds.inkMute, display: "flex", flexDirection: "column", gap: 3 }}>
            <li>quality:clean: <strong style={{ color: ds.ink }}>×1.2</strong></li>
            <li>quality:exceptional: <strong style={{ color: ds.ink }}>×1.5</strong></li>
          </ul>
        </div>
        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: ds.inkMute2, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
            Type Bonuses
          </span>
          <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: ds.inkMute, display: "flex", flexDirection: "column", gap: 3 }}>
            <li>type:docs: <strong style={{ color: ds.ink }}>+5 pts</strong></li>
            <li>type:bug / feature / refactor: <strong style={{ color: ds.ink }}>+10 pts</strong></li>
            <li>type:accessibility / performance: <strong style={{ color: ds.ink }}>+15 pts</strong></li>
            <li>type:security: <strong style={{ color: ds.ink }}>+20 pts</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
