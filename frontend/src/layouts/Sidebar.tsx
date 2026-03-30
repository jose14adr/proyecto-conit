import { useState } from "react";

const Sidebar = ({ menuItems }: any) => {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300
      ${collapsed ? "w-20" : "w-64"} min-h-screen`}
    >

      <button
        className="p-4"
        onClick={() => setCollapsed(!collapsed)}
      >
        ☰
      </button>

      <nav className="mt-4">
        {menuItems.map((item: any) => (
          <div
            key={item.label}
            className="px-4 py-2 hover:bg-slate-800 cursor-pointer"
          >
            {item.icon}
            {!collapsed && <span className="ml-2">{item.label}</span>}
          </div>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;