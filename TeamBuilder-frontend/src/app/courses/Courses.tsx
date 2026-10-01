import React, { useMemo, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAdminUser } from "@/lib/authUtils";
import { getAllCourses, getAllEnrolledCourses, createCourse } from "@/lib/courseApis";
import {
  Plus,
  Search,
  BookOpen,
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Eye,
  Users,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Types ──────────────────────────────────────────────────────────────────
export type CourseStatus = "Published" | "Draft" | "Archived";

export interface AdminCourseItem {
  id: string;
  title: string;
  code: string;
  instructor: string;
  studentCount: number;
  teamCount: number;
  status: CourseStatus;
  createdAt: string;
}

export interface EnrolledCourseItem {
  id: string;
  title: string;
  code: string;
  instructor: string;
  description?: string;
  progress: number; // 0-100
  team?: string;
  status: "In Progress" | "Completed";
}

export interface CreateCourseInput {
  title: string;
  code: string;
  instructor: string;
  description: string;
}

interface AdminCoursesViewProps {
  role: "admin";
  courses: AdminCourseItem[];
  loading?: boolean;
  onCreateCourse: (input: CreateCourseInput) => Promise<void>;
  onEditCourse?: (course: AdminCourseItem) => void;
  onArchiveCourse?: (course: AdminCourseItem) => void;
  onDeleteCourse?: (course: AdminCourseItem) => void;
  onViewCourse?: (course: AdminCourseItem) => void;
}

interface UserCoursesViewProps {
  role: "user";
  courses: EnrolledCourseItem[];
  loading?: boolean;
  browseAllUrl?: string;
}

type CoursesSectionProps = AdminCoursesViewProps | UserCoursesViewProps;

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<CourseStatus, string> = {
  Published: "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  Draft: "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-400",
  Archived: "border-border bg-muted text-muted-foreground",
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

function EmptyState({ label, action }: { label: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
      <BookOpen className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {action}
    </div>
  );
}

const EMPTY_FORM: CreateCourseInput = { title: "", code: "", instructor: "", description: "" };

const CoursesSectionView: React.FC<CoursesSectionProps> = (props) => {
  if (props.role === "admin") return <AdminCoursesView {...props} />;
  return <UserCoursesView {...props} />;
};

export default function Courses() {
  const authUser = useSelector((state: any) => state.auth.user);
  const isAdmin = isAdminUser(authUser);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await getAllCourses();
        const mappedCourses: AdminCourseItem[] = res.data?.map((c: any) => ({
          id: c.id,
          title: c.courseName,
          code: c.id.substring(0, 8),
          instructor: c.createdBy || "Unknown", // Might need to populate creater name
          studentCount: c.registeredUsers?.length || 0,
          teamCount: c.teams?.length || 0,
          status: "Published",
          createdAt: c.createdAt,
        })) || [];
        setCourses(mappedCourses);
      } else {
        const res = await getAllEnrolledCourses();
        const mappedCourses: EnrolledCourseItem[] = res.data?.map((r: any) => {
          const c = r.course;
          return {
            id: c.id,
            title: c.courseName,
            code: c.id.substring(0, 8),
            instructor: c.createdBy || "Unknown",
            description: c.courseDescription,
            progress: 0,
            status: "In Progress",
          };
        }) || [];
        setCourses(mappedCourses);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [isAdmin]);

  const handleCreateCourse = async (input: CreateCourseInput) => {
    await createCourse(input.title, input.description);
    fetchCourses();
  };

  if (isAdmin) {
    return (
      <CoursesSectionView
        role="admin"
        courses={courses}
        loading={loading}
        onCreateCourse={handleCreateCourse}
      />
    );
  }

  return <CoursesSectionView role="user" courses={courses} loading={loading} />;
}

// ── Admin view: all courses in the platform ─────────────────────────────
const AdminCoursesView: React.FC<AdminCoursesViewProps> = ({
  courses,
  loading = false,
  onCreateCourse,
  onEditCourse,
  onArchiveCourse,
  onDeleteCourse,
  onViewCourse,
}) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CreateCourseInput>(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");

  const stats = useMemo(
    () => ({
      total: courses?.length,
      published: courses?.filter((c) => c.status === "Published").length,
      draft: courses?.filter((c) => c.status === "Draft").length,
      students: courses?.reduce((sum, c) => sum + c.studentCount, 0),
    }),
    [courses]
  );

  const filtered = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase())
  );

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
    setCreating(true);
    try {
      await onCreateCourse({ ...form, title: form.title.trim(), code: form.code.trim() });
      handleOpenChange(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.message || err?.message || "Failed to create course.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">All Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage every course offered on the platform.</p>
        </div>
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Courses", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Draft", value: stats.draft },
          { label: "Total Students", value: stats.students },
        ].map((s) => (
          <Card key={s.label} className="shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              {loading ? <Skeleton className="my-1 h-7 w-10" /> : <p className="text-3xl font-extrabold text-foreground">{s.value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="shadow-sm">
        <CardHeader className="flex-col gap-3 space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base">Course List</CardTitle>
            <CardDescription>{courses.length} total</CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to={`/courses/${c.id}`}>
                        <p className="text-sm font-semibold text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground">Code: {c.code}</p>
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.instructor}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px] font-semibold", STATUS_STYLES[c.status])}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.studentCount}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{c.teamCount}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewCourse?.(c)}>
                            <Eye /> View
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEditCourse?.(c)}>
                            <Pencil /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onArchiveCourse?.(c)}>
                            <Archive /> Archive
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => onDeleteCourse?.(c)}>
                            <Trash2 /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              label={courses.length === 0 ? "No courses have been created yet." : "No courses match your search."}
              action={
                courses.length === 0 ? (
                  <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> Create Course
                  </Button>
                ) : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      {/* Create Course dialog */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Course</DialogTitle>
            <DialogDescription>Add a new course to the platform.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-title">Course Title</Label>
              <Input
                id="course-title"
                required
                placeholder="e.g. Advanced System Architecture"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="course-code">Course Code</Label>
                <Input
                  id="course-code"
                  required
                  placeholder="e.g. SYS2026"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-instructor">Instructor</Label>
                <Input
                  id="course-instructor"
                  required
                  placeholder="e.g. Dr. Rahul Sharma"
                  value={form.instructor}
                  onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea
                id="course-desc"
                rows={3}
                placeholder="Course overview and objectives..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {formError && <p className="text-sm text-destructive">{formError}</p>}

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating} className="gap-2">
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── User view: only the courses this user is enrolled in ─────────────────
const UserCoursesView: React.FC<UserCoursesViewProps> = ({ courses, loading = false, browseAllUrl = "/courses" }) => {
  const [search, setSearch] = useState("");
  const filtered = courses?.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 p-6 font-sans">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">My Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">Courses you're currently enrolled in.</p>
        </div>
        <Button asChild variant="outline" className="gap-2">
          <Link to={browseAllUrl}>
            <BookOpen className="h-4 w-4" />
            Browse All Courses
          </Link>
        </Button>
      </div>

      {courses.length > 0 && (
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search your courses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="group flex flex-col justify-between shadow-sm transition-all hover:border-primary/40">
              <CardContent className="p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[11px] font-semibold",
                      c.status === "Completed"
                        ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                        : "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
                    )}
                  >
                    {c.status}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">{c.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Code: {c.code} · {c.instructor}
                </p>
                {c.description && <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{c.description}</p>}

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Progress</span>
                    <span className="font-semibold text-primary">{c.progress}%</span>
                  </div>
                  <Progress value={c.progress} className="h-1.5" />
                </div>
              </CardContent>

              <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {c.team || "No team yet"}
                </div>
                <Button asChild size="sm" variant="secondary" className="gap-1 text-xs font-semibold">
                  <Link to={`/courses/${c.id}`}>
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          label={courses.length === 0 ? "You're not enrolled in any courses yet." : "No courses match your search."}
          action={
            courses.length === 0 ? (
              <Button asChild size="sm" className="gap-2">
                <Link to={browseAllUrl}>
                  <BookOpen className="h-4 w-4" /> Browse Courses
                </Link>
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
};
