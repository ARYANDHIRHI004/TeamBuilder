import React from "react";
import { Link } from "react-router-dom";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";

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
  { icon: "📖", iconBg: "bg-purple-100 dark:bg-purple-900/30", label: "My Courses", value: 3, sub: "Enrolled courses" },
  { icon: "👥", iconBg: "bg-green-100 dark:bg-green-900/30", label: "My Teams", value: 2, sub: "Teams you are in" },
  { icon: "✉️", iconBg: "bg-orange-100 dark:bg-orange-900/30", label: "Pending Invitations", value: 1, sub: "Invitation pending" },
  { icon: "📋", iconBg: "bg-blue-100 dark:bg-blue-900/30", label: "Tasks Due", value: 4, sub: "Across all courses" },
];

const COURSES: Course[] = [
  { id: "1", title: "MERN Development", code: "MERN2026", icon: "</>", iconBg: "bg-purple-600", team: "Team Alpha", role: "Member", members: 4, maxMembers: 4 },
  { id: "2", title: "Artificial Intelligence", code: "AI2026", icon: "🧠", iconBg: "bg-green-500", noTeam: true },
  { id: "3", title: "Java Programming", code: "JAVA2026", icon: "☕", iconBg: "bg-blue-600", team: "Team Phoenix", role: "Member", members: 3, maxMembers: 4 },
];

const TEAMS: Team[] = [
  { id: "1", name: "Team Alpha", course: "MERN Development", role: "Leader", members: 4, maxMembers: 4, status: "Complete", avatars: ["AK", "BR", "CL", "DM"] },
  { id: "2", name: "Team Phoenix", course: "Java Programming", role: "Member", members: 3, maxMembers: 4, status: "In Progress", avatars: ["EO", "FP", "GQ"] },
];

