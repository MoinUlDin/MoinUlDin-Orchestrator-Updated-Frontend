// src/components/DeploymentCard.tsx
// import { Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DeploymentCard({ deployment }: any) {
  const nav = useNavigate();

  const statusColor =
    deployment.status === "succeeded"
      ? "text-green-600"
      : deployment.status === "failed"
      ? "text-red-600"
      : "text-yellow-600";

  return (
    <div className="border rounded-lg p-3 flex items-center justify-between">
      <div>
        <div className="text-sm font-medium text-slate-800">
          Deployment #{deployment.id}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          {new Date(deployment.created_at).toLocaleString()}
        </div>
        <div className="text-xs mt-2 flex items-center gap-2">
          <span className={statusColor}>{deployment.status}</span>
          <span className="text-xs text-slate-400">
            • {deployment.trigger_reason}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => nav(`/deployments/${deployment.id}`)}
          className="px-3 py-1 rounded-md bg-white border text-sm"
        >
          View
        </button>
      </div>
    </div>
  );
}
