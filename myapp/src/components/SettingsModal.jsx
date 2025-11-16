// src/components/SettingsModal.jsx
import React from "react";
import { X } from "lucide-react";
import { useTheme } from "../App"; // adjust path as needed

const SettingsModal = ({ isOpen, onClose, onSave, settings = {} }) => {
  const { darkMode } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        backgroundColor: "rgba(2,6,23,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "92%",
          maxWidth: 520,
          backgroundColor: darkMode ? "#0b1220" : "#fff",
          padding: 20,
          borderRadius: 12,
          boxShadow: "0 10px 40px rgba(2,6,23,0.12)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: darkMode ? "#E4E4E7" : "#111827" }}>
            Settings
          </h3>
          <button onClick={onClose} style={{ border: "none", background: "transparent", cursor: "pointer" }}>
            <X size={18} color={darkMode ? "#cbd5e1" : "#374151"} />
          </button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: 6, color: darkMode ? "#E4E4E7" : "#111827" }}>
            Search Preferences
          </label>
          <select style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e6edf3" }}>
            <option>All Sources</option>
            <option>Email Only</option>
            <option>Documents Only</option>
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: darkMode ? "#cbd5e1" : "#374151" }}>
            <input type="checkbox" defaultChecked />
            Enable real-time search
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 8, color: darkMode ? "#cbd5e1" : "#374151" }}>
            <input type="checkbox" />
            Show search suggestions
          </label>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button
            onClick={() => {
              if (onSave) onSave();
              onClose();
            }}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#0f172a",
              color: "white",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px 14px",
              borderRadius: 8,
              border: "1px solid #e6edf3",
              background: "transparent",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
