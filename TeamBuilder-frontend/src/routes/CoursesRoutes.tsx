import Courses from "../app/courses/Courses";
import CourseDetailedPage from "../app/courses/CourseDetailedPage";
import Peers from "../app/courses/Peers";
import Teams from "../app/courses/Teams";

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
];
export {courseRoutes}