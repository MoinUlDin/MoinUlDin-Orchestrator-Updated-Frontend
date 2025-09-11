// src/components/ProjectTemplateModal.tsx
import React, { useEffect, useState } from "react";
import { X, Save, Hash } from "lucide-react";
import ProjectManagement from "../../services/ProjectManagement";
import toast from "react-hot-toast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (created: any) => void;
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function ProjectTemplateModal({
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [baseDomain, setBaseDomain] = useState("");
  const [dbRequired, setDbRequired] = useState(true);
  const [dbType, setDbType] = useState<"postgres" | "mysql" | "mongodb">(
    "postgres"
  );
  const [defaultEnvRaw, setDefaultEnvRaw] = useState<string>("{}");
  const [notifyEmailsRaw, setNotifyEmailsRaw] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // reset when closed
      setName("");
      setSlug("");
      setDescription("");
      setBaseDomain("");
      setDbRequired(true);
      setDbType("postgres");
      setDefaultEnvRaw("{}");
      setNotifyEmailsRaw("");
      setErrors({});
      setLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!slug && name) {
      setSlug(slugify(name));
    }
  }, [name]);

  if (!isOpen) return null;

  const validate = () => {
    const err: Record<string, string> = {};
    if (!name.trim()) err.name = "Name is required";
    if (!slug.trim() || slug.length < 3)
      err.slug = "Slug is required (3+ chars)";
    if (!baseDomain.trim()) err.baseDomain = "Base domain is required";
    // default_env must be valid JSON
    try {
      JSON.parse(defaultEnvRaw || "{}");
    } catch {
      err.defaultEnvRaw =
        'default_env must be valid JSON (e.g. {"KEY":"VALUE"})';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    let default_env: any = {};
    try {
      default_env = JSON.parse(defaultEnvRaw || "{}");
    } catch {
      toast.error("Invalid JSON in default environment.");
      return;
    }

    // notify_emails - accept comma-separated string and convert to array of trimmed emails
    const notify_emails =
      notifyEmailsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [];

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      base_domain: baseDomain.trim(),
      db_required: Boolean(dbRequired),
      db_type: dbType,
      default_env,
      notify_emails,
    };

    setLoading(true);
    try {
      const created = await ProjectManagement.createProjectTemplate(payload);
      toast.success("Project template created");
      onCreated && onCreated(created);
      onClose();
    } catch (err: any) {
      console.error("Create project error:", err);
      const msg =
        (typeof err === "string" && err) ||
        err?.detail ||
        err?.non_field_errors?.join?.(", ") ||
        "Failed to create project template";
      toast.error(msg);
      // if backend returns field errors, show them
      if (err && typeof err === "object") {
        const fieldErrors: Record<string, string> = {};
        for (const k of Object.keys(err)) {
          if (Array.isArray(err[k])) fieldErrors[k] = err[k].join(", ");
          else fieldErrors[k] = String(err[k]);
        }
        setErrors(fieldErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[95vh] w-full max-w-3xl bg-white rounded-xl shadow-lg border p-6 overflow-auto"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Create Project Template</h3>
            <p className="text-sm text-slate-500 mt-1">
              Provide the required details to create a template.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => !loading && onClose()}
              className="p-2 rounded-md hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Name *
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="DMS"
              required
            />
            {errors.name && (
              <div className="text-xs text-red-600 mt-1">{errors.name}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Slug *
            </label>
            <div className="mt-1 flex">
              <input
                className="flex-1 px-3 py-2 border rounded-l-md"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="dms-project"
                required
              />
              <div className="inline-flex items-center px-3 border rounded-r-md bg-slate-50 text-sm text-slate-500">
                <Hash className="w-4 h-4 mr-1" />
                slug
              </div>
            </div>
            {errors.slug && (
              <div className="text-xs text-red-600 mt-1">{errors.slug}</div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Project for dms"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Base Domain *
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={baseDomain}
              onChange={(e) => setBaseDomain(e.target.value)}
              placeholder="lms.pk"
              required
            />
            {errors.baseDomain && (
              <div className="text-xs text-red-600 mt-1">
                {errors.baseDomain}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              DB required
            </label>
            <div className="mt-1 flex items-center gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="db_required"
                  checked={dbRequired === true}
                  onChange={() => setDbRequired(true)}
                />
                <span className="text-sm">Yes</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  name="db_required"
                  checked={dbRequired === false}
                  onChange={() => setDbRequired(false)}
                />
                <span className="text-sm">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              DB Type
            </label>
            <select
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={dbType}
              onChange={(e) => setDbType(e.target.value as any)}
              disabled={!dbRequired}
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL</option>
              <option value="mongodb">MongoDB</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Default env (JSON)
            </label>
            <textarea
              className="mt-1 block w-full px-3 py-2 border rounded-md font-mono text-xs h-28"
              value={defaultEnvRaw}
              onChange={(e) => setDefaultEnvRaw(e.target.value)}
              placeholder='{"KEY":"VALUE"}'
            />
            {errors.defaultEnvRaw && (
              <div className="text-xs text-red-600 mt-1">
                {errors.defaultEnvRaw}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">
              Notify emails (comma separated)
            </label>
            <input
              className="mt-1 block w-full px-3 py-2 border rounded-md"
              value={notifyEmailsRaw}
              onChange={(e) => setNotifyEmailsRaw(e.target.value)}
              placeholder="admin@example.com, ops@example.com"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="px-4 py-2 rounded-md border bg-white"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-900 text-white"
            disabled={loading}
          >
            <Save className="w-4 h-4" />
            {loading ? "Creating…" : "Create Template"}
          </button>
        </div>
      </form>
    </div>
  );
}
