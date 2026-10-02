import React from "react";
import StudentProfilePage, {
  type StudentProfileData,
  type ActivityDay,
  type ProgressSlice,
  type FeedbackItem,
  type HistoryEvent,
  type HistoryTrendPoint,
} from "./StudentProfilePage";

// ── Dummy student (for UI preview only — swap for real data later) ─────────
const DUMMY_STUDENT: StudentProfileData = {
  id: "stu_8a2f91",
  name: "Aryan Verma",
  email: "aryan.verma@university.edu",
  phone: "+91 98765 43210",
  address: "Campus Block B, New Delhi",
  department: "Computer Science & Engineering",
  rollNumber: "CS2026014",
  batch: "2026",
  status: "Active",
  isEmailVerified: true,
  joinedAt: "2026-01-10",
  lastActiveAt: "2026-10-01",
};

// ── Dummy activity: ~365 days with a realistic, uneven pattern ─────────────
function generateDummyActivity(): ActivityDay[] {
  const days: ActivityDay[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 364; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const skip = Math.random() < (isWeekend ? 0.45 : 0.2);

    let count = 0;
    if (!skip) {
      const base = isWeekend ? 3 : 5;
      count = Math.max(0, Math.round(Math.random() * base + (Math.random() < 0.1 ? base : 0)));
    }

    days.push({ date: date.toISOString().slice(0, 10), count });
  }

  return days;
}

const DUMMY_ACTIVITY = generateDummyActivity();

const DUMMY_PROGRESS: ProgressSlice[] = [
  { label: "Completed", value: 68 },
  { label: "In Progress", value: 20 },
  { label: "Not Started", value: 12 },
];

const DUMMY_FEEDBACK_RECEIVED: FeedbackItem[] = [
  {
    id: "fr1",
    name: "Team Alpha",
    type: "Team",
    rating: 5,
    comment: "Aryan consistently delivers ahead of schedule and documents his code really well.",
    date: "Sep 18, 2026",
  },
  {
    id: "fr2",
    name: "Dr. Rahul Sharma",
    type: "Instructor",
    rating: 4,
    comment: "Strong grasp of backend concepts. Could participate a bit more in class discussions.",
    date: "Aug 29, 2026",
  },
  {
    id: "fr3",
    name: "Bhavna Rao",
    type: "Person",
    rating: 5,
    comment: "Great to pair-program with — explains things clearly and is very patient.",
    date: "Jul 14, 2026",
  },
];

const DUMMY_FEEDBACK_GIVEN: FeedbackItem[] = [
  {
    id: "fg1",
    name: "Team Phoenix",
    type: "Team",
    rating: 4,
    comment: "Good collaboration overall, though standups sometimes ran long without clear outcomes.",
    date: "Sep 20, 2026",
  },
  {
    id: "fg2",
    name: "Chirag Lal",
    type: "Person",
    rating: 5,
    comment: "Chirag's API documentation saved the team a lot of back-and-forth. Excellent work.",
    date: "Aug 02, 2026",
  },
];

const DUMMY_HISTORY_TREND: HistoryTrendPoint[] = [
  { label: "Jan", value: 12 },
  { label: "Feb", value: 18 },
  { label: "Mar", value: 15 },
  { label: "Apr", value: 24 },
  { label: "May", value: 30 },
  { label: "Jun", value: 22 },
  { label: "Jul", value: 28 },
  { label: "Aug", value: 34 },
  { label: "Sep", value: 40 },
];

const DUMMY_HISTORY_EVENTS: HistoryEvent[] = [
  { id: "h1", date: "2026-01-10", title: "Joined the platform", description: "Enrolled as a student in the Computer Science & Engineering department." },
  { id: "h2", date: "2026-01-18", title: "Enrolled in MERN Development", description: "First course enrollment." },
  { id: "h3", date: "2026-02-05", title: "Joined Team Alpha", description: "Became a member of Team Alpha for the MERN Development course." },
  { id: "h4", date: "2026-03-22", title: "Submitted first assignment", description: "Database Design assignment submitted 2 days before the deadline." },
  { id: "h5", date: "2026-05-30", title: "Promoted to Team Lead", description: "Took over as lead of Team Alpha." },
  { id: "h6", date: "2026-08-10", title: "Completed MERN Development", description: "Finished the course with a 92% completion score." },
  { id: "h7", date: "2026-09-20", title: "Gave feedback to Team Phoenix", description: "Left feedback after a cross-team collaboration sprint." },
];

// ── Demo page: drop this in a route to preview the UI with dummy data ─────
const StudentProfilePageDemo: React.FC = () => {
  return (
    <StudentProfilePage
      student={DUMMY_STUDENT}
      activity={DUMMY_ACTIVITY}
      progressBreakdown={DUMMY_PROGRESS}
      feedbackReceived={DUMMY_FEEDBACK_RECEIVED}
      feedbackGiven={DUMMY_FEEDBACK_GIVEN}
      historyTrend={DUMMY_HISTORY_TREND}
      historyEvents={DUMMY_HISTORY_EVENTS}
      loading={false}
      onBack={() => console.log("back clicked")}
    />
  );
};

export default StudentProfilePageDemo;