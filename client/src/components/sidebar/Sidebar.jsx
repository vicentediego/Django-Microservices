import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import SidebarItem from "./SidebarItem";
import menuItems from "./menuItems";
import ProfileModal from "../users/ProfileModal";

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 z-10 transition-all duration-300 flex flex-col ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        <div className="p-3 space-y-1 flex-1">
          {menuItems.map((item) => (
            <SidebarItem key={item.label} item={item} collapsed={collapsed} />
          ))}
        </div>

        <div className="border-t border-gray-200 p-3 space-y-1">
          <button
            onClick={() => setProfileOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-primary-light hover:text-primary transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {!collapsed && (
              <div className="min-w-0 text-left">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.username || "Usuario"}
                </p>
                <p className="text-xs text-gray-400">Editar perfil</p>
              </div>
            )}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}
