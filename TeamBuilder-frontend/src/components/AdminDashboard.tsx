import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { GraduationCap, Layers, Plus, Search, ShieldCheck, Users, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────────────────────
export type CohortStatus = "Upcoming" | "Active" | "Completed";

export interface Cohort {
  id: string;
  name: string;
  description?: string;
  status: CohortStatus;
  startDate: string; // ISO date
  endDate: string; // ISO date
  studentCount: number;
  capacity: number;
  createdBy?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  joinedAt?: string;
}

export interface CreateCohortInput {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
}

interface AdminDashboardProps {
  admins?: AdminUser[];
  cohorts?: Cohort[];
  loading?: boolean;
  /** Should persist the cohort. Throw to surface an error inside the dialog. */
  onCreateCohort: (input: CreateCohortInput) => Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<CohortStatus, string> = {
  Active: "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  Upcoming: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
  Completed: "border-border bg-muted text-muted-foreground",
};

const STATUS_COLORS: Record<CohortStatus, string> = {
  Active: "hsl(var(--chart-2))",
  Upcoming: "hsl(var(--chart-1))",
  Completed: "hsl(var(--muted-foreground))",
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

function EmptyState({ label }: { label: string }) {
  return <p className="rounded-xl border border-dashed py-10 text-center text-sm text-muted-foreground">{label}</p>;
}

const EMPTY_FORM: CreateCohortInput = { name: "", description: "", startDate: "", endDate: "", capacity: 30 };

// ── Component ──────────────────────────────────────────────────────────────
const AdminDashboard: React.FC<AdminDashboardProps> = ({
  admins = [],
  cohorts = [],
  loading = false,
  onCreateCohort,
}) => {
  const [cohortSearch, setCohortSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateCohortInput>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  // ── Stats derived from real data ──
  const stats = useMemo(() => {
    const totalStudents = cohorts.reduce((sum, c) => sum + c.studentCount, 0);
    const totalCapacity = cohorts.reduce((sum, c) => sum + c.capacity, 0);
    return [
      { label: "Total Cohorts", value: cohorts.length, sub: `${cohorts.filter((c) => c.status === "Active").length} active`, icon: Layers },
      { label: "Total Students", value: totalStudents, sub: `${totalCapacity} seats overall`, icon: GraduationCap },
      { label: "Admins", value: admins.length, sub: `${admins.filter((a) => a.status === "Active").length} active`, icon: ShieldCheck },
      {
        label: "Seat Utilisation",
        value: totalCapacity > 0 ? `${Math.round((totalStudents / totalCapacity) * 100)}%` : "0%",
        sub: "Enrolled vs. capacity",
        icon: Users,
      },
    ];
  }, [cohorts, admins]);

  const statusData = useMemo(
    () =>
      (["Active", "Upcoming", "Completed"] as CohortStatus[])
        .map((s) => ({ name: s, value: cohorts.filter((c) => c.status === s).length }))
        .filter((d) => d.value > 0),
    [cohorts]
  );

  const enrollmentData = useMemo(
    () => cohorts.map((c) => ({ name: c.name, Enrolled: c.studentCount, Capacity: c.capacity })),
    [cohorts]
  );

  const filteredCohorts = cohorts.filter((c) => c.name.toLowerCase().includes(cohortSearch.toLowerCase()));
  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(adminSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(adminSearch.toLowerCase())
  );

  // ── Create cohort ──
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setForm(EMPTY_FORM);
      setFormError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (form.endDate < form.startDate) {
      setFormError("End date can't be before the start date.");
      return;
    }
    setCreating(true);
    try {
      await onCreateCohort({ ...form, name: form.name.trim(), description: form.description.trim() });
      handleOpenChange(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to create cohort.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage cohorts, review admins, and keep an eye on enrollment across the platform.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Cohort
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                {loading ? (
                  <Skeleton className="my-1 h-7 w-12" />
                ) : (
                  <p className="text-3xl font-extrabold leading-tight text-foreground">{value}</p>
                )}
                <p className="truncate text-xs text-muted-foreground/70">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
        </TabsList>

        {/* ── Overview ── */}
        <TabsContent value="overview" className="mt-5">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
              <Skeleton className="h-80 rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="shadow-sm lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base">Enrollment by Cohort</CardTitle>
                  <CardDescription>Enrolled students compared to available seats.</CardDescription>
                </CardHeader>
                <CardContent>
                  {enrollmentData.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={enrollmentData} barGap={4}>
                          <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <YAxis tickLine={false} axisLine={false} allowDecimals={false} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--muted))" }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                          <Bar dataKey="Enrolled" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="Capacity" fill="hsl(var(--muted-foreground) / 0.35)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState label="Create a cohort to see enrollment data." />
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Cohorts by Status</CardTitle>
                  <CardDescription>Where every cohort currently stands.</CardDescription>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                            {statusData.map((d) => (
                              <Cell key={d.name} fill={STATUS_COLORS[d.name as CohortStatus]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <EmptyState label="No cohorts yet." />
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* ── Cohorts ── */}
        <TabsContent value="cohorts" className="mt-5">
          <Card className="shadow-sm">
            <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">All Cohorts</CardTitle>
                <CardDescription>{cohorts.length} total</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search cohorts..."
                  value={cohortSearch}
                  onChange={(e) => setCohortSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredCohorts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cohort</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead className="w-48">Enrollment</TableHead>
                      <TableHead>Created By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCohorts.map((c) => {
                      const pct = c.capacity > 0 ? Math.round((c.studentCount / c.capacity) * 100) : 0;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <p className="text-sm font-semibold text-foreground">{c.name}</p>
                            {c.description && (
                              <p className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{c.description}</p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={cn("text-[11px] font-semibold", STATUS_STYLES[c.status])}>
                              {c.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                            {formatDate(c.startDate)} – {formatDate(c.endDate)}
                          </TableCell>
                          <TableCell>
                            <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                              <span>{c.studentCount} / {c.capacity}</span>
                              <span className="font-semibold text-foreground">{pct}%</span>
                            </div>
                            <Progress value={pct} className="h-1.5" />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{c.createdBy || "—"}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState label={cohorts.length === 0 ? "No cohorts yet. Create your first one to get started." : "No cohorts match your search."} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Admins ── */}
        <TabsContent value="admins" className="mt-5">
          <Card className="shadow-sm">
            <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-base">Administrators</CardTitle>
                <CardDescription>{admins.length} total</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : filteredAdmins.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Admin</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAdmins.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
                                {initialsOf(a.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-semibold text-foreground">{a.name}</p>
                              <p className="text-xs text-muted-foreground">{a.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[11px] font-semibold">{a.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[11px] font-semibold",
                              a.status === "Active" ? STATUS_STYLES.Active : STATUS_STYLES.Completed
                            )}
                          >
                            {a.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{a.joinedAt ? formatDate(a.joinedAt) : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState label={admins.length === 0 ? "No admins found." : "No admins match your search."} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Cohort dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Cohort</DialogTitle>
            <DialogDescription>Set up a new cohort. You can enroll students once it's created.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="cohort-name">Cohort Name</Label>
              <Input
                id="cohort-name"
                required
                placeholder="e.g. Fall 2026 – Full Stack"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cohort-desc">Description</Label>
              <Textarea
                id="cohort-desc"
                rows={3}
                placeholder="What is this cohort about?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="cohort-start">Start Date</Label>
                <Input
                  id="cohort-start"
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cohort-end">End Date</Label>
                <Input
                  id="cohort-end"
                  type="date"
                  required
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cohort-capacity">Capacity</Label>
              <Input
                id="cohort-capacity"
                type="number"
                min={1}
                required
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Creating..." : "Create Cohort"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;