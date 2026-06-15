import { AuthRoutes } from "./routes/AuthRoutes";
import { CoursesRoutes } from "./routes/CoursesRoutes";
import { DashboardRoutes } from "./routes/DashboardRoutes";

function App() {

  const authUser = true
  

  return (
    <div>

      <AuthRoutes authUser={authUser}/>
      <DashboardRoutes authUser={authUser}/>
      <CoursesRoutes authUser={authUser}/>
    </div>
  );
}

export default App;
