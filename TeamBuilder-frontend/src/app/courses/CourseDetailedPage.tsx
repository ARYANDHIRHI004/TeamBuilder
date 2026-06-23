import React, { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Resource {
  id: string;
  name: string;
  type: "PDF" | "PPTX" | "XLSX" | "DOCX";
  size: string;
}

interface Task {
  id: string;
  title: string;
  date: string;
  dueIn: string;
  urgency: "high" | "medium" | "low" | "normal";
}

interface Announcement {
  id: string;
  title: string;
  desc: string;
  date: string;
  author: string;
  icon: string;
  iconBg: string;
}

interface QuickLink {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

// ── Static Data ────────────────────────────────────────────────────────────
const TABS = ["Overview", "Teams", "Peers", "Tasks", "Resources", "Announcements", "Activity Log"];

const LEARN_ITEMS = [
  "MongoDB - Database design and queries",
  "Express.js - Backend development",
  "React.js - Frontend development",
  "Node.js - Server-side JavaScript",
  "Build and deploy full-stack applications",
];

const TASKS: Task[] = [
  { id: "1", title: "React Project",       date: "May 25, 2026", dueIn: "Due in 5 days",  urgency: "high" },
  { id: "2", title: "Node.js Assignment",  date: "May 30, 2026", dueIn: "Due in 10 days", urgency: "medium" },
  { id: "3", title: "Database Design",     date: "Jun 05, 2026", dueIn: "Due in 16 days", urgency: "low" },
  { id: "4", title: "API Integration Task",date: "Jun 10, 2026", dueIn: "Due in 21 days", urgency: "normal" },
];

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: "1", icon: "📢", iconBg: "bg-purple-100",
    title: "Project Guidelines Updated",
    desc: "Please check the updated project guidelines for the final submission.",
    date: "May 15, 2026", author: "Dr. Rahul Sharma",
  },
  {
    id: "2", icon: "🎥", iconBg: "bg-green-100",
    title: "Live Session on Deployment",
    desc: "Live session on application deployment using Vercel.",
    date: "May 12, 2026", author: "Dr. Rahul Sharma",
  },
];

const RESOURCES: Resource[] = [
  { id: "1", name: "MERN_Development_Syllabus.pdf", type: "PDF",  size: "1.2 MB" },
  { id: "2", name: "MongoDB Basics.pptx",           type: "PPTX", size: "3.4 MB" },
  { id: "3", name: "Project_Requirements.xlsx",     type: "XLSX", size: "980 KB" },
  { id: "4", name: "API_Reference_Document.docx",   type: "DOCX", size: "1.5 MB" },
];

const QUICK_LINKS: QuickLink[] = [
  { id: "1", icon: "📚", title: "Course Resources",  desc: "Access study materials and resources" },
  { id: "2", icon: "💬", title: "Discussion Forum",  desc: "Ask questions and discuss topics" },
  { id: "3", icon: "👤", title: "Contact Instructor",desc: "Send a message to your instructor" },
];

const TEAM_AVATARS = ["AK", "BR", "CL", "DM"];

// ── Helpers ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = ["bg-purple-400", "bg-blue-400", "bg-pink-400", "bg-green-400"];

