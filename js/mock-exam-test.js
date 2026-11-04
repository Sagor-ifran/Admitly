/* Mock exam test page (mock-exam-test.html)
   Flow: intro -> test -> submit -> next section intro ... -> done */
(function () {
    "use strict";

    var CFG = window.MOCK_CONFIG;
    var BANK = window.MOCK_BANK;
    if (!CFG || !BANK) return;

    // ===== Settings =====
    var TIME_SCALE = 1;                       // testing-er jonno 0.1 korun, tahole shomoy 10 gun druto cholbe
    var KEY_ACTIVE = "admitly:mock:active";   // cholte thaka attempt
    var KEY_RESULT = "admitly:mock:result";   // shesh hole result page-er jonno
    var WARN_5 = 300;                         // sec
    var WARN_1 = 60;                          // sec

    // ===== Helpers =====
    function $(id) { return document.getElementById(id); }
    function pad(n) { return n < 10 ? "0" + n : String(n); }

    function clock(ms) {
        var s = Math.max(0, Math.ceil(ms / 1000));
        var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
        return h > 0 ? h + ":" + pad(m) + ":" + pad(r) : pad(m) + ":" + pad(r);
    }

    function shuffle(a) {
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    function countWords(t) {
        var m = t.trim().match(/\S+/g);
        return m ? m.length : 0;
    }

    // text-er k-tom word-er shesh-er index
    function endOfWord(text, k) {
        var re = /\S+/g, m, i = 0;
        while ((m = re.exec(text)) !== null) {
            i++;
            if (i === k) return re.lastIndex;
        }
        return text.length;
    }

    function mathRender(node) {
        if (window.renderMathInElement) {
            window.renderMathInElement(node, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "\\(", right: "\\)", display: false }
                ],
                throwOnError: false
            });
        }
    }

    function openDialog(d) {
        if (typeof d.showModal === "function") d.showModal();
        else d.setAttribute("open", "");
    }

    function closeDialog(d) {
        if (typeof d.close === "function") d.close();
        else d.removeAttribute("open");
    }

    var ICON_OK = '<svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    var ICON_BOOKMARK = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

    // ===== Elements =====
    var el = {
        steps: $("mxSteps"), exit: $("mxExit"),
        empty: $("mxEmpty"), intro: $("mxIntro"), test: $("mxTest"), done: $("mxDone"),
        iLabel: $("mxILabel"), iName: $("mxIName"), iNotice: $("mxINotice"), iFacts: $("mxIFacts"),
        iInfo: $("mxIInfo"), iNotes: $("mxINotes"), iStart: $("mxStart"),
        tLabel: $("mxTLabel"), tName: $("mxTName"), passage: $("mxPassage"), list: $("mxList"),
        essay: $("mxEssay"), ePrompt: $("mxEPrompt"), eArea: $("mxEArea"), eNote: $("mxENote"),
        doneH: $("mxDoneH"),
        barWrap: $("mxBarWrap"), timer: $("mxTimer"), time: $("mxTime"), submit: $("mxSubmit"),
        countNum: $("mxCountNum"), countLabel: $("mxCountLabel"), sr: $("mxSr"),
        cf: $("cfDialog"), cfTitle: $("cfTitle"), cfText: $("cfText"), cfKeep: $("cfKeep"), cfGo: $("cfGo"),
        ex: $("exDialog"), exStay: $("exStay"), exLeave: $("exLeave"),
        scroller: document.querySelector(".content-scroll")
    };

    // ===== URL theke student-er select kora topic ar section =====
    var params = new URLSearchParams(location.search);
    var pickedTopics = params.getAll("topic");
    var pickedSections = params.getAll("section");
    var sig = pickedTopics.slice().sort().join(",") + "|" + pickedSections.slice().sort().join(",");

    function topicName(v) {
        var out = v;
        Object.keys(CFG.topics).forEach(function (k) {
            CFG.topics[k].forEach(function (t) { if (t.v === v) out = t.n; });
        });
        return out;
    }

    // ===== Section gulo banano =====
    // Option B: topic-e kom question thakle kom question dibe, shomoy-o onupate kombe.
    function build() {
        var list = [];

        CFG.order.forEach(function (key) {
            var c = CFG.sections[key];
            var s = {
                key: key, name: c.name, short: c.short, type: c.type,
                ids: [], minutes: c.minutes,
                topics: [], partial: false, fewer: false,
                phase: "intro", startedAt: 0, deadline: 0, auto: false,
                answers: {}, bookmarks: {}, essay: ""
            };

            if (c.type === "mcq") {
                var mine = pickedTopics.filter(function (t) { return t.indexOf(key + "-") === 0; });
                if (!mine.length) return;

                var isAll = mine.length >= CFG.topics[key].length;
                var pool = [];
                BANK[key].forEach(function (q, i) {
                    if (isAll || mine.indexOf(q.t) !== -1) pool.push(i);
                });
                if (!pool.length) return;

                shuffle(pool);
                s.ids = pool.slice(0, Math.min(c.count, pool.length));
                s.partial = !isAll;
                s.topics = isAll ? [] : mine.map(topicName);

            } else if (c.type === "reading") {
                if (pickedSections.indexOf("reading") === -1) return;
                var n = Math.min(c.count, BANK.reading.length);
                for (var i = 0; i < n; i++) s.ids.push(i);

            } else if (c.type === "essay") {
                if (pickedSections.indexOf("essay") === -1) return;
            }

            if (c.type !== "essay") {
                s.fewer = s.ids.length < c.count;
                s.minutes = Math.max(1, Math.round(c.minutes * s.ids.length / c.count));
            }
            list.push(s);
        });

        return list;
    }

    // ===== State (refresh korleo thake) =====
    function save() {
        try { localStorage.setItem(KEY_ACTIVE, JSON.stringify(state)); } catch (e) { }
    }

    function navType() {
        var e = window.performance && performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        return e ? e.type : "navigate";
    }

    function load() {
        try {
            var s = JSON.parse(localStorage.getItem(KEY_ACTIVE) || "null");
            if (s && s.v === 1 && s.sig === sig && s.sections && s.sections.length) return s;
        } catch (e) { }
        return null;
    }

    var state = null;
    var nt = navType();
    // Refresh ba back korle ager attempt, mock-exam.html theke notun kore ashle notun attempt
    if (nt === "reload" || nt === "back_forward") state = load();
    if (!state) {
        state = { v: 1, sig: sig, cur: 0, finished: false, notice: "", sections: build() };
        if (state.sections.length) save();
    }

    function cur() { return state.sections[state.cur]; }
    function dur(s) { return s.minutes * 60000 * TIME_SCALE; }

    // ===== Screen =====
    function show(name) {
        ["empty", "intro", "test", "done"].forEach(function (k) { el[k].hidden = k !== name; });
        el.barWrap.hidden = name !== "test";
    }

    function toTop() { if (el.scroller) el.scroller.scrollTop = 0; }

    function renderSteps() {
        el.steps.innerHTML = "";
        state.sections.forEach(function (s, i) {
            var li = document.createElement("li");
            var isCur = i === state.cur && !state.finished;
            li.className = "mx_step" + (s.phase === "done" ? " is-done" : (isCur ? " is-current" : ""));
            if (isCur) li.setAttribute("aria-current", "step");

            var n = document.createElement("span");
            n.className = "mx_step_n";
            if (s.phase === "done") n.innerHTML = ICON_OK; else n.textContent = String(i + 1);

            var t = document.createElement("span");
            t.className = "mx_step_t";
            t.textContent = s.short;

            li.appendChild(n);
            li.appendChild(t);
            el.steps.appendChild(li);
        });
    }

    // ===== Intro =====
    function showIntro() {
        var s = cur();
        var essayCfg = CFG.sections.essay;

        el.iLabel.textContent = "Section " + (state.cur + 1) + " of " + state.sections.length;
        el.iName.textContent = s.name;

        el.iNotice.textContent = state.notice || "";
        el.iNotice.hidden = !state.notice;
        state.notice = "";
        save();

        // Facts
        var facts = s.type === "essay"
            ? [["1", "Essay"], [s.minutes + " min", "Time"]]
            : [[String(s.ids.length), "Questions"], [s.minutes + " min", "Time"]];
        el.iFacts.innerHTML = "";
        facts.forEach(function (f) {
            var d = document.createElement("div");
            d.className = "mx_fact";
            var b = document.createElement("strong");
            b.textContent = f[0];
            var sp = document.createElement("span");
            sp.textContent = f[1];
            d.appendChild(b);
            d.appendChild(sp);
            el.iFacts.appendChild(d);
        });

        // Topic ba kom-question-er info
        var info = [];
        if (s.partial && s.topics.length) info.push("Questions come only from: " + s.topics.join(", ") + ".");
        if (s.fewer) info.push("Only " + s.ids.length + " questions are available for this selection, so the time is adjusted to " + s.minutes + " minutes.");
        el.iInfo.innerHTML = "";
        info.forEach(function (t) {
            var p = document.createElement("p");
            p.textContent = t;
            el.iInfo.appendChild(p);
        });
        el.iInfo.hidden = info.length === 0;

        // Niyom
        var notes = [
            "The timer starts when you press Start section.",
            "You cannot come back to this section after you submit it.",
            "When time is up, your answers are submitted automatically."
        ];
        if (s.type === "essay") {
            notes.push("Aim for " + essayCfg.minWords + " to " + essayCfg.maxWords + " words. You cannot write more than " + essayCfg.maxWords + " words.");
        } else {
            notes.push("Each correct answer earns 1 mark. Wrong or unanswered questions earn 0 marks.");
        }
        el.iNotes.innerHTML = "";
        notes.forEach(function (t) {
            var li = document.createElement("li");
            li.textContent = t;
            el.iNotes.appendChild(li);
        });

        show("intro");
        toTop();
        el.iName.focus({ preventScroll: true });
    }

    function startSection() {
        var s = cur();
        if (!s || s.phase !== "intro") return;
        s.phase = "running";
        s.startedAt = Date.now();
        s.deadline = s.startedAt + dur(s);
        save();
        showTest();
    }

    // ===== Test =====
    function renderPassage(s) {
        var P = BANK.passage;
        el.passage.innerHTML = "";

        var h = document.createElement("h2");
        h.textContent = P.title;
        el.passage.appendChild(h);

        P.paras.forEach(function (text, i) {
            var p = document.createElement("p");
            var b = document.createElement("strong");
            b.textContent = "[" + (i + 1) + "] ";
            p.appendChild(b);
            p.appendChild(document.createTextNode(text));
            el.passage.appendChild(p);
        });

        var ins = document.createElement("p");
        ins.className = "rc_instruction";
        ins.textContent = "Questions 1–" + s.ids.length + ": Choose the best option for each question.";
        el.passage.appendChild(ins);
    }

    function paint(group, picked) {
        [].forEach.call(group.querySelectorAll(".opt"), function (b, k) {
            var on = k === picked;
            b.classList.toggle("is-selected", on);
            b.setAttribute("aria-checked", on ? "true" : "false");
        });
    }

    function renderQuestions(s) {
        var arr = BANK[s.key];
        el.list.innerHTML = "";

        s.ids.forEach(function (id, n) {
            var q = arr[id];

            var li = document.createElement("li");
            li.className = "rc_q";

            var row = document.createElement("div");
            row.className = "q_row";

            var h = document.createElement("h3");
            h.className = "q_title";
            h.innerHTML = '<span class="q_num">' + pad(n + 1) + '.</span><span class="q_txt">' + q.q + "</span>";
            row.appendChild(h);

            // Reading-e bookmark nai
            if (s.type !== "reading") {
                var bm = document.createElement("button");
                bm.type = "button";
                bm.className = "q_bookmark";
                bm.setAttribute("aria-label", "Bookmark question " + (n + 1));
                bm.setAttribute("aria-pressed", s.bookmarks[id] ? "true" : "false");
                bm.innerHTML = ICON_BOOKMARK;
                bm.addEventListener("click", function () {
                    var on = bm.getAttribute("aria-pressed") !== "true";
                    bm.setAttribute("aria-pressed", on ? "true" : "false");
                    if (on) s.bookmarks[id] = true; else delete s.bookmarks[id];
                    save();
                    // Laravel-e ekhane history-te save korbo
                });
                row.appendChild(bm);
            }

            var group = document.createElement("div");
            group.className = "opts";
            group.setAttribute("role", "radiogroup");
            group.setAttribute("aria-label", "Question " + (n + 1) + " options");

            q.o.forEach(function (text, oi) {
                var b = document.createElement("button");
                b.type = "button";
                b.className = "opt";
                b.setAttribute("role", "radio");
                b.setAttribute("aria-checked", "false");
                b.innerHTML =
                    '<span class="opt_radio" aria-hidden="true"></span>' +
                    '<span class="opt_label">' + text + "</span>";
                b.addEventListener("click", function () { choose(s, id, oi, group); });
                group.appendChild(b);
            });

            li.appendChild(row);
            li.appendChild(group);
            el.list.appendChild(li);

            paint(group, s.answers[id]);
        });

        mathRender(el.list);
    }

    // Option click: select, abar click korle untick. Kono instant result nai.
    function choose(s, id, oi, group) {
        if (s.phase !== "running") return;
        if (s.answers[id] === oi) delete s.answers[id];
        else s.answers[id] = oi;
        paint(group, s.answers[id]);
        updateCount();
        save();
    }

    function updateCount() {
        var s = cur();
        if (!s) return;
        if (s.type === "essay") {
            el.countNum.textContent = countWords(s.essay || "") + "/" + CFG.sections.essay.minWords;
            el.countLabel.textContent = "words";
        } else {
            el.countNum.textContent = Object.keys(s.answers).length + "/" + s.ids.length;
            el.countLabel.textContent = "answered";
        }
    }

    function showTest() {
        var s = cur();

        el.tLabel.textContent = "Section " + (state.cur + 1) + " of " + state.sections.length;
        el.tName.textContent = s.name;

        el.passage.hidden = s.type !== "reading";
        el.list.hidden = s.type === "essay";
        el.essay.hidden = s.type !== "essay";

        if (s.type === "essay") {
            el.ePrompt.textContent = CFG.essayPrompt;
            el.eArea.value = s.essay || "";
            el.eNote.textContent = "";
            el.list.innerHTML = "";
        } else {
            if (s.type === "reading") renderPassage(s);
            renderQuestions(s);
        }

        updateCount();
        show("test");
        toTop();
        startTimer();
        el.tName.focus({ preventScroll: true });
    }

    // ===== Timer =====
    var tickId = null, warned5 = false, warned1 = false;

    function startTimer() {
        stopTimer();
        warned5 = false;
        warned1 = false;
        el.timer.classList.remove("is-warn", "is-low");
        el.sr.textContent = "";
        tick();
        tickId = setInterval(tick, 500);
    }

    function stopTimer() {
        if (tickId) clearInterval(tickId);
        tickId = null;
    }

    function tick() {
        var s = cur();
        if (!s || s.phase !== "running") { stopTimer(); return; }

        var left = s.deadline - Date.now();
        if (left <= 0) { timeUp(); return; }

        el.time.textContent = clock(left);

        var secs = Math.ceil(left / 1000);
        el.timer.classList.toggle("is-warn", secs <= WARN_5 && secs > WARN_1);
        el.timer.classList.toggle("is-low", secs <= WARN_1);

        var total = dur(s) / 1000;
        if (secs <= WARN_5 && !warned5 && total > WARN_5) { warned5 = true; el.sr.textContent = "5 minutes left."; }
        if (secs <= WARN_1 && !warned1 && total > WARN_1) { warned1 = true; el.sr.textContent = "1 minute left."; }
    }

    function timeUp() {
        stopTimer();
        closeDialog(el.cf);
        closeDialog(el.ex);
        submitSection(true);
    }

    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) tick();
    });

    // ===== Submit =====
    function unanswered(s) {
        return s.type === "essay" ? 0 : s.ids.length - Object.keys(s.answers).length;
    }

    function askSubmit() {
        var s = cur();
        if (!s || s.phase !== "running") return;

        var msg = [];
        if (s.type === "essay") {
            var n = countWords(s.essay || "");
            var min = CFG.sections.essay.minWords, max = CFG.sections.essay.maxWords;
            if (n === 0) msg.push("Your essay is empty.");
            else if (n < min) msg.push("Your essay has " + n + " words. The recommended length is " + min + " to " + max + " words.");
        } else {
            var left = unanswered(s);
            if (left > 0) msg.push(left + (left === 1 ? " question is" : " questions are") + " unanswered.");
        }
        msg.push("You cannot come back to this section after you submit it.");

        el.cfTitle.textContent = "Submit " + s.name + "?";
        el.cfText.textContent = msg.join(" ");
        openDialog(el.cf);
    }

    function submitSection(auto) {
        var s = cur();
        if (!s || s.phase !== "running") return;

        stopTimer();
        clearTimeout(saveT);

        s.phase = "done";
        s.auto = !!auto;
        s.submittedAt = Date.now();
        s.used = Math.max(0, Math.min(dur(s), s.submittedAt - s.startedAt));
        if (auto) state.notice = s.name + " was submitted automatically because time ran out.";

        if (state.cur < state.sections.length - 1) {
            state.cur++;
            save();
            renderSteps();
            showIntro();
        } else {
            finishAll();
        }
    }

    function finishAll() {
        state.finished = true;
        guardOn = false;
        save();
        try { localStorage.setItem(KEY_RESULT, JSON.stringify(state)); } catch (e) { }
        renderSteps();
        show("done");
        toTop();
        el.doneH.focus({ preventScroll: true });
    }

    // ===== Essay =====
    var saveT = null;

    el.eArea.addEventListener("input", function () {
        var s = cur();
        if (!s || s.type !== "essay" || s.phase !== "running") return;

        var max = CFG.sections.essay.maxWords;
        if (countWords(el.eArea.value) > max) {
            el.eArea.value = el.eArea.value.slice(0, endOfWord(el.eArea.value, max));
            el.eNote.textContent = "You have reached the " + max + "-word limit.";
        } else {
            el.eNote.textContent = "";
        }

        s.essay = el.eArea.value;
        updateCount();
        clearTimeout(saveT);
        saveT = setTimeout(save, 400);
    });

    // ===== Events =====
    var guardOn = true;

    el.iStart.addEventListener("click", startSection);
    el.submit.addEventListener("click", askSubmit);
    el.cfKeep.addEventListener("click", function () { closeDialog(el.cf); });
    el.cfGo.addEventListener("click", function () { closeDialog(el.cf); submitSection(false); });
    el.exit.addEventListener("click", function () { openDialog(el.ex); });
    el.exStay.addEventListener("click", function () { closeDialog(el.ex); });
    el.exLeave.addEventListener("click", function () { guardOn = false; });

    // Test cholar shomoy tab bondho/refresh korle browser-er nijer warning
    window.addEventListener("beforeunload", function (e) {
        var s = state.sections[state.cur];
        if (guardOn && !state.finished && s && s.phase === "running") {
            e.preventDefault();
            e.returnValue = "";
        }
    });

    window.addEventListener("pagehide", function () {
        clearTimeout(saveT);
        if (state.sections.length) save();
    });

    // ===== Start =====
    function resume() {
        renderSteps();

        if (state.finished) {
            show("done");
            return;
        }

        var s = cur();
        if (s.phase === "running") {
            // Bairey thakar shomoy shomoy shesh hoye gele auto submit
            if (Date.now() >= s.deadline) { submitSection(true); return; }
            showTest();
        } else {
            showIntro();
        }
    }

    if (!state.sections.length) {
        show("empty");
    } else {
        resume();
    }
})();





