import React, { useState } from "react";
import { Link } from "react-router-dom";

interface NavItem {
  id: string;
  icon: string;
  label: string;
  badge?: number;
  href?: string
}

interface SidebarProps {
  activeItem?: string;
  onNavigate?: (id: string) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",   icon: "🏠", label: "Dashboard", href: "/dashboard" },
  { id: "courses",     icon: "📖", label: "My Courses", href: "/courses" },
  { id: "teams",       icon: "👥", label: "My Teams", href: "/teams" },
  { id: "peers",       icon: "🤝", label: "Peers & Network", href: "/peers" },
  { id: "profile",     icon: "👤", label: "Profile", href: "/profile" },
];

const SideBar: React.FC<SidebarProps> = ({
  activeItem = "dashboard",
  onNavigate,
}) => {
  const [active, setActive] = useState(activeItem);

  const handleClick = (id: string) => {
    setActive(id);
    onNavigate?.(id);
  };

  return (
    <aside className="w-56 h-screen bg-background border-r border-border flex flex-col shrink-0 shadow-sm transition-all delay-100">

      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="w-9 h-9 bg-card rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white text-base font-black">👥</span>
        </div>
        <div className="leading-tight">
          <p className="font-extrabold text-primary text-sm leading-none">Team Management</p>
          <p className="text-[11px] text-primary mt-0.5">System</p>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 ">
        {NAV_ITEMS.map(({ id, icon, label, badge, href }) => {
          const isActive = active === id;
          return (
            <Link
              to={`${href}`}
              key={id}
              type="button"
              onClick={() => handleClick(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                isActive
                  ? "bg-foreground text-secondary shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base w-5 text-center shrink-0">{icon}</span>
              <span className="flex-1">{label}</span>
              {badge !== undefined && (
                <span
                  className={`text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    isActive
                      ? "bg-white text-"
                      : "bg-purple-600 text-white"
                  }`}
                >
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom promo card ── */}
      <div className="mx-3 mb-4 bg-purple-50 border border-purple-100 rounded-2xl p-4 text-center">
        <div className="text-3xl mb-2">🧑‍💻</div>
        <p className="font-bold text-gray-900 text-xs leading-snug mb-1">
          Build. Collaborate. Succeed.
        </p>
        <p className="text-[11px] text-gray-400 leading-snug mb-3">
          Work together with your team and achieve more.
        </p>
        <button className="w-full bg-purple-600 hover:bg-purple-700 transition-colors text-white text-xs font-bold py-2 rounded-xl">
          Learn More
        </button>
      </div>
    </aside>
  );
};

export default SideBar;