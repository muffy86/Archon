// Main exports for coding-agents feature
export { CodingAgentsView } from "./views/CodingAgentsView";
export { CodingAgentsPage } from "./views/CodingAgentsPage";

// Export hooks if needed by other features
export { 
  useInitializeCodingAgent, 
  useCodingAgentSession,
  useCodingAgentChat 
} from "./hooks";

// Export types if needed by other features
export type { 
  Session, 
  SessionStatus, 
  ChatMessage,
  InitializeResponse,
  AgentCapabilitiesResponse,
  PromptCapabilitiesResponse 
} from "./types";