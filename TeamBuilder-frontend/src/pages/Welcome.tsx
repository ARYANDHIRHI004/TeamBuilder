import React from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = ["Features", "How it works", "Roles", "Pricing"];

const FEATURES = [
  {
    icon: "👥",
    title: "Member management",
    desc: "Add, remove, and organize members across cohorts with instant updates and audit logs.",
  },
  {
    icon: "📊",
    title: "Dashboard overview",
    desc: "Live bird's-eye view of pending work, notices, and course progress at a glance.",
  },
  {
    icon: "🛡️",
    title: "Role-based access",
    desc: "Fine-grained permissions so leaders, employees, and guests only see what they need.",
  },
  {
    icon: "📢",
    title: "Notice board",
    desc: "Pin announcements and updates so nothing gets buried in a chat thread again.",
  },
  {
    icon: "✅",
    title: "Pending work tracker",
    desc: "Track open tasks by member so nothing slips through the cracks between sprints.",
  },
  {
    icon: "💬",
    title: "Feedback system",
    desc: "Collect structured feedback from and about team members, stored with full history.",
  },
];

const STEPS = [
  { step: "01", title: "Sign in with Google", desc: "One click, no passwords. Your Google account handles security." },
  { step: "02", title: "Set up your workspace", desc: "Name your team, create cohorts, and define your structure." },
  { step: "03", title: "Invite your members", desc: "Invite by email and assign roles instantly." },
  { step: "04", title: "Run the work", desc: "Track progress, post notices, and manage feedback — all in one place." },
];

const ROLES = [
  { initial: "L", tag: "Leader", name: "Full control", desc: "Manage members, assign tasks, post notices, and review all feedback across every cohort." },
  { initial: "M", tag: "Marketing", name: "Campaign focus", desc: "Coordinate campaign deliverables, post updates, and track member contributions." },
  { initial: "E", tag: "Employee", name: "Task & progress view", desc: "See your pending work, courses, and notices. Submit feedback and track your history." },
  { initial: "G", tag: "Guest", name: "Read-only access", desc: "View the notice board and course list. No editing or task access." },
];

const STATS = [
  { num: "1K+", label: "Teams managed" },
  { num: "50+", label: "Roles & permissions" },
  { num: "24/7", label: "Live activity sync" },
];




