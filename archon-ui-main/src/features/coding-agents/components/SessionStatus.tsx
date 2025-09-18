import { Activity, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import type { SessionStatus as SessionStatusType } from "../types";

interface SessionStatusProps {
  status: SessionStatusType | undefined;
  sessionId?: string | null;
  className?: string;
}

export function SessionStatus({ status, sessionId, className = "" }: SessionStatusProps) {
  const getStatusConfig = (status?: SessionStatusType) => {
    switch (status) {
      case "creating":
        return {
          icon: <Clock className="h-4 w-4 animate-pulse" />,
          text: "Creating session...",
          color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
        };
      case "active":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: "Session active",
          color: "text-green-400 bg-green-400/10 border-green-400/30",
        };
      case "processing":
        return {
          icon: <Activity className="h-4 w-4 animate-pulse" />,
          text: "Processing...",
          color: "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
        };
      case "cancelled":
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: "Session cancelled",
          color: "text-gray-400 bg-gray-400/10 border-gray-400/30",
        };
      case "error":
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: "Session error",
          color: "text-red-400 bg-red-400/10 border-red-400/30",
        };
      default:
        return {
          icon: <Activity className="h-4 w-4 opacity-50" />,
          text: "No active session",
          color: "text-gray-500 bg-gray-500/10 border-gray-500/30",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.color}`}
      >
        {config.icon}
        <span className="text-sm font-medium">{config.text}</span>
      </div>
      {sessionId && status === "active" && (
        <span className="text-xs text-gray-500 font-mono">
          ID: {sessionId.slice(0, 8)}...
        </span>
      )}
    </div>
  );
}