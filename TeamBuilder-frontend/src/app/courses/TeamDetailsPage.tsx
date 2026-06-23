import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Member {
  id: string;
  initials: string;
  name: string;
  role: "Leader" | "Member";
  tasksCompleted: number;
  totalTasks: number;
  status: "Active" | "Inactive";
  joinedOn: string;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  assigneeInitials: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  status: "Completed" | "In Progress" | "Pending";
}

interface Activity {
  id: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  time: string;
}

// ── Static Data ────────────────────────────────────────────────────────────
const TABS = ["Overview", "Members", "Tasks", "Resources", "Activity Log"];

const MEMBERS: Member[] = [
  { id: "1", initials: "AK", name: "Aryan Kumar",   role: "Leader", tasksCompleted: 8,  totalTasks: 10, status: "Active",   joinedOn: "Jan 15, 2026" },
  { id: "2", initials: "BR", name: "Bhavna Rao",    role: "Member", tasksCompleted: 5,  totalTasks: 8,  status: "Active",   joinedOn: "Jan 15, 2026" },
  { id: "3", initials: "CL", name: "Chirag Lal",    role: "Member", tasksCompleted: 6,  totalTasks: 9,  status: "Active",   joinedOn: "Jan 16, 2026" },
  { id: "4", initials: "DM", name: "Divya Mehta",   role: "Member", tasksCompleted: 3,  totalTasks: 8,  status: "Inactive", joinedOn: "Jan 18, 2026" },
];

const TASKS: Task[] = [
  { id: "1", title: "Design MongoDB Schema",   assignee: "Aryan Kumar",  assigneeInitials: "AK", dueDate: "May 20, 2026", priority: "High",   status: "Completed"  },
  { id: "2", title: "Build REST API Endpoints",assignee: "Bhavna Rao",   assigneeInitials: "BR", dueDate: "May 25, 2026", priority: "High",   status: "In Progress"},
  { id: "3", title: "React Frontend UI",       assignee: "Chirag Lal",   assigneeInitials: "CL", dueDate: "May 28, 2026", priority: "Medium", status: "In Progress"},
  { id: "4", title: "Write Unit Tests",        assignee: "Divya Mehta",  assigneeInitials: "DM", dueDate: "Jun 01, 2026", priority: "Low",    status: "Pending"    },
  { id: "5", title: "Deploy to Vercel",        assignee: "Aryan Kumar",  assigneeInitials: "AK", dueDate: "Jun 05, 2026", priority: "Medium", status: "Pending"    },
];

const ACTIVITY: Activity[] = [
  { id: "1", icon: "✓",  iconBg: "bg-green-100",  iconColor: "text-green-600",  title: "Task Completed",           subtitle: "Design MongoDB Schema — Aryan Kumar",  time: "Today, 10:15 AM"      },
  { id: "2", icon: "📝", iconBg: "bg-blue-100",   iconColor: "text-blue-600",   title: "Task Updated",             subtitle: "Build REST API Endpoints — status changed", time: "Yesterday, 6:40 PM" },
  { id: "3", icon: "👥", iconBg: "bg-purple-100", iconColor: "text-purple-600", title: "Member Joined",            subtitle: "Divya Mehta joined the team",          time: "Jan 18, 2026"         },
  { id: "4", icon: "📢", iconBg: "bg-orange-100", iconColor: "text-orange-500", title: "Announcement Posted",      subtitle: "Project kickoff — by Aryan Kumar",     time: "Jan 15, 2026"         },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-purple-400", "bg-blue-400", "bg-pink-400", "bg-green-400", "bg-orange-400"];

function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const bg = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  const sz = size === "lg" ? "w-14 h-14 text-lg" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  return (
    <div className={`${sz} ${bg} rounded-full ring-2 ring-white flex items-center justify-center text-white font-bold shrink-0`}>
      {initials}
    </div>
  );
}

function MiniRing({ value, max }: { value: number; max: number }) {
  const r = 14, circ = 2 * Math.PI * r, pct = max === 0 ? 0 : value / max;
  return (
    <div className="relative w-9 h-9 flex items-center justify-center">
      <svg width="36" height="36" className="-rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="3" />
        <circle cx="18" cy="18" r={r} fill="none" stroke="#7c3aed" strokeWidth="3"
          strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[9px] font-bold text-gray-600">{value}</span>
    </div>
  );
}

