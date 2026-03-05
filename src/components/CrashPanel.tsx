import { useState, useCallback } from "react";
import TerminalLog, { type LogEntry } from "./TerminalLog";

const CrashPanel = () => {
  const [realmId, setRealmId] = useState("");
  const [crashLoop, setCrashLoop] = useState("10");
  const [timeDelay, setTimeDelay] = useState("1000");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour12: false });
  };

  const addLog = useCallback((text: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [...prev, { text, type, timestamp: getTimestamp() }]);
  }, []);

  const handleCrash = async () => {
    if (!realmId.trim()) {
      addLog("ERROR: Realm ID is required!", "error");
      return;
    }

    setIsRunning(true);
    setLogs([]);

    addLog("Initializing crash sequence...", "info");
    await delay(500);
    addLog(`Connecting to Realm "${realmId}"...`, "info");
    await delay(800);
    addLog(`Joined Realm "${realmId}"`, "success");
    await delay(300);
    addLog(`Crash loop: ${crashLoop} iterations`, "info");
    addLog(`Time delay: ${timeDelay}ms`, "info");
    await delay(400);

    const loops = parseInt(crashLoop) || 10;
    const delayMs = parseInt(timeDelay) || 1000;

    for (let i = 1; i <= loops; i++) {
      addLog(`Executing crash loop ${i}/${loops}...`, "warn");
      await delay(delayMs / 3);
      addLog(`Payload delivered [loop ${i}]`, "success");
      if (i < loops) await delay(delayMs / 2);
    }

    await delay(500);
    addLog("Crash sequence completed.", "success");
    addLog(`Total iterations: ${loops}`, "info");
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto p-4 h-[calc(100vh-5rem)]">
      {/* Controls */}
      <div className="flex flex-col gap-4 w-full lg:w-80 shrink-0">
        <div className="rounded border border-border bg-card p-5 space-y-4">
          <h2 className="font-display text-sm tracking-[0.2em] text-foreground text-glow uppercase">
            Configuration
          </h2>

          <FieldInput label="Realm ID" value={realmId} onChange={setRealmId} placeholder="Enter realm ID..." />
          <FieldInput label="Crash Loop" value={crashLoop} onChange={setCrashLoop} placeholder="10" />
          <FieldInput label="Time Delay (ms)" value={timeDelay} onChange={setTimeDelay} placeholder="1000" />

          <button
            onClick={handleCrash}
            disabled={isRunning}
            className={`w-full py-2.5 rounded font-display text-sm tracking-widest uppercase transition-all duration-200 ${
              isRunning
                ? "bg-secondary text-muted-foreground cursor-not-allowed"
                : "bg-destructive text-destructive-foreground glow-destructive hover:brightness-110 active:scale-[0.98]"
            }`}
          >
            {isRunning ? "Running..." : "Crash"}
          </button>
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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default CrashPanel;
