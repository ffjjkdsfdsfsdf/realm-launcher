import { useState, useCallback } from "react";
import SplashScreen from "@/components/SplashScreen";
import CrashPanel from "@/components/CrashPanel";

const Index = () => {
  const [loaded, setLoaded] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!loaded && <SplashScreen onComplete={handleSplashComplete} />}
      {loaded && (
        <div className="animate-fade-in">
          {/* Header */}
          <div className="border-b border-border px-6 py-3 flex items-center gap-3">
            <svg width="24" height="24" viewBox="0 0 50 50" fill="none">
              <polygon
                points="25,2 47,15 47,35 25,48 3,35 3,15"
                stroke="hsl(160 100% 50%)"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="25" cy="25" r="4" fill="hsl(160 100% 50%)" />
            </svg>
            <h1 className="font-display text-sm tracking-[0.3em] text-foreground text-glow uppercase">
              Crash Tool
            </h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">Online</span>
            </div>
          </div>

          <CrashPanel />
        </div>
      )}
    </div>
  );
};

export default Index;
