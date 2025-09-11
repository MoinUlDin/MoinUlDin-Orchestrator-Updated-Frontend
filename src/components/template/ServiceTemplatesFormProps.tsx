// src/components/ServiceTemplatesForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectManagement from "../../services/ProjectManagement";
import toast from "react-hot-toast";
import { Plus, Trash } from "lucide-react";

export interface ServiceDraft {
  id: string;
  name: string;
  service_type: string;
  repo_url?: string;
  repo_branch?: string;
  dockerfile_path?: string;
  internal_provision_endpoint?: string;
  internal_provision_token_secret?: string;
  env_vars: { name: string; value: string }[];
}

interface ServiceTemplatesFormProps {
  templateId: number;
  templateSlug: string;
}

export default function ServiceTemplatesForm({
  templateId,
  templateSlug,
}: ServiceTemplatesFormProps) {
  const nav = useNavigate();
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const newServiceDraft = (): ServiceDraft => ({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: "",
    service_type: "backend",
    repo_url: "",
    repo_branch: "main",
    dockerfile_path: "./Dockerfile",
    internal_provision_endpoint: "",
    env_vars: [],
  });

  const addServiceDraft = () => {
    setServices((s) => [...s, newServiceDraft()]);
  };

  // const updateServiceDraft = (id: string, patch: Partial<ServiceDraft>) => {
  //   setServices((s) =>
  //     s.map((it) => (it.id === id ? { ...it, ...patch } : it))
  //   );
  // };

  const removeServiceDraft = (id: string) => {
    setServices((s) => s.filter((it) => it.id !== id));
  };

  // const addServiceEnvVar = (id: string, name: string, value: string) => {
  //   setServices((s) =>
  //     s.map((it) =>
  //       it.id === id
  //         ? { ...it, env_vars: [...it.env_vars, { name, value }] }
  //         : it
  //     )
  //   );
  // };

  // const removeServiceEnvVar = (id: string, idx: number) => {
  //   setServices((s) =>
  //     s.map((it) =>
  //       it.id === id
  //         ? { ...it, env_vars: it.env_vars.filter((_, i) => i !== idx) }
  //         : it
  //     )
  //   );
  // };

  const handleSave = async () => {
    if (services.length === 0) {
      toast.error("Add at least one service");
      return;
    }

    for (const s of services) {
      if (!s.name.trim()) {
        toast.error("Every service needs a name");
        return;
      }
      if (!s.service_type.trim()) {
        toast.error("Every service needs a type");
        return;
      }
    }

    setLoading(true);
    try {
      const items = services.map((s) => ({
        project: templateId,
        name: s.name.trim(),
        service_type: s.service_type,
        repo_url: s.repo_url || "",
        repo_branch: s.repo_branch || "",
        build_config: {
          dockerfile: s.dockerfile_path || "./Dockerfile",
          env: s.env_vars || [],
        },
        internal_provision_token_secret: s.internal_provision_token_secret,
        internal_provision_endpoint: s.internal_provision_endpoint || "",
      }));

      await ProjectManagement.bulkCreateServiceTemplate(items);
      toast.success("Services created");
      nav(`/templates/${templateSlug}`);
    } catch (e: any) {
      console.error("Create services error", e);
      toast.error(e?.detail || e?.message || "Failed creating services");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h3 className="text-lg font-semibold mb-1">Service Templates</h3>
      <p className="text-sm text-slate-500 mb-6">
        Define the services that will be deployed for each tenant
      </p>

      <div className="mb-4 flex justify-end">
        <button
          onClick={addServiceDraft}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No services added yet. Click "Add Service" to begin.
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s, idx) => (
            <div key={s.id} className="border rounded-lg p-4 bg-slate-50">
              {/* Service form fields (same as before) */}
              <div className="flex items-start justify-between mb-3">
                <div className="font-medium">Service {idx + 1}</div>
                <button
                  onClick={() => removeServiceDraft(s.id)}
                  className="text-red-600 p-1 rounded hover:bg-red-50"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* ... all the service form fields ... */}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => setServices([])}
          className="px-4 py-2 rounded-md border bg-white"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-slate-900 text-white inline-flex items-center gap-2"
        >
          {loading ? "Saving…" : "Save Services"}
        </button>
      </div>
    </section>
  );
}
