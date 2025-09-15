import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Play,
  Link as ExternalLinkIcon,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import ProjectManagement from "../services/ProjectManagement"; // adjust path as needed
import { type ProjectTenantType, type TenantType } from "../utils/types";
import DeployTenantModal from "../components/modals/DeployTenantModal";
import { type ProjectSummary } from "../utils/types";
import toast from "react-hot-toast";

const formatDate = (iso?: string) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch (e) {
    return iso;
  }
};

const ProjectDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ProjectTenantType | null>(null);
  const [loading, setLoading] = useState(false);
  const [project, setProjects] = useState<ProjectSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deployProject, setDeployProject] = useState<ProjectSummary | null>(
    null
  );

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    // Use the helper you provided
    ProjectManagement.fetch_tenant_details(slug)
      .then((res: any) => {
        // assume API returns tenant details in a friendly shape
        setData(res);
        setProjects(res.project);
        console.log("response: ", res);
      })
      .catch((e: any) => {
        console.error(e);
        setError(typeof e === "string" ? e : e?.message || "Failed to load");
      })
      .finally(() => setLoading(false));
    setLoading(false);
  }, [slug]);

  const onBack = () => navigate("/projects");

  const onDeployNew = () => {
    if (!project) return toast.error("no project selected", { duration: 4000 });

    setDeployProject(project);
  };

  const onOpenLogs = (instance: TenantType) => {
    // change route to wherever your logs live
    navigate(`/projects/${slug}/instances/${instance.deployment_id}/logs`);
  };

  if (loading)
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-gray-300 rounded"></div>
          <div className="h-6 w-40 bg-gray-300 rounded"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="p-6">
        <div className="text-red-600">Error: {error}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
        >
          <ChevronLeft size={18} /> Back to Projects
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">
                {project?.name || "Project"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {project?.description}
              </p>

              <div className="mt-4 text-sm text-gray-600 space-y-2">
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                  {/* <div>
                    <div className="font-medium text-gray-700">Branch</div>
                    <div className="mt-1">{data?.branch || "main"}</div>
                  </div> */}
                  <div>
                    <div className="font-medium text-gray-700">Created</div>
                    <div className="mt-1">
                      {formatDate(project?.created_at)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Last Updated
                    </div>
                    <div className="mt-1">
                      {formatDate(project?.updated_at)}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700">
                      Last Deployment
                    </div>
                    <div className="mt-1">-</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={onDeployNew}
                className="inline-flex text-[12px] whitespace-nowrap items-center gap-2 bg-black text-white px-4 py-2 rounded shadow"
              >
                <Play size={14} /> Deploy New Instance
              </button>
            </div>
          </div>
        </div>

        <aside className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-600">Quick Stats</h3>
          <div className="mt-4 text-sm text-gray-700 space-y-3">
            <div className="flex justify-between">
              <div>Total Instances</div>
              <div className="font-medium">
                {data?.quick_stats?.total_instances ??
                  data?.instances?.length ??
                  0}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Running</div>
              <div className="font-medium text-green-600">
                {data?.quick_stats?.running ?? 0}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Deploying</div>
              <div className="font-medium text-blue-600">
                {data?.quick_stats?.deploying ?? 0}
              </div>
            </div>
            <div className="flex justify-between">
              <div>Stopped</div>
              <div className="font-medium">
                {data?.quick_stats?.stopped ?? 0}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium">Tenants</h3>
        <p className="text-sm text-gray-500 mt-1">
          Manage deployment Tenants for this project
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-sm text-gray-500">
                <th className="px-4 py-3">Tenant ID</th>
                <th className="px-4 py-3">Client name</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Sub Domain</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {(data?.tenants ?? []).map((inst) => (
                <tr key={inst.id}>
                  <td className="px-4 py-3 font-medium">{inst.id}</td>
                  <td className="px-4 py-3">{inst.name}</td>
                  <td className="px-4 py-3">
                    {inst.status === "Running" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                        Running
                      </span>
                    )}
                    {inst.status === "Deploying" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                        Deploying
                      </span>
                    )}
                    {inst.status === "Stopped" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        Stopped
                      </span>
                    )}
                    {inst.status === "pending" && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {inst.subdomain ? (
                      <a
                        href={inst.subdomain}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        <span className="truncate max-w-[200px]">
                          {inst.subdomain}
                        </span>
                        <ExternalLinkIcon size={14} />
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="px-4 py-3">{formatDate(inst.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenLogs(inst)}
                        title="Logs"
                        className="inline-flex items-center gap-2 px-3 py-1 border rounded text-sm"
                      >
                        <FileText size={14} /> Logs
                      </button>

                      <button
                        title="More"
                        className="inline-flex items-center px-2 py-1 border rounded"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {(!data?.instances || data.instances.length === 0) && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    No instances found for this project.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DeployTenantModal
        isOpen={!!deployProject}
        project={deployProject ?? undefined}
        onClose={() => setDeployProject(null)}
        onCreated={() => {
          return;
        }}
      />
    </div>
  );
};

export default ProjectDetail;
