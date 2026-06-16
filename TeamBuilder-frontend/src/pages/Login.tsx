import { Link } from "react-router-dom";


const Login= () => {
  return (
    <div className="min-h-screen bg-[#0d0d0f] text-[#f5f5f3] flex flex-col items-center  p-6 font-sans relative overflow-hidden">
      {/* diagonal texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 38px, rgba(232,57,44,0.045) 38px 39px)",
        }}
      />

      {/* top banner */}
      <div className="relative z-10 w-full  mb-4 rounded-2xl px-7 py-3.5 flex items-center justify-between text-[13px] font-mono uppercase tracking-[0.12em] text-white/90 bg-gradient-to-r from-[#b8261c] via-[#e8392c] to-[#ff5b41]">
        <Link to={"/"} className="flex items-center gap-2.5">
          Teams <span className="w-16 h-px bg-white/40" />
        </Link>
        <span>Sign in</span>
        <span className="flex items-center gap-2.5">
          <span className="w-16 h-px bg-white/40" /> Workspace
        </span>
      </div>

      {/* main card */}
      <div className="relative z-10 w-full h-[80vh] max-w-8xl bg-[#161618] border border-[#2a2a2d] rounded-2xl grid grid-cols-1 md:grid-cols-[1.15fr_1fr] overflow-hidden">
        {/* left / brand panel */}
        <div className="p-10 md:p-14 flex flex-col">
          <div className="font-mono text-xs uppercase tracking-[0.18em] text-[#e8392c] mb-7">
            // Team Builder
          </div>

          <h1 className="font-extrabold text-[44px] md:text-[64px] leading-[0.98] tracking-tight mb-2">
            Build your <span className="text-[#e8392c]">team</span>,
            <br />
            run the work
          </h1>

          <p className="text-[#9a9a9e] text-[15px] leading-relaxed max-w-[360px] mb-10">
            One place to organize members, assign roles, and track progress
            across every project your team owns.
          </p>

          <div className="mt-auto border-t border-[#2a2a2d] pt-6 flex flex-wrap gap-7">
            <div>
              <div className="font-extrabold text-[28px]">1K+</div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-[#9a9a9e] mt-1 max-w-[110px]">
                Teams managed
              </div>
            </div>
            <div>
              <div className="font-extrabold text-[28px]">50</div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-[#9a9a9e] mt-1 max-w-[110px]">
                Roles &amp; permissions
              </div>
            </div>
            <div>
              <div className="font-extrabold text-[28px]">24/7</div>
              <div className="font-mono text-[11px] uppercase tracking-wide text-[#9a9a9e] mt-1 max-w-[110px]">
                Synced activity
              </div>
            </div>
          </div>
        </div>

        {/* right / sign-in panel */}
        <div className="relative p-10 md:p-12 flex flex-col justify-center border-t md:border-t-0 md:border-l border-[#2a2a2d] bg-gradient-to-br from-[#1d1d20] to-[#121214]">
          <div
            className="absolute -top-10 -right-10 w-56 h-56 rounded-full opacity-20 blur-2xl pointer-events-none"
            style={{
              background:
                "linear-gradient(135deg, #e8392c, transparent 70%)",
            }}
          />

          <div className="font-mono text-xs uppercase tracking-[0.14em] text-[#9a9a9e] mb-1.5">
            Welcome back
          </div>
          <h2 className="font-extrabold text-[28px] mb-7">
            Sign in to continue
          </h2>

          <a
          href="http://localhost:8000/api/v1/auth/google" 
            className="relative z-10 w-full flex items-center justify-center gap-3 bg-white text-[#1f1f1f] rounded-xl py-4 px-5 text-[15px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-8px_rgba(232,57,44,0.45)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e8392c] focus-visible:outline-offset-[3px] active:translate-y-0"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#FFC107"
                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
              />
              <path
                fill="#FF3D00"
                d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l6.19 5.238C40.957 35.917 44 30.428 44 24c0-1.341-.138-2.65-.389-3.917z"
              />
            </svg>
            Continue with Google
          </a>

          <div className="flex items-center gap-3 my-6 font-mono text-[11px] uppercase tracking-widest text-[#9a9a9e]">
            <span className="flex-1 h-px bg-[#2a2a2d]" />
            Why Google
            <span className="flex-1 h-px bg-[#2a2a2d]" />
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5 text-[13px] text-[#9a9a9e]">
              <span className="text-[#e8392c] font-extrabold font-mono shrink-0">
                +
              </span>
              No new password to remember
            </div>
            <div className="flex items-start gap-2.5 text-[13px] text-[#9a9a9e]">
              <span className="text-[#e8392c] font-extrabold font-mono shrink-0">
                +
              </span>
              Your team profile syncs automatically
            </div>
            <div className="flex items-start gap-2.5 text-[13px] text-[#9a9a9e]">
              <span className="text-[#e8392c] font-extrabold font-mono shrink-0">
                +
              </span>
              Two-factor security from your Google account
            </div>
          </div>

          <div className="mt-8 text-xs text-[#9a9a9e] leading-relaxed">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#f5f5f3] underline decoration-[#2a2a2d]">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#f5f5f3] underline decoration-[#2a2a2d]">
              Privacy Policy
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;