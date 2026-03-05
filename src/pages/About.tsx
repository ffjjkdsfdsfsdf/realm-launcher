import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border px-6 py-3 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
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
        </Link>
      </div>

      <div className="max-w-xl mx-auto p-6 mt-12 space-y-8 animate-fade-in">
        <div className="flex flex-col items-center">
          <svg width="80" height="80" viewBox="0 0 50 50" fill="none" className="mb-6">
            <polygon
              points="25,2 47,15 47,35 25,48 3,35 3,15"
              stroke="hsl(160 100% 50%)"
              strokeWidth="2"
              fill="none"
              style={{ filter: "drop-shadow(0 0 12px hsl(160 100% 50% / 0.6))" }}
            />
            <polygon
              points="25,10 38,18 38,32 25,40 12,32 12,18"
              stroke="hsl(180 100% 50%)"
              strokeWidth="1.5"
              fill="hsl(160 100% 50% / 0.1)"
            />
            <circle cx="25" cy="25" r="4" fill="hsl(160 100% 50%)" />
          </svg>
          <h2 className="font-display text-xl tracking-[0.3em] text-foreground text-glow uppercase">
            About
          </h2>
        </div>

        <div className="rounded border border-border bg-card p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
              Application
            </h3>
            <p className="text-sm font-mono text-muted-foreground leading-relaxed">
              Crash Tool is a realm-based crash utility designed for controlled testing and execution. 
              Configure your target realm, set crash parameters, and monitor execution in real-time 
              through the built-in terminal.
            </p>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
              Features
            </h3>
            <ul className="text-sm font-mono text-muted-foreground space-y-1">
              <li>• Realm-based crash execution</li>
              <li>• Configurable crash loops & time delays</li>
              <li>• Real-time terminal logging</li>
              <li>• Access key authentication system</li>
              <li>• Admin key management panel</li>
            </ul>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
              Version
            </h3>
            <p className="text-sm font-mono text-muted-foreground">v1.0.0</p>
          </div>

          <div className="border-t border-border pt-4 space-y-2">
            <h3 className="font-display text-xs tracking-[0.2em] text-primary uppercase">
              Developer
            </h3>
            <p className="text-sm font-mono text-foreground text-glow">Alol</p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-2 rounded font-display text-xs tracking-widest uppercase border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-all"
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  );
};

export default About;
