import React, { useEffect, useState } from "react";
import API from "../api";

export default function Leaderboard({ limit = 6 }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await API.get(`/ratings/top/list?limit=${limit}&minCount=1`);
        if (!mounted) return;
        setItems(res.data || []);
      } catch (err) {
        console.warn("Leaderboard fetch failed", err);
      }
    };
    load();
    return () => (mounted = false);
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: 22, maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}>
      <h4 style={{ margin: 0, marginBottom: 12, color: "#284f3a" }}>Top Rated Ideas</h4>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((it, i) => (
          <div key={it.key} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", padding: 12, borderRadius: 10, border: "1px solid #eef6ee" }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(180deg,#dff6e8,#eafaf0)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#1f6f4d" }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, color: "#214734" }}>{it.key}</div>
              <div style={{ fontSize: 13, color: "#667a69" }}>{Number((it.avg || 0).toFixed(2))} • {it.count} votes</div>
            </div>
            <div style={{ width: 120, height: 8, background: "#f0f3f0", borderRadius: 8, overflow: "hidden" }}>
              <div style={{ width: `${Math.min(100, (it.avg || 0) / 5 * 100)}%`, height: "100%", background: "linear-gradient(90deg,#1f6f4d,#38b481)", transition: "width 700ms ease" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
