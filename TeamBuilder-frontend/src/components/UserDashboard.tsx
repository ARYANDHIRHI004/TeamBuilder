import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCheck,
  ArrowRight,
  Search,
  Sparkles,
  Plus,
  Award,
  BellRing,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { extractUser } from "@/lib/authUtils";
import { getAllEnrolledCourses } from "@/lib/courseApis";
import { getMyTeams } from "@/lib/teamApis";
import { getAllPeersForUser } from "@/lib/courseApis";

interface UserDashboardProps {
  user?: any;
}

interface DashboardCourse {
  id: string;
  title: string;
  code: string;
  progress: number;
  instructor: string;
  teamsCount: number;
}

interface DashboardTeam {
  id: string;
  name: string;
  course: string;
  courseId: string;
  role: string;
  membersCount: number;
  recentActivity: string;
}

interface DashboardPeer {
  id: string;
  name: string;
  course: string;
  courseId: string;
}

const initialsOf = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const actualUser = extractUser(user) || { name: "Student", email: "" };
  const [courseSearch, setCourseSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<DashboardCourse[]>([]);
  const [teams, setTeams] = useState<DashboardTeam[]>([]);
  const [peers, setPeers] = useState<DashboardPeer[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [enrolledRes, teamsRes, peersRes] = await Promise.all([
          getAllEnrolledCourses(),
          getMyTeams(),
          getAllPeersForUser(),
        ]);

        const enrolled = enrolledRes.data || [];
        setCourses(
          enrolled.map((r: any) => ({
            id: r.course.id,
            title: r.course.courseName,
            code: r.course.id.substring(0, 8),
            progress: 0,
            instructor: "Course faculty",
            teamsCount: 0,
          }))
        );

        const memberships = teamsRes.data || [];
        setTeams(
          memberships.map((m: any) => ({
            id: m.team.id,
            name: m.team.teamName,
            course: m.team.course?.courseName || "",
            courseId: m.team.course?.id || m.team.courseId,
            role: m.role === "TEAM_LEAD" ? "Team Lead" : "Member",
            membersCount: m.team.members?.length || 0,
            recentActivity: m.team.histories?.[0]?.description || "No recent activity",
          }))
        );

        const peerList = peersRes.data || [];
        const uniquePeers = new Map<string, DashboardPeer>();
        for (const p of peerList) {
          if (!uniquePeers.has(p.id)) {
            uniquePeers.set(p.id, {
              id: p.id,
              name: p.name,
              course: p.courseName,
              courseId: p.courseId,
            });
          }
        }
        setPeers(Array.from(uniquePeers.values()).slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredCourses = useMemo(
    () => courses.filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase())),
    [courses, courseSearch]
  );

  const avgProgress =
    courses.length > 0
      ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length)
      : 0;

  const leadCount = teams.filter((t) => t.role === "Team Lead").length;

  return (
    <div className="space-y-6 p-6 font-sans max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-500/30 text-purple-200 border-purple-400/30 backdrop-blur-md">
                Student Workspace
              </Badge>
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Active Member
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {actualUser.name || "Student"}!
            </h1>
            <p className="text-purple-200/80 text-sm max-w-2xl">
              Track your course progress, collaborate with your team members, and connect with peer builders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="secondary" className="gap-2 bg-white text-purple-950 hover:bg-purple-50 font-semibold">
              <Link to="/teams">
                <Users className="w-4 h-4" />
                Find a Team
              </Link>
            </Button>
            <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold">
              <Link to="/peers">
                <Sparkles className="w-4 h-4" />
                Connect Peers
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", value: loading ? "—" : String(courses.length), sub: "From your registrations", icon: BookOpen },
          { label: "My Teams", value: loading ? "—" : `${teams.length} Teams`, sub: `${leadCount} lead · ${teams.length - leadCount} member`, icon: Users },
          { label: "Peer Connections", value: loading ? "—" : String(peers.length), sub: "Across your courses", icon: UserCheck },
          { label: "Avg Progress", value: loading ? "—" : `${avgProgress}%`, sub: "Across enrolled courses", icon: Award },
        ].map(({ label, value, sub, icon: Icon }) => (
          <Card key={label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-[11px] text-muted-foreground font-medium">{sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="courses" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="courses" className="rounded-lg">My Courses</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-lg">My Teams</TabsTrigger>
          <TabsTrigger value="peers" className="rounded-lg">Recommended Peers</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-foreground">Active Courses</h2>
              <p className="text-xs text-muted-foreground">Continue learning and submit project deliverables.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search my courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No enrolled courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredCourses.map((c) => (
                <Card key={c.id} className="flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs font-semibold text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900">
                        {c.code}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold leading-snug">{c.title}</CardTitle>
                    <CardDescription className="text-xs">{c.instructor}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 pb-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{c.progress}%</span>
                      </div>
                      <Progress value={c.progress} className="h-2" />
                    </div>

                    <Button asChild variant="outline" className="w-full justify-between group">
                      <Link to={`/courses/${c.id}`}>
                        <span>View Course & Teams</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">My Collaborative Teams</h2>
              <p className="text-xs text-muted-foreground">Teams you are currently leading or part of.</p>
            </div>
            <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Link to="/teams">
                <Plus className="w-4 h-4" /> Create or Join Team
              </Link>
            </Button>
          </div>

          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : teams.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">You are not on a team yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teams.map((t) => (
                <Card key={t.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        {t.name}
                        <Badge className={t.role === "Team Lead" ? "bg-purple-600 text-white" : "bg-secondary text-secondary-foreground"}>
                          {t.role}
                        </Badge>
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {t.membersCount} Members
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">{t.course}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <BellRing className="w-4 h-4 text-purple-500 shrink-0" />
                      <span className="line-clamp-1">{t.recentActivity}</span>
                    </div>

                    <Button asChild size="sm" variant="ghost" className="gap-1 text-xs">
                      <Link to={`/courses/${t.courseId}/teams/${t.id}`}>
                        Team Workspace <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="peers" className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Peers in Your Courses</h2>
            <p className="text-xs text-muted-foreground">Students enrolled alongside you.</p>
          </div>

          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : peers.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No peers in your courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {peers.map((p) => (
                <Card key={p.id} className="shadow-sm hover:border-purple-300 transition-all">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-purple-600 text-white text-xs font-bold">
                          {initialsOf(p.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.course}</p>
                      </div>
                    </div>

                    <Button asChild size="sm" variant="outline" className="w-full text-xs gap-1 mt-2">
                      <Link to="/peers">
                        <Sparkles className="w-3 h-3 text-purple-600" /> Message
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
