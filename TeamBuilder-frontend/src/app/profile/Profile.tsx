import React, { useEffect, useState } from "react";
import { loginUser } from "@/lib/authApis";
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Mail, Shield, BookOpen, CheckCircle, Award, Star, MessageSquareText, History as HistoryIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

// ── Types ──────────────────────────────────────────────────────────────────
interface UserProfile {
  id?: string;
  name: string;
  email: string;
  address?: string;
  department?: string;
  isEmailVerified?: boolean;
  roles?: { role: string }[];
}

export interface CourseProgressItem {
  id: string;
  title: string;
  code: string;
  team: string;
  progress: number;
}

export interface FeedbackItem {
  id: string;
  name: string;
  type: "Team" | "Person";
  rating: number; // 1–5
  comment: string;
  date: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  action: string;
  detail: string;
}

export interface HistoryTrendPoint {
  label: string;
  value: number;
}

interface ProfileProps {
  taskStats?: { completed: number; total: number };
  courses?: CourseProgressItem[];
  feedbackGiven?: FeedbackItem[];
  feedbackReceived?: FeedbackItem[];
  historyEntries?: HistoryEntry[];
  historyTrend?: HistoryTrendPoint[];
}

// ── Small pieces ─────────────────────────────────────────────────────────
function EmptyState({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">{label}</p>;
}

function TaskRing({ completed, total }: { completed: number; total: number }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const data = [{ name: "tasks", value: pct, fill: "hsl(var(--primary))" }];
  return (
    <div className="relative h-24 w-24 shrink-0">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="78%" outerRadius="100%" data={data} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
          <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} cornerRadius={10} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-extrabold text-foreground">{pct}%</span>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn("h-3.5 w-3.5", i < rating ? "fill-primary text-primary" : "text-muted-foreground/30")}
        />
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

// ── Main Component ─────────────────────────────────────────────────────────
const Profile: React.FC<ProfileProps> = ({
  taskStats,
  courses = [],
  feedbackGiven = [],
  feedbackReceived = [],
  historyEntries = [],
  historyTrend = [],
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    setLoadingUser(true);
    setLoadError(false);
    try {
      const res = await loginUser();
      if (res?.data) {
        setUser(res.data);
      } else {
        setLoadError(true);
      }
    } catch (err) {
      console.log("Failed to load profile:", err);
      setLoadError(true);
    } finally {
      setLoadingUser(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Header Profile Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          {loadingUser && (
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          )}

          {!loadingUser && loadError && (
            <EmptyState label="Couldn't load your profile. Please refresh the page." />
          )}

          {!loadingUser && !loadError && user && (
            <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
              <Avatar className="h-24 w-24 shrink-0 ring-4 ring-primary/10">
                <AvatarFallback className="bg-primary text-3xl font-black text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-col items-center gap-3 md:flex-row">
                  <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{user.name}</h1>
                  {user.isEmailVerified && (
                    <Badge
                      variant="secondary"
                      className="gap-1 border-green-200 bg-green-50 font-semibold text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                    >
                      <CheckCircle className="h-3 w-3" /> Verified Student
                    </Badge>
                  )}
                </div>

                <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground md:justify-start">
                  <Mail className="h-4 w-4 text-primary" />
                  {user.email}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 md:justify-start">
                  <Badge variant="secondary" className="bg-primary/10 font-semibold text-primary">
                    Role: {user.roles?.[0]?.role || "STUDENT"}
                  </Badge>
                  {user.department && (
                    <Badge variant="secondary" className="bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Department: {user.department}
                    </Badge>
                  )}
                </div>
              </div>

              {taskStats && (
                <div className="flex shrink-0 items-center gap-4 rounded-2xl border bg-muted/40 p-4">
                  <TaskRing completed={taskStats.completed} total={taskStats.total} />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-foreground">Task Analytics</p>
                    <p className="text-muted-foreground">{taskStats.completed} / {taskStats.total} Tasks Done</p>
                    <span className="block text-[10px] font-semibold text-green-600">
                      {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}% Rate
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tabs ── */}
      {!loadingUser && !loadError && user && (
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details" className="gap-1.5">
              <Shield className="h-3.5 w-3.5" /> Details
            </TabsTrigger>
            <TabsTrigger value="feedback" className="gap-1.5">
              <MessageSquareText className="h-3.5 w-3.5" /> Feedback
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <HistoryIcon className="h-3.5 w-3.5" /> History
            </TabsTrigger>
          </TabsList>

          {/* ── Details tab ── */}
          <TabsContent value="details" className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BookOpen className="h-4 w-4 text-primary" /> My Enrolled Courses
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {courses.length > 0 ? (
                      courses.map((c) => (
                        <div key={c.id} className="flex items-center justify-between gap-4 rounded-xl border p-4">
                          <div>
                            <h3 className="text-sm font-bold text-foreground">{c.title}</h3>
                            <p className="mt-0.5 text-xs text-muted-foreground">Code: {c.code} · {c.team}</p>
                          </div>
                          <div className="w-28 shrink-0">
                            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                              <span>Progress</span>
                              <span className="font-bold text-primary">{c.progress}%</span>
                            </div>
                            <Progress value={c.progress} className="h-1.5" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState label="You're not enrolled in any courses yet." />
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Award className="h-4 w-4 text-primary" /> Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div>
                    <span className="block text-muted-foreground">User ID</span>
                    <span className="font-medium text-foreground">{user.id || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Email Address</span>
                    <span className="font-medium text-foreground">{user.email}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Campus Address</span>
                    <span className="font-medium text-foreground">{user.address || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-muted-foreground">Account Status</span>
                    <span className="font-semibold text-green-600">
                      {user.isEmailVerified ? "Active & Verified" : "Pending Verification"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── Feedback tab ── */}
          <TabsContent value="feedback" className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Feedback You've Given</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedbackGiven.length > 0 ? (
                    feedbackGiven.map((f) => <FeedbackCard key={f.id} item={f} />)
                  ) : (
                    <EmptyState label="You haven't given any feedback yet." />
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Feedback You've Received</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedbackReceived.length > 0 ? (
                    feedbackReceived.map((f) => <FeedbackCard key={f.id} item={f} />)
                  ) : (
                    <EmptyState label="No feedback has been left for you yet." />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ── History tab ── */}
          <TabsContent value="history" className="mt-5">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Activity Log</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyEntries.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Detail</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyEntries.map((h) => (
                          <TableRow key={h.id}>
                            <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{h.date}</TableCell>
                            <TableCell className="text-xs font-semibold text-foreground">{h.action}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{h.detail}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <EmptyState label="No history recorded yet." />
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Activity Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyTrend.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={historyTrend}>
                          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{
                              background: "hsl(var(--popover))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: 8,
                              fontSize: 12,
                            }}
                          />
                          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState label="Not enough activity to plot yet." />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Profile;