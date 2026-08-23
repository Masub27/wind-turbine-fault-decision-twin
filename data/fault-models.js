// ============================================================
// WIND TURBINE FAULT MODELS
// ============================================================

const FAULT_MODELS = {

    "blade-imbalance": {

        name: "Blade Imbalance",

        description:
            "Rotor vibration is significantly above the normal operating range while power output is reduced. The condition is consistent with blade or rotor imbalance.",

        severity: "HIGH",

        evidence: [
            "High vibration",
            "Reduced power",
            "Rotor instability"
        ],

        correctActions: [
            "reduce-speed",
            "inspect-blades"
        ]

    },


    "bearing-wear": {

        name: "Bearing Wear",

        description:
            "Increasing vibration and bearing temperature indicate possible mechanical wear in the rotor or generator bearing system.",

        severity: "HIGH",

        evidence: [
            "Elevated vibration",
            "Increasing temperature",
            "Reduced efficiency"
        ],

        correctActions: [
            "reduce-speed",
            "inspect-bearing"
        ]

    },


    "generator-overheat": {

        name: "Generator Overheating",

        description:
            "Generator temperature is abnormally high and power production is reduced. Continued operation may damage the generator.",

        severity: "CRITICAL",

        evidence: [
            "High temperature",
            "Reduced power",
            "Generator overheating state"
        ],

        correctActions: [
            "shutdown",
            "cool-generator"
        ]

    },


    "overspeed": {

        name: "Rotor Overspeed",

        description:
            "Rotor speed has exceeded the normal operating range. Excessive speed creates a serious mechanical and safety risk.",

        severity: "CRITICAL",

        evidence: [
            "Excessive RPM",
            "High vibration",
            "Overspeed generator state"
        ],

        correctActions: [
            "reduce-speed",
            "shutdown"
        ]

    },


    "yaw-misalignment": {

        name: "Yaw Misalignment",

        description:
            "The turbine is not correctly aligned with the incoming wind, reducing power generation and increasing mechanical stress.",

        severity: "MEDIUM",

        evidence: [
            "Reduced power",
            "Moderately increased vibration",
            "Normal temperature"
        ],

        correctActions: [
            "correct-yaw"
        ]

    },


    "grid-load": {

        name: "Grid / Load Fault",

        description:
            "The generator is producing significantly less electrical power because of an abnormal electrical load condition.",

        severity: "HIGH",

        evidence: [
            "Major power reduction",
            "Load fault state",
            "Rotor still operating"
        ],

        correctActions: [
            "shutdown",
            "check-electrical"
        ]

    },


    "hall-failure": {

        name: "Hall Sensor Failure",

        description:
            "The rotor may still be rotating, but the Hall sensor is providing unreliable RPM information.",

        severity: "HIGH",

        evidence: [
            "Unstable RPM reading",
            "Rotor movement inconsistent with sensor reading",
            "Sensor fault state"
        ],

        correctActions: [
            "shutdown",
            "check-sensor"
        ]

    },


    "electrical-fault": {

        name: "Electrical Connection Fault",

        description:
            "Electrical output is abnormally low and generator temperature is increasing, indicating a possible electrical connection problem.",

        severity: "HIGH",

        evidence: [
            "Reduced power",
            "Temperature increase",
            "Electrical fault state"
        ],

        correctActions: [
            "shutdown",
            "check-electrical"
        ]

    }

};