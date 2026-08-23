// ============================================================
// WIND TURBINE SIMULATION ENGINE
// ============================================================

const turbine = {
    running: false,

    windSpeed: 8.0,
    rpm: 0,
    power: 0,
    temperature: 25,
    vibration: 1.2,

    generatorState: "NORMAL",

    fault: "none",

    // Internal simulation values
    targetRPM: 0,
    targetPower: 0,
    targetTemperature: 25,
    targetVibration: 1.2,

    // Recovery state
    recoveryActive: false,
    recoveryProgress: 0,

    // Turbine constants
    ratedPower: 6.0,
    ratedRPM: 1800,

    updateWindSpeed(speed) {
        this.windSpeed = Number(speed);

        if (this.running) {
            this.calculateTargets();
        }
    },

    start() {
        this.running = true;
        this.calculateTargets();

        addEvent("Turbine started.");
    },

    stop() {
        this.running = false;

        this.targetRPM = 0;
        this.targetPower = 0;

        addEvent("Turbine stopped.");
    },

    reset() {

        this.running = false;

        this.windSpeed = 8.0;

        this.rpm = 0;
        this.power = 0;
        this.temperature = 25;
        this.vibration = 1.2;

        this.generatorState = "NORMAL";

        this.fault = "none";

        this.targetRPM = 0;
        this.targetPower = 0;
        this.targetTemperature = 25;
        this.targetVibration = 1.2;

        this.recoveryActive = false;
        this.recoveryProgress = 0;

        addEvent("Turbine reset to normal condition.");

        if (typeof window.updateInterface === "function") {
            window.updateInterface();
        }
    },

    calculateTargets() {

        if (!this.running) {

            this.targetRPM = 0;
            this.targetPower = 0;

            return;
        }

        /*
         * Educational turbine model.
         *
         * Wind speed controls rotor speed.
         * Power follows a simplified cubic relationship
         * until rated power is reached.
         */

        let normalizedWind = Math.min(this.windSpeed / 12, 1);

        this.targetRPM =
            normalizedWind * this.ratedRPM;

        this.targetPower =
            Math.min(
                this.ratedPower,
                this.ratedPower *
                Math.pow(normalizedWind, 3)
            );

        this.targetTemperature =
            25 +
            this.targetPower * 3;

        this.targetVibration = 1.2;

        this.generatorState = "NORMAL";

        applyFaultEffects();

    },

    update() {

        this.calculateTargets();

        /*
         * Smooth the values instead of instantly
         * jumping from one value to another.
         */

        this.rpm +=
            (this.targetRPM - this.rpm) * 0.08;

        this.power +=
            (this.targetPower - this.power) * 0.08;

        this.temperature +=
            (this.targetTemperature - this.temperature) * 0.05;

        this.vibration +=
            (this.targetVibration - this.vibration) * 0.08;

        if (typeof window.updateInterface === "function") {
            window.updateInterface();
        }

    }
};


// ============================================================
// FAULT EFFECTS
// ============================================================

function applyFaultEffects() {

    switch (turbine.fault) {

        case "blade-imbalance":

            turbine.targetVibration += 6.0;
            turbine.targetPower *= 0.75;

            break;


        case "bearing-wear":

            turbine.targetVibration += 3.5;
            turbine.targetTemperature += 15;

            turbine.targetPower *= 0.90;

            break;


        case "generator-overheat":

            turbine.targetTemperature += 45;
            turbine.targetPower *= 0.65;

            turbine.generatorState =
                "OVERHEATING";

            break;


        case "overspeed":

            turbine.targetRPM *= 1.35;
            turbine.targetVibration += 4.5;

            turbine.targetPower *= 1.05;

            turbine.generatorState =
                "OVERSPEED";

            break;


        case "yaw-misalignment":

            turbine.targetPower *= 0.65;
            turbine.targetVibration += 1.5;

            break;


        case "grid-load":

            turbine.targetPower *= 0.45;

            turbine.generatorState =
                "LOAD FAULT";

            break;


        case "hall-failure":

            /*
             * Real rotor speed continues,
             * but the sensor reading will be
             * modified in sensors.js.
             */

            turbine.generatorState =
                "SENSOR FAULT";

            break;


        case "electrical-fault":

            turbine.targetPower *= 0.35;
            turbine.targetTemperature += 10;

            turbine.generatorState =
                "ELECTRICAL FAULT";

            break;


        case "none":
        default:

            break;
    }
}


// ============================================================
// ANIMATION
// ============================================================

function updateRotorAnimation() {

    const rotor =
        document.getElementById("rotor");

    if (!rotor) return;

    if (!turbine.running) {

        rotor.style.animation = "none";

        return;
    }

    /*
     * RPM controls animation speed.
     */

    const rpm =
        Math.max(turbine.rpm, 1);

    const secondsPerRotation =
        60 / rpm;

    rotor.style.animation =
        `spin ${secondsPerRotation}s linear infinite`;
}


// ============================================================
// MAIN SIMULATION LOOP
// ============================================================

setInterval(() => {

    turbine.update();

    updateRotorAnimation();

}, 100);

window.turbine = turbine;
