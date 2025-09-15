// src/pages/ProjectsList.tsx
import { useEffect, useState } from "react";
import ProjectCard from "../components/ProjectCard";
import PageHeader from "../components/PageHeader";
import { Plus } from "lucide-react";
import ProjectManagement from "../services/ProjectManagement";
import ProjectTemplateModal from "../components/modals/ProjectTemplateModal";
import DeployTenantModal from "../components/modals/DeployTenantModal";
import { useNavigate } from "react-router-dom";
import { type ProjectSummary } from "../utils/types";

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deployProject, setDeployProject] = useState<ProjectSummary | null>(
    null
  );
  const nav = useNavigate();
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ProjectManagement.listProjectTemplates()
      .then((data) => {
        if (!mounted) return;
        // support paginated results or plain array
        const items = Array.isArray(data) ? data : data.results ?? [];
        setProjects(items);
      })
      .catch((err) => {
        console.error(err);
        setError(
          typeof err === "string"
            ? err
            : err?.detail ?? "Failed loading projects"
        );
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const refresh = () => {
    setLoading(true);
    ProjectManagement.listProjectTemplates()
      .then((data) => {
        const items = Array.isArray(data) ? data : data.results ?? [];
        setProjects(items);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };
  return (
    <div>
      <PageHeader
        title="Projects"
        subtitle="Manage your deployment projects and repositories"
      >
        <button
          onClick={() => nav(`/templates/create-template/__new__`)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </PageHeader>

      <div className="mb-6 flex items-center gap-4">
        <input
          type="search"
          placeholder="Search projects..."
          className="flex-1 max-w-lg px-4 py-2 border rounded-lg bg-white"
        />
        <select className="px-3 py-2 rounded-lg border bg-white">
          <option>All Status</option>
          <option>Active</option>
          <option>Deploying</option>
          <option>Inactive</option>
        </select>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">
          Loading projects…
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-600">{error}</div>
      ) : projects.length === 0 ? (
        <div className="py-8 text-center text-slate-600">No projects yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.slug}
              project={p}
              deploybtn={setDeployProject}
            />
          ))}
        </div>
      )}

      <DeployTenantModal
        isOpen={!!deployProject}
        project={deployProject ?? undefined}
        onClose={() => setDeployProject(null)}
        onCreated={(tenant) => {
          console.log("tenant: ", tenant);
          // on created refresh list and optionally navigate somewhere
          refresh();
        }}
      />
      <ProjectTemplateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => {
          // refresh the list
          setLoading(true);
          ProjectManagement.listProjectTemplates()
            .then((data) => {
              const items = Array.isArray(data) ? data : data.results ?? [];
              setProjects(items);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
        }}
      />
    </div>
  );
}
