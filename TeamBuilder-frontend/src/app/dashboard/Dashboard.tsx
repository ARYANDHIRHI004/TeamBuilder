import React from "react";
import { Link } from "react-router-dom";

// ── Types ──────────────────────────────────────────────────────────────────
interface Course {
  id: string;
  title: string;
  code: string;
  icon: string;
  iconBg: string;
  team?: string;
  role?: string;
  members?: number;
  maxMembers?: number;
  noTeam?: boolean;
}

interface Team {
  id: string;
  name: string;
  course: string;
  role: "Leader" | "Member";
  members: number;
  maxMembers: number;
  status: "Complete" | "In Progress";
  avatars: string[];
}

interface ActivityItem {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
}

interface QuickLink {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

// ── Static data ────────────────────────────────────────────────────────────
const STATS = [
  { icon: "📖", iconBg: "bg-purple-100", label: "My Courses", value: 3, sub: "Enrolled courses" },
  { icon: "👥", iconBg: "bg-green-100",  label: "My Teams",   value: 2, sub: "Teams you are in" },
  { icon: "✉️", iconBg: "bg-orange-100", label: "Pending Invitations", value: 1, sub: "Invitation pending" },
  { icon: "📋", iconBg: "bg-blue-100",   label: "Tasks Due",  value: 4, sub: "Across all courses" },
];

const COURSES: Course[] = [
  { id: "1", title: "MERN Development",       code: "MERN2026", icon: "</>", iconBg: "bg-purple-600", team: "Team Alpha",   role: "Member", members: 4, maxMembers: 4 },
  { id: "2", title: "Artificial Intelligence", code: "AI2026",   icon: "🧠",  iconBg: "bg-green-500",  noTeam: true },
  { id: "3", title: "Java Programming",        code: "JAVA2026", icon: "☕",  iconBg: "bg-blue-600",   team: "Team Phoenix", role: "Member", members: 3, maxMembers: 4 },
];

const TEAMS: Team[] = [
  { id: "1", name: "Team Alpha",   course: "MERN Development",       role: "Leader", members: 4, maxMembers: 4, status: "Complete",    avatars: ["AK","BR","CL","DM"] },
  { id: "2", name: "Team Phoenix", course: "Java Programming",        role: "Member", members: 3, maxMembers: 4, status: "In Progress", avatars: ["EO","FP","GQ"] },
];

const ACTIVITY: ActivityItem[] = [
  { id: "1", icon: "✓",  iconBg: "bg-green-100",  iconColor: "text-green-600",  title: "Logged in",                subtitle: "First login from this device",       time: "Today, 10:15 AM" },
  { id: "2", icon: "👥", iconBg: "bg-purple-100", iconColor: "text-purple-600", title: "Joined Team Alpha",        subtitle: "MERN Development",                   time: "Yesterday, 6:40 PM" },
  { id: "3", icon: "📄", iconBg: "bg-orange-100", iconColor: "text-orange-600", title: 'Task "Project Proposal"',  subtitle: "Submitted in MERN Development",      time: "Yesterday, 4:20 PM" },
  { id: "4", icon: "←",  iconBg: "bg-red-100",    iconColor: "text-red-500",    title: "Left Team Phoenix",        subtitle: "Java Programming",                   time: "10 Jun, 2026" },
  { id: "5", icon: "👥", iconBg: "bg-purple-100", iconColor: "text-purple-600", title: "Joined Team Phoenix",      subtitle: "Java Programming",                   time: "08 Jun, 2026" },
];

const QUICK_LINKS: QuickLink[] = [
  { id: "1", icon: "👥", title: "Browse Teams",      desc: "Find and explore teams in your courses" },
  { id: "2", icon: "📄", title: "Team Guidelines",   desc: "Read team formation rules and guidelines" },
  { id: "3", icon: "❓", title: "Help Center",       desc: "Get help and contact support" },
  { id: "4", icon: "🚩", title: "Report an Issue",   desc: "Report a problem or give feedback" },
];

// ── Sub-components ─────────────────────────────────────────────────────────

/** Circular progress ring */
function Ring({ value, max, color = "#7c3aed" }: { value: number; max: number; color?: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const pct = max === 0 ? 0 : value / max;
  const dash = pct * circ;
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <svg width="64" height="64" className="-rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="#e5e7eb" strokeWidth="5" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-xs font-bold text-gray-700 leading-tight text-center">
        {value}/{max}<br /><span className="font-normal text-[10px]">Members</span>
      </span>
    </div>
  );
}

/** Avatar initials circle */
function Avatar({ initials, dashed = false }: { initials: string; dashed?: boolean }) {
  if (dashed)
    return (
      <div className="w-9 h-9 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-lg">
        +
      </div>
    );
  const colors = ["bg-purple-400","bg-blue-400","bg-green-400","bg-orange-400","bg-pink-400"];
  const bg = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`w-9 h-9 rounded-full ${bg} flex items-center justify-center text-white text-xs font-bold ring-2 ring-white`}>
      {initials.slice(0, 2)}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
interface DashboardProps {
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName = "Aryan" }) => {
  return (
    <div className="flex-1 bg-gray-50 h-screen p-6 font-sans overflow-auto">

      {/* ── Top bar ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what's happening with your courses and teams.
          </p>
        </div>
        <div className="flex items-center gap-4">
          
          
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STATS.map(({ icon, iconBg, label, value, sub }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
            <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center text-2xl shrink-0`}>
              {icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-3xl font-extrabold text-gray-900 leading-tight">{value}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Body: left col + right col ── */}
      <div className="flex gap-5">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* My Courses */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">My Courses</h2>
              <Link to="/courses" className="text-sm text-purple-600 font-medium hover:underline">View All Courses</Link>
            </div>
            <div className="flex flex-col gap-3">
              {COURSES.map((c) => (
                <div key={c.id} className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                  {/* icon */}
                  <div className={`w-14 h-14 ${c.iconBg} rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                    {c.icon}
                  </div>
                  {/* info */}
                  <div className="min-w-[140px]">
                    <p className="font-bold text-gray-900 text-sm">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Course Code: {c.code}</p>
                    <span className="inline-block mt-1.5 text-[11px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5 font-medium">
                      Enrolled
                    </span>
                  </div>
                  {/* team / no-team */}
                  <div className="flex-1">
                    {c.noTeam ? (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                        <p className="text-orange-500 font-semibold text-sm">No Team Assigned</p>
                        <p className="text-gray-500 text-xs mt-0.5 mb-3">You are not part of any team yet.</p>
                        <div className="flex gap-2">
                          <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                            Create Team
                          </button>
                          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition-colors">
                            Join Team
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <div>
                          <p className="text-[11px] text-gray-400">Team</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-gray-500 text-xs">👥</span>
                            <p className="text-sm font-semibold text-gray-800">{c.team}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-gray-400">Role</p>
                          <p className="text-sm font-semibold text-gray-800 mt-0.5">{c.role}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* ring + btn */}
                  {!c.noTeam && (
                    <div className="flex items-center gap-4 ml-auto">
                      <Ring value={c.members!} max={c.maxMembers!} color={c.members === c.maxMembers ? "#22c55e" : "#7c3aed"} />
                      <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap">
                        View Team
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* My Teams */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-base">My Teams</h2>
              <button className="text-sm text-purple-600 font-medium hover:underline">View All Teams</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TEAMS.map((t) => (
                <div key={t.id} className="border border-gray-100 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                    {t.role === "Leader" && (
                      <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 font-semibold">
                        Leader
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mb-4">{t.course}</p>
                  {/* avatars */}
                  <div className="flex items-center gap-1 mb-4">
                    {t.avatars.map((a) => <Avatar key={a} initials={a} />)}
                    {t.members < t.maxMembers && <Avatar initials="+" dashed />}
                  </div>
                  {/* footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span>👥</span>
                      <span>{t.members}/{t.maxMembers} Members</span>
                      <span className={`ml-2 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        t.status === "Complete"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : "bg-blue-50 text-blue-600 border border-blue-200"
                      }`}>
                        {t.status}
                      </span>
                    </div>
                    <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                      View Team
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="w-72 shrink-0 flex flex-col gap-5">

          {/* Pending Invitation */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Pending Invitation</h2>
              <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 text-lg shrink-0">
                👥
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">Team Nexus</p>
                <p className="text-xs text-gray-400">Artificial Intelligence</p>
                <p className="text-xs text-gray-400 mt-0.5">Invited by Rahul Sharma</p>
              </div>
              <span className="text-[11px] text-gray-400 shrink-0">10 min ago</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold py-2 rounded-xl transition-colors">
                Decline
              </button>
              <button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-xl transition-colors">
                Accept
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Recent Activity</h2>
              <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-8 h-8 ${a.iconBg} ${a.iconColor} rounded-lg flex items-center justify-center text-sm shrink-0`}>
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{a.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{a.subtitle}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 shrink-0">{a.time}</span>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-xs text-purple-600 font-medium mt-4 hover:underline">
              View All Activity
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
};

export default Dashboard;