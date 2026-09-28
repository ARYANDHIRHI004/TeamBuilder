import React from "react";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
} from "recharts";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  User,
  Clock,
  Users,
  Tag,
  Mail,
  BookOpen,
  FileText,
  Megaphone,
  Video,
  Plus,
  Download,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────────────
export interface ResourceItem {
  id: string;
  name: string;
  type: "PDF" | "PPTX" | "XLSX" | "DOCX";
  size: string;
  url?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  date: string;
  dueIn: string;
  urgency: "high" | "medium" | "low" | "normal";
}

export interface AnnouncementItem {
  id: string;
  title: string;
  desc: string;
  date: string;
  author: string;
  kind: "update" | "session" | "general";
}

export interface TeamSummary {
  id: string;
  name: string;
  description: string;
  lead: string;
  members: string; // e.g. "4/4"
  status: "Active" | "Hiring";
}

export interface PeerItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

export interface ActivityLogItem {
  id: string;
  title: string;
  desc: string;
  time: string;
}

export interface YourTeamInfo {
  name: string;
  role: "Leader" | "Member";
  memberCount: string; // "4/4 Members"
  avatars: string[];
}

export interface CourseDetailData {
  id: string;
  name: string;
  code: string;
  shortDescription: string;
  progressPct: number;
  instructor: string;
  duration: string;
  totalStudents: number;
  teamsCount: number;
  tasksCompleted: number;
  tasksTotal: number;
  pendingTasks: number;
  upcomingDeadlineLabel: string;
  enrolledOn: string;
  role: string;
  credits: string;
  fullDescription: string;
  learnItems: string[];
  yourTeam?: YourTeamInfo;
  resources: ResourceItem[];
  tasks: TaskItem[];
  teams: TeamSummary[];
  peers: PeerItem[];
  announcements: AnnouncementItem[];
  activityLog: ActivityLogItem[];
}

export interface CurrentUser {
  name: string;
  role: string;
  initials: string;
}

interface CourseDetailProps {
  course?: CourseDetailData;
  loading?: boolean;
  currentUser?: CurrentUser;
  notificationCount?: number;
  onBack?: () => void;
}

// ── Style maps ───────────────────────────────────────────────────────────
const FILE_STYLES: Record<ResourceItem["type"], string> = {
  PDF: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  PPTX: "bg-orange-50 text-orange-500 dark:bg-orange-950 dark:text-orange-400",
  XLSX: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  DOCX: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
};

const URGENCY_STYLES: Record<TaskItem["urgency"], string> = {
  high: "text-red-500 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900",
  medium: "text-orange-500 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-900",
  low: "text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-900",
  normal: "text-muted-foreground bg-muted border-transparent",
};

const ANNOUNCEMENT_ICON: Record<AnnouncementItem["kind"], React.ElementType> = {
  update: Megaphone,
  session: Video,
  general: Bell,
};

// ── Small chart components ──────────────────────────────────────────────
function CourseProgressRing({ pct }: { pct: number }) {
  const data = [{ name: "progress", value: pct, fill: "hsl(var(--primary))" }];
  return (
    <div className="relative h-32 w-32 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="78%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={12} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-foreground">{pct}%</span>
        <span className="text-[10px] text-muted-foreground">complete</span>
      </div>
    </div>
  );
}

