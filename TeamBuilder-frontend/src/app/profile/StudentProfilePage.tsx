import React, { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Hash,
  CalendarDays,
  Clock,
  Flame,
  Trophy,
  Activity,
  CheckCircle2,
  Star,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ── Types ──────────────────────────────────────────────────────────────────
export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  department?: string;
  rollNumber?: string;
  batch?: string;
  status: "Active" | "Inactive";
  isEmailVerified?: boolean;
  joinedAt: string;
  lastActiveAt?: string;
}

export interface ActivityDay {
  date: string; // ISO "YYYY-MM-DD"
  count: number;
}

export interface ProgressSlice {
  label: string;
  value: number;
}

export interface FeedbackItem {
  id: string;
  name: string; // who the feedback is from / to
  type: "Team" | "Person" | "Instructor";
  rating: number; // 1–5
  comment: string;
  date: string;
}

export interface HistoryEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
}

export interface HistoryTrendPoint {
  label: string;
  value: number;
}

interface StudentProfilePageProps {
  student?: StudentProfileData;
  activity?: ActivityDay[];
  progressBreakdown?: ProgressSlice[];
  feedbackReceived?: FeedbackItem[];
  feedbackGiven?: FeedbackItem[];
  historyEvents?: HistoryEvent[];
  historyTrend?: HistoryTrendPoint[];
  loading?: boolean;
  onBack?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initialsOf = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const PIE_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--chart-4))",
];

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">{label}</p>;
}

const DetailRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  </div>
);

// ── Activity heatmap (GitHub / LeetCode style) ─────────────────────────────
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTH_FORMAT = new Intl.DateTimeFormat(undefined, { month: "short" });

function toKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function levelFor(count: number) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

