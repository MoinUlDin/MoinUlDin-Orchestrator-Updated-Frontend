// src/pages/TemplateDetail.tsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import ProjectManagement from "../services/ProjectManagement";
import { Pencil, Play, Plus } from "lucide-react";
import ServiceRow from "../components/ServiceRow";
import DeploymentCard from "../components/DeploymentCard";

type Service = {
  id: number;
  name: string;
  service_type: string;
  repo_url?: string;
  expose_domain?: boolean;
};

type ProjectDetailType = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_domain: string;
  db_required: boolean;
  db_type?: string;
  default_env?: Record<string, any>;
  notify_emails?: string[];
  stats?: {
    total_services: number;
    active_tenants: number;
  };
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const nav = useNavigate();

  const [template, setTemplate] = useState<ProjectDetailType | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let mounted = true;
    setLoading(true);

    // 1) fetch template
    ProjectManagement.getProjectTemplate(slug)
      .then((t) => {
        if (!mounted) return;
        setTemplate(t);
        // 2) fetch services using project id
        const projId = t.id;
        return Promise.all([
          ProjectManagement.listServiceTemplates({ project_id: projId }),
          ProjectManagement.listDeployments({ project_id: projId, limit: 6 }),
        ]);
      })
      .then((responses) => {
        if (!mounted) return;
        if (!responses) return;
        const [sRes, dRes] = responses;
        const sItems = Array.isArray(sRes) ? sRes : sRes.results ?? [];
        const dItems = Array.isArray(dRes) ? dRes : dRes.results ?? [];
        setServices(sItems);
        setDeployments(dItems);
      })
      .catch((err) => {
        console.error(err);
        setError(
          typeof err === "string"
            ? err
            : err?.detail ?? "Failed to load template"
        );
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Loading…</div>;
  }
  if (error) {
    return <div className="py-20 text-center text-red-600">{error}</div>;
  }
  if (!template) {
    return (
      <div className="py-20 text-center text-slate-600">Template not found</div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            {template.name}
          </h2>
          <div className="text-sm text-slate-500 mt-1">
            Template ID: {template.slug}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-2 rounded-md border">
            Edit Template <Pencil className="inline ml-2 w-4 h-4" />
          </button>
          <button
            onClick={() => nav(`/templates/${template.slug}/deploy`)}
            className="px-4 py-2 rounded-md bg-slate-900 text-white inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4" /> Deploy Instance
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overview card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Template Information
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              {template.description}
            </p>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-slate-700">
              <div>
                <dt className="text-xs text-slate-500">Base Domain</dt>
                <dd className="mt-1">{template.base_domain}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Database</dt>
                <dd className="mt-1">
                  {template.db_required ? template.db_type : "Not required"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Services</dt>
                <dd className="mt-1">
                  {template.stats?.total_services ?? services.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Active Tenants</dt>
                <dd className="mt-1">{template.stats?.active_tenants ?? 0}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-slate-800">Services</h4>
              <Link
                to={`/templates/${template.slug}/services/new`}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md border"
              >
                <Plus className="w-4 h-4" /> Add Service
              </Link>
            </div>

            <div className="divide-y">
              {services.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No services defined
                </div>
              ) : (
                services.map((s) => <ServiceRow key={s.id} service={s} />)
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-semibold text-slate-800">
                Recent Deployments
              </h4>
              <Link
                to={`/templates/${template.slug}/deployments`}
                className="text-sm text-slate-500"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {deployments.length === 0 ? (
                <div className="py-6 text-center text-slate-500">
                  No deployments yet
                </div>
              ) : (
                deployments.map((d: any) => (
                  <DeploymentCard key={d.id} deployment={d} />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Notifications & stats */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl border p-4">
            <h5 className="text-sm font-semibold text-slate-700 mb-2">
              Notifications
            </h5>
            <div className="text-sm text-slate-600">
              {template.notify_emails && template.notify_emails.length > 0 ? (
                <ul className="space-y-1">
                  <div>{template?.notify_emails}</div>
                  {/* {template.notify_emails.map((e: string, i: number) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">✉</span>
                      <span>{e}</span>
                    </li>
                  ))} */}
                </ul>
              ) : (
                <div className="text-slate-400">
                  No notification emails configured
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-4">
            <h5 className="text-sm font-semibold text-slate-700 mb-2">
              Template Stats
            </h5>
            <div className="text-sm text-slate-600">
              <div className="flex justify-between">
                <div>Total Services</div>
                <div>{template.stats?.total_services ?? services.length}</div>
              </div>
              <div className="flex justify-between mt-2">
                <div>Active Tenants</div>
                <div>{template.stats?.active_tenants ?? 0}</div>
              </div>
              <div className="flex justify-between mt-2">
                <div>Created By</div>
                <div className="text-xs text-slate-500">—</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
