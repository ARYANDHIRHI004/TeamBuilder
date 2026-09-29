import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  UserCheck,
  Clock,
  ArrowRight,
  Search,
  Sparkles,
  Plus,
  Award,
  CheckCircle2,
  ExternalLink,
  BellRing,
  Layers,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { extractUser } from "@/lib/authUtils";

interface UserDashboardProps {
  user?: any;
}

const MOCK_COURSES = [
  {
    id: "c1",
    title: "Full Stack Web Development",
    code: "CS-401",
    progress: 75,
    instructor: "Dr. Sarah Jenkins",
    totalModules: 12,
    completedModules: 9,
    nextLesson: "Building REST APIs with Express & Prisma",
    teamsCount: 4,
  },
  {
    id: "c2",
    title: "Machine Learning & AI Systems",
    code: "AI-302",
    progress: 40,
    instructor: "Prof. Alex Rivera",
    totalModules: 10,
    completedModules: 4,
    nextLesson: "Neural Networks Overview",
    teamsCount: 6,
  },
  {
    id: "c3",
    title: "Cloud Computing & DevOps",
    code: "SYS-508",
    progress: 90,
    instructor: "Elena Rostova",
    totalModules: 8,
    completedModules: 7,
    nextLesson: "Kubernetes Cluster Deployment",
    teamsCount: 3,
  },
];

const MOCK_TEAMS = [
  {
    id: "t1",
    name: "Code Crafters",
    course: "Full Stack Web Development",
    role: "Team Lead",
    membersCount: 4,
    maxMembers: 5,
    status: "Active",
    hiring: true,
    recentActivity: "Submitted Sprint 2 Milestone",
  },
  {
    id: "t2",
    name: "NeuroNodes AI",
    course: "Machine Learning & AI Systems",
    role: "Member",
    membersCount: 3,
    maxMembers: 4,
    status: "Active",
    hiring: false,
    recentActivity: "Scheduled Team Sync tomorrow at 4 PM",
  },
];

const MOCK_PEERS = [
  { id: "p1", name: "David Chen", role: "Frontend Developer", course: "CS-401", match: "95% Skill Match" },
  { id: "p2", name: "Sophia Martinez", role: "Data Scientist", course: "AI-302", match: "88% Skill Match" },
  { id: "p3", name: "Marcus Brody", role: "DevOps Engineer", course: "SYS-508", match: "92% Skill Match" },
];

const initialsOf = (name: string) =>
  name ? name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() : "U";

const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const actualUser = extractUser(user) || { name: "Student", email: "student@teambuilder.com" };
  const [courseSearch, setCourseSearch] = useState("");

  const filteredCourses = useMemo(
    () => MOCK_COURSES.filter((c) => c.title.toLowerCase().includes(courseSearch.toLowerCase())),
    [courseSearch]
  );

  return (
    <div className="space-y-6 p-6 font-sans max-w-7xl mx-auto">
      {/* Greeting Banner */}
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
              Welcome back, {actualUser.name || "Student"}! 👋
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Enrolled Courses</p>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">All active this term</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">My Teams</p>
              <p className="text-2xl font-bold text-foreground">2 Teams</p>
              <p className="text-[11px] text-muted-foreground">1 Team Lead, 1 Member</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Peer Connections</p>
              <p className="text-2xl font-bold text-foreground">14</p>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">+3 new this week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avg Progress</p>
              <p className="text-2xl font-bold text-foreground">68%</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">On track for completion</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="courses" className="w-full space-y-6">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="courses" className="rounded-lg">My Courses</TabsTrigger>
          <TabsTrigger value="teams" className="rounded-lg">My Teams</TabsTrigger>
          <TabsTrigger value="peers" className="rounded-lg">Recommended Peers</TabsTrigger>
        </TabsList>

        {/* My Courses Tab */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredCourses.map((c) => (
              <Card key={c.id} className="flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-800 transition-all shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-xs font-semibold text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900">
                      {c.code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{c.teamsCount} Teams</span>
                  </div>
                  <CardTitle className="text-base font-bold leading-snug">{c.title}</CardTitle>
                  <CardDescription className="text-xs">{c.instructor}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress ({c.completedModules}/{c.totalModules} modules)</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">{c.progress}%</span>
                    </div>
                    <Progress value={c.progress} className="h-2" />
                  </div>

                  <div className="p-3 rounded-lg bg-muted/60 space-y-1">
                    <p className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3 text-purple-500" /> Next Lesson
                    </p>
                    <p className="text-xs font-medium text-foreground line-clamp-1">{c.nextLesson}</p>
                  </div>

                  <Button asChild variant="outline" className="w-full justify-between group">
                    <Link to="/teams">
                      <span>View Course & Teams</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Teams Tab */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {MOCK_TEAMS.map((t) => (
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
                      {t.membersCount}/{t.maxMembers} Members
                    </Badge>
                  </div>
                  <CardDescription className="text-xs">{t.course}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <BellRing className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="line-clamp-1">{t.recentActivity}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex -space-x-2">
                      {Array.from({ length: t.membersCount }).map((_, i) => (
                        <Avatar key={i} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="bg-purple-500/20 text-purple-600 text-[10px] font-bold">
                            M{i + 1}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <Button asChild size="sm" variant="ghost" className="gap-1 text-xs">
                      <Link to="/teams">
                        Team Workspace <ExternalLink className="w-3 h-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Recommended Peers Tab */}
        <TabsContent value="peers" className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recommended Peer Builders</h2>
            <p className="text-xs text-muted-foreground">Students in your registered courses looking for teammates.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {MOCK_PEERS.map((p) => (
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
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <Badge variant="secondary" className="text-[10px]">{p.course}</Badge>
                    <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">{p.match}</span>
                  </div>

                  <Button asChild size="sm" variant="outline" className="w-full text-xs gap-1 mt-2">
                    <Link to="/peers">
                      <Sparkles className="w-3 h-3 text-purple-600" /> Connect
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDashboard;
