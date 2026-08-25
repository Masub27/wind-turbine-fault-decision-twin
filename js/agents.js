// ============================================================
// VIRTUAL WORKPLACE AGENTS
// ============================================================

const agents = {

    responses: {},
    consulted: new Set(),
    currentFault: "none",

    analyse() {

        const fault = turbine.fault;

        if (!fault || fault === "none") {

            this.responses = {
                maintenance: "No active fault. Continue normal mechanical monitoring.",
                energy: "Energy production is operating under normal conditions.",
                safety: "No immediate abnormal safety condition detected."
            };
            this.prepareConsultation("none");

            return;
        }


        const data = {

            wind: turbine.windSpeed.toFixed(1),

            rpm: turbine.rpm.toFixed(0),

            power: turbine.power.toFixed(2),

            temperature:
                turbine.temperature.toFixed(1),

            vibration:
                turbine.vibration.toFixed(1)
        };


        // ----------------------------------------------------
        // MAINTENANCE AGENT
        // ----------------------------------------------------

        let maintenance = "";


        if (fault === "blade-imbalance") {

            maintenance =
                `High vibration (${data.vibration} mm/s) indicates possible blade or rotor imbalance. ` +
                `Inspect blade condition, hub connections and rotor balance.`;

        }

        else if (fault === "bearing-wear") {

            maintenance =
                `Vibration (${data.vibration} mm/s) and temperature (${data.temperature} °C) ` +
                `suggest possible bearing degradation. Inspect lubrication, alignment and bearings.`;

        }

        else if (fault === "generator-overheat") {

            maintenance =
                `Generator temperature is ${data.temperature} °C. Inspect cooling, ventilation, ` +
                `generator bearings and possible overload conditions.`;

        }

        else if (fault === "overspeed") {

            maintenance =
                `Rotor speed is ${data.rpm} RPM. Inspect speed control, braking system ` +
                `and overspeed protection.`;

        }

        else if (fault === "yaw-misalignment") {

            maintenance =
                `Power is reduced while wind is available. Inspect yaw alignment, wind-direction ` +
                `sensor and yaw-drive mechanism.`;

        }

        else if (fault === "grid-load") {

            maintenance =
                `Electrical output is restricted. Inspect the generator connection, load interface ` +
                `and electrical protection equipment.`;

        }

        else if (fault === "hall-failure") {

            maintenance =
                `Rotor-position feedback may be unavailable. Inspect the Hall sensor, wiring, ` +
                `connector and sensor alignment.`;

        }

        else if (fault === "electrical-fault") {

            maintenance =
                `Electrical output is abnormal. Inspect electrical connections, converter, ` +
                `generator circuitry and protection equipment.`;

        }

        else {

            maintenance =
                `Abnormal turbine condition detected. Inspect mechanical and electrical systems.`;
        }


        // ----------------------------------------------------
        // ENERGY AGENT
        // ----------------------------------------------------

        let energy = "";


        if (fault === "blade-imbalance") {

            energy =
                `Power is ${data.power} kW at ${data.wind} m/s wind. ` +
                `Blade imbalance causes aerodynamic and mechanical losses. ` +
                `Correct the imbalance before returning to full operation.`;

        }

        else if (fault === "bearing-wear") {

            energy =
                `Mechanical losses are increasing because of bearing degradation. ` +
                `Continued operation may reduce efficiency and increase energy losses.`;

        }

        else if (fault === "generator-overheat") {

            energy =
                `Generator temperature is ${data.temperature} °C. ` +
                `Reduce or stop generation until the thermal condition is corrected.`;

        }

        else if (fault === "overspeed") {

            energy =
                `Rotor speed is ${data.rpm} RPM and exceeds the normal operating range. ` +
                `Speed control has priority over energy production.`;

        }

        else if (fault === "yaw-misalignment") {

            energy =
                `Wind is ${data.wind} m/s but power is only ${data.power} kW. ` +
                `Yaw misalignment is reducing aerodynamic efficiency.`;

        }

        else if (fault === "grid-load") {

            energy =
                `Mechanical energy is available but electrical output is restricted. ` +
                `Stabilise the electrical load before increasing generation.`;

        }

        else if (fault === "hall-failure") {

            energy =
                `Reliable rotor-position feedback is unavailable. ` +
                `Limit generation until the sensor signal is restored.`;

        }

        else if (fault === "electrical-fault") {

            energy =
                `Power output is significantly reduced. Investigate electrical losses ` +
                `before reconnecting the generator.`;

        }

        else {

            energy =
                `Energy output is abnormal. Compare wind input, rotor speed and power.`;
        }


        // ----------------------------------------------------
        // SAFETY AGENT
        // ----------------------------------------------------

        let safety = "";


        if (fault === "blade-imbalance") {

            safety =
                `HIGH RISK — vibration is ${data.vibration} mm/s. ` +
                `Keep personnel away from rotating equipment and isolate the turbine before inspection.`;

        }

        else if (fault === "bearing-wear") {

            safety =
                `HIGH RISK — mechanical degradation may progress during operation. ` +
                `Stop and isolate the turbine before inspection.`;

        }

        else if (fault === "generator-overheat") {

            safety =
                `HIGH RISK — generator temperature is ${data.temperature} °C. ` +
                `Stop or isolate the equipment and allow controlled cooling.`;

        }

        else if (fault === "overspeed") {

            safety =
                `CRITICAL RISK — rotor overspeed creates a serious rotating-equipment hazard. ` +
                `Do not approach the turbine. Activate the protection procedure.`;

        }

        else if (fault === "yaw-misalignment") {

            safety =
                `MEDIUM RISK — stop and isolate the turbine before physical inspection.`;

        }

        else if (fault === "grid-load") {

            safety =
                `HIGH RISK — electrical abnormality detected. ` +
                `Isolate the electrical system before troubleshooting.`;

        }

        else if (fault === "hall-failure") {

            safety =
                `HIGH RISK — loss of rotor-position feedback can affect control behaviour. ` +
                `Prevent unexpected startup and isolate the turbine.`;

        }

        else if (fault === "electrical-fault") {

            safety =
                `CRITICAL RISK — electrical fault may create shock or arc hazards. ` +
                `Disconnect and isolate the equipment before inspection.`;

        }

        else {

            safety =
                `Treat the abnormal condition as potentially hazardous until the cause is confirmed.`;
        }


        // ----------------------------------------------------
        // STORE RESPONSES — EACH ONE IS REVEALED ONLY WHEN
        // THE LEARNER CONSULTS THAT WORKPLACE AGENT.
        // ----------------------------------------------------

        this.responses = { maintenance, energy, safety };
        this.prepareConsultation(fault);

    },


    // ========================================================
    // RESET THE THREE CONSULTATIONS FOR A NEW FAULT
    // ========================================================

    prepareConsultation(fault) {
        this.currentFault = fault;
        this.consulted = new Set();

        ["maintenance", "energy", "safety"].forEach(agentName => {
            this.show(agentName, "Ready to analyse. Select the button to consult this agent.");

            const button = document.getElementById("consult-" + agentName);
            if (button) {
                button.disabled = false;
                button.textContent = `Consult ${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent`;
            }

            const card = document.getElementById("agent-" + agentName)?.closest(".agent");
            if (card) card.classList.remove("consulted");
        });

        const solution = document.getElementById("agent-solution");
        if (solution) {
            solution.classList.add("locked");
            solution.innerHTML = "🔒 Consult all three agents to unlock the coordinated solution. (0 of 3 completed)";
        }

        const decisionButton = document.getElementById("submitDecisionButton");
        if (decisionButton) {
            decisionButton.disabled = true;
            decisionButton.title = "Consult all three workplace agents first.";
        }
    },


    // ========================================================
    // CONSULT ONE AGENT
    // ========================================================

    consult(agentName) {
        if (!this.responses[agentName]) this.analyse();

        this.show(agentName, this.responses[agentName] || "No analysis is available.");
        this.consulted.add(agentName);

        const button = document.getElementById("consult-" + agentName);
        if (button) {
            button.disabled = true;
            button.textContent = "✓ Consultation completed";
        }

        const card = document.getElementById("agent-" + agentName)?.closest(".agent");
        if (card) card.classList.add("consulted");

        const solution = document.getElementById("agent-solution");
        if (this.consulted.size === 3) {
            if (solution) solution.classList.remove("locked");
            this.showSolution(this.currentFault);

            const decisionButton = document.getElementById("submitDecisionButton");
            if (decisionButton && this.currentFault !== "none") {
                decisionButton.disabled = false;
                decisionButton.title = "";
            }
        } else if (solution) {
            solution.innerHTML = `🔒 Continue the investigation: ${this.consulted.size} of 3 agents consulted.`;
        }

        if (typeof addEvent === "function") {
            addEvent(`${agentName.charAt(0).toUpperCase() + agentName.slice(1)} Agent consulted by learner.`);
        }
    },


    // ========================================================
    // DISPLAY AGENT MESSAGE
    // ========================================================

    show(agentName, message) {

        const element =
            document.getElementById(
                "agent-" + agentName
            );

        if (!element) {

            console.error(
                "Missing agent element: agent-" + agentName
            );

            return;
        }

        element.innerHTML =
            message;
    },


    // ========================================================
    // COORDINATED SOLUTION
    // ========================================================

    showSolution(fault) {

        const element =
            document.getElementById(
                "agent-solution"
            );

        if (!element) {
            return;
        }


        let solution = "";


        switch (fault) {

            case "none":

                solution =
                    "MONITOR → RECORD TELEMETRY → CONTINUE SAFE OPERATION";

                break;

            case "blade-imbalance":

                solution =
                    "STOP → ISOLATE → INSPECT BLADES → CORRECT BALANCE → VERIFY VIBRATION";

                break;


            case "bearing-wear":

                solution =
                    "STOP → ISOLATE → CHECK BEARING → CHECK LUBRICATION → VERIFY TEMPERATURE/VIBRATION";

                break;


            case "generator-overheat":

                solution =
                    "REDUCE/STOP GENERATION → COOL DOWN → INSPECT COOLING → VERIFY TEMPERATURE → RESTART";

                break;


            case "overspeed":

                solution =
                    "STOP TURBINE → VERIFY BRAKING → CHECK SPEED SENSOR → CHECK CONTROL SYSTEM → CONTROLLED RESTART";

                break;


            case "yaw-misalignment":

                solution =
                    "REDUCE OPERATION → CHECK WIND SENSOR → CHECK YAW SYSTEM → ALIGN NACELLE → VERIFY POWER";

                break;


            case "grid-load":

                solution =
                    "REDUCE OUTPUT → ISOLATE ELECTRICAL INTERFACE → CHECK LOAD/PROTECTION → CORRECT FAULT → RECONNECT";

                break;


            case "hall-failure":

                solution =
                    "STOP → ISOLATE → CHECK HALL SENSOR/WIRING → RESTORE SIGNAL → TEST CONTROL → RESTART";

                break;


            case "electrical-fault":

                solution =
                    "STOP → ELECTRICAL ISOLATION → INSPECT CIRCUIT → CORRECT FAULT → TEST → RECONNECT";

                break;


            default:

                solution =
                    "STOP → ISOLATE → DIAGNOSE → CORRECT → VERIFY → RESTART";
        }


        element.innerHTML =
            `<strong>Coordinated solution:</strong><br>${solution}`;
    }

};


// ============================================================
// MAKE IT AVAILABLE TO OTHER FILES
// ============================================================

window.agents = agents;

document.getElementById("consult-maintenance")?.addEventListener("click", () => agents.consult("maintenance"));
document.getElementById("consult-energy")?.addEventListener("click", () => agents.consult("energy"));
document.getElementById("consult-safety")?.addEventListener("click", () => agents.consult("safety"));

setTimeout(() => agents.analyse(), 0);
