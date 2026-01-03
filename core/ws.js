const WebSocket = require("ws");

const WS_URL = "wss://clara-core.onrender.com/data";

function wsRequest(action, payload = {}) {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket(WS_URL);

        ws.on("open", () => {
            ws.send(
                JSON.stringify({
                    action,
                    payload,
                })
            );
        });

        ws.on("message", (data) => {
            try {
                const msg = JSON.parse(data.toString());

                if (msg.error) {
                    reject(msg.error);
                } else {
                    resolve(msg);
                }
            } catch (err) {
                reject(err);
            } finally {
                ws.close();
            }
        });

        ws.on("error", reject);
    });
}

module.exports = wsRequest;
