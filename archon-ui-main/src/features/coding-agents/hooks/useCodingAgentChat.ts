import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef } from "react";
import { useToast } from "../../ui/hooks/useToast";
import { acpService } from "../services";
import type { ChatMessage, PromptInput, PromptResponse } from "../types";
import { codingAgentKeys } from "./useCodingAgentSession";

/**
 * Hook to manage chat interactions with the coding agent
 */
export function useCodingAgentChat(sessionId: string | null) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messageIdCounter = useRef(0);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  }, []);

  // Add a message to the chat
  const addMessage = useCallback((
    role: ChatMessage["role"],
    content: string,
    stopReason?: string,
  ) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      role,
      content,
      timestamp: new Date().toISOString(),
      status: role === "user" ? "sent" : undefined,
      stopReason,
    };

    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, [generateMessageId]);

  // Update message status
  const updateMessageStatus = useCallback((
    messageId: string,
    status: ChatMessage["status"],
  ) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, status } : msg,
      ),
    );
  }, []);

  // Send prompt mutation
  const sendPromptMutation = useMutation({
    mutationFn: async (prompt: PromptInput) => {
      if (!sessionId) throw new Error("No active session");
      
      const response = await acpService.sendPrompt(sessionId, { prompt });
      return response.data;
    },
    onMutate: async (prompt) => {
      setIsProcessing(true);
      
      // Add user message
      const content = typeof prompt === "string" 
        ? prompt 
        : prompt.map(block => block.text || block.title || "").join("\n");
      
      const userMessage = addMessage("user", content);
      updateMessageStatus(userMessage.id, "sending");
      
      return { userMessageId: userMessage.id };
    },
    onSuccess: (data: PromptResponse, _variables, context) => {
      // Update user message status
      if (context?.userMessageId) {
        updateMessageStatus(context.userMessageId, "sent");
      }
      
      // Add assistant response
      const responseContent = data.stopReason === "error"
        ? "An error occurred while processing your request."
        : "Task completed successfully.";
      
      addMessage("assistant", responseContent, data.stopReason);
      
      // Invalidate session status to get updated state
      queryClient.invalidateQueries({ 
        queryKey: codingAgentKeys.sessionStatus(sessionId!),
      });
    },
    onError: (error, _variables, context) => {
      // Update user message status
      if (context?.userMessageId) {
        updateMessageStatus(context.userMessageId, "error");
      }
      
      const message = error instanceof Error ? error.message : "Failed to send prompt";
      
      // Check if it's a session-related error
      if (message.includes("404") || message.includes("Session not found")) {
        addMessage("assistant", "Session expired. Please refresh to create a new session.");
        showToast("Session expired. Creating new session...", "info");
      } else if (message.includes("Session did not end in result")) {
        addMessage("assistant", "The AI agent failed to process your request. This might be due to a configuration issue with the ACP backend.");
        showToast("AI processing error. Check ACP backend configuration.", "error");
      } else {
        addMessage("assistant", `Error: ${message}`);
        showToast(message, "error");
      }
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
    messageIdCounter.current = 0;
  }, []);

  // Send a text prompt
  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    // Convert plain text to content block format expected by backend
    const contentBlocks = [
      {
        type: "text",
        text: text,
      },
    ];
    sendPromptMutation.mutate(contentBlocks);
  }, [sendPromptMutation]);

  return {
    // State
    messages,
    isProcessing: isProcessing || sendPromptMutation.isPending,
    
    // Actions
    sendMessage,
    sendPrompt: sendPromptMutation.mutate,
    clearMessages,
    
    // Utilities
    addMessage,
    updateMessageStatus,
  };
}