import { useEffect } from "react";
import { useCodingAgentChat, useCodingAgentSession } from "../hooks";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { SessionStatus } from "./SessionStatus";

interface ChatInterfaceProps {
  workingDirectory: string;
}

export function ChatInterface({ workingDirectory }: ChatInterfaceProps) {
  const {
    currentSessionId,
    session,
    isSessionLoading,
    createSession,
    cancelSession,
    isCreatingSession,
    isCancellingSession,
  } = useCodingAgentSession();

  const {
    messages,
    isProcessing,
    sendMessage,
    clearMessages,
  } = useCodingAgentChat(currentSessionId);

  // Create session when working directory is set
  useEffect(() => {
    if (workingDirectory && !currentSessionId && !isCreatingSession) {
      createSession({ 
        workingDirectory,
        mcpServers: [] // Explicitly pass empty array for now
      });
    }
  }, [workingDirectory, currentSessionId, isCreatingSession, createSession]);

  // Clear messages when session changes
  useEffect(() => {
    if (currentSessionId) {
      clearMessages();
    }
  }, [currentSessionId, clearMessages]);

  const handleCancel = () => {
    if (currentSessionId && !isCancellingSession) {
      cancelSession();
    }
  };

  const isDisabled = !currentSessionId || 
    session?.status === "error" || 
    session?.status === "cancelled" ||
    isSessionLoading ||
    isCreatingSession;

  return (
    <div className="flex flex-col h-full bg-gray-900/50 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header with session status */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 bg-gray-900/30">
        <h3 className="text-lg font-semibold text-gray-100">Coding Agent Chat</h3>
        <SessionStatus 
          status={session?.status} 
          sessionId={currentSessionId}
        />
      </div>

      {/* Messages area */}
      <MessageList 
        messages={messages} 
        isProcessing={isProcessing}
      />

      {/* Input area */}
      <MessageInput
        onSend={sendMessage}
        onCancel={handleCancel}
        disabled={isDisabled}
        isProcessing={isProcessing}
        placeholder={
          !workingDirectory
            ? "Select a working directory first..."
            : isCreatingSession
            ? "Creating session..."
            : session?.status === "error"
            ? "Session error - please refresh"
            : session?.status === "cancelled"
            ? "Session cancelled - please refresh"
            : "Ask the coding agent to help with your code..."
        }
      />
    </div>
  );
}