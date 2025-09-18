import { Send, Square } from "lucide-react";
import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Button } from "../../ui/primitives/button";

interface MessageInputProps {
  onSend: (message: string) => void;
  onCancel?: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onCancel,
  disabled = false,
  isProcessing = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled && !isProcessing) {
      onSend(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-gray-700 bg-gray-900/50 p-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || isProcessing}
            placeholder={placeholder}
            className="w-full min-h-[44px] max-h-[200px] px-4 py-2.5 pr-12 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 resize-none"
            rows={1}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500">
            {message.length > 0 && `${message.length} chars`}
          </div>
        </div>
        
        {isProcessing ? (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={onCancel}
            className="h-[44px] w-[44px]"
            title="Cancel operation"
          >
            <Square className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="h-[44px] px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message (Enter)"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        Press <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Enter</kbd> to send,{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-800 border border-gray-700 rounded">Shift+Enter</kbd> for new line
      </div>
    </div>
  );
}