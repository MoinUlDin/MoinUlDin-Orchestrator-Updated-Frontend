// src/components/ServiceTemplatesForm.tsx
import { useState, useEffect } from "react";
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
  isEditing?: boolean;
  initialServices?: any[]; // Add this prop
}

export default function ServiceTemplatesForm({
  templateId,
  templateSlug,
  isEditing = false,
  initialServices = [], // Default to empty array
}: ServiceTemplatesFormProps) {
  const nav = useNavigate();
  const [services, setServices] = useState<ServiceDraft[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert initial services to draft format when component mounts or initialServices changes
  useEffect(() => {
    if (isEditing && initialServices && initialServices.length > 0) {
      const serviceDrafts = initialServices.map((service) => ({
        id: `existing-${service.id}`,
        name: service.name,
        service_type: service.service_type,
        repo_url: service.repo_url || "",
        repo_branch: service.repo_branch || "main",
        dockerfile_path: service.build_config?.dockerfile || "./Dockerfile",
        internal_provision_endpoint: service.internal_provision_endpoint || "",
        internal_provision_token_secret:
          service.internal_provision_token_secret || "",
        env_vars: service.build_config?.env || service.env_vars || [],
      }));

      setServices(serviceDrafts);
    }
  }, [isEditing, initialServices]);

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

  const updateServiceDraft = (id: string, patch: Partial<ServiceDraft>) => {
    setServices((s) =>
      s.map((it) => (it.id === id ? { ...it, ...patch } : it))
    );
  };

  const removeServiceDraft = (id: string) => {
    setServices((s) => s.filter((it) => it.id !== id));
  };

  const addServiceEnvVar = (id: string, name: string, value: string) => {
    setServices((s) =>
      s.map((it) =>
        it.id === id
          ? { ...it, env_vars: [...it.env_vars, { name, value }] }
          : it
      )
    );
  };

  const removeServiceEnvVar = (id: string, idx: number) => {
    setServices((s) =>
      s.map((it) =>
        it.id === id
          ? { ...it, env_vars: it.env_vars.filter((_, i) => i !== idx) }
          : it
      )
    );
  };

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
      // For editing, we need to handle updates and deletions
      if (isEditing) {
        // Identify services to delete (existing services not in the current list)
        const initialServiceIds = initialServices.map((s) => s.id);
        const currentServiceIds = services
          .filter((s) => s.id.startsWith("existing-"))
          .map((s) => parseInt(s.id.replace("existing-", ""), 10));

        const servicesToDelete = initialServiceIds.filter(
          (id) => !currentServiceIds.includes(id)
        );

        // Delete removed services
        for (const serviceId of servicesToDelete) {
          await ProjectManagement.deleteServiceTemplate(serviceId);
        }

        // Update or create services
        for (const service of services) {
          const payload = {
            project: templateId,
            name: service.name.trim(),
            service_type: service.service_type,
            repo_url: service.repo_url || "",
            repo_branch: service.repo_branch || "",
            build_config: {
              dockerfile: service.dockerfile_path || "./Dockerfile",
              env: service.env_vars || [],
            },
            internal_provision_token_secret:
              service.internal_provision_token_secret,
            internal_provision_endpoint:
              service.internal_provision_endpoint || "",
          };

          if (service.id.startsWith("existing-")) {
            // Update existing service
            const serviceId = parseInt(service.id.replace("existing-", ""), 10);
            await ProjectManagement.updateServiceTemplate(serviceId, payload);
          } else {
            // Create new service
            await ProjectManagement.createServiceTemplate(payload);
          }
        }

        toast.success("Services updated");
      } else {
        // For new templates, use bulk create
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
      }

      nav(`/templates/${templateSlug}`);
    } catch (e: any) {
      console.error("Create/update services error", e);
      toast.error(e?.detail || e?.message || "Failed saving services");
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
                <div>
                  <label className="block text-sm text-slate-700">
                    Service Name
                  </label>
                  <input
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    value={s.name}
                    onChange={(e) =>
                      updateServiceDraft(s.id, { name: e.target.value })
                    }
                    placeholder="backend"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700">
                    Service Type
                  </label>
                  <select
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    value={s.service_type}
                    onChange={(e) =>
                      updateServiceDraft(s.id, {
                        service_type: e.target.value,
                      })
                    }
                  >
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-700">
                    Repository URL
                  </label>
                  <input
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    value={s.repo_url}
                    onChange={(e) =>
                      updateServiceDraft(s.id, {
                        repo_url: e.target.value,
                      })
                    }
                    placeholder="https://github.com/company/repo"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700">Branch</label>
                  <input
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    value={s.repo_branch}
                    onChange={(e) =>
                      updateServiceDraft(s.id, {
                        repo_branch: e.target.value,
                      })
                    }
                    placeholder="main"
                  />
                </div>

                {s.service_type === "backend" && (
                  <div className="">
                    <label className="block text-sm text-slate-700">
                      Internal Provision Endpoint
                    </label>
                    <input
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                      value={s.internal_provision_endpoint}
                      onChange={(e) =>
                        updateServiceDraft(s.id, {
                          internal_provision_endpoint: e.target.value,
                        })
                      }
                      placeholder="/api/admin/setup"
                    />
                    <p className="text-xs text-slate-400 mt-1">
                      Endpoint to call after deployment for initial setup
                      (required for backend)
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-700">
                    Dockerfile Path
                  </label>
                  <input
                    className="mt-1 w-full px-3 py-2 border rounded-md"
                    value={s.dockerfile_path}
                    onChange={(e) =>
                      updateServiceDraft(s.id, {
                        dockerfile_path: e.target.value,
                      })
                    }
                    placeholder="./Dockerfile"
                  />
                </div>

                {s.service_type === "backend" && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-slate-700">
                      Provision Token
                    </label>
                    <div className="">
                      <input
                        className="mt-1 w-full px-3 py-2 border rounded-md"
                        value={s.internal_provision_token_secret}
                        placeholder="Paste/Create your Token here (characters, numbers & _ only, e.g., C2Cas_sce233...)"
                        onChange={(e) =>
                          updateServiceDraft(s.id, {
                            internal_provision_token_secret: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                )}

                {/* Env vars entry */}
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
                    <input
                      className="col-span-1 px-3 py-2 border rounded-md"
                      placeholder="VAR_NAME"
                      id={`env-name-${s.id}`}
                    />
                    <input
                      className="col-span-1 px-3 py-2 border rounded-md"
                      placeholder="value"
                      id={`env-value-${s.id}`}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const nameEl = document.getElementById(
                          `env-name-${s.id}`
                        ) as HTMLInputElement | null;
                        const valEl = document.getElementById(
                          `env-value-${s.id}`
                        ) as HTMLInputElement | null;
                        const name = nameEl?.value ?? "";
                        const value = valEl?.value ?? "";
                        if (!name.trim()) {
                          toast.error("Env variable name required");
                          return;
                        }
                        addServiceEnvVar(s.id, name.trim(), value);
                        if (nameEl) nameEl.value = "";
                        if (valEl) valEl.value = "";
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white border"
                    >
                      <Plus className="w-4 h-4" /> Add Variable
                    </button>
                  </div>

                  {/* list */}
                  <div className="mt-3 space-y-2">
                    {s.env_vars.length === 0 ? (
                      <div className="text-sm text-slate-400">
                        No variables added
                      </div>
                    ) : (
                      s.env_vars.map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between gap-3 bg-white border rounded px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-medium">{v.name}</div>
                            <div className="text-xs text-slate-500">
                              {v.value}
                            </div>
                          </div>
                          <button
                            onClick={() => removeServiceEnvVar(s.id, i)}
                            className="text-red-600 p-1 rounded hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          onClick={() => {
            if (isEditing) {
              // Reload initial services
              const serviceDrafts = initialServices.map((service) => ({
                id: `existing-${service.id}`,
                name: service.name,
                service_type: service.service_type,
                repo_url: service.repo_url || "",
                repo_branch: service.repo_branch || "main",
                dockerfile_path:
                  service.build_config?.dockerfile || "./Dockerfile",
                internal_provision_endpoint:
                  service.internal_provision_endpoint || "",
                internal_provision_token_secret:
                  service.internal_provision_token_secret || "",
                env_vars: service.build_config?.env || service.env_vars || [],
              }));

              setServices(serviceDrafts);
            } else {
              setServices([]);
            }
          }}
          className="px-4 py-2 rounded-md border bg-white"
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-md bg-slate-900 text-white inline-flex items-center gap-2"
        >
          {loading
            ? "Saving…"
            : isEditing
            ? "Update Services"
            : "Save Services"}
        </button>
      </div>
    </section>
  );
}
