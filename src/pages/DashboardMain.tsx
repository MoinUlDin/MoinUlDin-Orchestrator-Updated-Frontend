// src/pages/DashboardMain.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Server,
  Zap,
  AlertTriangle,
  Plus,
  Clock,
  GitPullRequest,
  Type,
} from "lucide-react";
import ProjectManagement from "../services/ProjectManagement"; // adjust path

// --- Types expected from the backend (adjust if your API differs) ---
type DashboardStats = {
  total_projects: number;
  total_tenants: number;
  running_tenants: number;
  stopped_tenants: number;
  failed_deployments: number;
  recent_deployments: RecentDeployment[]; // most recent N deployments
};

type RecentDeployment = {
  id: number;
  project_name: string;
  tenant_subdomain: string; // shown as Instance in UI
  status: "pending" | "running" | "failed" | "succeeded" | string;
  branch?: string | null;
  commit?: string | null;
  deployed_at?: string | null; // ISO datetime
};

// --- Helper: format relative-ish deployed time ---
function formatRelative(iso?: string | null) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const sec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (sec < 60) return `${sec}s ago`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const days = Math.floor(hr / 24);
    return `${days}d ago`;
  } catch {
    return iso;
  }
}

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ title, value, subtitle, icon }) => {
  return (
    <div className="bg-white rounded-lg shadow p-5 flex items-start gap-4">
      <div className="p-3 rounded bg-gray-50">{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-500">{title}</div>
        <div className="mt-1 text-2xl font-semibold">{value}</div>
        {subtitle && (
          <div className="text-xs text-green-600 mt-1">{subtitle}</div>
        )}
      </div>
    </div>
  );
};

const DashboardMain: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  // Try to call ProjectManagement.getDashboard(); fallback to fetch
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    ProjectManagement.getDashboard()
      .then((res) => {
        setStats(res as DashboardStats);
        console.log("Dash Response: ", res);
      })
      .catch((err) => {
        console.error(err);
        setError(
          typeof err === "string"
            ? err
            : err?.message || "Failed to load dashboard"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboard();
    // you may want to poll occasionally; omitted for simplicity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Overview of projects and tenant deployments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/projects/new")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded shadow"
          >
            <Plus size={14} /> Add Project
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-100 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow p-4 text-red-600">
          {error}
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <StatCard
              title="Total Projects"
              value={stats?.total_projects ?? 0}
              subtitle="Active repositories"
              icon={<Box size={20} />}
            />
            <StatCard
              title="Total Tenants"
              value={stats?.total_tenants ?? 0}
              subtitle="Currently deployed"
              icon={<Zap size={20} />}
            />
            <StatCard
              title="Running Tenants"
              value={stats?.running_tenants ?? 0}
              subtitle="Currently deploying"
              icon={<Zap size={20} />}
            />
            <StatCard
              title="Stopped Tenants"
              value={stats?.stopped_tenants ?? 0}
              subtitle="Not running"
              icon={<Server size={20} />}
            />
            <StatCard
              title="Failed Deployments"
              value={stats?.failed_deployments ?? 0}
              subtitle="Last 30 days"
              icon={<AlertTriangle size={20} />}
            />
          </div>

          {/* Recent Deployments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium">Recent Deployments</h2>
                <p className="text-sm text-gray-500">
                  Latest tenant deployment activity
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchDashboard()}
                  className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white"
                >
                  <Clock size={14} /> Refresh
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="py-3 px-4">Project</th>
                    <th className="py-3 px-4">Instance</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Commit</th>
                    <th className="py-3 px-4">Deployed</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {stats?.recent_deployments &&
                  stats.recent_deployments.length > 0 ? (
                    stats.recent_deployments.map((d) => {
                      const statusLower = (d.status || "").toLowerCase();
                      let statusClass = "bg-green-100 text-green-700";
                      if (
                        statusLower.includes("fail") ||
                        statusLower === "failed"
                      )
                        statusClass = "bg-red-100 text-red-700";
                      else if (
                        statusLower.includes("run") ||
                        statusLower === "running"
                      )
                        statusClass = "bg-green-100 text-green-700";
                      else if (
                        statusLower.includes("pending") ||
                        statusLower.includes("deploy")
                      )
                        statusClass = "bg-blue-100 text-blue-700";
                      else statusClass = "bg-gray-100 text-gray-700";

                      return (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="py-4 px-4 font-medium">
                            {d.project_name}
                          </td>
                          <td className="py-4 px-4 text-gray-700">
                            {d.tenant_subdomain}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${statusClass}`}
                            >
                              {d.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-1 text-xs bg-gray-100 rounded">
                              {d.branch ?? "-"}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600 truncate max-w-[300px]">
                            {d.commit ?? "-"}
                          </td>
                          <td className="py-4 px-4 text-gray-500">
                            {formatRelative(d.deployed_at)}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 px-4 text-center text-gray-400"
                      >
                        No recent deployments
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default DashboardMain;
