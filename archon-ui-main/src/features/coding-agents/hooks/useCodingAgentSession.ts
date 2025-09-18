import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "../../ui/hooks/useToast";
import { acpService } from "../services";
import type {
  CreateSessionRequest,
  InitializeResponse,
  LoadSessionRequest,
  Session,
} from "../types";

// Query keys factory
export const codingAgentKeys = {
  all: ["coding-agent"] as const,
  initialize: () => [...codingAgentKeys.all, "initialize"] as const,
  sessions: () => [...codingAgentKeys.all, "sessions"] as const,
  session: (id: string) => [...codingAgentKeys.sessions(), id] as const,
  sessionStatus: (id: string) => [...codingAgentKeys.session(id), "status"] as const,
};

/**
 * Hook to initialize the ACP connection
 */
export function useInitializeCodingAgent() {
  return useQuery<InitializeResponse>({
    queryKey: codingAgentKeys.initialize(),
    queryFn: async () => {
      const response = await acpService.initialize();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}

/**
 * Hook to manage coding agent sessions
 */
export function useCodingAgentSession() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Query for current session
  const sessionQuery = useQuery<Session>({
    queryKey: currentSessionId ? codingAgentKeys.session(currentSessionId) : ["no-session"],
    queryFn: async () => {
      if (!currentSessionId) throw new Error("No session ID");
      try {
        const response = await acpService.getSession(currentSessionId);
        return response.data;
      } catch (error) {
        // If session not found (404), clear the invalid session ID
        if (error instanceof Error && error.message.includes("404")) {
          setCurrentSessionId(null);
          showToast("Session expired. Please create a new session.", "info");
        }
        throw error;
      }
    },
    enabled: !!currentSessionId,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (session doesn't exist)
      if (error instanceof Error && error.message.includes("404")) {
        return false;
      }
      // Retry other errors up to 3 times
      return failureCount < 3;
    },
    refetchInterval: (data) => {
      // Poll more frequently when session is processing
      if (data?.status === "processing" || data?.status === "creating") {
        return 1000; // 1 second
      }
      return false; // Don't poll otherwise
    },
  });

  // Mutation to create a new session
  const createSessionMutation = useMutation({
    mutationFn: async (request: CreateSessionRequest) => {
      const response = await acpService.createSession(request);
      return response.data;
    },
    onSuccess: (data) => {
      setCurrentSessionId(data.sessionId);
      showToast("Session created successfully", "success");
      // Invalidate session queries
      queryClient.invalidateQueries({ queryKey: codingAgentKeys.sessions() });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to create session";
      showToast(message, "error");
    },
  });

  // Mutation to load an existing session
  const loadSessionMutation = useMutation({
    mutationFn: async (request: LoadSessionRequest) => {
      await acpService.loadSession(request);
      return request.sessionId;
    },
    onSuccess: (sessionId) => {
      setCurrentSessionId(sessionId);
      showToast("Session loaded successfully", "success");
      queryClient.invalidateQueries({ queryKey: codingAgentKeys.session(sessionId) });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to load session";
      showToast(message, "error");
    },
  });

  // Mutation to cancel the current session
  const cancelSessionMutation = useMutation({
    mutationFn: async () => {
      if (!currentSessionId) throw new Error("No active session");
      await acpService.cancelSession(currentSessionId);
      return currentSessionId;
    },
    onSuccess: (sessionId) => {
      showToast("Session cancelled", "info");
      queryClient.invalidateQueries({ queryKey: codingAgentKeys.session(sessionId) });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Failed to cancel session";
      showToast(message, "error");
    },
  });

  return {
    // State
    currentSessionId,
    session: sessionQuery.data,
    isSessionLoading: sessionQuery.isLoading,
    sessionError: sessionQuery.error,

    // Actions
    createSession: createSessionMutation.mutate,
    loadSession: loadSessionMutation.mutate,
    cancelSession: cancelSessionMutation.mutate,
    
    // Loading states
    isCreatingSession: createSessionMutation.isPending,
    isLoadingSession: loadSessionMutation.isPending,
    isCancellingSession: cancelSessionMutation.isPending,
  };
}