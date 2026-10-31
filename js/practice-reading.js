(function () {
    // ===== Settings =====
    var CORRECT_POINTS = 1;
    var WRONG_POINTS = -0.5;
    var CONTINUE_URL = "practice.html";

    // ===== Result messages (accuracy % onujayi) =====
    var RESULT_MESSAGES = [
        { max: 30,  title: "Keep going, you've got this", text: "Reading takes practice, and that is completely okay. Read the passage once more, slowly, and try again. Every attempt makes you stronger." },
        { max: 50,  title: "Good start", text: "You understood parts of the passage. Focus on finding the answer in the text before choosing an option." },
        { max: 99,  title: "Great work!", text: "You are reading with confidence. A little more practice and you will get them all." },
        { max: 100, title: "Perfect score!", text: "Outstanding! Every answer was correct. Try another passage to keep the momentum going." }
    ];

    function getResultMessage(pct) {
        for (var i = 0; i < RESULT_MESSAGES.length; i++) {
            if (pct <= RESULT_MESSAGES[i].max) return RESULT_MESSAGES[i];
        }
        return RESULT_MESSAGES[RESULT_MESSAGES.length - 1];
    }

    // ===== DEMO questions =====
    // Asol project-e question server theke ashbe, ar answer check-o server-e hobe.
    var QUESTIONS = [
        { text: "According to the passage, the Sundarbans is the largest littoral ___ belt in the world.", options: ["coral", "pine", "mangrove", "grassland"], answer: 2 },
        { text: "How far do the forests stretch into the Bangladeshi hinterland from the coast?", options: ["80 km", "20 km", "50 km", "120 km"], answer: 0 },
        { text: "The Sundarbans cover an area of about", options: ["3,850 square kilometers", "85,300 square kilometers", "385,000 square kilometers", "38,500 square kilometers"], answer: 3 },
        { text: "About how much of the Sundarbans is covered in water?", options: ["One-half", "One-third", "One-fourth", "Two-thirds"], answer: 1 },
        { text: "Since when has the Sundarbans been a wildlife sanctuary?", options: ["1947", "1971", "1966", "1999"], answer: 2 },
        { text: "How many Royal Bengal Tigers are estimated to live in the Sundarbans?", options: ["About 40", "About 4,000", "About 40,000", "About 400"], answer: 3 },
        { text: "About how many spotted deer are estimated to live there?", options: ["About 30,000", "About 3,000", "About 300,000", "About 3 million"], answer: 0 },
        { text: "Which animal is described as common in the rivers?", options: ["Saltwater Crocodile", "Gangetic River Dolphin", "Royal Bengal Tiger", "Spotted deer"], answer: 1 },
        { text: "How many species of fish have been recorded in the Sundarbans?", options: ["Under 60", "Exactly 100", "Over 120", "Over 600"], answer: 2 },
        { text: "Over 260 species of ___ have been recorded in the Sundarbans.", options: ["birds", "reptiles", "insects", "amphibians"], answer: 0 },
        { text: "At least how many species of reptiles are known to exist there?", options: ["8", "20", "120", "50"], answer: 3 },
        { text: "How many species of amphibians are known to exist there?", options: ["Five", "Eight", "Eighteen", "Eighty"], answer: 1 },
        { text: "What does the passage say about Saltwater Crocodiles in Bangladesh?", options: ["They live in every river of the country", "They are no longer found anywhere", "The Sundarbans supports their only population", "They outnumber the tigers"], answer: 2 },
        { text: "The population of Saltwater Crocodiles is estimated at", options: ["fewer than 200", "about 2,000", "more than 20,000", "exactly 200"], answer: 0 },
        { text: "The \"mighty jungles\" once covered which plain?", options: ["Deccan plain", "Indus plain", "Punjab plain", "Gangetic plain"], answer: 3 },
        { text: "In paragraph [1], the word \"hinterland\" most nearly means", options: ["the open sea", "the land lying inland from a coast", "a type of forest", "a river delta"], answer: 1 },
        { text: "The word \"sanctuary\" is closest in meaning to", options: ["a prison", "a market", "a protected area", "a farm"], answer: 2 },
        { text: "Which of these is NOT mentioned as living in the Sundarbans?", options: ["Polar bears", "Fish", "Insects", "Reptiles"], answer: 0 },
        { text: "Which statement is true according to the passage?", options: ["The Sundarbans has no mangrove swamps.", "The Sundarbans became a sanctuary after the year 2000.", "Most of the Sundarbans is covered in water.", "The forests include more than mangrove swamps."], answer: 3 },
        { text: "What is the main idea of the passage?", options: ["The history of Bangladesh's rivers", "The size and rich wildlife of the Sundarbans", "How to protect tigers from hunters", "Tourism in coastal cities"], answer: 1 }
    ];

    var total = QUESTIONS.length;

    var ICON_OK = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    var ICON_NO = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';

    // ===== Elements =====
    function $(id) { return document.getElementById(id); }
    var list = $("rcList"), rcCount = $("rcCount"), rcFinish = $("rcFinish");
    var backBtn = $("backBtn"), leaveDialog = $("leaveDialog"), leaveStay = $("leaveStay");
    var unDialog = $("unDialog"), unTitle = $("unTitle"), unReview = $("unReview"), unSubmit = $("unSubmit");
    var resultDialog = $("resultDialog"), resultTitle = $("resultTitle"), resultMsg = $("resultMsg");
    var rsPoints = $("rsPoints"), rsAccuracy = $("rsAccuracy"), rsTime = $("rsTime"), rsContinue = $("rsContinue");

    // ===== State =====
    var state = {
        answers: [],        // prottek question-e kon option select hoyeche
        points: 0,
        answered: 0,
        finished: false,
        startTime: Date.now()
    };

    var groups = [];        // prottek question-er options-er container

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    // ===== Render questions =====
    function render() {
        QUESTIONS.forEach(function (q, qi) {
            var li = document.createElement("li");
            li.className = "rc_q";

            var h = document.createElement("h3");
            h.className = "q_title";
            h.innerHTML = '<span class="q_num">' + pad(qi + 1) + '.</span><span>' + q.text + '</span>';

            var group = document.createElement("div");
            group.className = "opts";
            group.setAttribute("role", "radiogroup");
            group.setAttribute("aria-label", "Question " + (qi + 1) + " options");

            q.options.forEach(function (text, oi) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "opt";
                b.setAttribute("role", "radio");
                b.setAttribute("aria-checked", "false");
                b.innerHTML =
                    '<span class="opt_radio" aria-hidden="true"></span>' +
                    '<span class="opt_label">' + text + '</span>' +
                    '<span class="opt_icon" aria-hidden="true"></span>';
                b.addEventListener("click", function () { choose(qi, oi); });
                group.appendChild(b);
            });

            li.appendChild(h);
            li.appendChild(group);
            list.appendChild(li);
            groups.push(group);
        });

        updateCount();
    }

    function updateCount() {
        rcCount.textContent = state.answered + "/" + total;
    }

    // ===== Option click: sathe sathe result, ekবার-i, bodlano jabe na =====
    function choose(qi, oi) {
        if (state.finished) return;
        if (typeof state.answers[qi] === "number") return;   // age-i answer dewa, lock

        var q = QUESTIONS[qi];
        var ok = oi === q.answer;

        state.answers[qi] = oi;
        state.answered++;
        state.points += ok ? CORRECT_POINTS : WRONG_POINTS;

        groups[qi].querySelectorAll(".opt").forEach(function (b, k) {
            b.classList.add("is-locked");
            b.setAttribute("aria-disabled", "true");

            if (k === oi) {
                b.classList.add("is-selected");
                b.setAttribute("aria-checked", "true");
            }
            if (k === q.answer) {
                b.classList.add("is-correct");
                b.querySelector(".opt_icon").innerHTML = ICON_OK;
            } else if (k === oi) {
                b.classList.add("is-wrong");
                b.querySelector(".opt_icon").innerHTML = ICON_NO;
            }
        });

        updateCount();
    }

    // ===== Finish =====
    function firstUnanswered() {
        for (var i = 0; i < total; i++) {
            if (typeof state.answers[i] !== "number") return i;
        }
        return -1;
    }

    function onFinishClick() {
        if (state.finished) return;

        var left = total - state.answered;
        if (left > 0) {
            unTitle.textContent = left + (left === 1 ? " question is" : " questions are") +
                " unanswered. Submit anyway?";
            if (typeof unDialog.showModal === "function") unDialog.showModal();
            else unDialog.setAttribute("open", "");
        } else {
            submit();
        }
    }

    // Review: prothom unanswered question-e niye jay
    function onReview() {
        unDialog.close();
        var i = firstUnanswered();
        if (i < 0) return;
        var target = list.children[i];
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        var firstOpt = groups[i].querySelector(".opt");
        if (firstOpt) firstOpt.focus({ preventScroll: true });
    }

    function onSubmitAnyway() {
        unDialog.close();
        submit();
    }

    function formatTime(ms) {
        var s = Math.round(ms / 1000);
        if (s < 60) return s + " sec";
        var m = Math.floor(s / 60);
        var r = s % 60;
        return m + " min" + (r ? " " + r + " sec" : "");
    }

    function submit() {
        state.finished = true;

        var correct = 0;
        for (var k = 0; k < total; k++) {
            if (state.answers[k] === QUESTIONS[k].answer) correct++;
        }
        var accuracy = Math.round((correct / total) * 100);
        var avg = (Date.now() - state.startTime) / total;   // moto shomoy / question-er shonkha

        var msg = getResultMessage(accuracy);
        resultTitle.textContent = msg.title;
        resultMsg.textContent = msg.text;

        rsPoints.textContent = String(Math.round(state.points * 100) / 100);
        rsAccuracy.textContent = accuracy + "%";
        rsTime.textContent = formatTime(avg);
        rsContinue.setAttribute("href", CONTINUE_URL);

        rcFinish.disabled = true;

        if (typeof resultDialog.showModal === "function") resultDialog.showModal();
        else resultDialog.setAttribute("open", "");
        rsContinue.focus();
    }

    // Esc ba bairey click kore result modal bondho hobe na, Continue-i ekমাত্র rasta
    resultDialog.addEventListener("cancel", function (e) { e.preventDefault(); });

    // ===== Events =====
    rcFinish.addEventListener("click", onFinishClick);
    unReview.addEventListener("click", onReview);
    unSubmit.addEventListener("click", onSubmitAnyway);

    // Back arrow: kono answer dewa thakle confirm
    backBtn.addEventListener("click", function (e) {
        if (state.answered > 0 && !state.finished && typeof leaveDialog.showModal === "function") {
            e.preventDefault();
            leaveDialog.showModal();
        }
    });
    leaveStay.addEventListener("click", function () { leaveDialog.close(); });

    render();
})();