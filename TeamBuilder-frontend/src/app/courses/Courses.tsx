import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllCourses, createCourse } from "@/lib/courseApis";
import type { CourseData } from "@/lib/courseApis";
import { Plus, Search, BookOpen, CheckCircle, ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await getAllCourses();
      setCourses(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.log("Failed to load courses:", err);
      setLoadError(true);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setCreating(true);
    try {
      await createCourse(newCourseName, newCourseDesc);
      await fetchCourses();
      setNewCourseName("");
      setNewCourseDesc("");
      setShowCreateModal(false);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create course. Ensure admin privileges.");
    } finally {
      setCreating(false);
    }
  };

  const filteredCourses = courses.filter(
    (c) =>
      c.courseName.toLowerCase().includes(search.toLowerCase()) ||
      (c.courseDescription && c.courseDescription.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 p-6 font-sans bg-background h-full">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">All Courses</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Explore active courses, view your teams, or register new learning paths.
          </p>
        </div>

        <Button onClick={() => setShowCreateModal(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Search & Stats Bar */}
      <Card className="shadow-sm">
        <CardContent className="flex flex-col items-center justify-between gap-4 p-4 md:flex-row">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex w-full items-center justify-end gap-6 text-xs text-muted-foreground md:w-auto">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>
                Total Courses: <strong className="text-foreground">{courses.length}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>
                Active Enrolled: <strong className="text-foreground">{courses.length > 0 ? 2 : 0}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading courses...</p>
        </div>
      )}

      {/* Error state */}
      {!loading && loadError && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <p className="text-sm font-semibold text-foreground">Couldn't load courses</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            Something went wrong while fetching courses. Check your connection and try again.
          </p>
          <Button variant="outline" size="sm" onClick={fetchCourses}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !loadError && filteredCourses.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed py-16 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            {courses.length === 0 ? "No courses yet" : "No courses match your search"}
          </p>
          <p className="max-w-sm text-xs text-muted-foreground">
            {courses.length === 0
              ? "Create the first course to get your team started."
              : "Try a different search term."}
          </p>
          {courses.length === 0 && (
            <Button size="sm" className="gap-2" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Course
            </Button>
          )}
        </div>
      )}

      {/* Course Cards Grid */}
      {!loading && !loadError && filteredCourses.length > 0 && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((c, index) => {
            const isEnrolled = index < 2; // Demo enrolled state
            return (
              <Card
                key={c.id}
                className="group flex flex-col justify-between shadow-sm transition-all hover:border-primary/40"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[11px] font-semibold",
                        isEnrolled
                          ? "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
                          : "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400"
                      )}
                    >
                      {isEnrolled ? "Enrolled" : "Open"}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-primary">
                    {c.courseName}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {c.courseDescription || "No detailed description provided for this course."}
                  </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between gap-2 border-t pt-4">
                  <div className="text-[11px] text-muted-foreground">
                    <span className="block font-medium text-foreground/80">{c.createdBy}</span>
                  </div>
                  <Button asChild size="sm" variant="secondary" className="gap-1 text-xs font-semibold">
                    <Link to={`/courses/${c.id}`}>
                      Details <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-name">Course Title</Label>
              <Input
                id="course-name"
                required
                placeholder="e.g. Advanced System Architecture"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-desc">Description</Label>
              <Textarea
                id="course-desc"
                rows={3}
                placeholder="Course overview and objectives..."
                value={newCourseDesc}
                onChange={(e) => setNewCourseDesc(e.target.value)}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Courses;