export default function Welcome() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#f5f5f3] font-sans overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="flex items-center justify-between px-9 py-[18px] border-b border-[#2a2a2d]">
        <div className="flex items-center gap-2.5 font-extrabold text-lg tracking-tight">
          <div className="w-7 h-7 bg-[#e8392c] rounded-md flex items-center justify-center text-white text-[13px] font-black">
            TB
          </div>
          TeamBuilder
        </div>

        <div className="hidden md:flex gap-7 text-sm text-[#9a9a9e]">
          {NAV_LINKS.map((l) => (
            <a key={l} href="#" className="hover:text-[#f5f5f3] transition-colors">
              {l}
            </a>
          ))}
        </div>

        <button className="bg-[#e8392c] hover:opacity-90 transition-opacity text-white text-sm font-bold px-5 py-2.5 rounded-xl">
          Get started free
        </button>
      </nav>

      {/* ── Red band ── */}
      <div
        className="flex items-center justify-between px-9 py-3 text-[12px] font-mono uppercase tracking-[0.12em] text-white/90"
        style={{ background: "linear-gradient(115deg, #b8261c, #e8392c 55%, #ff5b41)" }}
      >
        <span className="flex items-center gap-2.5">
          Teams <span className="w-14 h-px bg-white/40 inline-block" />
        </span>
        <span>✦ Now with AI-powered role suggestions</span>
        <span className="flex items-center gap-2.5">
          <span className="w-14 h-px bg-white/40 inline-block" /> Workspace
        </span>
      </div>

      {/* ── Hero ── */}
      <section className="text-center px-6 pt-20 pb-0 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, transparent 0 38px, rgba(232,57,44,0.04) 38px 39px)",
          }}
        />
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#e8392c] mb-6">
          // Team management, reimagined
        </p>
        <h1 className="font-black text-[clamp(48px,8vw,80px)] leading-[0.95] tracking-[-0.03em] mb-4">
          Build your <span className="text-[#e8392c]">team</span>,
          <br />
          own the work
        </h1>
        <p className="text-[#9a9a9e] text-lg max-w-[480px] mx-auto mb-9 leading-relaxed">
          Assign roles, track cohorts, and manage every member — all in one fast workspace.
        </p>
        <div className="flex gap-3 justify-center flex-wrap mb-0">
          <Link to={"/login"} className="bg-[#e8392c] hover:opacity-90 transition-opacity text-white font-bold text-[15px] px-8 py-4 rounded-xl">
            Sign in with Google →
          </Link>
          <button className="bg-transparent border border-[#3a3a3d] hover:bg-[#1d1d20] transition-colors text-[#f5f5f3] font-semibold text-[15px] px-8 py-4 rounded-xl">
            See how it works
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 mt-16 border-t border-b border-[#2a2a2d]" style={{ gap: "1px", background: "#2a2a2d" }}>
          {STATS.map(({ num, label }) => (
            <div key={label} className="bg-[#0d0d0f] py-8 text-center">
              
              <div className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#9a9a9e] mt-2">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-9 py-[72px]">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#e8392c] mb-3">
          // Features
        </p>
        <h2 className="font-black text-[38px] tracking-[-0.02em] mb-12 max-w-[460px] leading-tight">
          Everything your team actually needs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-[#161618] border border-[#2a2a2d] hover:border-[#e8392c] transition-colors rounded-[18px] p-7"
            >
              <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-xl mb-5 bg-[rgba(232,57,44,0.12)]">
                {icon}
              </div>
              <h3 className="font-bold text-[16px] mb-2">{title}</h3>
              <p className="text-[13px] text-[#9a9a9e] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-[#161618] border-t border-b border-[#2a2a2d] px-9 py-[72px]">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#e8392c] mb-3">
          // How it works
        </p>
        <h2 className="font-black text-[38px] tracking-[-0.02em] mb-12 leading-tight">
          Up and running in minutes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#2a2a2d]">
          {STEPS.map(({ step, title, desc }) => (
            <div key={step} className="px-6 py-4 lg:py-0 first:pl-0 last:pr-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#e8392c] mb-3">
                {step}
              </p>
              <h3 className="font-bold text-[15px] mb-2">{title}</h3>
              <p className="text-[13px] text-[#9a9a9e] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Roles ── */}
      <section className="px-9 py-[72px]">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#e8392c] mb-3">
          // Roles
        </p>
        <h2 className="font-black text-[38px] tracking-[-0.02em] mb-12 max-w-[460px] leading-tight">
          Built for every position on the team
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ROLES.map(({ initial, tag, name, desc }) => (
            <div
              key={tag}
              className="bg-[#161618] border border-[#2a2a2d] rounded-[18px] p-7 flex gap-5 items-start"
            >
              <div className="w-11 h-11 rounded-full bg-[rgba(232,57,44,0.15)] flex items-center justify-center font-black text-[15px] text-[#e8392c] shrink-0">
                {initial}
              </div>
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#e8392c] mb-1">
                  {tag}
                </p>
                <h3 className="font-bold text-[15px] mb-2">{name}</h3>
                <p className="text-[13px] text-[#9a9a9e] leading-[1.55]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <div className="px-9 pb-[72px]">
        <div
          className="relative rounded-[24px] px-12 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 overflow-hidden"
          style={{ background: "linear-gradient(115deg, #b8261c, #e8392c 55%, #ff5b41)" }}
        >
          {/* diagonal lines overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, transparent 0 38px, rgba(255,255,255,0.06) 38px 39px)",
            }}
          />
          <div className="relative z-10">
            <h2 className="font-black text-[38px] leading-none tracking-[-0.02em] mb-2">
              Ready to build<br />your team?
            </h2>
            <p className="text-white/75 text-[15px]">Start free — no credit card required.</p>
          </div>
          <div className="relative z-10 flex gap-3 flex-wrap">
            <Link to={"/login"} className="bg-white text-[#1f1f1f] font-bold text-[15px] px-7 py-4 rounded-xl whitespace-nowrap hover:opacity-90 transition-opacity">
              Sign in with Google
            </Link>
            <button className="bg-transparent border border-white/40 text-white font-semibold text-[15px] px-7 py-4 rounded-xl whitespace-nowrap hover:bg-white/10 transition-colors">
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-[#2a2a2d] px-9 py-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-[#9a9a9e]">
        <div className="flex items-center gap-2 font-bold text-[15px] text-[#f5f5f3]">
          <div className="w-7 h-7 bg-[#e8392c] rounded-md flex items-center justify-center text-white text-[11px] font-black">
            TB
          </div>
          TeamBuilder
        </div>
        <span>© 2026 TeamBuilder. All rights reserved.</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[#e8392c]">
          // Built for teams
        </span>
      </footer>
    </div>
  );
}