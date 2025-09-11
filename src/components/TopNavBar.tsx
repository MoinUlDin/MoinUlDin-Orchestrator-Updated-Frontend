// src/components/TopNavBar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogOut, UserCircle } from "lucide-react";

function NavLink({
  to,
  label,
  active,
}: {
  to: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function TopNavBar() {
  const location = useLocation();
  const nav = useNavigate();

  const userRaw = localStorage.getItem("user_info");
  const user = userRaw ? JSON.parse(userRaw) : null;
  const name = user?.first_name || user?.email || "User";

  const onLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");
    nav("/");
  };

  return (
    <header className="w-full bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/projects" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold">
              DF
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">
                DokPloy Deployment
              </div>
              <div className="text-xs text-slate-500">Manage deployments</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1 ml-6">
            <NavLink
              to="/dashboard"
              label="Dashboard"
              active={location.pathname.startsWith("/dashboard")}
            />
            <NavLink
              to="/projects"
              label="Projects"
              active={location.pathname.startsWith("/projects")}
            />
            <NavLink
              to="/templates"
              label="Templates"
              active={location.pathname.startsWith("/templates")}
            />
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right mr-2">
            <span className="text-sm font-medium text-slate-800">{name}</span>
            <span className="text-xs text-slate-500">{user?.role || ""}</span>
          </div>

          <button
            onClick={() => nav("/profile")}
            className="p-2 rounded-full hover:bg-slate-100"
            title="Profile"
          >
            <UserCircle className="w-7 h-7 text-slate-700" />
          </button>

          <button
            onClick={onLogout}
            className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white text-sm hover:opacity-95"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline-block">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
