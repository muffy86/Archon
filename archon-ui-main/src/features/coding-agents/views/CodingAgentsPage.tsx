import { ErrorBoundary } from "react-error-boundary";
import { CodingAgentsView } from "./CodingAgentsView";
import { AlertCircle } from "lucide-react";
import { Button } from "../../ui/primitives/button";

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center space-y-4 max-w-md">
        <AlertCircle className="h-12 w-12 mx-auto text-red-500" />
        <h2 className="text-xl font-semibold text-gray-100">Something went wrong</h2>
        <p className="text-sm text-gray-400">{error.message}</p>
        <Button 
          onClick={resetErrorBoundary}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
        >
          Try again
        </Button>
      </div>
    </div>
  );
}

export function CodingAgentsPage() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <CodingAgentsView />
    </ErrorBoundary>
  );
}