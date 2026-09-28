import { ModeToggle } from "@/components/mode-toggle";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Bell } from "lucide-react";

const NavBar = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-background border-b border-border sticky top-0 z-30 transition-all">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-primary hover:text-purple-600 font-medium transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center gap-4">
        <ModeToggle />

        <div className="relative cursor-pointer">
          <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm">
            <Bell className="w-4 h-4" />
          </div>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-2.5 bg-card border border-border rounded-xl px-3 py-1.5 shadow-sm hover:border-purple-300 transition-all cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xs">
            AV
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-primary leading-tight">Aryan Verma</p>
            <p className="text-[10px] text-gray-400 leading-none">Student</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;

