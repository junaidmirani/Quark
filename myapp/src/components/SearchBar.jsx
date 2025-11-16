// src/components/SearchBar.jsx
import React from "react";
import { Search, Settings } from "lucide-react";
import { useTheme } from "../App"; // <- path depends on where your Theme context is exported

// If your useTheme import path is different, change the line above.
// In your App.js you already define/use ThemeContext and export useTheme. If not, import from the same place you use useTheme.

const SearchBar = ({ value, onChange, onOpenSettings, placeholder = "Search across Gmail, Drive, Slack, Notion..." }) => {
  const { darkMode } = useTheme();

  return (
    <div style={{ padding: "16px 20px", width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: 820,
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: darkMode ? "#1f2937" : "#fff",
          borderRadius: 12,
          padding: "10px 12px",
          border: `1px solid ${darkMode ? "#374151" : "#e6edf3"}`,
          boxShadow: darkMode ? "none" : "0 6px 18px rgba(2,6,23,0.04)",
        }}
      >
        <Search size={18} style={{ color: darkMode ? "#9CA3AF" : "#9CA3AF", marginLeft: 4 }} />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: 15,
            color: darkMode ? "#E4E4E7" : "#111827",
            padding: "6px 8px",
          }}
        />
        <button
          onClick={onOpenSettings}
          aria-label="Open settings"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 6,
            color: darkMode ? "#cbd5e1" : "#6b7280",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
