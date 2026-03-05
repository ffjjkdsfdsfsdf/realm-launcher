const express = require("express");
const cors = require("cors");
const RealmAPI = require("./src/classes/Realm");
const createInstance = require("./src/client/Instance");

const app = express();
app.use(cors());
app.use(express.json());

let RAPI = null;
let activeSessions = new Map(); // sessionId -> { abort, logs }

// Initialize Realm API on startup
(async () => {
  try {
    RAPI = await RealmAPI();
    console.log("[SERVER] Realm API initialized. Xbox XUID:", RAPI.XboxAPI.xuid);
  } catch (err) {
    console.error("[SERVER] Failed to initialize Realm API:", err.message);
  }
})();

// Health check
app.get("/api/status", (req, res) => {
  res.json({
    online: !!RAPI,
    xuid: RAPI?.XboxAPI?.xuid || null,
  });
});

// Validate a realm by code or ID
app.post("/api/realm/validate", async (req, res) => {
  if (!RAPI) return res.status(503).json({ error: "Realm API not ready" });

  const { realmInput } = req.body;
  if (!realmInput) return res.status(400).json({ error: "realmInput required" });

  try {
    let realm;

    // If it looks like a numeric ID, look it up directly
    if (/^\d+$/.test(realmInput)) {
      realm = await RAPI.getRealmInfoByID(Number(realmInput));
    } else {
      // Treat as realm invite code
      realm = await RAPI.getRealmInfo(realmInput, true);
    }

    if (typeof realm === "number") {
      // HTTP status code returned = error
      if (realm === 403) {
        return res.json({ valid: false, reason: "blacklisted", error: "You are blacklisted from this realm." });
      }
      return res.json({ valid: false, reason: "not_found", error: `Realm not found (status ${realm})` });
    }

    return res.json({
      valid: true,
      realm: {
        id: realm.id,
        name: realm.name,
        owner: realm.owner,
        state: realm.state,
        expired: realm.expired,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// Start crash — SSE endpoint for streaming logs
app.get("/api/crash/start", async (req, res) => {
  if (!RAPI) {
    res.status(503).json({ error: "Realm API not ready" });
    return;
  }

  const { realmInput, loops = 1 } = req.query;
  if (!realmInput) {
    res.status(400).json({ error: "realmInput required" });
    return;
  }

  // Set up SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const send = (type, text) => {
    res.write(`data: ${JSON.stringify({ type, text, timestamp: new Date().toISOString() })}\n\n`);
  };

  let aborted = false;

  req.on("close", () => {
    aborted = true;
  });

  try {
    send("info", "Validating realm...");

    let realm;

    if (/^\d+$/.test(realmInput)) {
      realm = await RAPI.getRealmInfoByID(Number(realmInput));
    } else {
      realm = await RAPI.getRealmInfo(realmInput, false);
    }

    if (typeof realm === "number") {
      if (realm === 403) {
        send("error", "BLACKLISTED: You are blacklisted from this realm.");
      } else {
        send("error", `Realm not found or inaccessible (status ${realm})`);
      }
      res.end();
      return;
    }

    if (realm.expired || realm.state === "CLOSED") {
      send("error", "Realm is expired or closed.");
      res.end();
      return;
    }

    send("success", `Realm found: "${realm.name}" (ID: ${realm.id})`);

    const totalLoops = Math.min(parseInt(loops) || 1, 100);

    for (let i = 1; i <= totalLoops; i++) {
      if (aborted) {
        send("warn", "Aborted by client.");
        break;
      }

      send("info", `Starting crash loop ${i}/${totalLoops}...`);

      try {
        // Get realm IP
        const realmIP = await RAPI.getRealmIP(realm.id);

        if (typeof realmIP === "number") {
          if (realmIP === 403) {
            send("error", "BLACKLISTED: You are blacklisted from this realm.");
            break;
          }
          send("error", `Failed to get realm IP (status ${realmIP})`);
          break;
        }

        // Set transport info
        switch (realmIP.networkProtocol) {
          case "DEFAULT":
            realm.ip = realmIP.address.substring(0, realmIP.address.indexOf(":"));
            realm.port = Number(realmIP.address.substring(realmIP.address.indexOf(":") + 1));
            break;
          case "NETHERNET":
          case "NETHERNET_JSONRPC":
            realm.networkId = realmIP.address;
            break;
        }
        realm.transport = realmIP.networkProtocol;

        send("info", `Transport: ${realm.transport}`);

        // Create the crash instance
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => resolve(), 30000); // 30s max per loop

          try {
            // Override console.log temporarily to capture logs
            const origLog = console.log;
            const origError = console.error;

            console.log = (...args) => {
              const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
              // Only send blacklist/error related logs
              if (msg.toLowerCase().includes("blacklist") || msg.toLowerCase().includes("banned")) {
                send("error", `BLACKLISTED: ${msg}`);
              } else if (msg.toLowerCase().includes("error") || msg.toLowerCase().includes("kick")) {
                send("error", msg);
              }
              // Don't log other stuff per user request
            };

            console.error = (...args) => {
              const msg = args.map(a => typeof a === "object" ? JSON.stringify(a) : String(a)).join(" ");
              send("error", msg);
            };

            createInstance(realm, RAPI);

            // Restore after a delay
            setTimeout(() => {
              console.log = origLog;
              console.error = origError;
              clearTimeout(timeout);
              resolve();
            }, 15000); // Wait 15s for the crash to execute
          } catch (err) {
            send("error", `Instance error: ${err.message}`);
            resolve();
          }
        });

        send("success", `Crash loop ${i}/${totalLoops} completed.`);
      } catch (err) {
        send("error", `Loop ${i} error: ${err.message}`);
      }
    }

    send("success", "Crash sequence finished.");
  } catch (err) {
    send("error", `Fatal error: ${err.message}`);
  }

  res.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[SERVER] Crash Tool backend running on port ${PORT}`);
});
