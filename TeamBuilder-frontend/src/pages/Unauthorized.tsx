import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border p-8 rounded-2xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Access Denied</h1>
          <p className="text-sm text-muted-foreground">
            You do not have administrative privileges to view this page. This section is restricted to administrators only.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to={-1 as any}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
            <Link to="/dashboard">
              <Home className="w-4 h-4" /> My Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
