import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMyTeams, getAllTeams, createTeam, getMyCourseTeamStatus } from "@/lib/teamApis";
import ApplyToTeamDialog from "@/components/ApplyToTeamDialog";
import { getAllEnrolledCourses } from "@/lib/courseApis";
import { Loader2, Users, ExternalLink, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const MyTeamsList = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [teamsRes, enrolledRes] = await Promise.all([getMyTeams(), getAllEnrolledCourses()]);
        setTeams(teamsRes.data || []);
        setCourses(enrolledRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">My Teams</h1>
        <p className="mt-1 text-sm text-muted-foreground">Teams you belong to across all courses.</p>
      </div>

      {teams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm font-medium">You are not on any team yet.</p>
            {courses.length > 0 && (
              <Button asChild>
                <Link to={`/courses/${courses[0].course.id}/teams`}>Browse teams in a course</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {teams.map((m) => (
            <Card key={m.id}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">{m.team.teamName}</CardTitle>
                  <Badge variant="secondary">{m.role === "TEAM_LEAD" ? "Lead" : "Member"}</Badge>
                </div>
                <CardDescription>{m.team.course?.courseName}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{m.team.members?.length || 0} members</span>
                <Button asChild size="sm" variant="outline" className="gap-1">
                  <Link to={`/courses/${m.team.course?.id || m.team.courseId}/teams/${m.team.id}`}>
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {courses.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">Join a team by course</h2>
          <div className="flex flex-wrap gap-2">
            {courses.map((r: any) => (
              <Button key={r.course.id} asChild variant="outline" size="sm">
                <Link to={`/courses/${r.course.id}/teams`}>{r.course.courseName}</Link>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const CourseTeamsList = ({ coursesId }: { coursesId: string }) => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [canCreateTeam, setCanCreateTeam] = useState(true);
  const [canJoinTeam, setCanJoinTeam] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [myTeamId, setMyTeamId] = useState<string | null>(null);
  const [pendingTeamId, setPendingTeamId] = useState<string | null>(null);
  const [applyTeam, setApplyTeam] = useState<{ id: string; name: string } | null>(null);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const [teamsRes, statusRes] = await Promise.all([
        getAllTeams(coursesId),
        getMyCourseTeamStatus(coursesId),
      ]);
      setTeams(teamsRes.data || []);
      const status = statusRes.data;
      setCanCreateTeam(Boolean(status?.canCreateTeam));
      setCanJoinTeam(Boolean(status?.canJoinTeam));
      setMyTeamId(status?.membership?.team?.id ?? null);
      setPendingTeamId(status?.pendingApplication?.team?.id ?? null);

      if (status?.isInTeam && status?.membership?.team?.teamName) {
        setStatusMessage(`You are on team "${status.membership.team.teamName}" for this course (one team per course).`);
      } else if (status?.pendingApplication?.team?.teamName) {
        setStatusMessage(`Application pending for "${status.pendingApplication.team.teamName}".`);
      } else {
        setStatusMessage(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [coursesId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createTeam(coursesId, teamName.trim(), teamDescription.trim() || undefined);
      setCreateOpen(false);
      setTeamName("");
      setTeamDescription("");
      await loadTeams();
      alert(res.message || "Team submitted for admin approval.");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not create team.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 font-sans">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Course Teams</h1>
          <p className="text-sm text-muted-foreground">Create or join a team for this course.</p>
        </div>
        <Button className="gap-2" onClick={() => setCreateOpen(true)} disabled={!canCreateTeam}>
          <Plus className="h-4 w-4" /> Create team
        </Button>
      </div>

      {statusMessage && (
        <p className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">{statusMessage}</p>
      )}

      {teams.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">No teams in this course yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <CardTitle className="text-lg">{team.teamName}</CardTitle>
                <CardDescription className="line-clamp-2">{team.teamDescription || "No description"}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {team.approvalStatus === "PENDING" && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600">Awaiting admin</Badge>
                )}
                {team.approvalStatus === "REJECTED" && (
                  <Badge variant="destructive">Rejected</Badge>
                )}
                <Badge variant={team.hiring === "ACTIVE" ? "default" : "secondary"}>
                  {team.hiring === "ACTIVE" ? "Hiring" : "Closed"}
                </Badge>
                <p className="mt-2 text-xs text-muted-foreground">{team.members?.length || 0} members</p>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button asChild size="sm" variant="secondary" className="flex-1">
                  <Link to={`/courses/${coursesId}/teams/${team.id}`}>View</Link>
                </Button>
                {team.approvalStatus === "APPROVED" && team.hiring === "ACTIVE" && canJoinTeam && myTeamId !== team.id && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingTeamId === team.id}
                    onClick={() => setApplyTeam({ id: team.id, name: team.teamName })}
                  >
                    {pendingTeamId === team.id ? "Applied" : "Apply"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {applyTeam && (
        <ApplyToTeamDialog
          teamId={applyTeam.id}
          teamName={applyTeam.name}
          open={Boolean(applyTeam)}
          onOpenChange={(open) => {
            if (!open) setApplyTeam(null);
          }}
          onSuccess={() => {
            alert("Application submitted.");
            loadTeams();
            setApplyTeam(null);
          }}
        />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="team-name">Team name</Label>
              <Input id="team-name" required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="team-desc">Description</Label>
              <Input id="team-desc" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={creating}>{creating ? "Creating..." : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Teams = () => {
  const { coursesId } = useParams<{ coursesId: string }>();
  if (coursesId) return <CourseTeamsList coursesId={coursesId} />;
  return <MyTeamsList />;
};

export default Teams;
