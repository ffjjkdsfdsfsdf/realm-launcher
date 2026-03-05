import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import SplashScreen from "@/components/SplashScreen";
import KeyGate from "@/components/KeyGate";
import CrashPanel from "@/components/CrashPanel";
import AdminPanel from "@/components/AdminPanel";

type NavTab = "crash" | "admin";

const Index = () => {
  const [splashDone, setSplashDone] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("crash");

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  const handleAuthenticated = useCallback((admin: boolean) => {
    setIsAdmin(admin);
    setAuthenticated(true);
    setActiveTab("crash");
  }, []);

  const handleLogout = () => {
    setAuthenticated(false);
    setIsAdmin(false);
    setActiveTab("crash");
  };

  if (!splashDone) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (!authenticated) {
    return <KeyGate onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="animate-fade-in flex-1 flex flex-col">
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

          {/* Nav tabs */}
          <div className="ml-6 flex items-center gap-1">
            <TabButton active={activeTab === "crash"} onClick={() => setActiveTab("crash")}>
              Crash
            </TabButton>
            {isAdmin && (
              <TabButton active={activeTab === "admin"} onClick={() => setActiveTab("admin")}>
                Admin
              </TabButton>
            )}
          </div>

          <div className="ml-auto flex items-center gap-4">
            {isAdmin && (
              <span className="text-xs font-mono text-primary text-glow">ADMIN</span>
            )}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">Online</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-mono text-muted-foreground hover:text-destructive transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "crash" && <CrashPanel />}
          {activeTab === "admin" && isAdmin && <AdminPanel />}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-2 flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground opacity-60">
          Made by Alol
        </span>
        <Link
          to="/about"
          className="text-xs font-mono text-muted-foreground opacity-60 hover:text-primary hover:opacity-100 transition-all"
        >
          About
        </Link>
      </footer>
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all ${
      active
        ? "bg-primary/10 text-primary border border-primary/30"
        : "text-muted-foreground hover:text-foreground"
    }`}
  >
    {children}
  </button>
);

export default Index;
