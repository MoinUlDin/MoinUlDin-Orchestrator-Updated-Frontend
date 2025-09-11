// src/components/ServiceRow.tsx
import { Code, Globe } from "lucide-react";

type Props = {
  service: {
    id: number;
    name: string;
    service_type: string;
    repo_url?: string;
    expose_domain?: boolean;
  };
};

export default function ServiceRow({ service }: Props) {
  return (
    <div className="py-3 flex items-center justify-between">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-slate-50 border flex items-center justify-center">
          {service.service_type === "frontend" ? <Globe /> : <Code />}
        </div>
        <div>
          <div className="font-medium text-slate-900">{service.name}</div>
          <div className="text-xs text-slate-500">{service.service_type}</div>
          {service.repo_url && (
            <div className="text-xs text-slate-400 mt-1">
              {service.repo_url}
            </div>
          )}
        </div>
      </div>

      <div className="text-right text-sm text-slate-600">
        {service.expose_domain ? (
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded">
            public
          </span>
        ) : (
          <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded">
            internal
          </span>
        )}
      </div>
    </div>
  );
}
