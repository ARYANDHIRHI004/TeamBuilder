import { Navigate, Route, Routes } from "react-router";
import Layout from "../app/Layout";
import Courses from "../app/courses/Courses";
import CourseDetailedPage from "../app/courses/CourseDetailedPage";
import CourseLayout from "../app/courses/CourseLayout";
import Peers from "../app/courses/Peers";
import Teams from "../app/courses/Teams";
import TeamDetailsPage from "../app/courses/TeamDetailsPage";
export function CoursesRoutes({ authUser }: any) {
  return (
    <Routes>
      <Route path="/courses/" element={<Layout />}>
        <Route path="/courses/" element={<CourseLayout />}>
          <Route path="/courses/" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetailedPage />} />
          <Route path="/courses/:courseId/peers" element={<Peers />} />
          <Route path="/courses/:courseId/teams" element={<Teams />} />
        </Route>
          <Route path="/courses/:courseId/teams/:teamId/" element={<TeamDetailsPage />} />
      </Route>
    </Routes>
  );
}
