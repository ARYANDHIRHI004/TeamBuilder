import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from "react-redux";
import { isAdminUser } from "@/lib/authUtils";
import { getCourseById } from '@/lib/courseApis';
import { getAllTeams } from '@/lib/teamApis';
import type { TeamData } from '@/lib/teamApis';
import type { CourseData } from '@/lib/courseApis';
import axiosInstance from '@/lib/axios';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Users, Plus, ArrowRight, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Import the dialog components that the user just built
import { UploadStudentsButton } from '@/components/StudentCsvUploadDialog';
import type { StudentRow, UploadResult } from '@/components/StudentCsvUploadDialog';

const CourseDetailedPage = () => {
  const { coursesId } = useParams<{ coursesId: string }>();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);

  const authUser = useSelector((state: any) => state.auth.user);
  const isAdmin = isAdminUser(authUser);

  const fetchCourseData = async () => {
    if (!coursesId) return;
    setLoading(true);
    try {
      const courseRes = await getCourseById(coursesId);
      setCourse(courseRes.data);
      const teamsRes = await getAllTeams(coursesId);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [coursesId]);

  const handleUploadStudents = async (students: StudentRow[]): Promise<UploadResult> => {
    if (!coursesId) throw new Error("No course ID");
    
    // The backend addStudentManual route supports an array of students.
    const res = await axiosInstance.post(`/courses/${coursesId}/add-student-manual`, { students });
    const data = res.data.data;
    
    return {
      successCount: data.addedCount || 0,
    };
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return <div className="p-6 text-center text-muted-foreground">Course not found.</div>;
  }

  return (
    <div className="space-y-6 p-6 font-sans">
      {/* Course Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{course.courseName}</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{course.courseDescription || "No description provided."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Inject the user's Upload Students Button here, restricted to admins */}
          <UploadStudentsButton isAdmin={isAdmin} onUpload={handleUploadStudents} />
          
          <Button asChild variant="outline" className="gap-2">
            <Link to={`/courses/${coursesId}/peers`}>
              <Users className="h-4 w-4" /> Peers
            </Link>
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Cohort
          </Button>
        </div>
      </div>

      {/* Cohorts (Teams) Section */}
      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Cohorts / Teams</h2>
          <Badge variant="secondary">{teams.length} total</Badge>
        </div>
        
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center">
            <ShieldCheck className="mb-4 h-10 w-10 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">No cohorts yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">Get started by creating the first cohort for this course.</p>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Cohort
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <Card key={team.id} className="group flex flex-col justify-between shadow-sm transition-all hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{team.teamName}</CardTitle>
                    <Badge variant={team.hiring === 'ACTIVE' ? 'default' : 'secondary'}>
                      {team.hiring === 'ACTIVE' ? 'Hiring' : 'Closed'}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2 mt-2">
                    {team.teamDescription || "No description provided for this cohort."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{team.members?.length || 0} Members</span>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <Button asChild className="w-full gap-2" variant="secondary">
                    <Link to={`/courses/${coursesId}/teams/${team.id}`}>
                      View Cohort <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetailedPage;