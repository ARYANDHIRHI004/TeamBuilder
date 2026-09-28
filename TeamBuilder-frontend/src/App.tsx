import { useDispatch } from "react-redux";

import { useEffect, useState } from "react";
import { getMe } from "./features/authSlice";
import { loginUser } from "./lib/authApis";
import { RouterProvider } from "react-router-dom";
import router from "./routes";
import { Loader } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";

function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState<boolean | null>(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await loginUser();
        dispatch(getMe(data));
        // console.log(data)
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return !loading ? (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="h-screen  ">
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  ) : (
    <div className="h-screen w-screen flex justify-center items-center">
      <Loader className="animate-spin" />
    </div>
  );
}
export default App;
