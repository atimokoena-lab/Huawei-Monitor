const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const cors = require("cors");

const app = express();
app.use(cors());

const ROUTER = "http://192.168.8.1";

// ⚠️ PUT YOUR ROUTER PASSWORD HERE
const PASSWORD = "admin"; // change if needed

let cookie = "";
let token = "";

// STEP 1: Get token + session
async function getSession() {
    const res = await axios.get(`${ROUTER}/api/webserver/SesTokInfo`);

    const parsed = await xml2js.parseStringPromise(res.data);

    // ✅ Extract session correctly
    const ses = parsed.response.SesInfo[0];
    token = parsed.response.TokInfo[0];

    // ✅ THIS IS THE REAL COOKIE
    cookie = ses;

    console.log("✅ SESSION:", cookie);
    console.log("✅ TOKEN:", token);
}

// STEP 2: Login
async function login() {
    const xml = `
    <request>
        <Username>admin</Username>
        <Password>${Buffer.from(PASSWORD).toString("base64")}</Password>
        <password_type>4</password_type>
    </request>`;

    await axios.post(`${ROUTER}/api/user/login`, xml, {
    headers: {
        "__RequestVerificationToken": token,
        "Cookie": cookie, // 👈 now real session
        "Content-Type": "text/xml"
    }
});

    console.log("Logged in!");
}

// STEP 3: Fetch data
async function fetchRouter(endpoint) {
    try {
        const res = await axios.get(`${ROUTER}${endpoint}`, {
            headers: {
                "Cookie": cookie,
                "__RequestVerificationToken": token
            }
        });

        const parsed = await xml2js.parseStringPromise(res.data);
        return parsed.response;

    } catch (err) {
        return { error: err.message };
    }
}

// INIT (run once)
(async () => {
    await getSession();
    await login();
})();

// API
app.get("/api/status", async (req, res) => {
    const data = await fetchRouter("/api/monitoring/status");
    res.json(data);
});

app.get("/api/devices", async (req, res) => {
    const data = await fetchRouter("/api/wlan/host-list");
    res.json(data);
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));