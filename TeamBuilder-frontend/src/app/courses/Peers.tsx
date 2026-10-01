import React, { useMemo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { isAdminUser } from "@/lib/authUtils";
import { getCourseById, getPeersAccount } from "@/lib/courseApis";
import axiosInstance from "@/lib/axios";
import { Search, Users, UserCheck, UserX, BookOpen } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { UploadStudentsButton, type StudentRow, type UploadResult } from "@/components/StudentCsvUploadDialog";

// ── Types ──────────────────────────────────────────────────────────────────
export interface PeerRecord {
  id: string;
  name: string;
  email: string;
  course: string;
  team?: string;
  status: "Active" | "Inactive";
  progress: number; // 0-100
  joinedAt: string;
}

interface AllPeersPageProps {
  peers?: PeerRecord[];
  loading?: boolean;
  isAdmin?: boolean;
  onUploadStudents?: (students: StudentRow[]) => Promise<UploadResult | void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_STYLES: Record<PeerRecord["status"], string> = {
  Active: "border-green-200 bg-green-50 text-green-600 dark:border-green-900 dark:bg-green-950 dark:text-green-400",
  Inactive: "border-border bg-muted text-muted-foreground",
};

const formatDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const initialsOf = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed py-14 text-center">
      <Users className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{label}</p>
    </div>
  );
}

const ALL = "__all__";

// ── Component View ──────────────────────────────────────────────────────────────
const AllPeersPageView: React.FC<AllPeersPageProps> = ({ peers = [], loading = false, isAdmin = false, onUploadStudents }) => {
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const courses = useMemo(() => Array.from(new Set(peers.map((p) => p.course))).sort(), [peers]);

  const stats = useMemo(
    () => ({
      total: peers.length,
      active: peers.filter((p) => p.status === "Active").length,
      withoutTeam: peers.filter((p) => !p.team).length,
      courses: courses.length,
    }),
    [peers, courses]
  );

  const filtered = peers.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === ALL || p.course === courseFilter;
    const matchesStatus = statusFilter === ALL || p.status === statusFilter;
    return matchesSearch && matchesCourse && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">All Peers</h1>
          <p className="mt-1 text-sm text-muted-foreground">Every student enrolled across your courses.</p>
        </div>
        {onUploadStudents && <UploadStudentsButton isAdmin={isAdmin} onUpload={onUploadStudents} />}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Users, label: "Total Peers", value: stats.total },
          { icon: UserCheck, label: "Active", value: stats.active },
          { icon: UserX, label: "Without a Team", value: stats.withoutTeam },
          { icon: BookOpen, label: "Courses Covered", value: stats.courses },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                {loading ? <Skeleton className="my-1 h-7 w-10" /> : <p className="text-3xl font-extrabold text-foreground">{value}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="shadow-sm">
        <CardHeader className="flex-col gap-3 space-y-0 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-base">Peer Directory</CardTitle>
            <CardDescription>{peers.length} total</CardDescription>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Courses</SelectItem>
                {courses.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Statuses</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Team</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-40">Progress</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/15 text-[11px] font-bold text-primary">
                            {initialsOf(p.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.course}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.team || "No team"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("text-[11px] font-semibold", STATUS_STYLES[p.status])}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} className="h-1.5" />
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(p.joinedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState label={peers.length === 0 ? "No peers found yet." : "No peers match your filters."} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default function Peers() {
  const { coursesId } = useParams<{ coursesId: string }>();
  const [peers, setPeers] = useState<PeerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseName, setCourseName] = useState("");

  const authUser = useSelector((state: any) => state.auth.user);
  const isAdmin = isAdminUser(authUser);

  const fetchPeers = async () => {
    if (!coursesId) return;
    setLoading(true);
    try {
      const [courseRes, peersRes] = await Promise.all([
        getCourseById(coursesId),
        getPeersAccount(coursesId)
      ]);
      console.log(courseRes, peersRes);
      const cName = courseRes.data?.courseName || "Unknown Course";
      setCourseName(cName);
      
      const mappedPeers: PeerRecord[] = (peersRes.data || []).map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        course: cName,
        status: "Active",
        progress: 0,
        joinedAt: u.createdAt
      }));
      
      setPeers(mappedPeers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeers();
  }, [coursesId]);

  const handleUploadStudents = async (students: StudentRow[]): Promise<UploadResult> => {
    if (!coursesId) throw new Error("No course ID");
    
    // The backend addStudentManual route supports an array of students.
    const res = await axiosInstance.post(`/courses/${coursesId}/add-student-manual`, { students });
    const data = res.data.data;
    
    // Re-fetch peers after uploading
    fetchPeers();
    
    return {
      successCount: data.addedCount || 0,
    };
  };

  return (
    <AllPeersPageView 
      peers={peers} 
      loading={loading} 
      isAdmin={isAdmin}
      onUploadStudents={isAdmin ? handleUploadStudents : undefined}
    />
  );
}