function BigRing({ pct, label }: { pct: number; label: string }) {
  const r = 44, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="#e5e7eb" strokeWidth="9" />
        <circle cx="56" cy="56" r={r} fill="none" stroke="#7c3aed" strokeWidth="9"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-black text-gray-900">{pct}%</p>
        <p className="text-[10px] text-gray-400 leading-tight">{label}</p>
      </div>
    </div>
  );
}

const PRIORITY_STYLE: Record<Task["priority"], string> = {
  High:   "text-red-500 bg-red-50 border border-red-200",
  Medium: "text-orange-500 bg-orange-50 border border-orange-200",
  Low:    "text-blue-500 bg-blue-50 border border-blue-200",
};

const STATUS_STYLE: Record<Task["status"], string> = {
  Completed:   "text-green-600 bg-green-50 border border-green-200",
  "In Progress":"text-purple-600 bg-purple-50 border border-purple-200",
  Pending:     "text-gray-500 bg-gray-100 border border-gray-200",
};

// ── Main Component ─────────────────────────────────────────────────────────
interface TeamDetailProps {
  onBack?: () => void;
}

const TeamDetailPage: React.FC<TeamDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  const completedTasks = TASKS.filter((t) => t.status === "Completed").length;
  const inProgressTasks = TASKS.filter((t) => t.status === "In Progress").length;
  const pendingTasks = TASKS.filter((t) => t.status === "Pending").length;
  const progressPct = Math.round((completedTasks / TASKS.length) * 100);

  return (
    <div className="flex-1 bg-gray-50 overflow-auto h-screen font-sans">

      {/* ── Top bar ── */}
      

      <div className="flex gap-5 p-6">

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Team header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl shrink-0">
                👥
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-gray-900">Team Alpha</h1>
                  <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-semibold">Active</span>
                  <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-semibold">Leader</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">Course: MERN Development · MERN2026</p>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                  A collaborative team working on full-stack web development projects using the MERN stack.
                  Together we build, learn, and deliver real-world applications.
                </p>
              </div>
              <BigRing pct={progressPct} label="Team Progress" />
            </div>

            {/* meta row */}
            <div className="flex items-center gap-8 mt-5 pt-5 border-t border-gray-100 flex-wrap">
              {[
                { icon: "👤", label: "Leader",       value: "Aryan Kumar" },
                { icon: "📅", label: "Created On",   value: "Jan 15, 2026" },
                { icon: "👥", label: "Members",      value: "4 / 4" },
                { icon: "📋", label: "Total Tasks",  value: `${TASKS.length}` },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <span className="text-gray-400 text-base">{icon}</span>
                  <div>
                    <p className="text-[11px] text-gray-400">{label}</p>
                    <p className="text-sm font-semibold text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-6 flex-wrap">
            {[
              { icon: "✅", color: "text-green-500",  label: "Completed Tasks",  value: completedTasks },
              { icon: "⚡", color: "text-purple-500", label: "In Progress",      value: inProgressTasks },
              { icon: "⏳", color: "text-orange-500", label: "Pending Tasks",    value: pendingTasks },
              { icon: "👥", color: "text-blue-500",   label: "Active Members",   value: MEMBERS.filter(m => m.status === "Active").length },
            ].map(({ icon, color, label, value }) => (
              <div key={label} className="flex items-center gap-3 flex-1 min-w-[120px]">
                <span className={`text-2xl ${color}`}>{icon}</span>
                <div>
                  <p className="text-[11px] text-gray-400">{label}</p>
                  <p className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex border-b border-gray-100 px-6 overflow-x-auto">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap ${
                    activeTab === tab
                      ? "border-purple-600 text-purple-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-6">

              {/* ── Overview Tab ── */}
              {activeTab === "Overview" && (
                <div className="flex flex-col gap-6">
                  {/* members preview */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Team Members</h3>
                      <button onClick={() => setActiveTab("Members")} className="text-xs text-purple-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="flex items-center gap-3">
                      {MEMBERS.map((m) => (
                        <div key={m.id} className="flex flex-col items-center gap-1.5">
                          <Avatar initials={m.initials} size="lg" />
                          <p className="text-[11px] font-semibold text-gray-700 text-center leading-tight">{m.name.split(" ")[0]}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.role === "Leader" ? "text-green-600 bg-green-50 border border-green-200" : "text-gray-500 bg-gray-100"}`}>
                            {m.role}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* tasks preview */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Recent Tasks</h3>
                      <button onClick={() => setActiveTab("Tasks")} className="text-xs text-purple-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="flex flex-col gap-3">
                      {TASKS.slice(0, 3).map((t) => (
                        <div key={t.id} className="flex items-center gap-3 border border-gray-100 rounded-xl p-3">
                          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base shrink-0">📋</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">{t.title}</p>
                            <p className="text-[11px] text-gray-400">Assigned to {t.assignee} · Due {t.dueDate}</p>
                          </div>
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* progress breakdown */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Progress Breakdown</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Completed", count: completedTasks, total: TASKS.length, color: "bg-green-500" },
                        { label: "In Progress", count: inProgressTasks, total: TASKS.length, color: "bg-purple-500" },
                        { label: "Pending", count: pendingTasks, total: TASKS.length, color: "bg-gray-300" },
                      ].map(({ label, count, total, color }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs text-gray-500 mb-1">{label}</p>
                          <p className="text-2xl font-extrabold text-gray-900 mb-2">{count}<span className="text-sm text-gray-400 font-normal"> / {total}</span></p>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full">
                            <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${(count / total) * 100}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Members Tab ── */}
              {activeTab === "Members" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{MEMBERS.length} members total</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                      + Invite Member
                    </button>
                  </div>
                  {MEMBERS.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 border border-gray-100 rounded-2xl p-4">
                      <Avatar initials={m.initials} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.role === "Leader" ? "text-green-600 bg-green-50 border border-green-200" : "text-gray-500 bg-gray-100"}`}>
                            {m.role}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.status === "Active" ? "text-blue-600 bg-blue-50 border border-blue-200" : "text-gray-400 bg-gray-100"}`}>
                            {m.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Joined {m.joinedOn}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <MiniRing value={m.tasksCompleted} max={m.totalTasks} />
                        <div>
                          <p className="text-xs font-semibold text-gray-700">{m.tasksCompleted}/{m.totalTasks}</p>
                          <p className="text-[10px] text-gray-400">Tasks</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Tasks Tab ── */}
              {activeTab === "Tasks" && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-500">{TASKS.length} tasks total</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                      + Add Task
                    </button>
                  </div>
                  {TASKS.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 border border-gray-100 rounded-2xl p-4">
                      <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center text-base shrink-0">📋</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{t.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Due {t.dueDate}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Avatar initials={t.assigneeInitials} size="sm" />
                        <p className="text-xs text-gray-600 hidden sm:block">{t.assignee.split(" ")[0]}</p>
                      </div>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Other tabs placeholder */}
              {!["Overview", "Members", "Tasks"].includes(activeTab) && (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  {activeTab} content goes here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 shrink-0 flex flex-col gap-5">

          {/* Team Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-4">Team Info</h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Team Name",   value: "Team Alpha" },
                { label: "Course",      value: "MERN Development" },
                { label: "Team Size",   value: "4 / 4 Members" },
                { label: "Status",      value: "Complete" },
                { label: "Created",     value: "Jan 15, 2026" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-800">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Upcoming Deadlines</h2>
              <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-3">
              {TASKS.filter(t => t.status !== "Completed").map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center text-base shrink-0">📅</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{t.title}</p>
                    <p className="text-[11px] text-gray-400">{t.dueDate}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                </div>
              ))}
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
                    <p className="text-xs font-semibold text-gray-800">{a.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{a.subtitle}</p>
                    <p className="text-[10px] text-gray-300 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { icon: "📋", label: "Add New Task" },
                { icon: "📢", label: "Post Announcement" },
                { icon: "📁", label: "Upload Resource" },
                { icon: "👤", label: "Invite Member" },
              ].map(({ icon, label }) => (
                <button key={label} className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl hover:bg-purple-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base shrink-0">{icon}</div>
                  <p className="text-xs font-semibold text-gray-700">{label}</p>
                  <span className="ml-auto text-gray-300 text-sm">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetailPage;