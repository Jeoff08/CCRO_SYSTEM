import React, { useState } from "react";

export const TABS = {
  DASHBOARD: "dashboard",
  BOXES: "boxes",
  LOCATOR: "locator",
  LOCATIONS: "locations",
};

const SIDEBAR_ITEMS = [
  {
    id: TABS.DASHBOARD,
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    id: TABS.BOXES,
    label: "Box Management",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    id: TABS.LOCATOR,
    label: "Document Locator",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    id: TABS.LOCATIONS,
    label: "Location Management",
    icon: (
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12m0 0a4 4 0 10-5.657 5.657 4 4 0 005.657-5.657zM13.414 12l2.829-2.829a4 4 0 00-5.657-5.657L7.757 6.343" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <aside
      className={`shrink-0 flex flex-col py-4 transition-all duration-300 ease-in-out shadow-lg bg-gray-100 ${
        collapsed ? "w-[68px]" : "w-60"
      }`}
    >
      <div className={`flex ${collapsed ? "justify-center" : "justify-end px-3"} mb-3`}>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-200 hover:text-gray-700 active:scale-95 transition-all duration-200"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M8 6v12" />
          </svg>
        </button>
      </div>

      <nav className="flex flex-col gap-1.5 px-2.5 text-sm font-medium flex-1">
        {SIDEBAR_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const isHovered = hoveredItem === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              title={item.label}
              className={`relative flex items-center rounded-xl transition-all duration-200 ease-out group ${
                collapsed ? "w-full justify-center p-2.5" : "w-full justify-start px-3.5 py-2.5 gap-3"
              } ${
                isActive
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
                  : isHovered
                  ? "bg-gray-200 text-gray-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              style={isActive ? { transform: isHovered ? "translateX(3px)" : "translateX(0)" } : {}}
            >
              {isActive && !collapsed && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white transition-all duration-300" />
              )}
              <span className={`transition-transform duration-200 ${isHovered && !isActive ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${isActive ? "font-semibold" : "font-medium"}`}>
                  {item.label}
                </span>
              )}
              {collapsed && isHovered && (
                <span className="absolute left-full ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gray-700 shadow-lg shadow-gray-700/40 whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 px-2.5 pt-4 mt-2">
        <button
          type="button"
          onClick={onLogout}
          className={`w-full inline-flex items-center justify-center rounded-xl shadow-sm bg-white text-gray-500 font-semibold hover:bg-red-200 hover:border-gray-400 hover:text-gray-700 hover:shadow-md hover:shadow-gray-200/40 active:scale-[0.97] transition-all duration-200 ${
            collapsed ? "p-2.5" : "px-4 py-2.5 text-xs gap-2"
          }`}
          title="Logout"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
