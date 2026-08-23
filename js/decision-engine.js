// ============================================================
// STUDENT DECISION ENGINE
// ============================================================

(function () {
    const submitButton = document.getElementById("submitDecisionButton");
    const actionInput = document.getElementById("decisionAction");
    const reasonInput = document.getElementById("decisionReason");
    const feedback = document.getElementById("decisionFeedback");

    function showFeedback(correct, title, message) {
        if (!feedback) return;
        feedback.className = `decision-feedback ${correct ? "success" : "danger"}`;
        feedback.innerHTML = `<strong>${title}</strong><br>${message}`;
    }

    function evaluateDecision() {
        const faultId = window.turbine ? window.turbine.fault : "none";
        const model = typeof FAULT_MODELS !== "undefined" ? FAULT_MODELS[faultId] : null;
        const action = actionInput ? actionInput.value : "";
        const reason = reasonInput ? reasonInput.value.trim() : "";

        if (!model) {
            showFeedback(false, "No active fault", "Inject a fault before submitting a decision.");
            return;
        }

        if (!action) {
            showFeedback(false, "Decision incomplete", "Select an action before submitting.");
            return;
        }

        if (reason.length < 15) {
            showFeedback(false, "More evidence required", "Explain your decision using temperature, vibration, RPM, power or generator-state evidence.");
            return;
        }

        const correct = model.correctActions.includes(action);

        if (correct) {
            window.score = (Number(window.score) || 0) + 10;
            if (typeof updateScore === "function") updateScore();
            showFeedback(
                true,
                "✓ Correct decision",
                `${action.replaceAll("-", " ")} is an accepted response for ${model.name}. The recovery procedure has started.`
            );
            if (typeof addEvent === "function") addEvent(`Correct learner decision for ${model.name}: ${action}.`);
            if (typeof beginRecovery === "function") beginRecovery();
        } else {
            const accepted = model.correctActions.map(item => item.replaceAll("-", " ")).join(" or ");
            showFeedback(
                false,
                "✗ Unsafe or unsuitable decision",
                `Review the three agents and sensor evidence. For ${model.name}, an accepted action is: ${accepted}.`
            );
            if (typeof addEvent === "function") addEvent(`Incorrect learner decision for ${model.name}: ${action}.`);
        }
    }

    if (submitButton) submitButton.addEventListener("click", evaluateDecision);
    window.evaluateDecision = evaluateDecision;
})();
