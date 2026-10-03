import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  getTeamById,
  approveApplicant,
  rejectApplicant,
  approveTeamByAdmin,
  rejectTeamByAdmin,
  openHiring,
  closeHiring,
  getMyCourseTeamStatus,
} from "@/lib/teamApis";
import ApplyToTeamDialog from "@/components/ApplyToTeamDialog";
import { createNote } from "@/lib/notesApis";
import { extractUser, isAdminUser } from "@/lib/authUtils";
import { Loader2, ArrowLeft, Users, BookOpen } from "lucide-react";
import GiveFeedbackDialog from "@/components/GiveFeedbackDialog";
import TeamChatPanel from "@/components/TeamChatPanel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const initialsOf = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const TeamDetailsPage = () => {
  const { coursesId, teamsId } = useParams<{ coursesId: string; teamsId: string }>();
  const authUser = useSelector((state: any) => state.auth.user);
  const currentUser = extractUser(authUser);
  const currentUserId = currentUser?.id || currentUser?._id || authUser?._id;

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [actingOnApp, setActingOnApp] = useState<string | null>(null);
  const [actingAdmin, setActingAdmin] = useState(false);
  const [hiringBusy, setHiringBusy] = useState(false);
  const [canJoinTeam, setCanJoinTeam] = useState(false);
  const [pendingApplication, setPendingApplication] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);

  const isAdmin = isAdminUser(authUser);

  const myMembership = useMemo(() => {
    if (!team?.members || !currentUserId) return null;
    return team.members.find(
      (m: any) => m.memberId === currentUserId || m.member?.id === currentUserId
    );
  }, [team, currentUserId]);

  const isTeamLead = myMembership?.role === "TEAM_LEAD";
  const isTeamMember = Boolean(myMembership);

  const load = async () => {
    if (!coursesId || !teamsId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [teamRes, statusRes] = await Promise.all([
        getTeamById(coursesId, teamsId),
        getMyCourseTeamStatus(coursesId),
      ]);
      setTeam(teamRes.data);
      const status = statusRes.data;
      setCanJoinTeam(Boolean(status?.canJoinTeam));
      setPendingApplication(status?.pendingApplication?.team?.id === teamsId);
    } catch (err: any) {
      console.error(err);
      setTeam(null);
      setLoadError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load team details. Make sure you are enrolled in this course."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [coursesId, teamsId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamsId || !noteDraft.trim() || !isTeamMember) return;
    setSaving(true);
    try {
      await createNote(teamsId, noteDraft.trim());
      setNoteDraft("");
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not add note.");
    } finally {
      setSaving(false);
    }
  };

  const notes = team?.notes || [];

  const handleApproveApplicant = async (applicantUserId: string) => {
    if (!teamsId) return;
    setActingOnApp(applicantUserId);
    try {
      await approveApplicant(teamsId, applicantUserId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not approve applicant.");
    } finally {
      setActingOnApp(null);
    }
  };

  const handleRejectApplicant = async (applicantUserId: string) => {
    if (!teamsId) return;
    setActingOnApp(applicantUserId);
    try {
      await rejectApplicant(teamsId, applicantUserId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not reject applicant.");
    } finally {
      setActingOnApp(null);
    }
  };

  const handleAdminApproveTeam = async () => {
    if (!coursesId || !teamsId) return;
    setActingAdmin(true);
    try {
      await approveTeamByAdmin(coursesId, teamsId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not approve team.");
    } finally {
      setActingAdmin(false);
    }
  };

  const handleToggleHiring = async (open: boolean) => {
    if (!teamsId) return;
    setHiringBusy(true);
    try {
      if (open) await openHiring(teamsId);
      else await closeHiring(teamsId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not update hiring status.");
    } finally {
      setHiringBusy(false);
    }
  };

  const handleAdminRejectTeam = async () => {
    if (!coursesId || !teamsId) return;
    setActingAdmin(true);
    try {
      await rejectTeamByAdmin(coursesId, teamsId);
      await load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not reject team.");
    } finally {
      setActingAdmin(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-4 p-6 text-center">
        <p className="text-muted-foreground">{loadError || "Team not found."}</p>
        <Button asChild variant="outline">
          <Link to={coursesId ? `/courses/${coursesId}/teams` : "/teams"}>Back to teams</Link>
        </Button>
      </div>
    );
  }

  const teamBlocked = team.status === "INACTIVE";

  return (
    <div className="space-y-6 p-6 font-sans max-w-[1400px]">
      <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2">
        <Link to={coursesId ? `/courses/${coursesId}/teams` : "/teams"}>
          <ArrowLeft className="h-4 w-4" /> Back to teams
        </Link>
      </Button>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">{team.teamName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{team.teamDescription || "No description."}</p>
          {team.course?.courseName && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {team.course.courseName}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {team.approvalStatus && team.approvalStatus !== "APPROVED" && (
            <Badge variant="outline" className="border-amber-500 text-amber-600">
              {team.approvalStatus === "PENDING" ? "Awaiting admin approval" : "Rejected"}
            </Badge>
          )}
          <Badge variant={team.hiring === "ACTIVE" ? "default" : "secondary"}>
            {team.hiring === "ACTIVE" ? "Hiring open" : "Hiring closed"}
          </Badge>
          {teamBlocked && isTeamMember && (
            <Badge variant="destructive">This team is blocked</Badge>
          )}
          {isTeamLead && <Badge variant="outline">You are team lead</Badge>}
          {isTeamMember && !isTeamLead && <Badge variant="outline">You are a member</Badge>}
          {teamsId && (
            <GiveFeedbackDialog
              targetLabel={team.teamName}
              givenToTeamId={teamsId}
            />
          )}
          {isTeamLead && team.approvalStatus === "APPROVED" && !teamBlocked && (
            team.hiring === "ACTIVE" ? (
              <Button variant="outline" size="sm" disabled={hiringBusy} onClick={() => handleToggleHiring(false)}>
                Close hiring
              </Button>
            ) : (
              <Button size="sm" disabled={hiringBusy} onClick={() => handleToggleHiring(true)}>
                Open hiring
              </Button>
            )
          )}
          {!isTeamMember &&
            !isAdmin &&
            team.approvalStatus === "APPROVED" &&
            team.hiring === "ACTIVE" &&
            !teamBlocked &&
            canJoinTeam && (
              <Button size="sm" variant="default" disabled={pendingApplication} onClick={() => setApplyOpen(true)}>
                {pendingApplication ? "Application pending" : "Apply to join"}
              </Button>
            )}
        </div>
      </div>

      {teamsId && applyOpen && (
        <ApplyToTeamDialog
          teamId={teamsId}
          teamName={team.teamName}
          open={applyOpen}
          onOpenChange={setApplyOpen}
          onSuccess={() => {
            alert("Application submitted.");
            load();
          }}
        />
      )}

      {teamBlocked && isTeamMember && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            An administrator has blocked this team. It is hidden from other students, but you can still
            see team details and read team chat.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_minmax(320px,400px)] lg:items-start">
      <div className="space-y-6 min-w-0">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" /> Members
          </CardTitle>
          <CardDescription>{team.members?.length || 0} people on this team</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {(team.members || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No members yet.</p>
          ) : (
            (team.members || []).map((m: any) => (
              <div key={m.id} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{initialsOf(m.member?.name || "?")}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {m.member?.id ? (
                      <Link to={`/profile/${m.member.id}`} className="hover:underline text-primary">
                        {m.member?.name}
                      </Link>
                    ) : (
                      m.member?.name
                    )}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{m.member?.email}</p>
                  <p className="text-[10px] font-medium text-primary">
                    {m.role === "TEAM_LEAD" ? "Team lead" : "Member"}
                  </p>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {isAdmin && team.approvalStatus === "PENDING" && (
        <Card className="border-amber-500/40">
          <CardHeader>
            <CardTitle className="text-base">Admin: approve this team?</CardTitle>
            <CardDescription>New teams are hidden from students until you approve them.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={handleAdminApproveTeam} disabled={actingAdmin}>Approve team</Button>
            <Button variant="outline" onClick={handleAdminRejectTeam} disabled={actingAdmin}>Reject team</Button>
          </CardContent>
        </Card>
      )}

      {isTeamMember && team.approvalStatus === "APPROVED" && (team.applications?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Join applications</CardTitle>
            <CardDescription>
              {isTeamLead
                ? "Review cover letters and approve or reject applicants."
                : "Cover letters from students who applied to join (read-only)."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {team.applications.map((app: any) => (
              <div key={app.id} className="flex flex-col gap-2 rounded-lg border px-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {app.user?.id ? (
                      <Link to={`/profile/${app.user.id}`} className="text-primary hover:underline">
                        {app.user?.name || app.user?.email}
                      </Link>
                    ) : (
                      app.user?.name || app.user?.email
                    )}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-muted-foreground">Cover letter</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground rounded-md bg-muted/40 px-3 py-2">
                    {app.description || "No cover letter provided."}
                  </p>
                </div>
                {isTeamLead && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      disabled={actingOnApp === app.userId}
                      onClick={() => handleApproveApplicant(app.userId)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={actingOnApp === app.userId}
                      onClick={() => handleRejectApplicant(app.userId)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isTeamMember && team.approvalStatus === "APPROVED" && (team.applications?.length ?? 0) === 0 && team.hiring === "ACTIVE" && isTeamLead && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Hiring is open. Applicants will appear here with their cover letters.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Team notes</CardTitle>
          <CardDescription>
            {isTeamMember ? "Notes visible to team members." : "Join this team to add notes."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isTeamMember && (
            <form onSubmit={handleAddNote} className="flex gap-2">
              <Input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                placeholder="Add a note..."
                disabled={saving}
              />
              <Button type="submit" disabled={saving || !noteDraft.trim()}>Add</Button>
            </form>
          )}
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            <ul className="space-y-2">
              {notes.map((n: any) => (
                <li key={n.id} className="rounded-lg border bg-muted/30 px-3 py-2 text-sm">
                  {n.note}
                  <span className="mt-1 block text-[10px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      </div>

      {teamsId && (
        <div className="lg:sticky lg:top-4">
          <TeamChatPanel
            teamId={teamsId}
            teamName={team.teamName}
            isMember={isTeamMember}
            teamBlocked={teamBlocked}
          />
        </div>
      )}
      </div>
    </div>
  );
};

export default TeamDetailsPage;
