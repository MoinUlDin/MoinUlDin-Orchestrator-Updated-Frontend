// src/pages/DeploymentLogs.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  DownloadCloud,
  RefreshCw,
  Pause,
  Play,
  Square,
  Maximize2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  PlayIcon,
} from "lucide-react";
import ProjectManagement from "../services/ProjectManagement";
import {
  type DeploymentForLogsType,
  type DeploymentLogsType,
  type DeploymentsStepsType,
} from "../utils/types";
import toast from "react-hot-toast";

type Step = {
  key?: string;
  name: string;
  status?: "pending" | "running" | "success" | "failed" | "skipped";
  timestamp?: string | null;
  message?: string | null;
};

const parseApiResponse = (data: DeploymentForLogsType) => {
  let logs: string[] = [];
  let deployment: DeploymentForLogsType = data;
  let steps: Step[] = [];
  let progress = 0;

  if (!data) return { logs, deployment, steps, progress };

  // Handle the new response format
  if (data.logs && Array.isArray(data.logs)) {
    // Convert log entries to formatted strings
    logs = data.logs.map((log: DeploymentLogsType) => {
      const timestamp = new Date(log.ts).toLocaleString();
      return `[${timestamp}] [${log.type?.toUpperCase()}] ${log.message}`;
    });

    // Convert steps to the required format
    if (data.steps && Array.isArray(data.steps)) {
      steps = data.steps.map((step: DeploymentsStepsType) => ({
        key: step.step_key,
        name: step.step_key,
        status: step.status,
        timestamp: step.ended_at,
        message: step.message,
        order: step.order,
      }));
    }

    // Calculate progress based on steps
    if (data.steps && data.steps.length > 0) {
      const completedSteps = data.steps.filter(
        (step) =>
          step.status === "success" ||
          step.status === "failed" ||
          step.status === "skipped"
      ).length;
      progress = Math.round((completedSteps / data.steps.length) * 100);
    }

    return { logs, deployment, steps, progress };
  }

  return { logs, deployment, steps, progress };
};

const formatTime = (iso?: string | null) => {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const filterLogLine = (line: string, level: string) => {
  if (level === "ALL") return true;
  const l = line.toLowerCase();
  if (level === "INFO") return l.includes("[info]") || l.includes("info:");
  if (level === "SUCCESS")
    return l.includes("[success]") || l.includes("success:");
  if (level === "ERROR")
    return (
      l.includes("[error]") ||
      l.includes("error:") ||
      l.includes("[fail") ||
      l.includes("traceback")
    );
  return true;
};

const StepsList: React.FC<{ steps: Step[]; progress?: number }> = ({
  steps,
  progress = 0,
}) => {
  console.log("\n Seteps: ", steps);

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-sm ">Deployment Progress</h4>
        <div className="text-sm text-gray-500">{progress}%</div>
      </div>

      <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
        <div className="h-2 bg-black" style={{ width: `${progress}%` }} />
      </div>

      <ol className="mt-4 space-y-3">
        {steps && steps.length > 0 ? (
          steps.map((s, idx) => {
            const state = s.status || "pending";
            const icon =
              state === "success" ? (
                <CheckCircle className="text-green-500" />
              ) : state === "failed" || state === "skipped" ? (
                <XCircle className="text-red-500" />
              ) : state === "running" ? (
                <Loader2 className="animate-spin text-blue-500" />
              ) : (
                <Clock className="text-gray-400" />
              );

            return (
              <li
                key={`Steps-${s.key}-${idx}`}
                className="flex items-start gap-3"
              >
                <div className="mt-0.5">{icon}</div>
                <div className="flex-1 text-[12px]">
                  <div className="flex items-center justify-between">
                    <div className=" font-medium">{s.name}</div>
                    <div className="text-[10px] text-gray-400">
                      {formatTime(s.timestamp)}
                    </div>
                  </div>
                  {s.message && (
                    <div className="text-xs text-gray-500 mt-1">
                      {s.message}
                    </div>
                  )}
                </div>
              </li>
            );
          })
        ) : (
          <li className="text-sm text-gray-400">No step data available.</li>
        )}
      </ol>
    </div>
  );
};