const ACTIVITY: ActivityItem[] = [
  { id: "1", icon: "✓", iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-400", title: "Logged in", subtitle: "First login from this device", time: "Today, 10:15 AM" },
  { id: "2", icon: "👥", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", title: "Joined Team Alpha", subtitle: "MERN Development", time: "Yesterday, 6:40 PM" },
  { id: "3", icon: "📄", iconBg: "bg-orange-100 dark:bg-orange-900/30", iconColor: "text-orange-600 dark:text-orange-400", title: 'Task "Project Proposal"', subtitle: "Submitted in MERN Development", time: "Yesterday, 4:20 PM" },
  { id: "4", icon: "←", iconBg: "bg-red-100 dark:bg-red-900/30", iconColor: "text-red-500 dark:text-red-400", title: "Left Team Phoenix", subtitle: "Java Programming", time: "10 Jun, 2026" },
  { id: "5", icon: "👥", iconBg: "bg-purple-100 dark:bg-purple-900/30", iconColor: "text-purple-600 dark:text-purple-400", title: "Joined Team Phoenix", subtitle: "Java Programming", time: "08 Jun, 2026" },
];

const QUICK_LINKS: QuickLink[] = [
  { id: "1", icon: "👥", title: "Browse Teams", desc: "Find and explore teams in your courses" },
  { id: "2", icon: "📄", title: "Team Guidelines", desc: "Read team formation rules and guidelines" },
  { id: "3", icon: "❓", title: "Help Center", desc: "Get help and contact support" },
  { id: "4", icon: "🚩", title: "Report an Issue", desc: "Report a problem or give feedback" },
];

// ── Member-progress ring (Recharts, shadcn-themed) ──────────────────────────
function MembersRing({ value, max }: { value: number; max: number }) {
  const complete = value === max;
  const pct = Math.round((value / max) * 100);
  const data = [{ name: "members", value: pct, fill: complete ? "hsl(var(--chart-2))" : "hsl(var(--primary))" }];

  return (
    <div className="relative h-[68px] w-[68px] shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-foreground leading-none">
          {value}/{max}
        </span>
        <span className="text-[9px] text-muted-foreground leading-none mt-0.5">members</span>
      </div>
    </div>
  );
}

function InitialsAvatar({ initials, dashed = false }: { initials: string; dashed?: boolean }) {
  if (dashed) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground text-lg">
        +
      </div>
    );
  }
  return (
    <Avatar className="h-9 w-9 ring-2 ring-background">
      <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
        {initials.slice(0, 2)}
      </AvatarFallback>
    </Avatar>

  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
interface DashboardProps {
  userName?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userName = "Aryan" }) => {
  return (
    <div className="flex-1 bg-background p-6 font-sans">
      {/* ── Top bar ── */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
            Welcome back, {userName} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's what's happening with your courses and teams.
          </p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map(({ icon, iconBg, label, value, sub }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl", iconBg)}>
                {icon}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-3xl font-extrabold leading-tight text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground/70">{sub}</p>
              </div>
            </CardContent>
          </Card>

        ))}
      </div>

      {/* ── Body: left col + right col ── */}
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ── LEFT COLUMN ── */}
        <div className="flex min-w-0 flex-1 flex-col gap-5">
          {/* My Courses */}
          <Card className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">My Courses</CardTitle>
              <Link to="/courses" className="text-sm font-medium text-primary hover:underline">
                View All Courses
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {COURSES.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center"
                >
                  {/* icon */}
                  <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-lg font-bold text-white", c.iconBg)}>

                    {c.icon}
                  </div>
                  {/* info */}
                  <div className="min-w-[140px]">
                    <p className="text-sm font-bold text-foreground">{c.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Course Code: {c.code}</p>
                    <Badge variant="secondary" className="mt-1.5 border-green-200 bg-green-50 text-[11px] font-medium text-green-600 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                      Enrolled
                    </Badge>

                  </div>
                  {/* team / no-team */}
                  <div className="flex-1">
                    {c.noTeam ? (
                      <div className="rounded-xl border bg-muted/50 p-3">
                        <p className="text-sm font-semibold text-orange-500">No Team Assigned</p>
                        <p className="mb-3 mt-0.5 text-xs text-muted-foreground">
                          You are not part of any team yet.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" className="text-xs">Create Team</Button>
                          <Button size="sm" variant="outline" className="text-xs">Join Team</Button>

                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-5">
                        <div>
                          <p className="text-[11px] text-muted-foreground">Team</p>
                          <div className="mt-0.5 flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">👥</span>
                            <p className="text-sm font-semibold text-foreground">{c.team}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-muted-foreground">Role</p>
                          <p className="mt-0.5 text-sm font-semibold text-foreground">{c.role}</p>

                        </div>
                      </div>
                    )}
                  </div>
                  {/* ring + btn */}
                  {!c.noTeam && (
                    <div className="ml-auto flex items-center gap-4">
                      <MembersRing value={c.members!} max={c.maxMembers!} />
                      <Button size="sm" variant="outline" className="whitespace-nowrap text-xs">
                        View Team
                      </Button>

                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* My Teams */}
          <Card className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base">My Teams</CardTitle>
              <Button variant="link" className="h-auto p-0 text-sm">View All Teams</Button>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {TEAMS.map((t) => (
                <div key={t.id} className="rounded-2xl border p-4">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{t.name}</p>
                    {t.role === "Leader" && (
                      <Badge variant="secondary" className="border-green-200 bg-green-50 text-[10px] font-semibold text-green-600 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400">
                        Leader
                      </Badge>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">{t.course}</p>
                  {/* avatars */}
                  <div className="mb-4 flex items-center gap-1">
                    {t.avatars.map((a) => (
                      <InitialsAvatar key={a} initials={a} />
                    ))}
                    {t.members < t.maxMembers && <InitialsAvatar initials="+" dashed />}
                  </div>
                  {/* footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>👥</span>
                      <span>{t.members}/{t.maxMembers} Members</span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[11px] font-semibold",
                          t.status === "Complete"
                            ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400"
                            : "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400"
                        )}
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs">View Team</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
          {/* Recent Activity */}
          <Card className="shadow-sm">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Recent Activity</CardTitle>
              <Button variant="link" className="h-auto p-0 text-xs">View All</Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {ACTIVITY.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm", a.iconBg, a.iconColor)}>
                    {a.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-foreground">{a.title}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{a.subtitle}</p>
                  </div>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{a.time}</span>
                </div>
              ))}
              <Separator className="my-1" />
              <Button variant="link" className="h-auto justify-center p-0 text-xs">
                View All Activity
              </Button>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              {QUICK_LINKS.map((q) => (
                <button
                  key={q.id}
                  className="flex items-start gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                >
                  <span className="text-base">{q.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">{q.title}</p>
                    <p className="text-[11px] text-muted-foreground">{q.desc}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
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