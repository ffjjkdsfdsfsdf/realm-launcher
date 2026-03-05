const { Authflow, Titles } = require("prismarine-auth");
const { v4: uuidv4 } = require("uuid");

class XboxAPI {
    constructor() {
        this.content_restrictions = "eyJ2ZXJzaW9uIjoyLCJkYXRhIjp7Imdlb2dyYXBoaWNSZWdpb24iOiJVUyIsIm1heEFnZVJhdGluZyI6MjU1LCJwcmVmZXJyZWRBZ2VSYXRpbmciOjI1NSwicmVzdHJpY3RQcm9tb3Rpb25hbENvbnRlbnQiOmZhbHNlfX0";
    }

    async getXboxToken(relyingParty) {
        let flow = new Authflow(undefined, "./auth", {
            flow: "sisu",
            authTitle: Titles.MinecraftIOS,
            deviceType: "iOS",
        }, (data) => {
            console.log(`${data.message}`);
        });

        let xboxToken = await flow.getXboxToken(relyingParty);

        if (typeof xboxToken.userXUID === "string" || typeof xboxToken.userXUID === "number")
            this.xuid = xboxToken?.userXUID;

        return `XBL3.0 x=${xboxToken.userHash};${xboxToken.XSTSToken}`;
    }

    async getXboxUserData(xuid) {
        if (!xuid) return;

        const authToken = await this.getXboxToken(null);

        const response = await fetch(`https://peoplehub.xboxlive.com/users/me/people/xuids(${xuid})/decoration/detail,preferredColor,presenceDetail`, {
            method: "GET",
            headers: {
                "x-xbl-contract-version": 4,
                "Accept-Encoding": "gzip, deflate",
                "Accept": "application/json",
                "User-Agent": "WindowsGameBar/5.823.1271.0",
                "Accept-Language": "en-US",
                "Authorization": authToken,
                "Host": "peoplehub.xboxlive.com",
                "Connection": "Keep-Alive"
            }
        });

        switch (response.status) {
            case 200:
                return (await response.json()).people[0];
            case 400:
                return null;
            default:
                console.log({ errorMsg: `${response.status} ${response.statusText} ${await response.text()}` });
                return null;
        }
    }

    async titleHistory(xuid) {
        if (!xuid) return;

        const authToken = await this.getXboxToken(null);

        const response = await fetch(`https://titlehub.xboxlive.com/users/xuid(${xuid})/titles/titleHistory/decoration/GamePass,TitleHistory,Achievement,Stats`, {
            method: "GET",
            headers: {
                "x-xbl-contract-version": 2,
                "Accept-Encoding": "gzip, deflate",
                "Accept": "application/json",
                "MS-CV": "unkV+2EFWDGAoQN9",
                "User-Agent": "WindowsGameBar/5.823.1271.0",
                "Accept-Language": "en-US",
                "Authorization": authToken,
                "Host": "titlehub.xboxlive.com",
                "Connection": "Keep-Alive"
            }
        });

        switch (response.status) {
            case 200:
                return (await response.json()).titles;
            case 400:
                return null;
            default:
                console.log({ errorMsg: `${response.status} ${response.statusText} ${await response.text()}` });
                return null;
        }
    }

    async getClub(id) {
        if (!id) return;

        const authToken = await this.getXboxToken(null);

        const response = await fetch(`https://clubhub.xboxlive.com/clubs/Ids(${id})/decoration/clubPresence`, {
            method: "GET",
            headers: {
                "x-xbl-contract-version": 4,
                "Accept-Encoding": "gzip; q=1.0, deflate; q=0.5, identity; q=0.1",
                "x-xbl-contentrestrictions": this.content_restrictions,
                "Signature": "",
                "Cache-Control": "no-store, must-revalidate, no-cache",
                "Accept": "application/json",
                "X-XblCorrelationId": uuidv4(),
                "PRAGMA": "no-cache",
                "Accept-Language": "en-US, en",
                "Authorization": authToken,
                "Host": "clubhub.xboxlive.com",
                "Connection": "Keep-Alive"
            }
        });

        switch (response.status) {
            case 200:
                const clubData = await response.json();
                if (clubData.code) return clubData;
                return clubData.clubs[0];
            default:
                console.log({ errorMsg: `${response.status} ${response.statusText} ${await response.text()}` });
                return null;
        }
    }
}

module.exports = XboxAPI;
