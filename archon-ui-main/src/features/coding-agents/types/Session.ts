import type { McpServer, PromptInput, PromptResponse } from "./CodingAgent";

// Session status enum
export type SessionStatus = "creating" | "active" | "processing" | "cancelled" | "error";

// Session management types
export interface Session {
  id: string;
  working_directory: string;
  mcp_servers: McpServer[];
  created_at: string;
  status: SessionStatus;
}

export interface CreateSessionRequest {
  workingDirectory: string;
  mcpServers?: McpServer[];
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface LoadSessionRequest {
  sessionId: string;
  workingDirectory: string;
  mcpServers?: McpServer[];
}

// Prompt request/response
export interface PromptRequest {
  prompt: PromptInput;
}

// API Response wrappers
export interface ApiResponse<T> {
  data: T;
}

export interface EmptyApiResponse {
  data?: null;
}

// Specific API response types
export interface InitializeApiResponse extends ApiResponse<import("./CodingAgent").InitializeResponse> {}
export interface CreateSessionApiResponse extends ApiResponse<CreateSessionResponse> {}
export interface SessionApiResponse extends ApiResponse<Session> {}
export interface PromptApiResponse extends ApiResponse<PromptResponse> {}

// Message types for chat interface
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  status?: "sending" | "sent" | "error";
  stopReason?: string;
}