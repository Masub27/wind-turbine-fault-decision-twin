// ============================================================
// LIVE 50HERTZ / SMARD DATA ADAPTER
// ============================================================

(function () {
    "use strict";

    const BASE = "https://www.smard.de/app/chart_data";
    const REGION = "50Hertz";
    const RESOLUTION = "quarterhour";
    const REFRESH_MS = 15 * 60 * 1000;
    const FILTERS = {
        windOnshore: "4067",
        gridLoad: "410"
    };

    const state = {
        lastChecked: null,
        nextRefresh: null,
        status: "loading"
    };

    const byId = id => document.getElementById(id);

    function setText(id, value) {
        const element = byId(id);
        if (element) element.textContent = value;
    }

    function setStatus(status, label, message) {
        state.status = status;
        const badge = byId("liveDataBadge");
        if (badge) {
            badge.className = `live-badge ${status}`;
            badge.textContent = label;
        }
        setText("liveDataMessage", message);
    }

    async function getJson(url) {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error(`SMARD request failed (${response.status})`);
        return response.json();
    }

    async function fetchLatestSeries(filter) {
        const indexUrl = `${BASE}/${filter}/${REGION}/index_${RESOLUTION}.json`;
        const index = await getJson(indexUrl);
        const timestamps = Array.isArray(index.timestamps) ? index.timestamps : [];
        if (!timestamps.length) throw new Error("No SMARD timestamps available");

        const blockTimestamp = timestamps[timestamps.length - 1];
        const dataUrl = `${BASE}/${filter}/${REGION}/${filter}_${REGION}_${RESOLUTION}_${blockTimestamp}.json`;
        const payload = await getJson(dataUrl);
        const series = Array.isArray(payload.series) ? payload.series : [];
        const now = Date.now() + 5 * 60 * 1000;

        for (let index = series.length - 1; index >= 0; index -= 1) {
            const point = series[index];
            if (Array.isArray(point) && point[0] <= now && Number.isFinite(Number(point[1]))) {
                return { timestamp: Number(point[0]), mwh: Number(point[1]) };
            }
        }
        throw new Error("No recent SMARD value available");
    }

    function githubSnapshotUrl() {
        if (!location.hostname.endsWith(".github.io")) return "data/live-energy.json";
        const owner = location.hostname.split(".")[0];
        const repository = location.pathname.split("/").filter(Boolean)[0];
        return repository
            ? `https://raw.githubusercontent.com/${owner}/${repository}/main/data/live-energy.json`
            : "data/live-energy.json";
    }

    async function fetchSnapshot() {
        const snapshot = await getJson(`${githubSnapshotUrl()}?v=${Date.now()}`);
        if (
            !snapshot ||
            snapshot.windMWh === null ||
            snapshot.gridLoadMWh === null ||
            !Number.isFinite(Number(snapshot.windMWh)) ||
            !Number.isFinite(Number(snapshot.gridLoadMWh))
        ) {
            throw new Error("Live snapshot is not ready");
        }
        return snapshot;
    }

    function calculateWindProxy(windMW) {
        // Transparent educational proxy, not a measured local wind speed.
        const regionalShare = Math.max(0, Math.min(windMW / 22000, 1));
        return Math.max(3, Math.min(14, 3 + Math.sqrt(regionalShare) * 11));
    }

    function formatTime(timestamp) {
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Berlin",
            dateStyle: "medium",
            timeStyle: "short"
        }).format(new Date(timestamp));
    }

    function applyWindProxy(speed) {
        if (window.turbine && typeof window.turbine.updateWindSpeed === "function") {
            window.turbine.updateWindSpeed(speed);
        }
        const input = byId("windSpeed");
        if (input) input.value = speed.toFixed(1);
        setText("windSpeedValue", speed.toFixed(1));
        if (typeof window.updateInterface === "function") window.updateInterface();
    }

    async function refresh() {
        setStatus("loading", "REFRESHING", "Requesting the latest 50Hertz measurements from SMARD…");
        state.lastChecked = new Date();

        try {
            let wind;
            let load;
            try {
                const snapshot = await fetchSnapshot();
                wind = { timestamp: Number(snapshot.windTimestamp), mwh: Number(snapshot.windMWh) };
                load = { timestamp: Number(snapshot.gridLoadTimestamp), mwh: Number(snapshot.gridLoadMWh) };
            } catch (snapshotError) {
                [wind, load] = await Promise.all([
                    fetchLatestSeries(FILTERS.windOnshore),
                    fetchLatestSeries(FILTERS.gridLoad)
                ]);
            }

            const windMW = wind.mwh * 4;
            const loadMW = load.mwh * 4;
            const proxy = calculateWindProxy(windMW);
            const measurementTime = Math.min(wind.timestamp, load.timestamp);

            setText("liveWindPower", windMW.toLocaleString("en-GB", { maximumFractionDigits: 1 }));
            setText("liveGridLoad", loadMW.toLocaleString("en-GB", { maximumFractionDigits: 1 }));
            setText("liveWindProxy", proxy.toFixed(1));
            setText("liveMeasurementTime", formatTime(measurementTime));
            applyWindProxy(proxy);

            setStatus("live", "LIVE DATA", "The turbine wind input is following the latest regional wind proxy.");
            if (typeof addEvent === "function") addEvent("Live 50Hertz SMARD data applied to the digital twin.");
        } catch (error) {
            console.warn("SMARD live-data fallback:", error);
            setStatus("fallback", "SIMULATION FALLBACK", "Live data is temporarily unavailable. The laboratory simulation remains operational.");
            if (typeof addEvent === "function") addEvent("SMARD unavailable; simulation fallback remains active.");
        }

        state.nextRefresh = new Date(Date.now() + REFRESH_MS);
        setText(
            "liveRefreshInfo",
            `Last checked ${formatTime(state.lastChecked)} · Next refresh ${formatTime(state.nextRefresh)}`
        );
    }

    const refreshButton = byId("refreshLiveDataButton");
    if (refreshButton) refreshButton.addEventListener("click", refresh);

    window.liveEnergyData = { refresh, state };
    refresh();
    setInterval(refresh, REFRESH_MS);
})();
