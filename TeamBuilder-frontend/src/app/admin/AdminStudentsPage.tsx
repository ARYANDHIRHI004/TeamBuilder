import { useEffect, useState } from "react";
import { getAllStudentsAdmin, getAllTeamsAdmin, setTeamBlockStatus, setUserBlockStatus } from "@/lib/adminApis";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminStudentsPage = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sRes, tRes] = await Promise.all([getAllStudentsAdmin(), getAllTeamsAdmin()]);
      setStudents(sRes.data || []);
      setTeams(tRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleUser = async (userId: string, currentlyBlocked: boolean) => {
    setActingId(userId);
    try {
      await setUserBlockStatus(userId, !currentlyBlocked);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
    }
  };

  const toggleTeam = async (teamId: string, currentlyBlocked: boolean) => {
    setActingId(teamId);
    try {
      await setTeamBlockStatus(teamId, !currentlyBlocked);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || "Action failed");
    } finally {
      setActingId(null);
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-extrabold">Students & Teams</h1>
        <p className="text-sm text-muted-foreground">All registered students and teams across courses.</p>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered students</CardTitle>
              <CardDescription>Every row is a course enrollment. Block applies to the user account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.registrationId}>
                      <TableCell className="font-medium">
                        {s.userId ? (
                          <Link to={`/profile/${s.userId}`} className="text-primary hover:underline">
                            {s.name}
                          </Link>
                        ) : (
                          s.name
                        )}
                      </TableCell>
                      <TableCell className="text-xs">{s.userEmail}</TableCell>
                      <TableCell className="text-xs">{s.courseName}</TableCell>
                      <TableCell>
                        {!s.hasAccount ? (
                          <Badge variant="outline">No login yet</Badge>
                        ) : s.accountStatus === "INACTIVE" ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {s.userId ? (
                          <Button
                            size="sm"
                            variant={s.accountStatus === "INACTIVE" ? "secondary" : "destructive"}
                            disabled={actingId === s.userId}
                            onClick={() => toggleUser(s.userId, s.accountStatus === "INACTIVE")}
                          >
                            {s.accountStatus === "INACTIVE" ? "Unblock" : "Block"}
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>All teams</CardTitle>
              <CardDescription>Block hides a team from students and closes hiring.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teams.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.teamName}</TableCell>
                      <TableCell className="text-xs">{t.course?.courseName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{t.approvalStatus}</Badge>
                      </TableCell>
                      <TableCell>
                        {t.status === "INACTIVE" ? (
                          <Badge variant="destructive">Blocked</Badge>
                        ) : (
                          <Badge variant="secondary">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={t.status === "INACTIVE" ? "secondary" : "destructive"}
                          disabled={actingId === t.id}
                          onClick={() => toggleTeam(t.id, t.status === "INACTIVE")}
                        >
                          {t.status === "INACTIVE" ? "Unblock" : "Block"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStudentsPage;
