import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "../sidebar/Sidebar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onToggleSidebar={() => setCollapsed(!collapsed)} />
      <Sidebar collapsed={collapsed} />

      <main
        className={`pt-16 transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-60"
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
