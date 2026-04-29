import { useState } from "react";
import StarRating from "./components/StarRating";

// ResultCard receives these props from App.js:
//   title       — name of the reuse idea
//   description — how to do it
//   difficulty  — "Easy" or "Medium"
//   icon        — emoji shown on the card
function ResultCard({ title, description, difficulty, icon }) {
  // Track hover state so we can animate the card
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`card ${hovered ? "card-hovered" : ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Icon bubble at top */}
      <div className="card-icon">{icon || "♻️"}</div>

      {/* Title */}
      <h3 className="card-title">{title}</h3>

      {/* Description */}
      <p className="card-desc">{description}</p>

      {/* Difficulty badge — only show if difficulty was passed */}
      {difficulty && (
        <span className={`badge badge-${difficulty.toLowerCase()}`}>
          {difficulty}
        </span>
      )}

      {/* Ratings */}
      <div style={{ marginTop: 12 }}>
        <StarRating id={title || "unknown_result"} />
      </div>
    </div>
  );
}

export default ResultCard;