const DeploymentLogs: React.FC = () => {
  const { slug, deploymentId } = useParams<{
    slug?: string;
    deploymentId?: string;
  }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deployment, setDeployment] = useState<DeploymentForLogsType | null>(
    null
  );
  const [steps, setSteps] = useState<Step[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const DELAYTIME = 10000;
  const [streaming, setStreaming] = useState<boolean>(true);
  const [paused, setPaused] = useState<boolean>(false);
  const [fullResponse, setFullResponse] =
    useState<DeploymentForLogsType | null>(null);
  const [filter, setFilter] = useState<"ALL" | "INFO" | "SUCCESS" | "ERROR">(
    "ALL"
  );

  const pollRef = useRef<number | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);

  const fetchLogs = async () => {
    if (!deploymentId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ProjectManagement.getDeploymentLogs(
        Number(deploymentId)
      );
      const {
        logs: newLogs,
        deployment: meta,
        steps: stepList,
        progress: prog,
      } = parseApiResponse(res);
      setFullResponse(res);
      console.log("Response for logs: ", res);
      setLogs(newLogs || []);
      setDeployment(meta || null);
      setSteps(stepList || []);
      if (typeof prog === "number" && prog >= 0) setProgress(prog);
    } catch (err: any) {
      console.error(err);
      setError(
        typeof err === "string" ? err : err?.message || "Failed to load logs"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(); // initial load

    // Polling only if streaming and not paused
    if (streaming && !paused) {
      pollRef.current = window.setInterval(() => {
        fetchLogs();
      }, DELAYTIME);
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentId, streaming, paused]);

  // scroll to bottom whenever logs change
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const onDownload = () => {
    const text = logs.join("\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const filename = `deployment-${deploymentId ?? "logs"}.log`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const onPauseToggle = () => {
    setPaused((p) => !p);
  };

  const onStreamingToggle = () => {
    setStreaming((s) => !s);
  };

  const onBack = () => {
    navigate(-1);
  };

  const handleResumeStop = () => {
    if (!deploymentId) return toast.error("deployment id not found");
    if (deployment?.status === "failed") {
      ProjectManagement.resumeDeployment(deploymentId)
        .then(() => {
          fetchLogs();
          toast.success("Deployment is now being resumed");
        })
        .catch((err) => {
          toast.error(err.message || "error occured");
        });
    } else {
      toast.success("random text ");
    }
  };
  const filteredLogs = logs.filter((l) => filterLogLine(l, filter));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <ChevronLeft size={18} /> Back to Project
          </button>
          <div>
            <h2 className="text-xl font-semibold">Production Deployment</h2>
            <div className="text-sm text-gray-500">
              {deployment?.id ? `Deployment #${deployment.id}` : "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white hover:shadow-sm"
            onClick={onDownload}
            title="Download Logs"
          >
            <DownloadCloud size={16} /> Download Logs
          </button>

          <button
            className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white hover:shadow-sm"
            onClick={() => {
              fetchLogs();
            }}
            title="Redeploy"
          >
            <RefreshCw size={16} /> Redeploy
          </button>

          <button
            className={`inline-flex  border rounded ${
              deployment?.status === "failed" ? "bg-blue-600" : "bg-red-600"
            }   text-white hover:bg-red-700`}
            onClick={() => {
              handleResumeStop();
            }}
            title={deployment?.status === "failed" ? "resume" : "stop"}
          >
            {deployment?.status === "failed" ? (
              <span className="flex items-center gap-2 px-3 py-1">
                <PlayIcon size={14} /> Resume
              </span>
            ) : (
              <span className="flex items-center gap-2 px-3 py-1">
                <Square size={14} /> Stop
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
          <StepsList steps={steps} progress={progress} />
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium">Live Logs</div>
              <div className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                Streaming
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border px-2 py-1 rounded text-sm"
                title="Filter logs"
              >
                <option value="ALL">All Logs</option>
                <option value="INFO">Info</option>
                <option value="SUCCESS">Success</option>
                <option value="ERROR">Error</option>
              </select>

              <button
                onClick={onPauseToggle}
                title={paused ? "Resume" : "Pause"}
                className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white"
              >
                {paused ? <Play size={14} /> : <Pause size={14} />}{" "}
                {paused ? "Resume" : "Pause"}
              </button>

              <button
                onClick={onStreamingToggle}
                title={streaming ? "Disable streaming" : "Enable streaming"}
                className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white"
              >
                {streaming ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Maximize2 size={14} />
                )}
                {streaming ? "Streaming" : "Polling"}
              </button>

              <button
                onClick={() => {
                  fetchLogs();
                }}
                title="Refresh"
                className="inline-flex items-center gap-2 px-3 py-1 border rounded bg-white"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-scroll  flex flex-col">
            <div
              ref={logsRef}
              className="flex-1 overflow-scroll max-h-[50rem] bg-slate-900 text-slate-100 rounded p-4 font-mono text-sm leading-5"
              style={{ minHeight: 300 }}
            >
              {loading && logs.length === 0 ? (
                <div className="text-gray-400">Loading logs...</div>
              ) : error ? (
                <div className="text-red-400">Error: {error}</div>
              ) : filteredLogs.length === 0 ? (
                <div className="text-gray-400">No logs available.</div>
              ) : (
                filteredLogs.map((line, idx) => {
                  const lower = line.toLowerCase();
                  let colorClass = "text-slate-200";
                  if (
                    lower.includes("[error]") ||
                    lower.includes("error") ||
                    lower.includes("traceback")
                  )
                    colorClass = "text-red-400";
                  else if (
                    lower.includes("[success]") ||
                    lower.includes("success")
                  )
                    colorClass = "text-green-400";
                  else if (lower.includes("[info]") || lower.includes("info"))
                    colorClass = "text-sky-300";
                  else if (lower.includes("warn") || lower.includes("warning"))
                    colorClass = "text-yellow-300";

                  return (
                    <div
                      key={idx}
                      className={`whitespace-pre-wrap ${colorClass}`}
                    >
                      {line}
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <div>Showing {filteredLogs.length} lines</div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(logs.join("\n"));
                  }}
                  className="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white text-sm"
                >
                  <FileText size={14} /> Copy
                </button>
                <button
                  onClick={() => {
                    const w = window.open("", "_blank", "noopener,noreferrer");
                    if (w) {
                      w.document.write(
                        "<pre>" +
                          logs.map((l) => escapeHtml(l)).join("\n") +
                          "</pre>"
                      );
                      w.document.title = `deployment-${deploymentId}-logs`;
                    }
                  }}
                  className="inline-flex items-center gap-2 px-2 py-1 border rounded bg-white text-sm"
                >
                  <Maximize2 size={14} /> Fullscreen
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function escapeHtml(unsafe: string) {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default DeploymentLogs;
