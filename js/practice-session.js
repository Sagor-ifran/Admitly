(function () {
    // ===== Settings =====
    var CORRECT_POINTS = 1;
    var WRONG_POINTS = -0.5;
    var RESULT_PAGE = "practice-result.html";

    // ===== Geometry figures (inline SVG, rong text-er rong-er sathe mile jay) =====
    var FIG_TRIANGLE = [
        '<svg viewBox="0 0 240 190" role="img" aria-label="Right-angled triangle ABC. The right angle is at B, AB is 6 cm and BC is 8 cm.">',
        '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">',
        '<polygon points="50,150 178,150 50,54"/>',
        '<path d="M62 150V138H50" stroke-width="1.6"/>',
        '</g>',
        '<g fill="currentColor" font-size="15" font-weight="600">',
        '<text x="34" y="52">A</text><text x="34" y="168">B</text><text x="184" y="168">C</text>',
        '</g>',
        '<g fill="currentColor" font-size="14">',
        '<text x="40" y="106" text-anchor="end">6 cm</text>',
        '<text x="114" y="176" text-anchor="middle">8 cm</text>',
        '<text x="132" y="92">AC = ?</text>',
        '</g>',
        '</svg>'
    ].join("");

    var FIG_DIAMETER = [
        '<svg viewBox="0 0 300 200" role="img" aria-label="A circle with centre O and diameter AB. Point C lies on the circle. Angle CAB is 35 degrees.">',
        '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">',
        '<circle cx="150" cy="100" r="80"/>',
        '<line x1="70" y1="100" x2="230" y2="100"/>',
        '<polyline points="70,100 177.4,24.8 230,100"/>',
        '</g>',
        '<g fill="none" stroke="currentColor" stroke-width="1.5">',
        '<path d="M169.2 30.5 174.9 38.7 183.1 33"/>',
        '<path d="M94 100A24 24 0 0 0 89.7 86.2"/>',
        '<path d="M206 100A24 24 0 0 1 216.2 80.3"/>',
        '</g>',
        '<circle cx="150" cy="100" r="2.5" fill="currentColor"/>',
        '<g fill="currentColor" font-size="15" font-weight="600">',
        '<text x="50" y="106">A</text><text x="236" y="106">B</text><text x="184" y="20">C</text><text x="143" y="120">O</text>',
        '</g>',
        '<g fill="currentColor" font-size="13">',
        '<text x="100" y="95">35°</text><text x="194" y="92">?</text>',
        '</g>',
        '</svg>'
    ].join("");

    var FIG_RADIUS = [
        '<svg viewBox="0 0 220 190" role="img" aria-label="A circle with centre O and a radius of 7 cm.">',
        '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
        '<circle cx="110" cy="95" r="70"/>',
        '<line x1="110" y1="95" x2="180" y2="95"/>',
        '</g>',
        '<circle cx="110" cy="95" r="2.5" fill="currentColor"/>',
        '<g fill="currentColor" font-size="15">',
        '<text x="145" y="84" text-anchor="middle">7 cm</text>',
        '<text x="98" y="114" font-weight="600">O</text>',
        '</g>',
        '</svg>'
    ].join("");

    // ===== DEMO question list =====
    // Asol project-e question server theke ashbe, ar answer check-o server-e hobe.
    // Math: inline \( ... \), alada line-e $$ ... $$ (JS string-e backslash duto likhte hobe)
    var QUESTIONS = [
        {
            text: "A product is sold for ৳600 after a 20% discount. What was its original price?",
            options: ["৳720", "৳750", "৳800", "৳900"],
            answer: 1,
            explanation: "<p>After a 20% discount, the customer pays 80% of the original price.</p>$$\\text{Original price}=\\dfrac{600}{0.80}=750$$<p>So the original price was <strong>৳750</strong>.</p>"
        },
        {
            text: "Simplify \\(\\dfrac{3}{4}+\\dfrac{5}{6}\\).",
            options: ["\\(\\dfrac{8}{10}\\)", "\\(\\dfrac{15}{24}\\)", "\\(\\dfrac{11}{12}\\)", "\\(\\dfrac{19}{12}\\)"],
            answer: 3,
            explanation: "<p>The LCM of 4 and 6 is 12.</p>$$\\dfrac{3}{4}+\\dfrac{5}{6}=\\dfrac{9}{12}+\\dfrac{10}{12}=\\dfrac{19}{12}$$"
        },
        {
            text: "Find the roots of \\(x^{2}-5x+6=0\\).",
            options: ["2 and 3", "\\(-2\\) and \\(-3\\)", "1 and 6", "\\(-1\\) and 6"],
            answer: 0,
            explanation: "$$x^{2}-5x+6=(x-2)(x-3)=0$$<p>So \\(x=2\\) or \\(x=3\\).</p>"
        },
        {
            text: "In the figure, triangle ABC has a right angle at B, with AB = 6 cm and BC = 8 cm. Find the length of AC.",
            figure: FIG_TRIANGLE,
            options: ["8 cm", "9 cm", "10 cm", "12 cm"],
            answer: 2,
            explanation: "<p>Use the Pythagorean theorem in the right-angled triangle.</p>$$AC^{2}=AB^{2}+BC^{2}=6^{2}+8^{2}=36+64=100$$<p>So \\(AC=\\sqrt{100}=10\\) cm.</p>"
        },
        {
            text: "A shopkeeper buys an item for ৳400 and sells it for ৳500. What is the profit percentage?",
            options: ["20%", "15%", "30%", "25%"],
            answer: 3,
            explanation: "<p>Profit = 500 − 400 = ৳100.</p>$$\\text{Profit}\\%=\\dfrac{100}{400}\\times 100=25\\%$$"
        },
        {
            text: "In the figure, AB is a diameter of the circle with centre O. If \\(\\angle CAB=35^{\\circ}\\), find \\(\\angle CBA\\).",
            figure: FIG_DIAMETER,
            options: ["35°", "45°", "55°", "65°"],
            answer: 2,
            explanation: "<p>An angle in a semicircle is a right angle, so \\(\\angle ACB=90^{\\circ}\\).</p>$$\\angle CBA=180^{\\circ}-90^{\\circ}-35^{\\circ}=55^{\\circ}$$"
        },
        {
            text: "If \\(A=\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}\\), what is \\(\\det(A)\\)?",
            options: ["\\(-2\\)", "\\(2\\)", "\\(10\\)", "\\(-10\\)"],
            answer: 0,
            explanation: "$$\\det(A)=\\begin{vmatrix}1&2\\\\3&4\\end{vmatrix}=(1)(4)-(2)(3)=-2$$"
        },
        {
            text: "Choose the correct sentence.",
            options: ["She don't like tea.", "She doesn't likes tea.", "She doesn't like tea.", "She not like tea."],
            answer: 2,
            explanation: "<p>After <em>doesn't</em> we use the base form of the verb: <strong>She doesn't like tea.</strong></p>"
        },
        {
            text: "Choose the synonym of <strong>abundant</strong>.",
            options: ["Scarce", "Plentiful", "Tiny", "Fragile"],
            answer: 1,
            explanation: "<p><em>Abundant</em> means existing in large quantities, so its synonym is <strong>plentiful</strong>.</p>"
        },
        {
            text: "Find the area of the circle shown in the figure. (Take \\(\\pi=\\dfrac{22}{7}\\))",
            figure: FIG_RADIUS,
            options: ["44 cm²", "49 cm²", "154 cm²", "308 cm²"],
            answer: 2,
            explanation: "$$A=\\pi r^{2}=\\dfrac{22}{7}\\times 7^{2}=154\\text{ cm}^{2}$$"
        }
    ];

    var total = QUESTIONS.length;

    var ICON_OK = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    var ICON_NO = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var ICON_NEXT = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';

    // ===== Elements =====
    function $(id) { return document.getElementById(id); }
    var sCount = $("sCount"), sSegs = $("sSegs"), sPoints = $("sPoints");
    var qNum = $("qNum"), qText = $("qText"), qBookmark = $("qBookmark"), qFigure = $("qFigure");
    var opts = $("opts"), explain = $("explain"), exToggle = $("exToggle"), exBody = $("exBody");
    var sBar = $("sBar"), barStatus = $("barStatus"), barSkip = $("barSkip"), barNext = $("barNext");
    var backBtn = $("backBtn"), leaveDialog = $("leaveDialog"), leaveStay = $("leaveStay");
    var scroller = document.querySelector(".content-scroll");

    // ===== State =====
    var state = { i: 0, points: 0, answered: false, results: [], bookmarks: {} };

    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function math(el) {
        if (window.renderMathInElement) {
            window.renderMathInElement(el, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "\\[", right: "\\]", display: true },
                    { left: "\\(", right: "\\)", display: false }
                ],
                throwOnError: false
            });
        }
    }

    function renderSegs() {
        sSegs.innerHTML = "";
        for (var k = 0; k < total; k++) {
            var seg = document.createElement("div");
            var cls = "seg";
            var r = state.results[k];
            if (r === true) cls += " is-correct";
            else if (r === false) cls += " is-wrong";
            else if (r === null) cls += " is-skipped";
            else if (k === state.i) cls += " is-current";
            seg.className = cls;
            sSegs.appendChild(seg);
        }
        sSegs.setAttribute("aria-valuenow", state.i + 1);
    }

    function renderPoints() {
        sPoints.textContent = state.points.toFixed(2);
    }

    function setBarIdle() {
        sBar.className = "session_bar";
        barStatus.innerHTML = '<span class="bar_hint">Select an answer to continue</span>';
        barSkip.hidden = false;
        barNext.hidden = true;
    }

    function setBarResult(ok) {
        sBar.className = "session_bar " + (ok ? "is-correct" : "is-wrong");
        var pts = ok ? "+" + CORRECT_POINTS + " point" : WRONG_POINTS + " points";
        barStatus.innerHTML = (ok ? ICON_OK : ICON_NO) +
            "<span>" + (ok ? "Correct answer" : "Wrong answer") + "</span>" +
            '<span class="bar_pts">' + pts + "</span>";
        barSkip.hidden = true;
        barNext.hidden = false;
        barNext.innerHTML = (state.i === total - 1 ? "Finish" : "Next question") + ICON_NEXT;
    }

    // Explanation khola/bondho (animation CSS-e)
    function setExplain(open) {
        explain.classList.toggle("is-collapsed", !open);
        exToggle.setAttribute("aria-expanded", open ? "true" : "false");
    }

    function renderQuestion() {
        var q = QUESTIONS[state.i];
        state.answered = false;

        qNum.textContent = pad(state.i + 1) + ".";
        qText.innerHTML = q.text;
        sCount.textContent = pad(state.i + 1) + "/" + pad(total);

        // Geometry figure
        if (q.figure) {
            qFigure.innerHTML = q.figure;
            qFigure.hidden = false;
        } else {
            qFigure.innerHTML = "";
            qFigure.hidden = true;
        }

        opts.innerHTML = "";
        q.options.forEach(function (html, idx) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "opt";
            b.setAttribute("role", "radio");
            b.setAttribute("aria-checked", "false");
            b.innerHTML =
                '<span class="opt_radio" aria-hidden="true"></span>' +
                '<span class="opt_label">' + html + "</span>" +
                '<span class="opt_icon" aria-hidden="true"></span>';
            b.addEventListener("click", function () { choose(idx); });
            opts.appendChild(b);
        });

        explain.hidden = true;
        explain.classList.add("is-collapsed");
        exBody.innerHTML = "";

        var saved = !!state.bookmarks[state.i];
        qBookmark.setAttribute("aria-pressed", saved ? "true" : "false");

        setBarIdle();
        renderSegs();
        renderPoints();
        math(qText);
        math(opts);
    }

    function choose(idx) {
        if (state.answered) return;
        state.answered = true;

        var q = QUESTIONS[state.i];
        var ok = idx === q.answer;
        state.results[state.i] = ok;
        state.points += ok ? CORRECT_POINTS : WRONG_POINTS;

        var buttons = opts.querySelectorAll(".opt");
        buttons.forEach(function (b, k) {
            b.classList.add("is-locked");
            b.setAttribute("aria-disabled", "true");

            if (k === idx) {
                b.classList.add("is-selected");
                b.setAttribute("aria-checked", "true");
            }
            if (k === q.answer) {
                b.classList.add("is-correct");
                b.querySelector(".opt_icon").innerHTML = ICON_OK;
            } else if (k === idx) {
                b.classList.add("is-wrong");
                b.querySelector(".opt_icon").innerHTML = ICON_NO;
            }
        });

        // Explanation: bondho obosthay dekhiye, tarpor smooth kore khola
        exBody.innerHTML = q.explanation;
        math(exBody);
        explain.classList.add("is-collapsed");
        exToggle.setAttribute("aria-expanded", "false");
        explain.hidden = false;
        void explain.offsetHeight;      // reflow, jate transition chole
        setExplain(true);

        var shownFor = state.i;
        setTimeout(function () {
            if (state.i === shownFor && !explain.hidden) {
                explain.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }, 400);

        setBarResult(ok);
        renderSegs();
        renderPoints();
    }

    function advance() {
        if (state.i < total - 1) {
            state.i++;
            renderQuestion();
            if (scroller) scroller.scrollTop = 0;
        } else {
            finish();
        }
    }

    function next() {
        if (state.answered) advance();
    }

    function skip() {
        if (state.answered) return;
        state.results[state.i] = null;
        advance();
    }

    function finish() {
        var correct = 0, wrong = 0, skipped = 0;
        for (var k = 0; k < total; k++) {
            if (state.results[k] === true) correct++;
            else if (state.results[k] === false) wrong++;
            else skipped++;
        }
        var params = new URLSearchParams({
            total: total,
            correct: correct,
            wrong: wrong,
            skipped: skipped,
            points: state.points.toFixed(2)
        });
        location.href = RESULT_PAGE + "?" + params.toString();
    }

    // ===== Events =====
    barNext.addEventListener("click", next);
    barSkip.addEventListener("click", skip);

    exToggle.addEventListener("click", function () {
        setExplain(explain.classList.contains("is-collapsed"));
    });

    qBookmark.addEventListener("click", function () {
        var on = qBookmark.getAttribute("aria-pressed") !== "true";
        qBookmark.setAttribute("aria-pressed", on ? "true" : "false");
        state.bookmarks[state.i] = on;
        // Laravel-e ekhane server-e save korbo
    });

    // Back arrow: kono answer dewa thakle confirm
    backBtn.addEventListener("click", function (e) {
        var started = state.results.length > 0;
        if (started && typeof leaveDialog.showModal === "function") {
            e.preventDefault();
            leaveDialog.showModal();
        }
    });
    leaveStay.addEventListener("click", function () { leaveDialog.close(); });

    // Keyboard: 1-4 diye option, ArrowRight diye porer question
    document.addEventListener("keydown", function (e) {
        if (leaveDialog.open || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.key >= "1" && e.key <= "9" && !state.answered) {
            var n = Number(e.key) - 1;
            if (n < QUESTIONS[state.i].options.length) choose(n);
        } else if (e.key === "ArrowRight" && state.answered) {
            next();
        }
    });

    renderQuestion();
})();