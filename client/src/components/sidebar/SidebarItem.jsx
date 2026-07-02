import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function SidebarItem({ item, collapsed }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const hasChildren = item.children?.length > 0;

  const isActive = hasChildren
    ? item.children.some((c) => location.pathname.startsWith(c.path))
    : location.pathname === item.path;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
            isActive
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-primary-light hover:text-primary"
          }`}
        >
          {item.icon}
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <svg
                className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </>
          )}
        </button>
        {open && !collapsed && (
          <div className="ml-8 mt-1 space-y-1">
            {item.children.map((child) => (
              <Link
                key={child.path}
                to={child.path}
                className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                  location.pathname.startsWith(child.path)
                    ? "bg-primary-light text-primary font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
        isActive
          ? "bg-primary text-white"
          : "text-gray-600 hover:bg-primary-light hover:text-primary"
      }`}
    >
      {item.icon}
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}
