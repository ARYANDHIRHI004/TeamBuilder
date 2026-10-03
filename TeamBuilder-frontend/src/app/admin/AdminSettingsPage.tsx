import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AdminSettingsPage = () => (
  <div className="space-y-6 p-6">
    <h1 className="text-2xl font-extrabold">Settings</h1>
    <Card>
      <CardHeader>
        <CardTitle>Admin console</CardTitle>
        <CardDescription>Account and platform settings will be configured here.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Use the sidebar to manage cohorts, students, teams, and feedback.
      </CardContent>
    </Card>
  </div>
);

export default AdminSettingsPage;
