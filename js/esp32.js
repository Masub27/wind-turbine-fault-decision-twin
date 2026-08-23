// ============================================================
// VIRTUAL ESP32
// ============================================================

const esp32 = {

    connected: true,

    deviceName: "ESP32-WIND-TURBINE",

    firmware: "1.0.0",

    getTelemetry() {

        const data =
            sensors.read();

        return {

            device: this.deviceName,

            firmware: this.firmware,

            timestamp:
                new Date().toISOString(),

            sensors: data

        };

    },

    status() {

        return {

            connected: this.connected,

            device:
                this.deviceName,

            firmware:
                this.firmware

        };

    }

};


// ============================================================
// TELEMETRY STREAM
// ============================================================

setInterval(() => {

    if (!esp32.connected) {
        return;
    }

    const telemetry =
        esp32.getTelemetry();

    /*
     * Later this exact JSON structure
     * can come from a REAL ESP32.
     */

    window.latestTelemetry =
        telemetry;

}, 250);