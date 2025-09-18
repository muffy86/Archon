/**
 * Agent Client Protocol (ACP) Service
 * Handles all communication with the ACP backend running on localhost:3001
 */

import type {
  CreateSessionApiResponse,
  CreateSessionRequest,
  EmptyApiResponse,
  InitializeApiResponse,
  LoadSessionRequest,
  PromptApiResponse,
  PromptRequest,
  SessionApiResponse,
} from "../types";

// Direct connection to ACP backend (CORS is configured to allow all origins)
// ACP backend URL is configurable via environment variable VITE_ACP_BASE_URL (default: http://localhost:3001)
const ACP_BASE_URL = import.meta.env.VITE_ACP_BASE_URL || "http://localhost:3001";

class AcpService {
  private baseUrl: string;

  constructor(baseUrl: string = ACP_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      // Try to parse error as JSON for better error messages
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        } else if (errorJson.message) {
          errorMessage = errorJson.message;
        }
      } catch {
        // If not JSON, use the text as-is
        if (errorText) {
          errorMessage = errorText;
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  /**
   * Initialize the ACP connection
   */
  async initialize(): Promise<InitializeApiResponse> {
    return this.request<InitializeApiResponse>("/api/initialize", {
      method: "POST",
    });
  }

  /**
   * Create a new session
   */
  async createSession(
    request: CreateSessionRequest,
  ): Promise<CreateSessionApiResponse> {
    return this.request<CreateSessionApiResponse>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Load an existing session
   */
  async loadSession(request: LoadSessionRequest): Promise<EmptyApiResponse> {
    return this.request<EmptyApiResponse>("/api/sessions/load", {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<SessionApiResponse> {
    return this.request<SessionApiResponse>(`/api/sessions/${sessionId}`);
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<SessionApiResponse> {
    return this.request<SessionApiResponse>(
      `/api/sessions/${sessionId}/status`,
    );
  }

  /**
   * Send a prompt to a session
   */
  async sendPrompt(
    sessionId: string,
    request: PromptRequest,
  ): Promise<PromptApiResponse> {
    console.log("[ACP] Sending prompt request:", JSON.stringify(request, null, 2));
    return this.request<PromptApiResponse>(
      `/api/sessions/${sessionId}/prompt`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
  }

  /**
   * Cancel a session
   */
  async cancelSession(sessionId: string): Promise<EmptyApiResponse> {
    return this.request<EmptyApiResponse>(
      `/api/sessions/${sessionId}/cancel`,
      {
        method: "POST",
      },
    );
  }
}

export const acpService = new AcpService();