import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Eye,
  Edit3,
  Trash2,
  Plus,
  Database,
  BadgeCheck,
  AlertTriangle,
  Box,
  MoreHorizontal,
  Globe,
} from "lucide-react";
import ProjectManagement from "../services/ProjectManagement";

// Minimal type assumption based on typical data; adjust as needed
interface ProjectSummary {
  id: number;
  name: string;
  status: "active" | "draft";
  description: string;
  base_domain: string;
  database: string;
  created_at: string;
  db_type: string;
  slug: string;
}

const TemplateListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionOpen, setActionOpen] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ProjectManagement.listProjectTemplates()
      .then((data) => {
        if (!mounted) return;
        console.log("data: ", data);
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

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleActionClick = (id: number) => {
    setActionOpen(actionOpen === id ? null : id);
  };

  const handleView = (id: number) => {
    // Navigate to details or handle view
    navigate(`/templates/${id}`);
    setActionOpen(null);
  };

  const handleEdit = (slug: string) => {
    // Handle edit
    console.log("Edit template", slug);
    setActionOpen(null);
    navigate(`/templates/create-template/${slug}`);
  };

  const handleDelete = (id: number) => {
    // Confirm and delete
    if (window.confirm("Are you sure you want to delete this template?")) {
      // Call API to delete
      ProjectManagement.deleteProjectTemplate(id)
        .then(() => {
          setProjects((prev) => prev.filter((p) => p.id !== id));
        })
        .catch((err) => console.error("Delete failed", err));
    }
    setActionOpen(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2  rounded-full text-[10px] font-medium bg-gray-100 text-gray-800 border border-gray-200">
        Draft
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Project Templates
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage project templates for automated deployments
            </p>
          </div>
          <button className="bg-gray-900 text-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors">
            <Plus className="w-3 h-3" />
            Create Template
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => handleActionClick(project.id)}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                  {actionOpen === project.id && (
                    <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-40 z-10">
                      <button
                        onClick={() => handleView(project.id)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleEdit(project.slug)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit3 className="w-4 h-4" />
                        Edit Template
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
                {/* Icon */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg mb-4">
                    <Box className="w-6 h-6 text-gray-600" />
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-[10px]">
                      {getStatusBadge(project.status)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {project.description}
                </p>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Database className="w-3 h-3" />
                    {project.db_type}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Globe className="w-3 h-3" />
                    <span>{project.base_domain}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <BadgeCheck className="w-3 h-3" />
                    Created {formatDate(project.created_at)}
                  </div>
                </div>

                {/* Status Badge */}
                <div
                  onClick={() => navigate(`/templates/${project.slug}`)}
                  className="flex w-full mt-8 rounded-lg items-center justify-center py-1 px-6 gap-5 border hover:cursor-pointer hover:bg-gray-200 "
                >
                  <div className="flex items-center gap-2 text-xs">
                    <Eye className="w-3 h-3" />
                    View Template
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && !loading && (
          <div className="text-center py-12">
            <Box className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No templates found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or create a new template.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateListPage;
