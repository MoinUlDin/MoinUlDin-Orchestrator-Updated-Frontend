import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { type ProjectDetailType } from "../utils/types";
import { truncString } from "../utils/helpers";
import {
  ArrowLeft,
  Database,
  Globe,
  AlertTriangle,
  Mail,
  Edit,
  Play,
  Copy,
  Settings,
} from "lucide-react";
import ProjectManagement from "../services/ProjectManagement"; // Adjust path to your service

const TemplateDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>(); // Get template ID from URL
  const navigate = useNavigate();
  const [template, setTemplate] = useState<ProjectDetailType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTemplateDetail();
  }, [slug]);

  const fetchTemplateDetail = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      const data = await ProjectManagement.getProjectTemplate(slug!);
      console.log("detail : ", data);
      setTemplate(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load template details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleEdit = () => {
    navigate(`/templates/create-template/${slug}`);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template details...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error || "Template not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-gray-600 hover:text-purple-600 flex items-center gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Templates
        </button>

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {template.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Template ID: {template.id}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {template.active && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                Active
              </span>
            )}
            <button
              onClick={handleEdit}
              className="border text-[14px] bg-white text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Template
            </button>
            <div className="relative">
              <button className="bg-purple-600 text-[14px] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
                <Play className="w-4 h-4" />
                Deploy Instance
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "overview"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "services"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("services")}
          >
            Services
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "configuration"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("configuration")}
          >
            Configuration
          </button>
          <button
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === "deployments"
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("deployments")}
          >
            Deployments
          </button>
        </div>

        {/* Overview Tab Content */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Template Information */}
            <div className="md:col-span-2  bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="col-span-2">
                <h2 className="text-lg font-semibold  text-gray-900 ">
                  Template Information
                </h2>
                <p className="text-gray-600 text-[12px] mb-3">
                  Basic configuration and metadata
                </p>
                <p className="mb-6">{template.description}</p>
              </div>

              <div className="space-y-4 text-sm text-gray-600 grid md:grid-cols-2 gap-4">
                <div className="flex gap-2 items-center py-2 border-gray-100">
                  <span className="font-medium text-gray-700">
                    Base Domain:
                  </span>
                  <span>{template.base_domain}</span>
                </div>
                <div className="flex gap-2 items-center py-2 border-gray-100">
                  <span className="font-medium text-gray-700">Database:</span>
                  <span className="text-purple-600">{template.db_type}</span>
                </div>
                <div className="flex gap-2 items-center py-2 border-gray-100">
                  <span className="font-medium text-gray-700">Services:</span>
                  <span>{template.total_services}</span>
                </div>

                <div className="flex gap-2 items-center py-2 border-gray-100">
                  <span className="font-medium text-gray-700">
                    Active Tenat:
                  </span>
                  <span>{template?.tenat || 0}</span>
                </div>
                <div className="flex gap-2 items-center py-2 border-gray-100">
                  <span className="font-medium text-gray-700">Created:</span>
                  <span>{formatDate(template.created_at)}</span>
                </div>
                <div className="flex gap-2 items-center py-2">
                  <span className="font-medium text-gray-700">Updated:</span>
                  <span>{formatDate(template.updated_at)}</span>
                </div>
              </div>
            </div>
            {/* Notifications & Template Stats */}
            <div className="flex flex-col gap-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Notifications
                </h2>
                <div className="space-y-3">
                  {template.notify_emails?.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 py-2 border-gray-100 last:border-0"
                    >
                      <Mail className="w-3 h-3" />
                      <span className="text-gray-600 text-[12px] mb-1">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template Stats */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:col-start-3">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Template Stats
                </h2>
                <div className="space-y-4 text-sm text-gray-600">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">
                      Total Services:
                    </span>
                    <span>{template.total_services}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-700">
                      Active Tenants:
                    </span>
                    <span>{template.tenat}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-700">
                      Created By:
                    </span>
                    <span>{template.created_by}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="bg-white p-4 rounded-lg border-1 border-gray-900 shadow-lg ">
            <div>
              <h1>Service Templates</h1>
              <p className="text-gray-600 text-[12px]">
                Configure the services that will be deployed for each tenant
              </p>
            </div>
            <div className="overflow-x-auto mt-5">
              <table className="w-full ">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide">
                    <th className="border-b pr-4">Service</th>
                    <th className="border-b pr-4">Type</th>
                    <th className="border-b pr-4 ">Repository</th>
                    <th className="border-b pr-4">Branch</th>
                    <th className="border-b">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {Number((template?.service_templates ?? []).length) === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 border-b text-center text-sm"
                      >
                        No services defined
                      </td>
                    </tr>
                  ) : (
                    (template?.service_templates ?? []).map((row: any) => (
                      <tr key={`Services-${row.id}`} className="text-[12px]">
                        <td className="py-3 border-b pr-4 flex items-center gap-2">
                          {row.service_type === "backend" ? (
                            <Settings className="h-3 w-3" />
                          ) : (
                            <Globe className="h-3 w-3" />
                          )}

                          {row.name ?? "—"}
                        </td>
                        <td className="py-3 border-b pr-4">
                          {row.service_type ?? "—"}
                        </td>
                        <td className="py-3 border-b pr-4 break-all flex items-center gap-2">
                          {truncString(row.repo_url) ?? "—"}
                          <Copy className="h-3 w-3 hover:cursor-pointer" />
                        </td>
                        <td className="py-3 border-b pr-4">
                          {row.repo_branch ?? "—"}
                        </td>

                        <td className="py-3 border-b">
                          {row.active ? "Active" : "Stopped"}
                        </td>
                      </tr>
                    ))
                  )}
                  {template.db_required && (
                    <tr className="text-[12px]">
                      <td className="py-3 border-b pr-4 flex items-center gap-2">
                        <Database className="h-3 w-3" />
                        Database
                      </td>
                      <td className="py-3 border-b pr-4">
                        {template.db_type ?? "—"}
                      </td>
                      <td className="py-3 border-b pr-4 break-all flex items-center gap-2">
                        —
                      </td>
                      <td className="py-3 border-b pr-4">—</td>

                      <td className="py-3 border-b">—</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateDetailPage;
