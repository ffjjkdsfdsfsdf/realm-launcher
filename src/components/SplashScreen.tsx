import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setExiting(true);
            setTimeout(onComplete, 600);
          }, 400);
          return 100;
        }
        return prev + Math.random() * 3 + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [onComplete]);

  const clampedProgress = Math.min(progress, 100);
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-all duration-600 ${
        exiting ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div
          className="absolute left-0 right-0 h-[2px] bg-primary"
          style={{ animation: "scanline 4s linear infinite" }}
        />
      </div>

      <div className="relative">
        {/* SVG Circle loader */}
        <svg width="140" height="140" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="hsl(220 15% 14%)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx="70"
            cy="70"
            r="58"
            fill="none"
            stroke="hsl(160 100% 50%)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100"
            style={{
              filter: "drop-shadow(0 0 6px hsl(160 100% 50% / 0.5))",
            }}
          />
        </svg>

        {/* Spinning logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin-slow">
            <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
              <polygon
                points="25,2 47,15 47,35 25,48 3,35 3,15"
                stroke="hsl(160 100% 50%)"
                strokeWidth="2"
                fill="none"
                style={{
                  filter: "drop-shadow(0 0 8px hsl(160 100% 50% / 0.6))",
                }}
              />
              <polygon
                points="25,10 38,18 38,32 25,40 12,32 12,18"
                stroke="hsl(180 100% 50%)"
                strokeWidth="1.5"
                fill="hsl(160 100% 50% / 0.1)"
              />
              <circle
                cx="25"
                cy="25"
                r="4"
                fill="hsl(160 100% 50%)"
                style={{
                  filter: "drop-shadow(0 0 6px hsl(160 100% 50% / 0.8))",
                }}
              />
            </svg>
          </div>
        </div>
      </div>

      <p className="mt-6 font-display text-sm tracking-[0.3em] text-foreground text-glow uppercase">
        Initializing
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        {Math.floor(clampedProgress)}%
      </p>
    </div>
  );
};

export default SplashScreen;
