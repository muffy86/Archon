// Agent capabilities and initialization types

export interface AgentCapabilitiesResponse {
  loadSession?: boolean | null;
  promptCapabilities: PromptCapabilitiesResponse;
}

export interface PromptCapabilitiesResponse {
  image: boolean;
  embeddedContext: boolean;
  audio?: boolean | null;
}

export interface ClientCapabilitiesResponse {
  fs: FsCapabilitiesResponse;
}

export interface FsCapabilitiesResponse {
  readTextFile: boolean;
  writeTextFile: boolean;
}

export interface InitializeResponse {
  protocolVersion: number;
  capabilities: AgentCapabilitiesResponse;
  clientCapabilities?: ClientCapabilitiesResponse | null;
}

// Content and prompt types
export interface ContentBlock {
  type: string;
  text?: string | null;
  data?: string | null;
  description?: string | null;
  mimeType?: string | null;
  name?: string | null;
  resource?: any | null;
  size?: number | null;
  title?: string | null;
  uri?: string | null;
}

export type PromptInput = string | ContentBlock[];

export interface PromptResponse {
  stopReason: string;
}

// MCP Server configuration
export interface EnvVariable {
  name: string;
  value: string;
}

export interface McpServer {
  name: string;
  command: string;
  args: string[];
  env: EnvVariable[];
}