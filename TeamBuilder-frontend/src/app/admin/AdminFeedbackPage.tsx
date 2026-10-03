import { useEffect, useState } from "react";
import { getAllReviewsAdmin } from "@/lib/reviewApis";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const AdminFeedbackPage = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await getAllReviewsAdmin();
        setReviews(res.data || []);
      } catch (e) {
        console.error(e);
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
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-extrabold">Feedback</h1>
      <Card>
        <CardHeader>
          <CardTitle>All peer & team feedback</CardTitle>
          <CardDescription>{reviews.length} entries</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-lg border p-4 text-sm">
                <p className="font-medium">
                  {r.givenBy?.name} →{" "}
                  {r.givenToUser?.name || r.givenToTeam?.teamName || "Unknown"}
                </p>
                <p className="mt-2 text-muted-foreground">{r.review}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {new Date(r.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackPage;