function TaskStatusBar({ completed, inProgress, pending }: { completed: number; inProgress: number; pending: number }) {
  const data = [
    { name: "Completed", value: completed, fill: "hsl(var(--chart-2))" },
    { name: "In Progress", value: inProgress, fill: "hsl(var(--primary))" },
    { name: "Pending", value: pending, fill: "hsl(var(--muted-foreground))" },
  ];
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={48}>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function InitialsAvatar({ initials }: { initials: string }) {
  return (
    <Avatar className="h-9 w-9 ring-2 ring-background">
      <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">{initials}</AvatarFallback>
    </Avatar>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">{label}</p>;
}

// ── Main Component ─────────────────────────────────────────────────────────
const CourseDetailPage: React.FC<CourseDetailProps> = ({ course, loading = false, currentUser, notificationCount = 0, onBack }) => {
  return (
    <div className="h-screen flex-1 overflow-auto bg-muted/30 font-sans">
      

      {/* ── Loading state ── */}
      {loading && (
        <div className="space-y-5 p-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      )}

      {/* ── No data state ── */}
      {!loading && !course && (
        <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Course not found</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            We couldn't load this course. It may have been removed, or you may not have access.
          </p>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back to My Courses
          </Button>
        </div>
      )}

      {!loading && course && (
        <div className="flex flex-col gap-5 p-6 lg:flex-row">
          {/* ── MAIN CONTENT ── */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* Course header card */}
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-start gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary text-3xl font-black text-primary-foreground">
                    <BookOpen className="h-9 w-9" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-3">
                      <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{course.name}</h1>
                      <Badge
                        variant="secondary"
                        className="border-green-200 bg-green-50 font-semibold text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                      >
                        Enrolled
                      </Badge>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">Course Code: {course.code}</p>
                    <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{course.shortDescription}</p>
                  </div>
                  <div className="shrink-0 text-center">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">Your Progress</p>
                    <CourseProgressRing pct={course.progressPct} />
                  </div>
                </div>

                <Separator className="my-5" />

                <div className="flex flex-wrap items-center gap-8">
                  {[
                    { icon: User, label: "Instructor", value: course.instructor },
                    { icon: Clock, label: "Duration", value: course.duration },
                    { icon: Users, label: "Total Students", value: String(course.totalStudents) },
                    { icon: Tag, label: "Teams", value: String(course.teamsCount) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-[11px] text-muted-foreground">{label}</p>
                        <p className="text-sm font-semibold text-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Stats row */}
            <Card className="shadow-sm">
              <CardContent className="flex flex-wrap items-center gap-6 p-4">
                {[
                  { icon: FileText, color: "text-blue-500", label: "Tasks Completed", value: `${course.tasksCompleted} / ${course.tasksTotal}` },
                  { icon: Clock, color: "text-orange-500", label: "Pending Tasks", value: String(course.pendingTasks) },
                  { icon: Tag, color: "text-primary", label: "Upcoming Deadline", value: course.upcomingDeadlineLabel },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="flex min-w-[180px] flex-1 items-center gap-3">
                    <Icon className={cn("h-5 w-5", color)} />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-bold text-foreground">{value}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="whitespace-nowrap">
                  View Tasks
                </Button>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="shadow-sm">
              <Tabs defaultValue="overview" className="w-full">
                <div className="overflow-x-auto border-b px-6">
                  <TabsList className="h-auto bg-transparent p-0">
                    {[
                      ["overview", "Overview"],
                      ["teams", "Teams"],
                      ["peers", "Peers"],
                      ["tasks", "Tasks"],
                      ["resources", "Resources"],
                      ["announcements", "Announcements"],
                      ["activity", "Activity Log"],
                    ].map(([value, label]) => (
                      <TabsTrigger
                        key={value}
                        value={value}
                        className="rounded-none border-b-2 border-transparent px-3 py-4 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"
                      >
                        {label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {/* Overview */}
                <TabsContent value="overview" className="flex flex-col gap-6 p-6">
                  <div>
                    <h3 className="mb-4 font-bold text-foreground">Course Overview</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        { icon: BookOpen, label: "Course Code", value: course.code },
                        { icon: Clock, label: "Enrolled On", value: course.enrolledOn },
                        { icon: Users, label: "Your Role", value: course.role },
                        { icon: Mail, label: "Credits", value: course.credits },
                      ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-[11px] text-muted-foreground">{label}</p>
                            <p className="text-sm font-bold text-foreground">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-bold text-foreground">Course Description</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">{course.fullDescription}</p>
                      <Button variant="link" className="mt-4 h-auto gap-1 p-0 text-sm">
                        View Syllabus <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div>
                      <h4 className="mb-3 font-bold text-foreground">What You'll Learn</h4>
                      {course.learnItems.length > 0 ? (
                        <ul className="flex flex-col gap-2">
                          {course.learnItems.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="mt-0.5 shrink-0 font-bold text-green-500">✓</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <EmptyRow label="Learning outcomes haven't been added yet." />
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-4 font-bold text-foreground">Your Team</h4>
                    {course.yourTeam ? (
                      <div className="flex items-center gap-4 rounded-2xl border p-4">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">{course.yourTeam.name}</p>
                            {course.yourTeam.role === "Leader" && (
                              <Badge
                                variant="secondary"
                                className="border-green-200 bg-green-50 text-[10px] font-semibold text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                              >
                                Leader
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{course.yourTeam.memberCount}</p>
                        </div>
                        <div className="flex items-center -space-x-2">
                          {course.yourTeam.avatars.map((a) => (
                            <InitialsAvatar key={a} initials={a} />
                          ))}
                        </div>
                        <Button variant="outline" size="sm" className="ml-auto">
                          View Team
                        </Button>
                      </div>
                    ) : (
                      <EmptyRow label="You haven't joined a team in this course yet." />
                    )}
                  </div>

                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-bold text-foreground">Course Resources</h4>
                      <Button variant="link" className="h-auto p-0 text-xs">View All</Button>
                    </div>
                    {course.resources.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                        {course.resources.map((r) => (
                          <div key={r.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors hover:border-primary/40">
                            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold", FILE_STYLES[r.type])}>
                              {r.type}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-[12px] font-semibold text-foreground">{r.name}</p>
                              <p className="text-[11px] text-muted-foreground">{r.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyRow label="No resources have been shared for this course yet." />
                    )}
                  </div>
                </TabsContent>

                {/* Teams */}
                <TabsContent value="teams" className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Course Teams</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Team
                    </Button>
                  </div>
                  {course.teams.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {course.teams.map((t) => (
                        <div key={t.id} className="flex flex-col justify-between space-y-3 rounded-2xl border p-4">
                          <div>
                            <div className="mb-1 flex items-center justify-between">
                              <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-[10px] font-semibold",
                                  t.status === "Active"
                                    ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                                    : "border-purple-200 bg-purple-50 text-purple-600 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400"
                                )}
                              >
                                {t.status}
                              </Badge>
                            </div>
                            <p className="line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                          </div>
                          <div className="flex items-center justify-between border-t pt-2 text-xs text-muted-foreground">
                            <span>Lead: <strong className="text-foreground">{t.lead}</strong></span>
                            <span>Members: <strong className="text-foreground">{t.members}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyRow label="No teams have been formed in this course yet." />
                  )}
                </TabsContent>

                {/* Peers */}
                <TabsContent value="peers" className="space-y-4 p-6">
                  <h3 className="text-sm font-bold text-foreground">Enrolled Classmates & Peers</h3>
                  {course.peers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {course.peers.map((p) => (
                        <div key={p.id} className="flex items-center justify-between rounded-2xl border p-3">
                          <div>
                            <p className="text-sm font-bold text-foreground">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.email}</p>
                          </div>
                          <Badge
                            variant="secondary"
                            className="border-purple-200 bg-purple-50 text-[10px] font-semibold text-purple-600 dark:border-purple-900 dark:bg-purple-950 dark:text-purple-400"
                          >
                            {p.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyRow label="No classmates to show yet." />
                  )}
                </TabsContent>

                {/* Tasks */}
                <TabsContent value="tasks" className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">Course Deliverables & Tasks</h3>
                    <Button size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Submit Task
                    </Button>
                  </div>
                  {course.tasks.length > 0 ? (
                    <div className="space-y-3">
                      {course.tasks.map((t) => (
                        <div key={t.id} className="flex items-center justify-between gap-4 rounded-2xl border p-4">
                          <div>
                            <p className="text-sm font-bold text-foreground">{t.title}</p>
                            <p className="text-xs text-muted-foreground">{t.date} · {t.dueIn}</p>
                          </div>
                          <Badge variant="outline" className={cn("text-[10px] font-semibold", URGENCY_STYLES[t.urgency])}>
                            {t.urgency.toUpperCase()}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyRow label="No tasks have been assigned yet." />
                  )}
                  <Separator />
                  <TaskStatusBar completed={course.tasksCompleted} inProgress={course.tasksTotal - course.tasksCompleted - course.pendingTasks} pending={course.pendingTasks} />
                </TabsContent>

                {/* Resources */}
                <TabsContent value="resources" className="space-y-4 p-6">
                  <h3 className="text-sm font-bold text-foreground">Course Materials & Downloads</h3>
                  {course.resources.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {course.resources.map((r) => (
                        <div key={r.id} className="flex items-center gap-4 rounded-2xl border p-4 transition-colors hover:border-primary/40">
                          <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold", FILE_STYLES[r.type])}>
                            {r.type}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-foreground">{r.name}</p>
                            <p className="text-[11px] text-muted-foreground">{r.size}</p>
                          </div>
                          <Button variant="link" size="sm" className="h-auto gap-1 p-0 text-xs">
                            <Download className="h-3.5 w-3.5" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyRow label="No materials have been uploaded yet." />
                  )}
                </TabsContent>

                {/* Announcements */}
                <TabsContent value="announcements" className="space-y-4 p-6">
                  <h3 className="text-sm font-bold text-foreground">Instructor Announcements</h3>
                  {course.announcements.length > 0 ? (
                    <div className="space-y-3">
                      {course.announcements.map((a) => {
                        const Icon = ANNOUNCEMENT_ICON[a.kind];
                        return (
                          <div key={a.id} className="flex items-start gap-3 rounded-2xl border p-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-foreground">{a.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.desc}</p>
                              <p className="mt-2 text-[11px] text-muted-foreground/70">{a.date} · {a.author}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyRow label="No announcements yet." />
                  )}
                </TabsContent>

                {/* Activity Log */}
                <TabsContent value="activity" className="space-y-4 p-6">
                  <h3 className="text-sm font-bold text-foreground">Course Activity Log</h3>
                  {course.activityLog.length > 0 ? (
                    <div className="space-y-3">
                      {course.activityLog.map((log) => (
                        <div key={log.id} className="flex items-start gap-3 rounded-2xl border p-3">
                          <span className="mt-0.5 text-sm font-bold text-primary">•</span>
                          <div>
                            <p className="text-xs font-bold text-foreground">{log.title}</p>
                            <p className="text-[11px] text-muted-foreground">{log.desc}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground/70">{log.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyRow label="No activity recorded yet." />
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
            {/* Upcoming Tasks */}
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Upcoming Tasks</h2>
                  <Button variant="link" className="h-auto p-0 text-xs">View All</Button>
                </div>
                {course.tasks.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {course.tasks.map(({ id, title, date, dueIn, urgency }) => (
                      <div key={id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-foreground">{title}</p>
                          <p className="text-[11px] text-muted-foreground">{date}</p>
                        </div>
                        <Badge variant="outline" className={cn("whitespace-nowrap text-[10px] font-semibold", URGENCY_STYLES[urgency])}>
                          {dueIn}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyRow label="No upcoming tasks." />
                )}
              </CardContent>
            </Card>

            {/* Course Announcements */}
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-foreground">Course Announcements</h2>
                  <Button variant="link" className="h-auto p-0 text-xs">View All</Button>
                </div>
                {course.announcements.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {course.announcements.map((a) => {
                      const Icon = ANNOUNCEMENT_ICON[a.kind];
                      return (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{a.title}</p>
                            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{a.desc}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground/70">{a.date} · {a.author}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyRow label="No announcements yet." />
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-sm">
              <CardContent className="p-5">
                <h2 className="mb-3 text-sm font-bold text-foreground">Quick Links</h2>
                <div className="flex flex-col divide-y">
                  {[
                    { icon: BookOpen, title: "Course Resources", desc: "Access study materials and resources" },
                    { icon: Users, title: "Discussion Forum", desc: "Ask questions and discuss topics" },
                    { icon: User, title: "Contact Instructor", desc: "Send a message to your instructor" },
                  ].map((q) => (
                    <button
                      key={q.title}
                      className="flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left transition-colors hover:bg-muted"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <q.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">{q.title}</p>
                        <p className="truncate text-[11px] text-muted-foreground">{q.desc}</p>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetailPage;