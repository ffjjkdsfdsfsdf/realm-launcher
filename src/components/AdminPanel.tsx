import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type KeyType = "user" | "admin";

const AdminPanel = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [label, setLabel] = useState("");
  const [keyType, setKeyType] = useState<KeyType>("user");
  const [generating, setGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [error, setError] = useState("");

  const fetchKeys = useCallback(async () => {
    const { data } = await supabase
      .from("access_keys")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setKeys(data);
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const generateKey = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
    let result = "CT-";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const newKey = generateKey();
      const { error: dbError } = await supabase
        .from("access_keys")
        .insert({
          key_value: newKey,
          label: label.trim() || null,
          key_type: keyType,
        });

      if (dbError) {
        setError(dbError.message);
      } else {
        setGeneratedKey(newKey);
        setLabel("");
        fetchKeys();
      }
    } catch (e: any) {
      setError(e.message || "Unexpected error");
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleKey = async (id: string, currentActive: boolean) => {
    await supabase
      .from("access_keys")
      .update({ is_active: !currentActive })
      .eq("id", id);
    fetchKeys();
  };

  const handleDeleteKey = async (id: string) => {
    await supabase.from("access_keys").delete().eq("id", id);
    fetchKeys();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto p-4">
      <div className="rounded border border-border bg-card p-5 space-y-4">
        <h2 className="font-display text-sm tracking-[0.2em] text-foreground text-glow uppercase">
          Admin — Key Generator
        </h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Label (optional)
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. User123"
              className="w-full bg-input border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Key Type
            </label>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => setKeyType("user")}
                className={`px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                  keyType === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                User
              </button>
              <button
                type="button"
                onClick={() => setKeyType("admin")}
                className={`px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all ${
                  keyType === "admin"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 rounded font-display text-xs tracking-widest uppercase bg-primary text-primary-foreground glow-primary hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {generating ? "..." : "Generate Key"}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs font-mono text-destructive">{error}</p>
        )}

        {generatedKey && (
          <div className="bg-secondary border border-border rounded p-3 flex items-center gap-3">
            <code className="text-sm font-mono text-primary flex-1 break-all">{generatedKey}</code>
            <button
              onClick={() => copyToClipboard(generatedKey)}
              className="px-3 py-1.5 rounded text-xs font-mono bg-muted text-foreground hover:bg-border transition-colors"
            >
              Copy
            </button>
          </div>
        )}
      </div>

      <div className="rounded border border-border bg-card p-5 space-y-3">
        <h2 className="font-display text-sm tracking-[0.2em] text-foreground text-glow uppercase">
          Existing Keys
        </h2>

        {keys.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">No keys generated yet.</p>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {keys.map((k) => (
              <div
                key={k.id}
                className="flex items-center gap-3 bg-secondary rounded px-3 py-2 text-xs font-mono"
              >
                <code className="text-foreground flex-1 break-all">{k.key_value}</code>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                  k.key_type === "admin"
                    ? "bg-destructive/20 text-destructive"
                    : "bg-primary/20 text-primary"
                }`}>
                  {k.key_type || "user"}
                </span>
                {k.label && (
                  <span className="text-muted-foreground shrink-0">{k.label}</span>
                )}
                <span className={`shrink-0 ${k.is_active ? "text-primary" : "text-destructive"}`}>
                  {k.is_active ? "Active" : "Disabled"}
                </span>
                <button
                  onClick={() => handleToggleKey(k.id, k.is_active)}
                  className="px-2 py-1 rounded bg-muted text-foreground hover:bg-border transition-colors shrink-0"
                >
                  {k.is_active ? "Disable" : "Enable"}
                </button>
                <button
                  onClick={() => handleDeleteKey(k.id)}
                  className="px-2 py-1 rounded bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