function Avatar({ initials }: { initials: string }) {
  const bg = AVATAR_COLORS[initials.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div className={`w-9 h-9 rounded-full ${bg} ring-2 ring-white flex items-center justify-center text-white text-xs font-bold`}>
      {initials}
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg width="144" height="144" className="-rotate-90">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke="#7c3aed" strokeWidth="10"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`} strokeLinecap="round" />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-black text-gray-900">{pct}%</p>
        <p className="text-[11px] text-gray-400">Course Progress</p>
      </div>
    </div>
  );
}

const FILE_STYLES: Record<Resource["type"], { bg: string; color: string }> = {
  PDF:  { bg: "bg-red-100",    color: "text-red-600" },
  PPTX: { bg: "bg-orange-100", color: "text-orange-500" },
  XLSX: { bg: "bg-green-100",  color: "text-green-600" },
  DOCX: { bg: "bg-blue-100",   color: "text-blue-600" },
};

const URGENCY: Record<Task["urgency"], string> = {
  high:   "text-red-500 bg-red-50 border border-red-200",
  medium: "text-orange-500 bg-orange-50 border border-orange-200",
  low:    "text-blue-500 bg-blue-50 border border-blue-200",
  normal: "text-gray-500",
};

// ── Main Component ─────────────────────────────────────────────────────────
interface CourseDetailProps {
  onBack?: () => void;
}

const CourseDetailPage: React.FC<CourseDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="flex-1 bg-gray-50 h-screen font-sans overflow-auto">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
        >
          ← Back to My Courses
        </button>
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">🔔</div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm">AV</div>
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">Aryan Verma</p>
              <p className="text-xs text-gray-400">Student</p>
            </div>
            <span className="text-gray-400 text-xs ml-1">▾</span>
          </div>
        </div>
      </div>

      <div className="flex gap-5 p-6">

        {/* ── MAIN CONTENT ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Course header card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start gap-5">
              {/* icon */}
              <div className="w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shrink-0">
                &lt;/&gt;
              </div>
              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-extrabold text-gray-900">MERN Development</h1>
                  <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-semibold">
                    Enrolled
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-2">Course Code: MERN2026</p>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                  Learn to build modern full-stack web applications using MongoDB, Express.js, React.js and Node.js.
                  Build real-world projects and enhance your skills.
                </p>
              </div>
              {/* progress ring */}
              <div className="text-center shrink-0">
                <p className="text-xs text-gray-400 mb-2 font-medium">Your Progress</p>
                <ProgressRing pct={68} />
              </div>
            </div>

            {/* meta row */}
            <div className="flex items-center gap-8 mt-5 pt-5 border-t border-gray-100 flex-wrap">
              {[
                { icon: "👤", label: "Instructor",      value: "Dr. Rahul Sharma" },
                { icon: "🕐", label: "Duration",        value: "Jan 15 – May 15, 2026" },
                { icon: "👥", label: "Total Students",  value: "120" },
                { icon: "🏷️", label: "Teams",           value: "24" },
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

          {/* Stats row */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center gap-6 flex-wrap">
            {[
              { icon: "✅", color: "text-blue-500",   label: "Tasks Completed",   value: "17 / 25" },
              { icon: "⏳", color: "text-orange-500", label: "Pending Tasks",     value: "8" },
              { icon: "📅", color: "text-purple-500", label: "Upcoming Deadline", value: "React Project (May 25, 2026)" },
            ].map(({ icon, color, label, value }) => (
              <div key={label} className="flex items-center gap-3 flex-1 min-w-[180px]">
                <span className={`text-xl ${color}`}>{icon}</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-bold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
            <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-5 py-2 rounded-xl transition-colors whitespace-nowrap">
              View Tasks
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex border-b border-gray-100 px-6">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
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
              {/* Overview tab content */}
              {activeTab === "Overview" && (
                <div className="flex flex-col gap-6">
                  {/* Course overview info cards */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-4">Course Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { icon: "📖", label: "Course Code",  value: "MERN2026",    bg: "bg-purple-50" },
                        { icon: "📅", label: "Enrolled On",  value: "Jan 15, 2026",bg: "bg-blue-50" },
                        { icon: "👥", label: "Your Role",    value: "Member",      bg: "bg-green-50" },
                        { icon: "✉️", label: "Credits",      value: "4",           bg: "bg-orange-50" },
                      ].map(({ icon, label, value, bg }) => (
                        <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <p className="text-[11px] text-gray-400">{label}</p>
                            <p className="text-sm font-bold text-gray-800">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description + What you'll learn */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">Course Description</h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        This course is designed to take you from the basics to advanced level of full-stack web
                        development using the MERN stack. You will build real-world projects and collaborate
                        with your team to solve problems.
                      </p>
                      <button className="mt-4 text-sm text-purple-600 font-medium flex items-center gap-1 hover:gap-2 transition-all">
                        View Syllabus →
                      </button>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">What You'll Learn</h4>
                      <ul className="flex flex-col gap-2">
                        {LEARN_ITEMS.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                            <span className="text-green-500 font-bold mt-0.5 shrink-0">✓</span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Your Team */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-4">Your Team</h4>
                    <div className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-gray-900 text-sm">Team Alpha</p>
                          <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 font-semibold">
                            Leader
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">4 / 4 Members</p>
                      </div>
                      <div className="flex items-center -space-x-2">
                        {TEAM_AVATARS.map((a) => <Avatar key={a} initials={a} />)}
                      </div>
                      <button className="border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold px-5 py-2 rounded-xl transition-colors ml-auto">
                        View Team
                      </button>
                    </div>
                  </div>

                  {/* Course Resources */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-gray-900">Course Resources</h4>
                      <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {RESOURCES.map((r) => {
                        const { bg, color } = FILE_STYLES[r.type];
                        return (
                          <div key={r.id} className="border border-gray-100 rounded-2xl p-3 flex items-center gap-3 hover:border-purple-200 transition-colors cursor-pointer">
                            <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0`}>
                              {r.type}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-gray-800 truncate">{r.name}</p>
                              <p className="text-[11px] text-gray-400">{r.size}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for other tabs */}
              {activeTab !== "Overview" && (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  {activeTab} content goes here
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="w-72 shrink-0 flex flex-col gap-5">

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Upcoming Tasks</h2>
              <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-4">
              {TASKS.map(({ id, title, date, dueIn, urgency }) => (
                <div key={id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base shrink-0">📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{title}</p>
                    <p className="text-[11px] text-gray-400">{date}</p>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${URGENCY[urgency]}`}>
                    {dueIn}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Course Announcements */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-sm">Course Announcements</h2>
              <button className="text-xs text-purple-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex flex-col gap-4">
              {ANNOUNCEMENTS.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-9 h-9 ${a.iconBg} rounded-xl flex items-center justify-center text-base shrink-0`}>
                    {a.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{a.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{a.desc}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{a.date} · {a.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Quick Links</h2>
            <div className="flex flex-col divide-y divide-gray-50">
              {QUICK_LINKS.map((q) => (
                <button key={q.id} className="flex items-center gap-3 py-3 text-left hover:bg-gray-50 rounded-xl px-1 transition-colors w-full">
                  <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-base shrink-0">{q.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800">{q.title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{q.desc}</p>
                  </div>
                  <span className="text-gray-300 text-sm">›</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;