const { createClient } = require("bedrockx");
const { Authflow, Titles } = require("prismarine-auth");
const { v4: uuidv4 } = require("uuid");

async function createInstance(realm, RAPI) {
    RAPI.realm = realm;

    await RAPI.postStorySettings(RAPI.realm.id, true, true, true, true);

    const options = {
        host: realm.transport === "DEFAULT" ? realm.ip : undefined,
        port: realm.transport === "DEFAULT" ? realm.port : undefined,
        profilesFolder: "./auth",
        authTitle: Titles.MinecraftIOS,
        deviceType: "iOS",
        flow: "sisu",
        version: "1.21.130",
        authflow: new Authflow(undefined, "./auth", {
            flow: "sisu",
            authTitle: Titles.MinecraftIOS,
            deviceType: "iOS",
        }, (data) => {
            console.log(`${data.message}`);
        }),
        transport: realm.transport,
        networkId: realm.transport.includes("NETHERNET") ? realm.networkId : undefined,
        skinData: {
            ClientRandomId: Date.now(),
            CurrentInputMode: 2,
            DefaultInputMode: 2,
            DeviceModel: "iPhone11,8",
            DeviceOS: 2,
            DeviceId: uuidv4().replace(/-/g, "").toUpperCase(),
            GUIScale: 0,
            LanguageCode: "en_US",
            OverrideSkin: false,
            UIProfile: 1,
            MaxViewDistance: 16,
            MemoryTier: 3,
            PlatformType: 1,
            GraphicsMode: 1,
            TrustedSkin: true
        }
    };

    const instance = createClient(options);
    instance.options.protocolVersion = 924;

    console.log(`Connecting to ${realm.name}`);

    instance._disconnect = instance.disconnect;

    let wasKicked = false, interval;

    instance.disconnect = () => {
        wasKicked = true;
        instance._disconnect();
    };

    instance.on("kick", async (data) => {
        wasKicked = true;
        console.log(`${JSON.stringify(data)}`);
        clearInterval(interval);
    });

    instance.on("error", (error) => {
        if (wasKicked) return;
        instance.emit("kick", { message: String(error) });
    });

    instance.on("close", () => {
        if (wasKicked) return;
        setTimeout(async () => {
            const realmIP = await RAPI.getRealmIP(realm.id);

            switch (realmIP.networkProtocol) {
                case "DEFAULT":
                    realm.ip = realmIP.address.substring(0, realmIP.address.indexOf(':'));
                    realm.port = Number(realmIP.address.substring(realmIP.address.indexOf(':') + 1));
                    break;
                case "NETHERNET":
                case "NETHERNET_JSONRPC":
                    realm.networkId = realmIP.address;
                    break;
            }

            realm.transport = realmIP.networkProtocol;
            createInstance(realm, RAPI);
        }, 120000);
    });

    instance.on("play_status", async (data) => {
        switch (data.status) {
            case 'login_success':
                console.log(`Connected to ${realm.name}`);
                break;
            case 'player_spawn':
                instance.write("serverbound_loading_screen", { type: 1 });
                instance.write("serverbound_loading_screen", { type: 2 });
                break;
        }
    });

    instance.on("start_game", (startGameData) => {
        console.log(`Spawned into ${realm.name}`);
    });

    instance._write = instance.write;
    instance.write = (a, b) => {
        if (a === "request_network_settings") b.protocol_version = 924;
        if (a === "login") {
            const identity = JSON.parse(b.tokens.identity);
            const certificate = JSON.parse(identity.Certificate);
            certificate.chain = ["\\a"];
            identity.Certificate = JSON.stringify(certificate);
            b.tokens.identity = JSON.stringify(identity);
        }
        instance._write(a, b);
    };
}

module.exports = createInstance;
