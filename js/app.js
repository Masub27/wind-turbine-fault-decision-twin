// ============================================================
// WIND TURBINE DIGITAL TWIN - MAIN APPLICATION
// ============================================================

let score = 0;
window.score = score;
let simulationStarted = false;

// ------------------------------------------------------------
// DOM ELEMENTS
// ------------------------------------------------------------

const windSpeedInput = document.getElementById("windSpeed");
const windSpeedValue = document.getElementById("windSpeedValue");

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const resetButton = document.getElementById("resetButton");

const faultSelector = document.getElementById("faultSelector");
const injectFaultButton = document.getElementById("injectFaultButton");

const submitDecisionButton =
    document.getElementById("submitDecisionButton");


// ============================================================
// WIND SPEED CONTROL
// ============================================================

if (windSpeedInput) {

    windSpeedInput.addEventListener("input", function () {

        const speed = Number(this.value);

        if (windSpeedValue) {
            windSpeedValue.textContent = speed.toFixed(1);
        }

        if (
            typeof turbine !== "undefined" &&
            typeof turbine.updateWindSpeed === "function"
        ) {
            turbine.updateWindSpeed(speed);
        }

        updateInterface();

    });

}


// ============================================================
// START TURBINE
// ============================================================

if (startButton) {

    startButton.addEventListener("click", function () {

        if (
            typeof turbine !== "undefined" &&
            typeof turbine.start === "function"
        ) {

            turbine.start();

            simulationStarted = true;

            setSystemStatus(
                "SYSTEM RUNNING",
                true
            );

            addEvent(
                "Turbine started by learner."
            );

            updateInterface();

        }

    });

}


// ============================================================
// STOP TURBINE
// ============================================================

if (stopButton) {

    stopButton.addEventListener("click", function () {

        if (
            typeof turbine !== "undefined" &&
            typeof turbine.stop === "function"
        ) {

            turbine.stop();

            simulationStarted = false;

            setSystemStatus(
                "SYSTEM STOPPED",
                false
            );

            addEvent(
                "Turbine stopped by learner."
            );

            updateInterface();

        }

    });

}


// ============================================================
// RESET
// ============================================================

if (resetButton) {

    resetButton.addEventListener("click", function () {

        if (
            typeof turbine !== "undefined" &&
            typeof turbine.reset === "function"
        ) {

            turbine.reset();

        }

        if (faultSelector) {
            faultSelector.value = "none";
        }

        score = 0;
        window.score = 0;

        updateScore();

        simulationStarted = false;

        setSystemStatus(
            "SYSTEM READY",
            true
        );

        const feedback =
            document.getElementById("decisionFeedback");

        if (feedback) {

            feedback.className =
                "decision-feedback hidden";

            feedback.innerHTML = "";

        }

        const recovery =
            document.getElementById("recoveryStatus");

        if (recovery) {

            recovery.textContent =
                "Waiting for student decision.";

        }

        const recoveryBar =
            document.getElementById("recoveryBar");

        if (recoveryBar) {

            recoveryBar.style.width = "0%";

        }

        showFault(
            "NO ACTIVE FAULT",
            "The turbine is operating normally."
        );

        addEvent(
            "Laboratory reset."
        );

        updateInterface();

        if (window.agents && typeof window.agents.analyse === "function") {
            window.agents.analyse();
        }

    });

}


// ============================================================
// FAULT INJECTION
// ============================================================

if (injectFaultButton) {

    injectFaultButton.addEventListener("click", function () {

        const selectedFault =
            faultSelector
                ? faultSelector.value
                : "none";


        // ------------------------------------------------------
        // No fault selected
        // ------------------------------------------------------

        if (
            !selectedFault ||
            selectedFault === "none"
        ) {

            alert(
                "Please select a fault first."
            );

            addEvent(
                "No fault selected."
            );

            return;

        }


        // ------------------------------------------------------
        // Make sure turbine is running
        // ------------------------------------------------------

        if (
            typeof turbine !== "undefined" &&
            !turbine.running
        ) {

            /*
             * Automatically start the turbine.
             * This makes classroom testing easier.
             */

            turbine.start();

            simulationStarted = true;

            setSystemStatus(
                "SYSTEM RUNNING",
                true
            );

            addEvent(
                "Turbine automatically started for fault investigation."
            );

        }


        // ------------------------------------------------------
        // Inject fault
        // ------------------------------------------------------

        if (
            typeof faultEngine !== "undefined" &&
            typeof faultEngine.inject === "function"
        ) {

            faultEngine.inject(
                selectedFault
            );

            addEvent(
                "Learner injected fault: " +
                selectedFault
            );

            updateInterface();

        } else {

            console.error(
                "Fault engine is not available."
            );

            alert(
                "Fault engine is not loaded. Check faults.js."
            );

        }

    });

}


