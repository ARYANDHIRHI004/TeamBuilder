import { Link, useSearchParams } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  const [params] = useSearchParams();
  const reason = params.get("reason");

  const isBlocked = reason === "blocked";
  const notRegistered = reason === "not_registered";

  const title = isBlocked ? "Account blocked" : "Access denied";
  const description = isBlocked
    ? "Your account has been blocked by an administrator. You cannot sign in until it is unblocked."
    : notRegistered
      ? "You are not registered for any course yet. Ask an administrator to enroll your email before signing in."
      : "You do not have permission to view this page.";

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-2xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to={-1 as any}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
          </Button>
          {!isBlocked && (
            <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
              <Link to="/dashboard">
                <Home className="w-4 h-4" /> My Dashboard
              </Link>
            </Button>
          )}
          {isBlocked && (
            <Button asChild variant="secondary" className="gap-2">
              <Link to="/login">Back to login</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
