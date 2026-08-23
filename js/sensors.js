// ============================================================
// VIRTUAL SENSOR SYSTEM
// ============================================================

const sensors = {

    windSpeed: 0,
    rpm: 0,
    power: 0,
    temperature: 25,
    vibration: 1.2,

    generatorState: "NORMAL",

    read() {

        this.windSpeed =
            turbine.windSpeed;

        this.rpm =
            turbine.rpm;

        this.power =
            turbine.power;

        this.temperature =
            turbine.temperature;

        this.vibration =
            turbine.vibration;

        this.generatorState =
            turbine.generatorState;


        // ====================================================
        // HALL SENSOR FAILURE
        // ====================================================

        if (turbine.fault === "hall-failure") {

            /*
             * The physical rotor is still moving,
             * but the Hall sensor gives an unreliable
             * measurement.
             */

            this.rpm =
                Math.random() > 0.5
                    ? 0
                    : Math.round(turbine.rpm * 0.45);

        }


        return {

            windSpeed: Number(this.windSpeed.toFixed(2)),

            rpm: Math.round(this.rpm),

            power: Number(this.power.toFixed(2)),

            temperature:
                Number(this.temperature.toFixed(1)),

            vibration:
                Number(this.vibration.toFixed(2)),

            generatorState:
                this.generatorState,

            fault:
                turbine.fault

        };

    }

};


// Update sensor values every 250 ms

setInterval(() => {

    sensors.read();

}, 250);