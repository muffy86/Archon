import { useState } from "react";
import { Code2, Terminal } from "lucide-react";
import { useInitializeCodingAgent } from "../hooks";
import { ChatInterface } from "../components/ChatInterface";
import { FolderSelector } from "../components/FolderSelector";
import { Button } from "../../ui/primitives/button";

export function CodingAgentsView() {
  const [workingDirectory, setWorkingDirectory] = useState("");
  const [isSessionStarted, setIsSessionStarted] = useState(false);

  // Initialize the coding agent connection
  const { data: initData, isLoading: isInitializing, error: initError } = useInitializeCodingAgent();

  const handleStartSession = () => {
    // Validate that it's an absolute path
    if (workingDirectory && workingDirectory.startsWith('/')) {
      setIsSessionStarted(true);
    } else {
      alert('Please enter a full absolute path starting with "/"\n\nExample: /Users/username/Projects/myproject');
    }
  };

  const handleReset = () => {
    setIsSessionStarted(false);
    setWorkingDirectory("");
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <Terminal className="h-12 w-12 mx-auto text-cyan-500 animate-pulse" />
          <p className="text-gray-400">Initializing coding agent...</p>
        </div>
      </div>
    );
  }

  if (initError) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-md">
          <Terminal className="h-12 w-12 mx-auto text-red-500" />
          <p className="text-gray-300">Failed to initialize coding agent</p>
          <p className="text-sm text-gray-500">
            {initError instanceof Error ? initError.message : "Unknown error"}
          </p>
          <p className="text-xs text-gray-600">
            Make sure the ACP backend is running on localhost:3001
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
            <Code2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Coding Agent</h1>
            <p className="text-sm text-gray-400">
              AI-powered coding assistant for your projects
            </p>
          </div>
        </div>
        
        {isSessionStarted && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50"
          >
            Change Directory
          </Button>
        )}
      </div>

      {/* Protocol info */}
      {initData && (
        <div className="bg-gray-900/30 border border-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="text-gray-400">
                Protocol v{initData.protocolVersion}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">
                Image support: {initData.capabilities.promptCapabilities.image ? "✓" : "✗"}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-400">
                Context: {initData.capabilities.promptCapabilities.embeddedContext ? "✓" : "✗"}
              </span>
              {initData.capabilities.promptCapabilities.audio && (
                <>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-400">Audio: ✓</span>
                </>
              )}
            </div>
            {initData.clientCapabilities && (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">
                  File read: {initData.clientCapabilities.fs.readTextFile ? "✓" : "✗"}
                </span>
                <span className="text-gray-400">
                  File write: {initData.clientCapabilities.fs.writeTextFile ? "✓" : "✗"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {!isSessionStarted ? (
          <div className="h-full flex items-center justify-center">
            <div className="max-w-md w-full space-y-6">
              <div className="text-center space-y-2">
                <Terminal className="h-16 w-16 mx-auto text-cyan-500 opacity-50" />
                <h2 className="text-xl font-semibold text-gray-100">
                  Select a Working Directory
                </h2>
                <p className="text-sm text-gray-400">
                  Choose the folder where the coding agent will work on your project
                </p>
              </div>

              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
                <FolderSelector
                  value={workingDirectory}
                  onChange={setWorkingDirectory}
                  label="Target Directory"
                  placeholder="/path/to/your/project"
                />

                <Button
                  onClick={handleStartSession}
                  disabled={!workingDirectory || !workingDirectory.startsWith('/')}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Start Coding Session
                </Button>
              </div>

              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>The agent will have access to read and modify files in this directory</p>
                <p>Make sure to choose the correct project folder</p>
              </div>
            </div>
          </div>
        ) : (
          <ChatInterface workingDirectory={workingDirectory} />
        )}
      </div>
    </div>
  );
}