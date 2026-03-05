import { useState, useCallback, useRef, useEffect } from "react";
import TerminalLog, { type LogEntry } from "./TerminalLog";

const BACKEND_URL_KEY = "crash-tool-backend-url";

const CrashPanel = () => {
  const [realmInput, setRealmInput] = useState("");
  const [crashLoop, setCrashLoop] = useState("10");
  const [backendUrl, setBackendUrl] = useState(() => localStorage.getItem(BACKEND_URL_KEY) || "http://localhost:3001");
  const [showSettings, setShowSettings] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { text, type, timestamp: getTimestamp() }]);
  }, []);

  // Check backend status
  const checkBackend = useCallback(async () => {
    try {
      const res = await fetch(`${backendUrl}/api/status`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        setBackendOnline(data.online);
      } else {
        setBackendOnline(false);
      }
    } catch {
      setBackendOnline(false);
    }
  }, [backendUrl]);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  const saveBackendUrl = (url: string) => {
    setBackendUrl(url);
    localStorage.setItem(BACKEND_URL_KEY, url);
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleCrash = async () => {
    if (!realmInput.trim()) {
      addLog("ERROR: Realm code or ID is required!", "error");
      return;
    }

    if (!backendOnline) {
      addLog("ERROR: Backend is offline. Check your backend URL in settings.", "error");
      return;
    }

    setIsRunning(true);
    setLogs([]);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    addLog("Connecting to backend...", "info");

    try {
      const url = `${backendUrl}/api/crash/start?realmInput=${encodeURIComponent(realmInput.trim())}&loops=${encodeURIComponent(crashLoop)}`;
      const response = await fetch(url, { signal: controller.signal });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Unknown error" }));
        addLog(`Backend error: ${err.error}`, "error");
        setIsRunning(false);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        addLog("Failed to open log stream.", "error");
        setIsRunning(false);
        return;
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              addLog(data.text, data.type as LogEntry["type"]);
            } catch {
              // skip malformed
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") {
        addLog("⚠ Crash sequence aborted by user.", "warn");
      } else {
        addLog(`Connection error: ${err.message}`, "error");
      }
    }

    setIsRunning(false);
    abortControllerRef.current = null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto p-4 h-[calc(100vh-8rem)]">
      {/* Controls */}
      <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
        <div className="rounded border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm tracking-[0.2em] text-foreground text-glow uppercase">
              Configuration
            </h2>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
              title="Settings"
            >
              ⚙
            </button>
          </div>

          {showSettings && (
            <div className="space-y-1.5 p-3 rounded bg-secondary border border-border">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Backend URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => saveBackendUrl(e.target.value)}
                placeholder="http://localhost:3001"
                className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              />
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-primary" : backendOnline === false ? "bg-destructive" : "bg-muted-foreground"}`} />
                <span className="text-xs font-mono text-muted-foreground">
                  {backendOnline ? "Backend online" : backendOnline === false ? "Backend offline" : "Checking..."}
                </span>
                <button
                  onClick={checkBackend}
                  className="text-xs font-mono text-primary hover:underline ml-auto"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          <FieldInput
            label="Realm Code / ID"
            value={realmInput}
            onChange={setRealmInput}
            placeholder="Enter realm code or ID..."
          />
          <FieldInput
            label="Crash Loops"
            value={crashLoop}
            onChange={setCrashLoop}
            placeholder="10"
          />

          <div className="flex gap-2">
            <button
              onClick={handleCrash}
              disabled={isRunning}
              className={`flex-1 py-2.5 rounded font-display text-sm tracking-widest uppercase transition-all duration-200 ${
                isRunning
                  ? "bg-secondary text-muted-foreground cursor-not-allowed"
                  : "bg-destructive text-destructive-foreground glow-destructive hover:brightness-110 active:scale-[0.98]"
              }`}
            >
              {isRunning ? "Running..." : "Crash"}
            </button>
            {isRunning && (
              <button
                onClick={handleStop}
                className="px-4 py-2.5 rounded font-display text-sm tracking-widest uppercase bg-accent text-accent-foreground hover:brightness-110 active:scale-[0.98] transition-all duration-200"
              >
                Stop
              </button>
            )}
          </div>

          {/* Backend status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${backendOnline ? "bg-primary animate-pulse" : "bg-destructive"}`} />
            <span className="text-xs font-mono text-muted-foreground">
              {backendOnline ? "Backend connected" : "Backend disconnected"}
            </span>
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div className="flex-1 min-h-[300px]">
        <TerminalLog logs={logs} />
      </div>
    </div>
  );
};

const FieldInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
    />
  </div>
);

export default CrashPanel;
