import { useEffect, useRef } from "react";

interface LogEntry {
  text: string;
  type: "info" | "success" | "error" | "warn";
  timestamp: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog = ({ logs }: TerminalLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "success": return "text-primary";
      case "error": return "text-destructive";
      case "warn": return "text-accent";
      case "info":
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col h-full rounded border border-border bg-background overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-secondary">
        <div className="w-2 h-2 rounded-full bg-destructive" />
        <div className="w-2 h-2 rounded-full bg-accent" />
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span className="ml-2 text-xs font-display tracking-widest text-muted-foreground uppercase">
          Terminal
        </span>
      </div>
      <div ref={scrollRef} className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <p className="text-muted-foreground opacity-50">
            {">"} Waiting for execution...
          </p>
        )}
        {logs.map((log, i) => (
          <div key={i} className="flex gap-2">
            <span className="text-muted-foreground shrink-0">[{log.timestamp}]</span>
            <span className={getColor(log.type)}>{log.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export type { LogEntry };
export default TerminalLog;
