// ============================================================
// WIND TURBINE FAULT ENGINE
// ============================================================
// Handles:
// - Fault injection
// - Fault clearing
// - Fault display
// - Recovery procedure
// - Agent analysis trigger
// ============================================================


const faultEngine = {

    active: false,

    // --------------------------------------------------------
    // INJECT FAULT
    // --------------------------------------------------------

    inject(faultId) {

        // If no fault is selected
        if (!faultId || faultId === "none") {

            this.clear();

            return;
        }


        // Check whether the fault exists
        const fault = FAULT_MODELS[faultId];

        if (!fault) {

            console.error(
                "Unknown fault:",
                faultId
            );

            return;
        }


        // ----------------------------------------------------
        // Set turbine fault
        // ----------------------------------------------------

        turbine.fault = faultId;

        this.active = true;

        turbine.recoveryActive = false;

        turbine.recoveryProgress = 0;


        // ----------------------------------------------------
        // Event log
        // ----------------------------------------------------

        addEvent(
            `FAULT INJECTED: ${fault.name}`
        );


        // ----------------------------------------------------
        // Display fault
        // ----------------------------------------------------

        showFault(
            fault.name,
            fault.description
        );


        // ----------------------------------------------------
        // Recalculate turbine
        // ----------------------------------------------------

        turbine.calculateTargets();


        // ----------------------------------------------------
        // Update interface
        // ----------------------------------------------------

        updateInterface();


        // ----------------------------------------------------
        // Trigger workplace agents
        // ----------------------------------------------------

        /*
         * The agents read the CURRENT turbine state.
         *
         * This is important because every fault should
         * produce a different maintenance, energy and
         * safety response.
         */

        setTimeout(() => {

            if (
                window.agents &&
                typeof window.agents.analyse === "function"
            ) {

                window.agents.analyse();

            } else {

                console.warn(
                    "Agent system not available."
                );

            }

        }, 100);

    },


    // --------------------------------------------------------
    // CLEAR FAULT
    // --------------------------------------------------------

    clear() {

        turbine.fault = "none";

        this.active = false;

        turbine.recoveryActive = false;

        turbine.recoveryProgress = 0;


        // Reset recovery interface

        const bar =
            document.getElementById(
                "recoveryBar"
            );

        if (bar) {

            bar.style.width = "0%";

        }


        const status =
            document.getElementById(
                "recoveryStatus"
            );

        if (status) {

            status.textContent =
                "No recovery procedure active.";

        }


        // ----------------------------------------------------
        // Event log
        // ----------------------------------------------------

        addEvent(
            "Fault cleared. Turbine returned to normal model."
        );


        // ----------------------------------------------------
        // Fault display
        // ----------------------------------------------------

        showFault(
            "NO ACTIVE FAULT",
            "The turbine is operating normally. Start the turbine and inject a fault to begin the investigation."
        );


        // ----------------------------------------------------
        // Recalculate
        // ----------------------------------------------------

        turbine.calculateTargets();


        // ----------------------------------------------------
        // Update interface
        // ----------------------------------------------------

        updateInterface();


        // ----------------------------------------------------
        // Tell agents to analyse normal condition
        // ----------------------------------------------------

        setTimeout(() => {

            if (
                window.agents &&
                typeof window.agents.analyse === "function"
            ) {

                window.agents.analyse();

            }

        }, 100);

    },


    // --------------------------------------------------------
    // GET ACTIVE FAULT
    // --------------------------------------------------------

    getActiveFault() {

        if (!this.active) {

            return null;

        }


        return (
            FAULT_MODELS[turbine.fault]
            || null
        );

    }

};


// ============================================================
// FAULT DISPLAY
// ============================================================

function showFault(
    name,
    description
) {

    const badge =
        document.getElementById(
            "faultBadge"
        );

    const descriptionElement =
        document.getElementById(
            "faultDescription"
        );


    // If elements don't exist
    if (
        !badge ||
        !descriptionElement
    ) {

        console.warn(
            "Fault display elements not found."
        );

        return;
    }


    // --------------------------------------------------------
    // NORMAL STATE
    // --------------------------------------------------------

    if (
        turbine.fault === "none"
    ) {

        badge.textContent =
            "NO ACTIVE FAULT";

        badge.className =
            "fault-badge normal";

    }

    // --------------------------------------------------------
    // ACTIVE FAULT
    // --------------------------------------------------------

    else {

        badge.textContent =
            "ACTIVE FAULT";

        badge.className =
            "fault-badge active";

    }


    // --------------------------------------------------------
    // Description
    // --------------------------------------------------------

    descriptionElement.innerHTML = `
        <strong>${name}</strong>
        <br>
        ${description}
    `;

}


// ============================================================
// BEGIN RECOVERY
// ============================================================

