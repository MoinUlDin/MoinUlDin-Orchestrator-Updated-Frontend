// src/pages/CreateTemplate.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProjectManagement from "../services/ProjectManagement";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  Save,
  Plus,
  Trash,
  Database as DbIcon,
} from "lucide-react";

type DBType = "postgres" | "mysql" | "mongodb";

type BasicInfoPayload = {
  name: string;
  slug: string;
  description?: string;
  base_domain: string;
  notify_emails: string[]; // array
};

type TemplateRecord = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  base_domain: string;
  db_required: boolean;
  db_type?: DBType;
  notify_emails?: string[];
  active?: boolean;
};

type ServiceDraft = {
  id: string; // client-side id
  name: string;
  service_type: string; // 'backend' | 'frontend' | etc
  repo_url?: string;
  repo_branch?: string;
  dockerfile_path?: string;
  internal_provision_endpoint?: string;
  internal_provision_token_secret?: string;
  env_vars: { name: string; value: string }[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CreateTemplatePage() {
  const nav = useNavigate();

  // Tabs
  const TABS = ["basic", "database", "services"] as const;
  type TabKey = (typeof TABS)[number];
  const [activeTab, setActiveTab] = useState<TabKey>("basic");

  // Basic info state (required)
  const [basic, setBasic] = useState<BasicInfoPayload>({
    name: "",
    slug: "",
    description: "",
    base_domain: "",
    notify_emails: [],
  });
  const [notifyEmailsText, setNotifyEmailsText] = useState<string>("");

  // template saved state (backend)
  const [template, setTemplate] = useState<TemplateRecord | null>(null);
  const templateExists = !!template?.id;

  // DB tab
  const [dbRequired, setDbRequired] = useState<boolean>(false);
  const [dbType, setDbType] = useState<DBType>("postgres");

  // services drafts
  const [services, setServices] = useState<ServiceDraft[]>([]);

  // loading flags
  const [loadingBasic, setLoadingBasic] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived
  const canNavigateToChildren = templateExists;

  // Helpers
  const setBasicField = (k: keyof BasicInfoPayload, v: any) => {
    setBasic((s) => ({ ...s, [k]: v }));
    if (k === "name" && !basic.slug) {
      // update slug auto when name typed and slug blank
      setBasic((s) => ({ ...s, slug: slugify(v) }));
    }
  };

  // Basic form submit -> create template
  const handleSaveBasic = async () => {
    // validate
    const err: Record<string, string> = {};
    if (!basic.name.trim()) err.name = "Name is required";
    if (!basic.slug.trim() || basic.slug.length < 2)
      err.slug = "Slug is required";
    if (!basic.base_domain.trim()) err.base_domain = "Base domain is required";
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoadingBasic(true);
    try {
      const payload = {
        name: basic.name.trim(),
        slug: basic.slug.trim(),
        description: basic.description?.trim() || "",
        base_domain: basic.base_domain.trim(),
        notify_emails: notifyEmailsText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const created = await ProjectManagement.createProjectTemplate(payload);
      setTemplate(created);
      toast.success("Template created");
      // after create allow navigation
    } catch (e: any) {
      console.error("create template error", e);
      const msg =
        typeof e === "string" ? e : e?.detail || "Failed creating template";
      toast.error(msg);
    } finally {
      setLoadingBasic(false);
    }
  };

  // DB save -> patch template
  const handleSaveDb = async () => {
    if (!template) return;
    setLoadingDb(true);
    try {
      const payload: Partial<TemplateRecord> = {
        db_required: dbRequired,
        db_type: dbRequired ? dbType : undefined,
      };
      const patched = await ProjectManagement.partialUpdateProjectTemplate(
        template.slug,
        payload
      );
      setTemplate(patched);
      toast.success("Database configuration saved");
    } catch (e: any) {
      console.error("db patch error", e);
      toast.error(e?.detail || "Failed saving database configuration");
    } finally {
      setLoadingDb(false);
    }
  };

  // Service helpers
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

  // Save services -> create service-templates for each
  const handleSaveServices = async () => {
    if (!template) {
      toast.error("Save basic info first");
      return;
    }
    if (services.length === 0) {
      toast.error("Add at least one service");
      return;
    }

    // minimal validation: each service needs a name and type
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

    setLoadingServices(true);
    try {
      // Build array payloads
      const items = services.map((s) => {
        if (!s.dockerfile_path) {
          toast.error("Docker File path");
          return;
        }
        return {
          // include project id here (serializer expects project pk)
          project: template.id,
          name: s.name.trim(),
          service_type: s.service_type,
          repo_url: s.repo_url || "",
          repo_branch: s.repo_branch || "",
          build_config: {
            dockerfile: s.dockerfile_path,
            // you may want to embed envs under build_config or as a separate field
            env: s.env_vars || [],
          },
          internal_provision_token_secret: s.internal_provision_token_secret,
          internal_provision_endpoint: s.internal_provision_endpoint || "",
          // If your backend expects `build_env` instead, adapt accordingly
          // build_env: s.env_vars || []
        };
      });

      // send array in one request
      console.log("sending items: ", items);
      const created = await ProjectManagement.bulkCreateServiceTemplate(items);
      console.log("bulk created:", created);
      toast.success("Services created");
      nav(`/templates/${template.slug}`);
    } catch (e: any) {
      console.error("create services error", e);
      toast.error(e?.detail || e?.message || "Failed creating services");
    } finally {
      setLoadingServices(false);
    }
  };

  // Render helpers
  const tabButton = (key: TabKey, label: string, disabled = false) => (
    <button
      key={key}
      onClick={() => !disabled && setActiveTab(key)}
      className={`px-3 py-2 rounded-md text-sm ${
        activeTab === key
          ? "bg-white text-slate-900 shadow"
          : "bg-slate-100 text-slate-600 hover:bg-slate-50"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => nav("/templates")}
            className="inline-flex items-center gap-2 text-slate-700"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back to Templates</span>
          </button>
          <div>
            <h1 className="text-2xl font-semibold">Create Project Template</h1>
            <p className="text-sm text-slate-500">
              Define a reusable template for automated project deployments
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => nav("/templates")}
            className="px-4 py-2 rounded-md border bg-white"
          >
            Cancel
          </button>
          {/* Save button is context-sensitive; handled inside each tab */}
          <button
            onClick={() => {
              // If basic not saved, save it; else if services tab, save services; etc
              if (activeTab === "basic") handleSaveBasic();
              else if (activeTab === "database") handleSaveDb();
              else if (activeTab === "services") handleSaveServices();
            }}
            className="px-4 py-2 rounded-md bg-slate-900 text-white inline-flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-6">
        {tabButton("basic", "Basic Info")}
        {tabButton("database", "Database", !canNavigateToChildren)}
        {tabButton("services", "Services", !canNavigateToChildren)}
      </div>

      {/* Tab content */}
      <div className="bg-white border rounded-xl p-6">
        {activeTab === "basic" && (
          <section>
            <h3 className="text-lg font-semibold mb-1">Basic Information</h3>
            <p className="text-sm text-slate-500 mb-6">
              Configure the basic template settings and metadata
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700">
                  Template Name *
                </label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  value={basic.name}
                  onChange={(e) => setBasicField("name", e.target.value)}
                  placeholder="DMS"
                />
                {errors.name && (
                  <div className="text-xs text-red-600 mt-1">{errors.name}</div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-700">Slug *</label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  value={basic.slug}
                  onChange={(e) =>
                    setBasicField("slug", slugify(e.target.value))
                  }
                  placeholder="dms-project"
                />
                {errors.slug && (
                  <div className="text-xs text-red-600 mt-1">{errors.slug}</div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700">
                  Description
                </label>
                <textarea
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  value={basic.description}
                  onChange={(e) => setBasicField("description", e.target.value)}
                  placeholder="Project for dms"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700">
                  Base Domain *
                </label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  value={basic.base_domain}
                  onChange={(e) => setBasicField("base_domain", e.target.value)}
                  placeholder="lms.pk"
                />
                {errors.base_domain && (
                  <div className="text-xs text-red-600 mt-1">
                    {errors.base_domain}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-700">
                  Notification Emails
                </label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded-md"
                  value={notifyEmailsText}
                  onChange={(e) => setNotifyEmailsText(e.target.value)}
                  placeholder="admin@example.com, ops@example.com"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Comma-separated list of emails to notify after successful
                  deploy.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setErrors({});
                }}
                className="px-4 py-2 rounded-md border bg-white"
              >
                Reset
              </button>

              <button
                onClick={handleSaveBasic}
                disabled={loadingBasic}
                className="px-4 py-2 rounded-md bg-slate-900 text-white inline-flex items-center gap-2"
              >
                {loadingBasic ? "Saving…" : "Save Basic Info"}
              </button>
            </div>
          </section>
        )}

        {/* Database View */}
        {activeTab === "database" && (
          <section>
            <h3 className="text-lg font-semibold mb-1">
              Database Configuration
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Configure database requirements for this template
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-700">
                  Require Database
                </label>
                <div className="mt-2 flex items-center gap-6">
                  <label className="inline-flex items-center gap-3">
                    <input
                      type="radio"
                      checked={dbRequired === true}
                      onChange={() => setDbRequired(true)}
                    />
                    <span>Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-3">
                    <input
                      type="radio"
                      checked={dbRequired === false}
                      onChange={() => setDbRequired(false)}
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {dbRequired && (
                <>
                  <div>
                    <label className="block text-sm text-slate-700">
                      Database Type
                    </label>
                    <select
                      className="mt-1 w-full px-3 py-2 border rounded-md"
                      value={dbType}
                      onChange={(e) => setDbType(e.target.value as DBType)}
                    >
                      <option value="postgres">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                      <option value="mongodb">MongoDB</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3">
                    <DbIcon className="w-6 h-6 text-slate-400" />
                    <div className="text-sm text-slate-500">
                      <div className="font-medium text-slate-700">
                        Database Service
                      </div>
                      <div>
                        A database service will be automatically created for
                        each tenant deployment using the selected database type.
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-md border bg-white"
                onClick={() => setDbRequired(false)}
              >
                Reset
              </button>
              <button
                onClick={handleSaveDb}
                disabled={!template || loadingDb}
                className={`px-4 py-2 rounded-md inline-flex items-center gap-2 text-white ${
                  !template ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900"
                }`}
              >
                {loadingDb ? "Saving…" : "Save Database"}
              </button>
            </div>
          </section>
        )}

        {/* Services View */}
        {activeTab === "services" && (
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
                          {/* <option value="db">Database</option> */}
                          {/* <option value="worker">Worker</option>
                          <option value"other">Other</option> */}
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
                        <label className="block text-sm text-slate-700">
                          Branch
                        </label>
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
                              placeholder="Paste your Token here"
                              onChange={(e) =>
                                updateServiceDraft(s.id, {
                                  internal_provision_token_secret:
                                    e.target.value,
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
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white border"
                          >
                            Add Variable
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
                                  <div className="text-sm font-medium">
                                    {v.name}
                                  </div>
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
                onClick={() => setServices([])}
                className="px-4 py-2 rounded-md border bg-white"
              >
                Reset
              </button>
              <button
                onClick={handleSaveServices}
                disabled={!template || loadingServices}
                className={`px-4 py-2 rounded-md inline-flex items-center gap-2 text-white ${
                  !template ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900"
                }`}
              >
                {loadingServices ? "Saving…" : "Save Services"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
