import { useState } from "react";

// SearchBar receives one prop:
//   onSearch — a function from App.js that runs when user searches
function SearchBar({ onSearch }) {
  const [item, setItem] = useState("");

  // Run search (called by button click OR Enter key)
  const handleSearch = () => {
    if (item.trim() === "") return; // do nothing if input is empty
    onSearch(item.trim());
  };

  // Allow pressing Enter key to search
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  // Clear the input box
  const handleClear = () => {
    setItem("");
  };

  return (
    <div className="search-wrapper">
      <div className="search-container">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="e.g. plastic bottle, old clothes, glass jar..."
          value={item}
          onChange={(e) => setItem(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {/* Show X button only when there is text */}
        {item && (
          <button className="clear-btn" onClick={handleClear}>
            ✕
          </button>
        )}
        <button className="search-btn" onClick={handleSearch}>
          Search
        </button>
      </div>
    </div>
  );
}

export default SearchBar;