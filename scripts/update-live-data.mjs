import { writeFile } from "node:fs/promises";

const BASE = "https://www.smard.de/app/chart_data";
const REGION = "50Hertz";
const RESOLUTION = "quarterhour";

async function getJson(url) {
    const response = await fetch(url, { headers: { "user-agent": "VET-Wind-Turbine-Digital-Twin/1.0" } });
    if (!response.ok) throw new Error(`${response.status} from ${url}`);
    return response.json();
}

async function latest(filter) {
    const index = await getJson(`${BASE}/${filter}/${REGION}/index_${RESOLUTION}.json`);
    const timestamp = index.timestamps.at(-1);
    if (!timestamp) throw new Error(`No timestamp for filter ${filter}`);
    const data = await getJson(`${BASE}/${filter}/${REGION}/${filter}_${REGION}_${RESOLUTION}_${timestamp}.json`);
    const now = Date.now() + 5 * 60 * 1000;
    const point = data.series.slice().reverse().find(item => Array.isArray(item) && item[0] <= now && Number.isFinite(Number(item[1])));
    if (!point) throw new Error(`No usable series value for filter ${filter}`);
    return { timestamp: Number(point[0]), mwh: Number(point[1]) };
}

const [wind, load] = await Promise.all([latest("4067"), latest("410")]);
const snapshot = {
    status: "live",
    source: "Bundesnetzagentur | SMARD.de",
    region: REGION,
    resolution: RESOLUTION,
    generatedAt: new Date().toISOString(),
    windTimestamp: wind.timestamp,
    windMWh: wind.mwh,
    gridLoadTimestamp: load.timestamp,
    gridLoadMWh: load.mwh
};

await writeFile("data/live-energy.json", `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
console.log(JSON.stringify(snapshot));
