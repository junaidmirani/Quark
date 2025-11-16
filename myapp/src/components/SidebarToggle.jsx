// src/components/SidebarToggle.jsx
import React from "react";
import { Menu, X } from "lucide-react";

const SidebarToggle = ({ isOpen, onToggle }) => {
  return (
    <button
      aria-label="Toggle sidebar"
      onClick={onToggle}
      style={{
        border: "none",
        background: "transparent",
        cursor: "pointer",
        padding: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isOpen ? <X size={18} /> : <Menu size={18} />}
    </button>
  );
};

export default SidebarToggle;
