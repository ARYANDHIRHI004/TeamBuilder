import React from "react";
import { Link, useParams } from "react-router-dom";

interface NavItem {
  label: string;
  href?: string;
}

interface SidebarProps {
  userName?: string;
  activeItem?: string;
  onNavigate?: (label: string) => void;
}

const CourseSideBar: React.FC<SidebarProps> = ({
  activeItem = "DashBoard",
  onNavigate,
}) => {
  const { coursesId } = useParams();
  const navItems: NavItem[] = [
    { label: "Teams", href: `/courses/${coursesId}/teams` },
    { label: "Peers", href: `/courses/${coursesId}/peers` },
  ];

  return (
    <aside className="w-50 h-screen bg-[#0d0d0f] border border-[#3a3a3d]  flex flex-col p-5">
      {/* main nav */}
      <nav className="flex flex-col gap-3 px-2">
        {navItems.map((item) => {
          const isActive = item.label === activeItem;
          return (
            <Link
              to={`${item.href}`}
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
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default CourseSideBar;
