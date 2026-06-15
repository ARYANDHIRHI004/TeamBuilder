import React from "react";

interface NavItem {
  label: string;
  href?: string;
}

const navItems: NavItem[] = [
  { label: "DashBoard" },
  { label: "Profile" },
  { label: "FeedBacks" },
  { label: "History" },
];

const cohorts: NavItem[] = [
  { label: "Cohort 1" },
  { label: "Cohort 2" },
  { label: "Cohort 3" },
];

interface SidebarProps {
  userName?: string;
  activeItem?: string;
  onNavigate?: (label: string) => void;
  onLogout?: () => void;
}

const SideBar: React.FC<SidebarProps> = ({
  activeItem = "DashBoard",
  onNavigate,
  onLogout,
}) => {
  return (
    <aside className="w-64 h-screen bg-[#0d0d0f] border border-[#3a3a3d]  flex flex-col p-5">
      {/* user name */}
      <div className="text-[#f5f5f3] text-4xl font-medium px-2 mb-4">
        Sishya <span className="text-[#e8392c]">Ji</span>
      </div>

      {/* main nav */}
      <nav className="flex flex-col gap-3 px-2">
        {navItems.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate?.(item.label)}
              className={`text-left text-base transition-colors ${
                isActive
                  ? "text-[#e8392c] font-semibold"
                  : "text-[#f5f5f3] hover:text-[#e8392c]"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* divider */}
      <div className="h-px bg-[#3a3a3d] my-5" />

      {/* cohorts */}
      <nav className="flex flex-col gap-3 px-2">
        {cohorts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onNavigate?.(item.label)}
            className="text-left text-base text-[#f5f5f3] hover:text-[#e8392c] transition-colors"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* spacer + logout */}
      <div className="mt-auto pt-6">
        <button
          type="button"
          onClick={onLogout}
          className="w-full border border-[#3a3a3d] rounded-xl py-2.5 text-[#f5f5f3] text-base hover:bg-[#1d1d20] transition-colors"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default SideBar;