import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  const expanded = !collapsed || hovered;

  return (
    <div style={{ display: "flex" }}>

      <Sidebar
        collapsed={collapsed}
        hovered={hovered}
        setHovered={setHovered}
      />

      <div
        style={{
          flex: 1,
          marginLeft: expanded ? 260 : 80,
          transition: "0.3s",
          background: "#f1f5f9",
          minHeight: "100vh",
        }}
      >
        <Header
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div style={{ padding: 20 }}>
          {children}
        </div>
      </div>

    </div>
  );
}