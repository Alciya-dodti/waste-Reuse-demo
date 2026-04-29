import React, { useEffect, useState } from "react";
import API from "../api";

// StarRating: tries backend persistence, falls back to localStorage on error
export default function StarRating({ id, size = 20 }) {
  const storageKey = `rating_${id}`;
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await API.get(`/ratings/${encodeURIComponent(id)}`);
        if (!mounted) return;
        setRating(res.data.avg || 0);
        setCount(res.data.count || 0);
      } catch (err) {
        // fallback to localStorage
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            setRating(parsed.avg || 0);
            setCount(parsed.count || 0);
          }
        } catch (e) {}
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [id, storageKey]);

  const submit = async (value) => {
    try {
      const res = await API.post(`/ratings`, { key: id, value });
      if (res && res.data) {
        setRating(res.data.avg || 0);
        setCount(res.data.count || 0);
        return;
      }
    } catch (err) {
      // ignore and fallback to localStorage
    }

    // Local fallback
    try {
      const prev = JSON.parse(localStorage.getItem(storageKey) || "null");
      let newCount = 1;
      let newAvg = value;
      if (prev && prev.count) {
        newCount = prev.count + 1;
        newAvg = (prev.avg * prev.count + value) / newCount;
      }
      const payload = { avg: newAvg, count: newCount };
      localStorage.setItem(storageKey, JSON.stringify(payload));
      setRating(Number(newAvg.toFixed(2)));
      setCount(newCount);
    } catch (e) {}
  };

  return (
    <div className="star-rating" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((s) => (
          <svg
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => submit(s)}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            style={{ cursor: "pointer", transform: hover >= s ? "translateY(-3px)" : "none", transition: "transform 120ms ease" }}
            className={s <= Math.round(rating) ? "star-filled" : "star-empty"}
          >
            <path
              d="M12 .587l3.668 7.431L23.4 9.75l-5.7 5.557L18.9 23 12 19.412 5.1 23l1.2-7.693L.6 9.75l7.732-1.732z"
              fill={s <= Math.round(rating) ? "#f6c84c" : "#d6d6d6"}
            />
          </svg>
        ))}
      </div>

      <div style={{ fontSize: 13, color: "#375a43", fontWeight: 700 }}>
        {rating > 0 ? `${rating} (${count})` : "No ratings"}
      </div>
    </div>
  );
}
