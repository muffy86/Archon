import { Bot, User, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "../types";

interface MessageListProps {
  messages: ChatMessage[];
  isProcessing?: boolean;
}

export function MessageList({ messages, isProcessing = false }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getStatusIcon = (status?: ChatMessage["status"]) => {
    switch (status) {
      case "sending":
        return <Clock className="h-3 w-3 animate-pulse" />;
      case "sent":
        return <CheckCircle className="h-3 w-3" />;
      case "error":
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isProcessing && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <Bot className="h-12 w-12 mb-4 opacity-50" />
          <p className="text-sm">Start a conversation with the coding agent</p>
          <p className="text-xs mt-2">Select a working directory and send a message to begin</p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          {message.role === "assistant" && (
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Bot className="h-5 w-5 text-white" />
              </div>
            </div>
          )}

          <div
            className={`max-w-[70%] ${
              message.role === "user" ? "order-1" : ""
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-blue-600/20 border border-blue-500/30 text-gray-100"
                  : "bg-gray-800/50 border border-gray-700 text-gray-100"
              }`}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {message.content}
              </pre>
              {message.stopReason && (
                <p className="text-xs text-gray-500 mt-2">
                  Status: {message.stopReason}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 px-1">
              <span className="text-xs text-gray-500">
                {formatTimestamp(message.timestamp)}
              </span>
              {message.status && getStatusIcon(message.status)}
            </div>
          </div>

          {message.role === "user" && (
            <div className="flex-shrink-0 order-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}

      {isProcessing && (
        <div className="flex gap-3 justify-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2">
            <div className="flex gap-1">
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}