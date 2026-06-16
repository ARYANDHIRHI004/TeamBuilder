import { useDispatch, useSelector } from "react-redux";
import { AuthRoutes } from "./routes/AuthRoutes";
import { CoursesRoutes } from "./routes/CoursesRoutes";
import { DashboardRoutes } from "./routes/DashboardRoutes";
import { useEffect, useState } from "react";
import { getMe } from "./features/authSlice";
import { loginUser } from "./lib/authApis";

function App() {
  const dispatch = useDispatch();
  const authUser = useSelector((state: any) => state.auth.user);
  const [loading, setLoading] = useState<boolean | null>(false);

  useEffect(() => {
    (async () => {
      setLoading(true)
      const data = await loginUser();
      dispatch(getMe(data));
    })();
    setLoading(false)
  }, []);

  return (
    <div>
      {!loading ? (
        <div>
          <AuthRoutes authUser={authUser} />
          <DashboardRoutes authUser={authUser} />
          <CoursesRoutes authUser={authUser} />
        </div>
      ) : (
        <div>Loading</div>
      )}
    </div>
  );
}

export default App;