// ============================================================
// UPDATE INTERFACE
// ============================================================

function updateInterface() {

    if (
        typeof sensors === "undefined" ||
        typeof sensors.read !== "function"
    ) {
        return;
    }


    const data =
        sensors.read();


    // ---------------------------------------------------------
    // TELEMETRY
    // ---------------------------------------------------------

    setText(
        "telemetryWind",
        Number(data.windSpeed).toFixed(1)
    );

    setText(
        "telemetryRPM",
        Math.round(data.rpm)
    );

    setText(
        "telemetryPower",
        Number(data.power).toFixed(2)
    );

    setText(
        "telemetryTemperature",
        Number(data.temperature).toFixed(1)
    );

    setText(
        "telemetryVibration",
        Number(data.vibration).toFixed(2)
    );

    setText(
        "telemetryGenerator",
        data.generatorState
    );


    // ---------------------------------------------------------
    // TURBINE STATE
    // ---------------------------------------------------------

    const turbineState =
        document.getElementById("turbineState");


    if (turbineState) {

        if (
            typeof turbine !== "undefined" &&
            !turbine.running
        ) {

            turbineState.textContent =
                "TURBINE STOPPED";

        }

        else if (
            typeof turbine !== "undefined" &&
            turbine.fault !== "none"
        ) {

            turbineState.textContent =
                "⚠ FAULT ACTIVE";

        }

        else {

            turbineState.textContent =
                "NORMAL OPERATION";

        }

    }


    // ---------------------------------------------------------
    // FAULT DISPLAY
    // ---------------------------------------------------------

    if (
        typeof turbine !== "undefined" &&
        turbine.fault !== "none" &&
        typeof FAULT_MODELS !== "undefined"
    ) {

        const fault =
            FAULT_MODELS[turbine.fault];

        if (fault) {

            showFault(
                fault.name,
                fault.description
            );

        }

    }


    // ---------------------------------------------------------
    // AGENTS
    // ---------------------------------------------------------

    if (
        typeof updateAgents === "function"
    ) {

        updateAgents(data);

    }

}


// ============================================================
// TEXT HELPER
// ============================================================

function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent = value;

    }

}


// ============================================================
// SYSTEM STATUS
// ============================================================

function setSystemStatus(text, online) {

    setText(
        "systemStatus",
        text
    );

    const dot =
        document.getElementById(
            "systemStatusDot"
        );

    if (!dot) {
        return;
    }

    if (online) {

        dot.classList.add(
            "online"
        );

    } else {

        dot.classList.remove(
            "online"
        );

    }

}


// ============================================================
// SCORE
// ============================================================

function updateScore() {

    score = Number(window.score) || 0;

    setText(
        "decisionScore",
        "Score: " + score
    );

}


// ============================================================
// EVENT LOG
// ============================================================

function addEvent(message) {

    const log =
        document.getElementById(
            "eventLog"
        );

    if (!log) {
        return;
    }


    const entry =
        document.createElement(
            "div"
        );

    entry.className =
        "log-entry";


    const time =
        new Date().toLocaleTimeString();


    entry.textContent =
        "[" +
        time +
        "] " +
        message;


    log.prepend(entry);

}


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO OTHER FILES
// ============================================================

window.addEvent =
    addEvent;

window.updateInterface =
    updateInterface;

window.updateScore =
    updateScore;

window.setSystemStatus =
    setSystemStatus;


// ============================================================
// INITIALIZATION
// ============================================================

updateScore();

updateInterface();

addEvent(
    "Wind Turbine Fault-to-Decision Laboratory initialized."
);

addEvent(
    "Simulation mode ready."
);