function beginRecovery() {

    // No fault
    if (!faultEngine.active) {

        addEvent(
            "No active fault. Recovery is not required."
        );

        return;

    }


    // Start recovery
    turbine.recoveryActive = true;

    turbine.recoveryProgress = 0;


    // Reset progress bar

    const bar =
        document.getElementById(
            "recoveryBar"
        );

    if (bar) {

        bar.style.width = "0%";

    }


    // Update status

    const status =
        document.getElementById(
            "recoveryStatus"
        );

    if (status) {

        status.textContent =
            "Recovery procedure started...";

    }


    addEvent(
        "Recovery procedure started."
    );

}


// ============================================================
// UPDATE RECOVERY
// ============================================================

function updateRecovery() {

    if (!turbine.recoveryActive) {

        return;

    }


    // Increase progress

    turbine.recoveryProgress += 1;


    // Prevent value > 100

    if (
        turbine.recoveryProgress > 100
    ) {

        turbine.recoveryProgress = 100;

    }


    // --------------------------------------------------------
    // Progress bar
    // --------------------------------------------------------

    const bar =
        document.getElementById(
            "recoveryBar"
        );

    if (bar) {

        bar.style.width =
            `${turbine.recoveryProgress}%`;

    }


    // --------------------------------------------------------
    // Status text
    // --------------------------------------------------------

    const status =
        document.getElementById(
            "recoveryStatus"
        );

    if (status) {

        status.textContent =
            `Recovery in progress... ${turbine.recoveryProgress}%`;

    }


    // --------------------------------------------------------
    // Recovery complete
    // --------------------------------------------------------

    if (
        turbine.recoveryProgress >= 100
    ) {

        turbine.recoveryActive = false;

        verifyRecovery();

    }

}


// ============================================================
// VERIFY RECOVERY
// ============================================================

function verifyRecovery() {

    /*
     * Temporarily remove the fault and allow the
     * turbine to return toward normal operating values.
     */

    turbine.fault = "none";

    turbine.calculateTargets();


    const status =
        document.getElementById(
            "recoveryStatus"
        );


    if (status) {

        status.innerHTML =
            "🔎 Checking sensor values...";

    }


    addEvent(
        "AI agents verifying recovery..."
    );


    // --------------------------------------------------------
    // Wait for simulation values to stabilise
    // --------------------------------------------------------

    setTimeout(() => {

        const data =
            sensors.read();


        /*
         * Normal training limits
         */

        const healthy =
            data.vibration < 3 &&
            data.temperature < 70 &&
            data.power > 0.5;


        // ====================================================
        // SUCCESS
        // ====================================================

        if (healthy) {

            faultEngine.active = false;

            turbine.fault = "none";


            if (status) {

                status.innerHTML =
                    "🟢 <strong>FAULT CLEARED</strong> — turbine operating within normal limits.";

            }


            addEvent(
                "FAULT CLEARED. Sensor verification successful."
            );


            showFault(
                "FAULT CLEARED",
                "The turbine has returned to acceptable operating conditions."
            );


            turbine.calculateTargets();

            updateInterface();


            // Agents analyse the recovered system

            setTimeout(() => {

                if (
                    window.agents &&
                    typeof window.agents.analyse === "function"
                ) {

                    window.agents.analyse();

                }

            }, 100);

        }


        // ====================================================
        // FAILURE
        // ====================================================

        else {

            /*
             * Recovery failed.
             *
             * The previous fault must be restored.
             */

            const previousFault =
                window.lastInjectedFault;


            if (previousFault) {

                turbine.fault =
                    previousFault;

                faultEngine.active = true;

                turbine.calculateTargets();

            }


            addEvent(
                "Recovery verification failed. Abnormal sensor values remain."
            );


            if (status) {

                status.innerHTML =
                    "🔴 <strong>RECOVERY FAILED</strong> — abnormal sensor values remain.";
            }


            // Agents reassess the fault

            setTimeout(() => {

                if (
                    window.agents &&
                    typeof window.agents.analyse === "function"
                ) {

                    window.agents.analyse();

                }

            }, 100);


            updateInterface();

        }

    }, 1500);

}


// ============================================================
// RECOVERY LOOP
// ============================================================

setInterval(() => {

    updateRecovery();

}, 100);


// ============================================================
// REMEMBER LAST INJECTED FAULT
// ============================================================

/*
 * We keep the last fault so that if recovery fails,
 * the simulation can restore the correct fault.
 */

const originalInject =
    faultEngine.inject.bind(
        faultEngine
    );


faultEngine.inject =
    function(faultId) {

        if (
            faultId &&
            faultId !== "none"
        ) {

            window.lastInjectedFault =
                faultId;

        }

        return originalInject(
            faultId
        );

    };


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.faultEngine =
    faultEngine;

window.showFault =
    showFault;

window.beginRecovery =
    beginRecovery;

window.updateRecovery =
    updateRecovery;
