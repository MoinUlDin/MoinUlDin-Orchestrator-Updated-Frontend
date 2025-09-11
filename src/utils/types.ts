export interface ProjectDetailType {
  id: 4;
  name: "What a shot";
  slug: "slugc";
  description: "testing new page";
  base_domain: "wow.wour";
  db_required: true;
  db_type: "postgres";
  notify_emails: ["moinuldinc@gmail.com"];
  active: true;
  created_by: 1;
  tenat?: number;
  created_at: "2025-09-11T05:35:48.851960Z";
  updated_at: "2025-09-11T05:38:10.741771Z";
  service_templates: [
    {
      id: 1;
      project: 4;
      name: "Lms Backend";
      service_type: "backend";
      repo_url: "https://github.com/MoinUlDin/Orchestrator-Updated-Frontend.git";
      repo_branch: "main";
      build_config: {
        dockerfile: "./DockerFile";
      };
      env_vars: [
        {
          name: "password";
          value: "cejiLKDIce234KFJCEL8";
        }
      ];
      expose_domain: true;
      internal_provision_endpoint: "/api/internal api";
      internal_provision_token_secret: null;
      order: 0;
      active: true;
      created_at: "2025-09-11T06:24:22.564176Z";
      updated_at: "2025-09-11T06:24:22.564176Z";
    },
    {
      id: 2;
      project: 4;
      name: "Frontend";
      service_type: "frontend";
      repo_url: "https://github.com/sothing";
      repo_branch: "main";
      build_config: {
        dockerfile: "./Dockerfile";
      };
      env_vars: [];
      expose_domain: true;
      internal_provision_endpoint: "/api/domina/interanl";
      internal_provision_token_secret: null;
      order: 0;
      active: true;
      created_at: "2025-09-11T06:24:22.583176Z";
      updated_at: "2025-09-11T06:24:22.583176Z";
    }
  ];
  total_services: 3;
  database_service: {
    id: "db-4";
    project: 4;
    name: "slugc-database";
    service_type: "db";
    repo_url: null;
    repo_branch: null;
    build_config: {};
    env_vars: [];
    expose_domain: false;
    internal_provision_endpoint: null;
    internal_provision_token_secret: null;
    order: 9999;
    active: true;
    db_type: "postgres";
    note: "Synthetic DB service created per-template configuration";
  };
}
