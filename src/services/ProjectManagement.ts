// src/services/ProjectManagement.ts
import api from "./api";

/**
 * Centralized API client for project/template/tenant/deployment endpoints.
 * All methods return response.data or throw normalized error object/string.
 *
 * NOTE: adjust types as you add more strict typings for your domain models.
 */

type QueryParams = Record<string, any>;
type AnyObj = Record<string, any>;

class ProjectManagement {
  // ---------- Audit Entries ----------
  static async getDashboard() {
    try {
      const res = await api.get("/api/dashboard/overview/");
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
  static async listAuditEntries(params?: QueryParams) {
    try {
      const res = await api.get("/api/audit-entries/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getAuditEntry(id: number | string) {
    try {
      const res = await api.get(`/api/audit-entries/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Deployment Steps ----------
  static async listDeploymentSteps(params?: QueryParams) {
    try {
      const res = await api.get("/api/deployment-steps/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createDeploymentStep(payload: AnyObj) {
    try {
      const res = await api.post("/api/deployment-steps/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getDeploymentStep(id: number | string) {
    try {
      const res = await api.get(`/api/deployment-steps/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateDeploymentStep(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/deployment-steps/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateDeploymentStep(
    id: number | string,
    payload: AnyObj
  ) {
    try {
      const res = await api.patch(`/api/deployment-steps/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteDeploymentStep(id: number | string) {
    try {
      const res = await api.delete(`/api/deployment-steps/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateDeploymentStepStatus(
    id: number | string,
    payload: AnyObj
  ) {
    // payload expected shape: { status, message?, meta? }
    try {
      const res = await api.post(
        `/api/deployment-steps/${id}/update_status/`,
        payload
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Deployments ----------
  static async listDeployments(params?: QueryParams) {
    try {
      const res = await api.get("/api/deployments/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
  static async getDeploymentLogs(id?: number) {
    try {
      const res = await api.get(`/api/deployments/${id}/logs/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createDeployment(payload: AnyObj) {
    try {
      const res = await api.post("/api/deployments/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getDeployment(id: number | string) {
    try {
      const res = await api.get(`/api/deployments/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateDeployment(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/deployments/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateDeployment(id: number | string, payload: AnyObj) {
    try {
      const res = await api.patch(`/api/deployments/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteDeployment(id: number | string) {
    try {
      const res = await api.delete(`/api/deployments/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async resumeDeployment(id: number | string) {
    try {
      const res = await api.post(`/api/deployments/${id}/resume/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateDeploymentStatus(id: number | string, payload: AnyObj) {
    // payload: { status: 'running'|'failed'|'succeeded' }
    try {
      const res = await api.post(
        `/api/deployments/${id}/update_status/`,
        payload
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Health checks ----------
  static async postHealthCheck(payload: AnyObj) {
    // payload: { tenant_service_id, status, detail? }
    try {
      const res = await api.post("/api/health-checks/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Integration Secrets ----------
  static async listIntegrationSecrets(params?: QueryParams) {
    try {
      const res = await api.get("/api/integration-secrets/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createIntegrationSecret(payload: AnyObj) {
    try {
      const res = await api.post("/api/integration-secrets/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getIntegrationSecret(id: number | string) {
    try {
      const res = await api.get(`/api/integration-secrets/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateIntegrationSecret(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/integration-secrets/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateIntegrationSecret(
    id: number | string,
    payload: AnyObj
  ) {
    try {
      const res = await api.patch(`/api/integration-secrets/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteIntegrationSecret(id: number | string) {
    try {
      const res = await api.delete(`/api/integration-secrets/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Job Records ----------
  static async listJobRecords(params?: QueryParams) {
    try {
      const res = await api.get("/api/job-records/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createJobRecord(payload: AnyObj) {
    try {
      const res = await api.post("/api/job-records/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getJobRecord(id: number | string) {
    try {
      const res = await api.get(`/api/job-records/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateJobRecord(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/job-records/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateJobRecord(id: number | string, payload: AnyObj) {
    try {
      const res = await api.patch(`/api/job-records/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteJobRecord(id: number | string) {
    try {
      const res = await api.delete(`/api/job-records/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Notifications ----------
  static async sendNotification(payload: AnyObj) {
    // payload: { deployment_id, success: boolean, message?: string }
    try {
      const res = await api.post("/api/notifications/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Project Templates ----------
  static async listProjectTemplates() {
    try {
      const res = await api.get("/api/project-templates/");
      return res.data;
    } catch (error: any) {
      console.log("org: ", error);
      throw error.response?.data || error.message;
    }
  }

  static async createProjectTemplate(payload: AnyObj) {
    try {
      const res = await api.post("/api/project-templates/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
  static async fetch_tenant_details(slug: string | string) {
    try {
      const res = await api.get(
        `/api/project-templates/${slug}/fetch_tenant_details/`
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getProjectTemplate(slug: string | string) {
    try {
      const res = await api.get(`/api/project-templates/${slug}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateProjectTemplate(slug: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/project-templates/${slug}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateProjectTemplate(
    slug: number | string,
    payload: AnyObj
  ) {
    try {
      const res = await api.patch(`/api/project-templates/${slug}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteProjectTemplate(id: number | string) {
    try {
      const res = await api.delete(`/api/project-templates/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Service Templates ----------
  static async listServiceTemplates(params?: QueryParams) {
    try {
      const res = await api.get("/api/service-templates/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createServiceTemplate(payload: AnyObj) {
    try {
      const res = await api.post("/api/service-templates/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
  static async bulkCreateServiceTemplate(payload: AnyObj) {
    try {
      const res = await api.post(
        "/api/service-templates/bulk_create/",
        payload
      );
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getServiceTemplate(id: number | string) {
    try {
      const res = await api.get(`/api/service-templates/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateServiceTemplate(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/service-templates/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateServiceTemplate(
    id: number | string,
    payload: AnyObj
  ) {
    try {
      const res = await api.patch(`/api/service-templates/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteServiceTemplate(id: number | string) {
    try {
      const res = await api.delete(`/api/service-templates/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Tenant Services ----------
  static async listTenantServices(params?: QueryParams) {
    try {
      const res = await api.get("/api/tenant-services/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createTenantService(payload: AnyObj) {
    try {
      const res = await api.post("/api/tenant-services/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getTenantService(id: number | string) {
    try {
      const res = await api.get(`/api/tenant-services/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateTenantService(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/tenant-services/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateTenantService(
    id: number | string,
    payload: AnyObj
  ) {
    try {
      const res = await api.patch(`/api/tenant-services/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteTenantService(id: number | string) {
    try {
      const res = await api.delete(`/api/tenant-services/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  // ---------- Tenants ----------
  static async listTenants(params?: QueryParams) {
    try {
      const res = await api.get("/api/tenants/", { params });
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async createTenant(payload: AnyObj) {
    try {
      const res = await api.post("/api/tenants/", payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async getTenant(id: number | string) {
    try {
      const res = await api.get(`/api/tenants/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async updateTenant(id: number | string, payload: AnyObj) {
    try {
      const res = await api.put(`/api/tenants/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async partialUpdateTenant(id: number | string, payload: AnyObj) {
    try {
      const res = await api.patch(`/api/tenants/${id}/`, payload);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async deleteTenant(id: number | string) {
    try {
      const res = await api.delete(`/api/tenants/${id}/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }

  static async redeployTenant(id: number | string) {
    try {
      const res = await api.post(`/api/tenants/${id}/redeploy/`);
      return res.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  }
}

export default ProjectManagement;
