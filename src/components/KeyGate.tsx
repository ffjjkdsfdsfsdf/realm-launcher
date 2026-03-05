import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_KEY = "CrasherUltimate";

interface KeyGateProps {
  onAuthenticated: (isAdmin: boolean) => void;
}

const KeyGate = ({ onAuthenticated }: KeyGateProps) => {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!key.trim()) {
      setError("Please enter a key.");
      return;
    }

    // Check admin key
    if (key.trim() === ADMIN_KEY) {
      onAuthenticated(true);
      return;
    }

    // Check DB for valid key
    setLoading(true);
    try {
      const { data, error: dbError } = await supabase
        .from("access_keys")
        .select("*")
        .eq("key_value", key.trim())
        .eq("is_active", true)
        .maybeSingle();

      if (dbError) {
        setError("Failed to validate key.");
      } else if (!data) {
        setError("Invalid or expired key.");
      } else {
        // Mark key as used
        await supabase
          .from("access_keys")
          .update({ used_at: new Date().toISOString(), used_by: "user" })
          .eq("id", data.id);
        onAuthenticated(false);
      }
    } catch {
      setError("Connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none" className="mb-4">
            <polygon
              points="25,2 47,15 47,35 25,48 3,35 3,15"
              stroke="hsl(160 100% 50%)"
              strokeWidth="2"
              fill="none"
              style={{ filter: "drop-shadow(0 0 8px hsl(160 100% 50% / 0.6))" }}
            />
            <circle cx="25" cy="25" r="4" fill="hsl(160 100% 50%)" />
          </svg>
          <h1 className="font-display text-lg tracking-[0.3em] text-foreground text-glow uppercase">
            Crash Tool
          </h1>
          <p className="mt-2 text-xs text-muted-foreground font-mono">
            Enter your access key to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded border border-border bg-card p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Access Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter key..."
              className="w-full bg-input border border-border rounded px-3 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-xs font-mono text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded font-display text-sm tracking-widest uppercase bg-primary text-primary-foreground glow-primary hover:brightness-110 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Validating..." : "Unlock"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground font-mono opacity-50">
          Made by Alol
        </p>
      </div>
    </div>
  );
};

export default KeyGate;
