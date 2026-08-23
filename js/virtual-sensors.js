// ============================================================
// VIRTUAL ESP32 SENSOR HEALTH MONITOR
// ============================================================

(function () {
    "use strict";

    const setText = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    };

    function setHealth(cardId, statusId, level, label) {
        const card = document.getElementById(cardId);
        const status = document.getElementById(statusId);
        if (card) card.className = `sensor-card ${level === "normal" ? "" : level}`.trim();
        if (status) {
            status.className = `sensor-state ${level}`;
            status.textContent = label;
        }
    }

    function update() {
        if (typeof sensors === "undefined" || typeof sensors.read !== "function") return;
        const data = sensors.read();
        const fault = window.turbine ? window.turbine.fault : "none";

        setText("sensorWindValue", Number(data.windSpeed).toFixed(1));
        setText("sensorRpmValue", Math.round(data.rpm));
        setText("sensorVibrationValue", Number(data.vibration).toFixed(2));
        setText("sensorTemperatureValue", Number(data.temperature).toFixed(1));
        setText("sensorPowerValue", Number(data.power).toFixed(2));

        setHealth("sensor-anemometer", "sensorWindStatus", "normal", "NORMAL");
        setHealth(
            "sensor-hall",
            "sensorRpmStatus",
            fault === "hall-failure" ? "alarm" : "normal",
            fault === "hall-failure" ? "SIGNAL FAULT" : "NORMAL"
        );

        const vibrationLevel = data.vibration >= 6 ? "alarm" : data.vibration >= 3 ? "warning" : "normal";
        setHealth(
            "sensor-vibration",
            "sensorVibrationStatus",
            vibrationLevel,
            vibrationLevel === "alarm" ? "ALARM" : vibrationLevel === "warning" ? "WARNING" : "NORMAL"
        );

        const temperatureLevel = data.temperature >= 70 ? "alarm" : data.temperature >= 55 ? "warning" : "normal";
        setHealth(
            "sensor-temperature",
            "sensorTemperatureStatus",
            temperatureLevel,
            temperatureLevel === "alarm" ? "ALARM" : temperatureLevel === "warning" ? "WARNING" : "NORMAL"
        );

        const electricalFault = fault === "grid-load" || fault === "electrical-fault";
        setHealth(
            "sensor-power",
            "sensorPowerStatus",
            electricalFault ? "alarm" : "normal",
            electricalFault ? "OUTPUT FAULT" : "NORMAL"
        );

        setText("sensorLastUpdate", new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/Berlin",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(new Date()));
    }

    window.virtualSensorMonitor = { update };
    update();
    setInterval(update, 1000);
})();
