import Courses from "../app/courses/Courses";
import CourseDetailedPage from "../app/courses/CourseDetailedPage";
import Peers from "../app/courses/Peers";
import Teams from "../app/courses/Teams";
import TeamDetailPage from "../app/courses/TeamDetailsPage";

const courseRoutes = [
  {
    path: "/courses",
    element: <Courses />,
  },
  {
    path: "/courses/:coursesId",
    element: <CourseDetailedPage />,
  },
  {
    path: "/courses/:coursesId/peers",
    element: <Peers />,
  },
  {
    path: "/courses/:coursesId/teams",
    element: <Teams />,
  },
  {
    path: "/courses/:coursesId/teams/:teamsId",
    element: <TeamDetailPage />,
  },
];
export {courseRoutes}