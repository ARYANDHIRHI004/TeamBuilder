import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import StudentProfilePage, {
  type StudentProfileData,
  type ActivityDay,
  type ProgressSlice,
  type FeedbackItem,
  type HistoryEvent,
  type HistoryTrendPoint,
} from "./StudentProfilePage";
import { getUserProfile, loginUser, updateMyProfile } from "@/lib/authApis";
import { getReviewsForUser, getMyReviews } from "@/lib/reviewApis";
import { getUserHistory } from "@/lib/historyApis";
import { getAllEnrolledCourses } from "@/lib/courseApis";
import { extractUser } from "@/lib/authUtils";

function buildActivityFromHistory(history: any[]): ActivityDay[] {
  const counts = new Map<string, number>();
  for (const h of history) {
    const date = (h.createdAt as string).slice(0, 10);
    counts.set(date, (counts.get(date) || 0) + 1);
  }

  const days: ActivityDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    days.push({ date: key, count: counts.get(key) || 0 });
  }
  return days;
}

function buildHistoryTrend(history: any[]): HistoryTrendPoint[] {
  const monthCounts = new Map<string, number>();
  for (const h of history) {
    const d = new Date(h.createdAt);
    const label = d.toLocaleString(undefined, { month: "short" });
    monthCounts.set(label, (monthCounts.get(label) || 0) + 1);
  }
  return Array.from(monthCounts.entries()).map(([label, value]) => ({ label, value }));
}

const Profile = () => {
  const navigate = useNavigate();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const authUser = useSelector((state: any) => state.auth.user);
  const me = extractUser(authUser);

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [activity, setActivity] = useState<ActivityDay[]>([]);
  const [progressBreakdown, setProgressBreakdown] = useState<ProgressSlice[]>([]);
  const [feedbackReceived, setFeedbackReceived] = useState<FeedbackItem[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState<FeedbackItem[]>([]);
  const [historyTrend, setHistoryTrend] = useState<HistoryTrendPoint[]>([]);
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);
  const [saving, setSaving] = useState(false);

  const targetUserId = routeUserId || me?.id;

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        let user: any;
        let edit = false;

        if (!routeUserId || routeUserId === me?.id) {
          const meRes = await loginUser();
          user = extractUser(meRes) || meRes.data;
          edit = true;
        } else {
          const profileRes = await getUserProfile(targetUserId);
          user = profileRes.data;
          edit = Boolean(profileRes.data?.canEdit);
        }

        if (!user?.id) return;

        setCanEdit(edit);

        const [historyRes, reviewsRes, enrolledRes] = await Promise.all([
          getUserHistory(user.id),
          edit && !routeUserId ? getMyReviews() : getReviewsForUser(user.id),
          edit && !routeUserId ? getAllEnrolledCourses() : Promise.resolve({ data: [] }),
        ]);

        const history = historyRes.data || [];
        const enrolled = enrolledRes.data || [];
        const reviews = reviewsRes.data || { received: [], given: [] };

        setStudent({
          id: user.id,
          name: user.name,
          email: user.email,
          address: user.address,
          status: user.accountStatus === "INACTIVE" ? "Inactive" : "Active",
          isEmailVerified: user.isEmailVerified,
          joinedAt: user.createdAt,
          lastActiveAt: user.updatedAt,
        });

        setActivity(buildActivityFromHistory(history));
        setHistoryTrend(buildHistoryTrend(history));
        setHistoryEvents(
          history.map((h: any) => ({
            id: h.id,
            date: h.createdAt,
            title: h.team?.teamName ? `Team: ${h.team.teamName}` : "Activity",
            description: h.description,
          }))
        );

        const inProgress = enrolled.length;
        setProgressBreakdown([
          { label: "In Progress", value: inProgress > 0 ? 100 : 0 },
          { label: "Completed", value: 0 },
          { label: "Not Started", value: inProgress > 0 ? 0 : 100 },
        ]);

        setFeedbackReceived(
          (reviews.received || []).map((r: any) => ({
            id: r.id,
            name: r.givenBy?.name || r.givenToTeam?.teamName || "Unknown",
            type: r.givenToTeam ? "Team" : "Person",
            rating: 5,
            comment: r.review,
            date: new Date(r.createdAt).toLocaleDateString(),
          }))
        );

        setFeedbackGiven(
          (reviews.given || []).map((r: any) => ({
            id: r.id,
            name: r.givenToUser?.name || r.givenToTeam?.teamName || "Unknown",
            type: r.givenToTeam ? "Team" : "Person",
            rating: 5,
            comment: r.review,
            date: new Date(r.createdAt).toLocaleDateString(),
          }))
        );
      } catch (err) {
        console.error(err);
        setStudent(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [targetUserId, routeUserId, me?.id]);

  const handleSaveProfile = async (updates: { name: string; address?: string }) => {
    if (!canEdit) return;
    setSaving(true);
    try {
      await updateMyProfile({ name: updates.name, address: updates.address ?? null });
      const meRes = await loginUser();
      const user = extractUser(meRes) || meRes.data;
      setStudent((prev) =>
        prev
          ? {
              ...prev,
              name: user.name,
              address: user.address,
            }
          : prev
      );
    } catch (err: any) {
      alert(err?.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };

  const fallbackStudent = useMemo(
    () =>
      student || {
        id: "",
        name: "User",
        email: "",
        status: "Active" as const,
        joinedAt: new Date().toISOString(),
      },
    [student]
  );

  return (
    <StudentProfilePage
      student={fallbackStudent.id ? fallbackStudent : undefined}
      activity={activity}
      progressBreakdown={progressBreakdown}
      feedbackReceived={feedbackReceived}
      feedbackGiven={feedbackGiven}
      historyTrend={historyTrend}
      historyEvents={historyEvents}
      loading={loading}
      canEdit={canEdit}
      saving={saving}
      onSaveProfile={canEdit ? handleSaveProfile : undefined}
      onBack={() => navigate("/dashboard")}
    />
  );
};

export default Profile;