const LEVEL_CLASSES = ["bg-muted", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"];

function ActivityHeatmap({ data }: { data: ActivityDay[] }) {
  const { weeks, monthLabels, totalContributions, activeDays, currentStreak, longestStreak } = useMemo(() => {
    const countByDate = new Map(data.map((d) => [d.date, d.count]));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const totalDays = 371; // ~53 weeks
    const rawStart = new Date(today);
    rawStart.setDate(rawStart.getDate() - (totalDays - 1));
    const start = new Date(rawStart);
    start.setDate(start.getDate() - start.getDay()); // snap back to Sunday

    const allDays: { date: Date; count: number }[] = [];
    const cursor = new Date(start);
    while (cursor <= today) {
      const key = toKey(cursor);
      allDays.push({ date: new Date(cursor), count: countByDate.get(key) || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks: { date: Date; count: number }[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    const monthLabels = weeks.map((week, i) => {
      const firstOfMonth = week.find((d) => d.date.getDate() <= 7);
      if (!firstOfMonth) return "";
      const prevWeek = weeks[i - 1];
      const prevHadSameMonth = prevWeek?.some((d) => d.date.getMonth() === firstOfMonth.date.getMonth());
      return prevHadSameMonth ? "" : MONTH_FORMAT.format(firstOfMonth.date);
    });

    const totalContributions = allDays.reduce((sum, d) => sum + d.count, 0);
    const activeDays = allDays.filter((d) => d.count > 0).length;

    let longestStreak = 0;
    let running = 0;
    for (const d of allDays) {
      if (d.count > 0) {
        running += 1;
        longestStreak = Math.max(longestStreak, running);
      } else {
        running = 0;
      }
    }
    let currentStreak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].count > 0) currentStreak += 1;
      else break;
    }

    return { weeks, monthLabels, totalContributions, activeDays, currentStreak, longestStreak };
  }, [data]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 pb-4">
        {[
          { icon: Activity, label: "Total Activity", value: totalContributions },
          { icon: CheckCircle2, label: "Active Days", value: activeDays },
          { icon: Flame, label: "Current Streak", value: `${currentStreak} day${currentStreak === 1 ? "" : "s"}` },
          { icon: Trophy, label: "Longest Streak", value: `${longestStreak} day${longestStreak === 1 ? "" : "s"}` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <p className="text-sm font-bold text-foreground">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1">
          <div className="ml-7 flex gap-[3px]">
            {weeks.map((_, i) => (
              <div key={i} className="w-[11px] shrink-0 text-[10px] text-muted-foreground">
                {monthLabels[i]}
              </div>
            ))}
          </div>

          <div className="flex gap-[3px]">
            <div className="flex flex-col gap-[3px]">
              {DAY_LABELS.map((label, i) => (
                <div key={i} className="flex h-[11px] w-6 items-center text-[10px] text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((d, di) => (
                  <div
                    key={di}
                    title={`${d.count} ${d.count === 1 ? "activity" : "activities"} on ${d.date.toDateString()}`}
                    className={cn("h-[11px] w-[11px] rounded-[2px]", LEVEL_CLASSES[levelFor(d.count)])}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground">
        <span>Less</span>
        {LEVEL_CLASSES.map((cls, i) => (
          <div key={i} className={cn("h-[11px] w-[11px] rounded-[2px]", cls)} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Progress pie (sits to the right of the heatmap) ────────────────────────
function ProgressPie({ data }: { data: ProgressSlice[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  return (
    <div className="flex flex-col items-center gap-3 lg:w-52">
      <div className="h-36 w-36">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={45} outerRadius={65} paddingAngle={2} strokeWidth={0}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="w-full space-y-1.5">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              <span className="text-muted-foreground">{d.label}</span>
            </div>
            <span className="font-semibold text-foreground">{total > 0 ? Math.round((d.value / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Feedback card + star rating ─────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("h-3.5 w-3.5", i < rating ? "fill-primary text-primary" : "text-muted-foreground/30")} />
      ))}
    </div>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-foreground">{item.name}</p>
        <Badge variant="secondary" className="text-[10px] font-semibold">{item.type}</Badge>
      </div>
      <StarRating rating={item.rating} />
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.comment}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/70">{item.date}</p>
    </div>
  );
}

// ── Tile timeline (history) ─────────────────────────────────────────────────
function Timeline({ events }: { events: HistoryEvent[] }) {
  return (
    <div>
      {events.map((e, i) => (
        <div key={e.id} className="flex gap-4">
          <div className="flex flex-col items-center">
            <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" />
            {i < events.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className={cn("min-w-0 flex-1 pb-6", i === events.length - 1 && "pb-0")}>
            <div className="rounded-xl border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">{e.title}</p>
                <span className="whitespace-nowrap text-[11px] text-muted-foreground">{formatDate(e.date)}</span>
              </div>
              {e.description && <p className="mt-1 text-xs text-muted-foreground">{e.description}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  student,
  activity = [],
  progressBreakdown = [],
  feedbackReceived = [],
  feedbackGiven = [],
  historyEvents = [],
  historyTrend = [],
  loading = false,
  onBack,
}) => {
  return (
    <div className="space-y-6 p-6 font-sans">
      {onBack && (
        <Button variant="ghost" size="sm" className="-ml-2 gap-2 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      )}

      {loading && (
        <div className="space-y-5">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      )}

      {!loading && !student && (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Student not found</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            This profile may have been removed, or you may not have access to it.
          </p>
          {onBack && <Button variant="outline" size="sm" onClick={onBack}>Go Back</Button>}
        </div>
      )}

      {!loading && student && (
        <>
          {/* Header card */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                <Avatar className="h-24 w-24 shrink-0 ring-4 ring-primary/10">
                  <AvatarFallback className="bg-primary text-3xl font-black text-primary-foreground">
                    {initialsOf(student.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-col items-center gap-3 sm:flex-row">
                    <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{student.name}</h1>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-semibold",
                          student.status === "Active"
                            ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                            : "border-border bg-muted text-muted-foreground"
                        )}
                      >
                        {student.status}
                      </Badge>
                      {student.isEmailVerified && (
                        <Badge
                          variant="secondary"
                          className="gap-1 border-blue-200 bg-blue-50 font-semibold text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                    <Mail className="h-4 w-4 text-primary" />
                    {student.email}
                  </p>
                  {student.department && (
                    <Badge variant="secondary" className="bg-primary/10 font-semibold text-primary">
                      {student.department}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal details */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Personal Details</CardTitle>
              <CardDescription>Contact and account information.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailRow icon={Hash} label="Roll Number" value={student.rollNumber} />
                <DetailRow icon={Building2} label="Department" value={student.department} />
                <DetailRow icon={Phone} label="Phone" value={student.phone} />
                <DetailRow icon={MapPin} label="Address" value={student.address} />
                <DetailRow icon={CalendarDays} label="Joined On" value={formatDate(student.joinedAt)} />
                <DetailRow icon={Clock} label="Last Active" value={student.lastActiveAt ? formatDate(student.lastActiveAt) : "—"} />
              </div>
            </CardContent>
          </Card>

          {/* Activity: heatmap + progress pie */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Activity</CardTitle>
              <CardDescription>A day-by-day look at activity, and an overall progress breakdown.</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length > 0 ? (
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <ActivityHeatmap data={activity} />
                  </div>
                  {progressBreakdown.length > 0 && (
                    <>
                      <Separator orientation="vertical" className="hidden self-stretch lg:block" />
                      <div>
                        <p className="mb-3 text-xs font-semibold text-foreground">Progress</p>
                        <ProgressPie data={progressBreakdown} />
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <EmptyState label="No activity recorded yet." />
              )}
            </CardContent>
          </Card>

          {/* Feedback & History */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Feedback & History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="received" className="w-full">
                <TabsList>
                  <TabsTrigger value="received">Feedback Received</TabsTrigger>
                  <TabsTrigger value="given">Feedback Given</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* Feedback received from others */}
                <TabsContent value="received" className="mt-5 space-y-3">
                  {feedbackReceived.length > 0 ? (
                    feedbackReceived.map((f) => <FeedbackCard key={f.id} item={f} />)
                  ) : (
                    <EmptyState label="No feedback has been received yet." />
                  )}
                </TabsContent>

                {/* Feedback given to team / peers */}
                <TabsContent value="given" className="mt-5 space-y-3">
                  {feedbackGiven.length > 0 ? (
                    feedbackGiven.map((f) => <FeedbackCard key={f.id} item={f} />)
                  ) : (
                    <EmptyState label="Hasn't given any feedback yet." />
                  )}
                </TabsContent>

                {/* History: line graph + tile timeline */}
                <TabsContent value="history" className="mt-5 space-y-6">
                  <div>
                    <p className="mb-3 text-sm font-bold text-foreground">Activity Trend</p>
                    {historyTrend.length > 0 ? (
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={historyTrend}>
                            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <EmptyState label="Not enough history to plot a trend yet." />
                    )}
                  </div>

                  <Separator />

                  <div>
                    <p className="mb-4 text-sm font-bold text-foreground">Timeline</p>
                    {historyEvents.length > 0 ? (
                      <Timeline events={historyEvents} />
                    ) : (
                      <EmptyState label="No history recorded since joining." />
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default StudentProfilePage;