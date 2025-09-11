// src/components/ProjectCard.tsx
import { Play } from "lucide-react"; //ExternalLink, GitPullRequest
import { useNavigate } from "react-router-dom";

type Props = {
  project: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    repo?: string;
    active_tenants_count?: number;
    status?: "active" | "deploying" | "inactive";
    updated_at?: string;
  };
};

export default function ProjectCard({ project }: Props) {
  const nav = useNavigate();

  const onDeploy = () => {
    nav(`/templates/${project.slug}/deploy`);
  };

  const onView = () => {
    nav(`/templates/${project.slug}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {project.name}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{project.description}</p>
          </div>

          <div className="text-right">
            <div className="text-xs text-slate-400">{project.repo}</div>
            <div
              className={`mt-3 inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${
                project.status === "active"
                  ? "bg-green-100 text-green-800"
                  : project.status === "deploying"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {project.status || "inactive"}
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-slate-500 flex items-center gap-4">
          <div>{project.active_tenants_count ?? 0} instances</div>
          <div>•</div>
          <div>
            {project.updated_at
              ? new Date(project.updated_at).toLocaleString()
              : "—"}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={onDeploy}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 text-white hover:opacity-95"
        >
          <Play className="w-4 h-4" /> Deploy
        </button>

        <button
          onClick={onView}
          className="px-3 py-2 rounded-lg bg-white border text-slate-700"
        >
          View
        </button>
      </div>
    </div>
  );
}
