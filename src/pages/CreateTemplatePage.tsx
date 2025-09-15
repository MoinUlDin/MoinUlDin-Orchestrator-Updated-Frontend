// src/pages/CreateTemplate.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectManagement from "../services/ProjectManagement";
import toast from "react-hot-toast";
import ServiceTemplatesForm from "../components/template/ServiceTemplatesFormProps";
import { ChevronLeft, Save, Database as DbIcon } from "lucide-react";

type DBType = "postgres" | "mysql" | "mongodb";

type BasicInfoPayload = {
  name: string;
  slug: string;
  description?: string;
  base_domain: string;
  notify_emails: string[];
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
  service_templates?: any[];
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
  const { slug: templateSlugFromUrl } = useParams<{ slug: string }>();
  const isEditing = !!templateSlugFromUrl && templateSlugFromUrl !== "__new__";

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

  // loading flags
  const [loadingBasic, setLoadingBasic] = useState(false);
  const [loadingDb, setLoadingDb] = useState(false);
  const [loadingTemplate, setLoadingTemplate] = useState(isEditing);

  // validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived
  const canNavigateToChildren = templateExists;

  // Load template data if editing
  useEffect(() => {
    if (isEditing && templateSlugFromUrl) {
      const loadTemplate = async () => {
        try {
          setLoadingTemplate(true);
          const templateData = await ProjectManagement.getProjectTemplate(
            templateSlugFromUrl
          );
          console.log("templateData: ", templateData);
          setTemplate(templateData);

          // Pre-fill basic info
          setBasic({
            name: templateData.name,
            slug: templateData.slug,
            description: templateData.description || "",
            base_domain: templateData.base_domain,
            notify_emails: templateData.notify_emails || [],
          });

          // Pre-fill notification emails
          setNotifyEmailsText(templateData.notify_emails?.join(", ") || "");

          // Pre-fill database info
          setDbRequired(templateData.db_required);
          if (templateData.db_type) {
            setDbType(templateData.db_type);
          }
        } catch (error: any) {
          console.error("Error loading template", error);
          toast.error(error.detail || "Failed to load template");
          nav("/templates");
        } finally {
          setLoadingTemplate(false);
        }
      };

      loadTemplate();
    }
  }, [isEditing, templateSlugFromUrl, nav]);

  // Helpers
  const setBasicField = (k: keyof BasicInfoPayload, v: any) => {
    setBasic((s) => ({ ...s, [k]: v }));
    if (k === "name" && !basic.slug && !isEditing) {
      // update slug auto when name typed and slug blank (only for new templates)
      setBasic((s) => ({ ...s, slug: slugify(v) }));
    }
  };

  // Basic form submit -> create or update template
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

      let created;
      if (isEditing && template) {
        // Update existing template
        created = await ProjectManagement.updateProjectTemplate(
          template.slug,
          payload
        );
        toast.success("Template updated");
      } else {
        // Create new template
        created = await ProjectManagement.createProjectTemplate(payload);
        toast.success("Template created");
      }

      setTemplate(created);
    } catch (e: any) {
      console.error("create/update template error", e);
      const msg =
        typeof e === "string" ? e : e?.detail || "Failed saving template";
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

  if (loadingTemplate) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Loading template...</div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-semibold">
              {isEditing ? "Edit Project Template" : "Create Project Template"}
            </h1>
            <p className="text-sm text-slate-500">
              {isEditing
                ? "Update your project template"
                : "Define a reusable template for automated project deployments"}
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
                    setBasicField(
                      "slug",
                      isEditing ? e.target.value : slugify(e.target.value)
                    )
                  }
                  placeholder="dms-project"
                  disabled={isEditing} // Disable slug editing for existing templates
                />
                {errors.slug && (
                  <div className="text-xs text-red-600 mt-1">{errors.slug}</div>
                )}
                {isEditing && (
                  <p className="text-xs text-slate-400 mt-1">
                    Slug cannot be changed for existing templates
                  </p>
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
                  if (isEditing && template) {
                    // Reset to original values for edit mode
                    setBasic({
                      name: template.name,
                      slug: template.slug,
                      description: template.description || "",
                      base_domain: template.base_domain,
                      notify_emails: template.notify_emails || [],
                    });
                    setNotifyEmailsText(
                      template.notify_emails?.join(", ") || ""
                    );
                  } else {
                    // Reset to empty values for create mode
                    setBasic({
                      name: "",
                      slug: "",
                      description: "",
                      base_domain: "",
                      notify_emails: [],
                    });
                    setNotifyEmailsText("");
                  }
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
                {loadingBasic
                  ? "Saving…"
                  : isEditing
                  ? "Update Basic Info"
                  : "Save Basic Info"}
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
                onClick={() => {
                  if (isEditing && template) {
                    setDbRequired(template.db_required);
                    if (template.db_type) {
                      setDbType(template.db_type);
                    }
                  } else {
                    setDbRequired(false);
                    setDbType("postgres");
                  }
                }}
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
        {activeTab === "services" && template && (
          <ServiceTemplatesForm
            templateId={template.id}
            templateSlug={template.slug}
            isEditing={isEditing}
            initialServices={template.service_templates || []}
          />
        )}
      </div>
    </div>
  );
}
