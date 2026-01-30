import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Link, 
  FileText, 
  Plus,
  X,
  Loader2,
  Sparkles
} from "lucide-react";
import { KnowledgeItemType, inferTypeFromUrl } from "@/types/knowledge";

interface QuickDumpProps {
  onDump: (data: { type: KnowledgeItemType; content?: string; url?: string; title?: string }) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export const QuickDump = ({ onDump, isLoading, className }: QuickDumpProps) => {
  const [mode, setMode] = useState<"collapsed" | "link" | "note">("collapsed");
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("");

  const handleSubmit = async () => {
    if (!input.trim()) return;

    if (mode === "link") {
      const type = inferTypeFromUrl(input);
      await onDump({ type, url: input.trim(), title: title.trim() || undefined });
    } else {
      await onDump({ type: "note", content: input.trim(), title: title.trim() || undefined });
    }

    setInput("");
    setTitle("");
    setMode("collapsed");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.metaKey) {
      handleSubmit();
    }
  };

  if (mode === "collapsed") {
    return (
      <div className={cn("space-y-3", className)}>
        <p className="text-sm text-muted-foreground">
          Dump something. Trajectory will organize it.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setMode("link")}
          >
            <Link className="w-4 h-4" />
            Add Link
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => setMode("note")}
          >
            <FileText className="w-4 h-4" />
            Add Note
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 p-4 rounded-xl border border-border bg-card", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {mode === "link" ? <Link className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
          <span>{mode === "link" ? "Add a link" : "Add a note"}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            setMode("collapsed");
            setInput("");
            setTitle("");
          }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-background"
      />

      {mode === "link" ? (
        <Input
          placeholder="Paste URL..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-background"
          autoFocus
        />
      ) : (
        <Textarea
          placeholder="Write your note..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-background min-h-[100px] resize-none"
          autoFocus
        />
      )}

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI will extract insights & prioritize
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Save
        </Button>
      </div>
    </div>
  );
};
