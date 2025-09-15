// src/components/modals/DeployTenantModal.tsx
import React, { useEffect, useState } from "react";
import { X, Send, User, Mail, Lock, Globe, Building2 } from "lucide-react";
import ProjectManagement from "../../services/ProjectManagement";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

type ProjectSummary = {
  id: number;
  name: string;
  slug: string;
  base_domain?: string;
};

type Props = {
  isOpen: boolean;
  project?: ProjectSummary | null;
  onClose: () => void;
  onCreated?: (tenant: any) => void;
};

export default function DeployTenantModal({
  isOpen,
  project,
  onClose,
  onCreated,
}: Props) {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [clientRef, setClientRef] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [company, setCompany] = useState("");
  const [sendCredentials, setSendCredentials] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) {
      // reset form on close
      setName("");
      setClientRef("");
      setEmail("");
      setPassword("");
      setSubdomain("");
      setCompany("");
      setSendCredentials(true);
      setLoading(false);
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Client name is required";
    if (!subdomain.trim()) e.subdomain = "Subdomain is required";
    // simple subdomain chars check
    if (!/^[a-z0-9-]{2,63}$/i.test(subdomain.trim())) {
      e.subdomain =
        "Subdomain must be 2-63 chars and only letters, numbers and hyphen";
    }
    if (!email.trim()) e.email = "Email is required";
    if (!password.trim()) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setErrors({});
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    if (!project) {
      toast.error("No project selected");
      return;
    }

    const payload = {
      project: project.id,
      name: name,
      client_ref: clientRef || undefined,
      subdomain: subdomain.toLowerCase(),
      email: email,
      password: password,
      company: company || undefined,
      send_credentials: sendCredentials,
    };

    setLoading(true);

    ProjectManagement.createTenant(payload)
      .then((r) => {
        console.log("Deployment Response: ", r);
        const { slug, deployment_id } = r;
        onClose();
        nav(`/projects/${slug}/instances/${deployment_id}/logs`);
      })
      .catch((err) => {
        console.error("Create tenant error", err);
        const msg =
          err?.detail ||
          (err?.message ? String(err.message) : "Failed to create tenant");
        toast.error(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-lg z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Deploy New Tenant</h3>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="p-1 rounded hover:bg-slate-100"
            aria-label="close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm text-slate-500 mb-4">
          Deploying <strong>{project?.name}</strong> — base domain:{" "}
          <span className="font-medium">{project?.base_domain ?? "—"}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <div className="text-xs text-slate-500 mb-1">Client name</div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="pl-8 pr-3 py-2 border rounded w-full"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder="Client / tenant name"
              />
            </div>
            {errors.name && (
              <div className="text-sm text-red-600 mt-1">{errors.name}</div>
            )}
          </label>

          <label className="block">
            <div className="text-xs text-slate-500 mb-1">Client email</div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="pl-8 pr-3 py-2 border rounded w-full"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="admin@example.com"
                type="email"
              />
            </div>
            {errors.email && (
              <div className="text-sm text-red-600 mt-1">{errors.email}</div>
            )}
          </label>

          <label className="block">
            <div className="text-xs text-slate-500 mb-1">Subdomain</div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Globe className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="pl-8 pr-3 py-2 border rounded w-full"
                value={subdomain}
                onChange={(ev) => setSubdomain(ev.target.value.toLowerCase())}
                placeholder="tenant-subdomain (letters, numbers and hyphen)"
              />
            </div>
            {errors.subdomain && (
              <div className="text-sm text-red-600 mt-1">
                {errors.subdomain}
              </div>
            )}
            <div className="text-xs text-slate-400 mt-1">
              Full domain will be{" "}
              <span className="font-medium">{`${subdomain || "<sub>"}.${
                project?.base_domain || "<base>"
              }`}</span>
            </div>
          </label>

          <label className="block">
            <div className="text-xs text-slate-500 mb-1">
              Password (for internal-provision superuser)
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="pl-8 pr-3 py-2 border rounded w-full"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="Strong password"
                type="password"
              />
            </div>
            {errors.password && (
              <div className="text-sm text-red-600 mt-1">{errors.password}</div>
            )}
          </label>

          <label className="block md:col-span-2">
            <div className="text-xs text-slate-500 mb-1">
              Company (optional)
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                <Building2 className="w-4 h-4 text-slate-400" />
              </div>
              <input
                className="pl-8 pr-3 py-2 border rounded w-full"
                value={company}
                onChange={(ev) => setCompany(ev.target.value)}
                placeholder="Company name (optional)"
              />
            </div>
          </label>

          <label className="flex items-center gap-3 md:col-span-2">
            <input
              type="checkbox"
              checked={sendCredentials}
              onChange={(e) => setSendCredentials(e.target.checked)}
            />
            <span className="text-sm text-slate-600">
              Send credentials to client email after successful deployment
            </span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="px-4 py-2 rounded border hover:bg-slate-50"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded bg-slate-900 text-white inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {loading ? "Deploying…" : "Create & Deploy"}
          </button>
        </div>
      </form>
    </div>
  );
}
