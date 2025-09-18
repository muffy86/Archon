import { Folder, FolderOpen } from "lucide-react";
import { useState, useRef } from "react";
import { Button } from "../../ui/primitives/button";
import { Input } from "../../ui/primitives/input";

interface FolderSelectorProps {
  value: string;
  onChange: (path: string) => void;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
}

export function FolderSelector({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter full absolute path (e.g., /Users/name/Projects/myproject)",
  label = "Working Directory",
}: FolderSelectorProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle folder selection via file input
  const handleFolderSelect = () => {
    // Create a hidden input element for folder selection
    const input = document.createElement("input");
    input.type = "file";
    input.webkitdirectory = true;
    input.directory = true;
    
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // Extract the folder path from the first file
        const path = files[0].webkitRelativePath || files[0].path || "";
        const folderPath = path.split("/")[0];
        
        // Browser security prevents getting the full path
        // Only the folder name is available, which isn't enough
        // Show a message to the user
        const folderName = folderPath || "selected folder";
        alert(`Browser security prevents accessing the full path.\n\nPlease manually enter the complete path to "${folderName}" in the input field.\n\nExample: /Users/username/Projects/${folderName}`);
        // Don't update with just the folder name as it won't work
        // onChange(folderPath || value);
      }
      setIsSelecting(false);
    };

    input.oncancel = () => {
      setIsSelecting(false);
    };

    setIsSelecting(true);
    input.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-300">
          {label}
        </label>
      )}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Folder className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || isSelecting}
            placeholder={placeholder}
            className="pl-10 bg-gray-900/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleFolderSelect}
          disabled={disabled || isSelecting}
          className="bg-gray-900/50 border-gray-700 hover:bg-gray-800/50"
          title="Browse for folder"
        >
          <FolderOpen className="h-4 w-4" />
        </Button>
      </div>
      {value && (
        <p className="text-xs text-gray-500">
          Selected: <span className="text-gray-400 font-mono">{value}</span>
        </p>
      )}
    </div>
  );
}

// Add type declarations for webkitdirectory
declare module "react" {
  interface InputHTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    webkitdirectory?: boolean;
    directory?: boolean;
  }
}