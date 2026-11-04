/* Mock exam page (mock-exam.html) */
(function () {
    var form = document.getElementById("mockForm");
    if (!form) return;

    var segCards = [].slice.call(form.querySelectorAll(".mk_card[data-seg]"));
    var simpleCards = [].slice.call(form.querySelectorAll(".mk_card[data-section]"));
    var allCards = segCards.concat(simpleCards);
    var dataInputs = [].slice.call(form.querySelectorAll("input[name]"));   // topic ar section (form-e jay)

    var fullEl = document.getElementById("mkFull");
    var sumEl = document.getElementById("mkSum");
    var beginBtn = document.getElementById("mkBegin");
    var allBtn = document.getElementById("mkAll");
    var allText = document.getElementById("mkAllText");

    // ---------- Helpers ----------
    function fmtTime(m) {
        var h = Math.floor(m / 60), r = m % 60;
        if (h === 0) return r + " min";
        return h + "h" + (r ? " " + r + "m" : "");
    }

    // ["a", "b", "c"] -> "a, b and c"
    function joinList(parts) {
        if (parts.length <= 1) return parts.join("");
        return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
    }

    // Reading ar Essay alada gona hoy, MCQ-er bhitore na
    function describe(t) {
        var parts = [];
        if (t.mcq) parts.push(t.mcq + (t.mcq === 1 ? " MCQ" : " MCQs"));
        if (t.reading) parts.push(t.reading + " Reading Comprehension");
        if (t.essay) parts.push(t.essay + (t.essay === 1 ? " Essay" : " Essays"));
        return joinList(parts);
    }

    function tally(cards) {
        var t = { mcq: 0, reading: 0, essay: 0, min: 0 };
        cards.forEach(function (c) {
            t.min += Number(c.dataset.min) || 0;
            if (c.dataset.section === "reading") t.reading += 1;
            else if (c.dataset.section === "essay") t.essay += 1;
            else t.mcq += Number(c.dataset.q) || 0;
        });
        return t;
    }

    function isSelected(card) {
        if (card.hasAttribute("data-seg")) {
            return card.querySelectorAll(".mk_topic input:checked").length > 0;
        }
        return card.querySelector("input[name]").checked;
    }

    function setOpen(card, open) {
        card.classList.toggle("is-open", open);
        card.querySelector(".mk_toggle").setAttribute("aria-expanded", open ? "true" : "false");
    }

    // Segment-er circle: sob topic select hole checked, kichu hole dash, kono na hole khali
    function syncSeg(card) {
        var topics = card.querySelectorAll(".mk_topic input");
        var master = card.querySelector(".mk_seg_input");
        var n = card.querySelectorAll(".mk_topic input:checked").length;

        master.checked = n > 0 && n === topics.length;
        master.indeterminate = n > 0 && n < topics.length;
    }

    // ---------- Upore-r total (card-er data theke) ----------
    var full = tally(allCards);
    fullEl.textContent = describe(full) + " · Total time: " + fmtTime(full.min);

    // ---------- Sob kichu abar hishab ----------
    function refresh() {
        segCards.forEach(syncSeg);

        // Segment-er jekono topic select korle puro segment-er question ar shomoy dhora hoy
        var picked = [];
        allCards.forEach(function (c) {
            var on = isSelected(c);
            c.classList.toggle("is-selected", on);
            if (on) picked.push(c);
        });

        var any = picked.length > 0;
        beginBtn.disabled = !any;

        if (any) {
            var t = tally(picked);
            sumEl.textContent = "Selected: " + describe(t) + " · " + fmtTime(t.min);
        } else {
            sumEl.textContent = "Select at least one topic to begin.";
        }

        // Select all button
        var checkedCount = dataInputs.filter(function (i) { return i.checked; }).length;
        var everything = checkedCount === dataInputs.length;
        var some = checkedCount > 0 && !everything;

        allBtn.classList.toggle("is-all", everything);
        allBtn.classList.toggle("is-some", some);
        allBtn.setAttribute("aria-pressed", everything ? "true" : "false");
        allText.textContent = everything ? "Clear all" : "Select all";
    }

    // ---------- Events ----------
    dataInputs.forEach(function (i) {
        i.addEventListener("change", refresh);
    });

    segCards.forEach(function (card) {
        var master = card.querySelector(".mk_seg_input");
        var toggle = card.querySelector(".mk_toggle");

        // Circle-e click: oi segment-er sob topic select/unselect
        master.addEventListener("change", function () {
            card.querySelectorAll(".mk_topic input").forEach(function (t) {
                t.checked = master.checked;
            });
            refresh();
        });

        // Accordion khola/bondho
        toggle.addEventListener("click", function () {
            setOpen(card, !card.classList.contains("is-open"));
        });
    });

    allBtn.addEventListener("click", function () {
        var everything = dataInputs.every(function (i) { return i.checked; });
        dataInputs.forEach(function (i) { i.checked = !everything; });
        refresh();
    });

    // Kichu select na thakle start hobe na
    form.addEventListener("submit", function (e) {
        if (beginBtn.disabled) e.preventDefault();
    });

    // Checkbox-e Enter chaple jeno test shuru na hoye jay
    form.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && e.target.type === "checkbox") e.preventDefault();
    });

    // Browser form-er ager obostha ferot dile abar hishab
    window.addEventListener("pageshow", refresh);

    // Boro screen-e duto accordion-i khola obosthay shuru
    if (window.matchMedia("(min-width: 992px)").matches) {
        segCards.forEach(function (c) { setOpen(c, true); });
    }

    refresh();
})();





/* =========================================================
   PART 2: Mock exam test page (mock-exam-test.html)
   Flow: intro -> test -> submit -> next section intro ... -> done
   ========================================================= */
(function () {
    "use strict";

    var CFG = window.MOCK_CONFIG;
    var BANK = window.MOCK_BANK;
    if (!CFG || !BANK) return;
    if (!document.getElementById("mxIntro")) return;

    // ===== Settings =====
    var TIME_SCALE = 1;                       // testing-er jonno 0.1 korun, tahole shomoy 10 gun druto cholbe
    var STATE_VERSION = 2;
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

    function fmtDur(ms) {
        var s = Math.round(ms / 1000);
        if (s < 60) return s + " sec";
        var m = Math.round(s / 60);
        if (m < 60) return m + " min";
        var h = Math.floor(m / 60), r = m % 60;
        return h + "h" + (r ? " " + r + "m" : "");
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
        page: document.querySelector(".mx_page"),
        steps: $("mxSteps"), exit: $("mxExit"),
        empty: $("mxEmpty"), intro: $("mxIntro"), test: $("mxTest"), done: $("mxDone"),
        iLabel: $("mxILabel"), iName: $("mxIName"), iNotice: $("mxINotice"), iFacts: $("mxIFacts"),
        iInfo: $("mxIInfo"), iNotes: $("mxINotes"), iStart: $("mxStart"),
        tLabel: $("mxTLabel"), tName: $("mxTName"), passage: $("mxPassage"), list: $("mxList"),
        essay: $("mxEssay"), prompts: $("mxPrompts"), eArea: $("mxEArea"), eNote: $("mxENote"),
        doneH: $("mxDoneH"), doneList: $("mxDoneList"),
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
    // Topic-e kom question thakle kom question dibe, shomoy-o onupate kombe.
    function build() {
        var list = [];

        CFG.order.forEach(function (key) {
            var c = CFG.sections[key];
            var s = {
                key: key, name: c.name, short: c.short, type: c.type,
                ids: [], minutes: c.minutes,
                topics: [], partial: false, fewer: false,
                phase: "intro", startedAt: 0, deadline: 0, auto: false, used: 0,
                answers: {}, bookmarks: {}, essay: "", prompt: null
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
            if (s && s.v === STATE_VERSION && s.sig === sig && s.sections && s.sections.length) return s;
        } catch (e) { }
        return null;
    }

    var state = null;
    var nt = navType();
    // Refresh ba back korle ager attempt, mock-exam.html theke notun kore ashle notun attempt
    if (nt === "reload" || nt === "back_forward") state = load();
    if (!state) {
        state = { v: STATE_VERSION, sig: sig, cur: 0, finished: false, notice: "", sections: build() };
        if (state.sections.length) save();
    }

    function cur() { return state.sections[state.cur]; }
    function dur(s) { return s.minutes * 60000 * TIME_SCALE; }

    // ===== Screen =====
    function show(name) {
        ["empty", "intro", "test", "done"].forEach(function (k) { el[k].hidden = k !== name; });
        el.barWrap.hidden = name !== "test";
        el.page.classList.toggle("is-center", name === "done" || name === "empty");
        el.steps.classList.toggle("is-finished", name === "done");
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
            ? [["1 of " + CFG.essayPrompts.length, "Topic to choose"], [s.minutes + " min", "Time"]]
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
            notes.push("Choose one of the " + CFG.essayPrompts.length + " topics. You cannot change it after you start writing.");
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

    // ===== Essay: topic picker =====
    function syncEssay(s) {
        var has = typeof s.prompt === "number";
        var locked = countWords(s.essay || "") > 0;

        [].forEach.call(el.prompts.children, function (b, i) {
            var on = has && i === s.prompt;
            b.classList.toggle("is-selected", on);
            b.setAttribute("aria-checked", on ? "true" : "false");
            b.setAttribute("aria-disabled", locked && !on ? "true" : "false");
        });

        el.prompts.classList.toggle("is-locked", locked);
        el.eArea.disabled = !has;
        el.eArea.placeholder = has
            ? "Start writing your essay here..."
            : "Choose a topic above to start writing...";
    }

    function choosePrompt(s, i) {
        if (s.phase !== "running") return;
        if (countWords(s.essay || "") > 0 && s.prompt !== i) {
            el.eNote.textContent = "You cannot change your topic after you start writing. Clear your text to choose another topic.";
            return;
        }
        el.eNote.textContent = "";
        s.prompt = i;
        syncEssay(s);
        save();
        el.eArea.focus({ preventScroll: true });
    }

    function renderPrompts(s) {
        el.prompts.innerHTML = "";
        CFG.essayPrompts.forEach(function (text, i) {
            var b = document.createElement("button");
            b.type = "button";
            b.className = "opt";
            b.setAttribute("role", "radio");
            b.setAttribute("aria-checked", "false");
            b.innerHTML =
                '<span class="opt_radio" aria-hidden="true"></span>' +
                '<span class="opt_label"></span>';
            b.querySelector(".opt_label").textContent = text;
            b.addEventListener("click", function () { choosePrompt(s, i); });
            el.prompts.appendChild(b);
        });
        syncEssay(s);
    }

    function showTest() {
        var s = cur();

        el.tLabel.textContent = "Section " + (state.cur + 1) + " of " + state.sections.length;
        el.tName.textContent = s.name;

        el.passage.hidden = s.type !== "reading";
        el.list.hidden = s.type === "essay";
        el.essay.hidden = s.type !== "essay";

        if (s.type === "essay") {
            el.list.innerHTML = "";
            el.eArea.value = s.essay || "";
            el.eNote.textContent = "";
            renderPrompts(s);
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

    // Sob section shesh: summary list
    function renderDone() {
        el.doneList.innerHTML = "";
        state.sections.forEach(function (s) {
            var li = document.createElement("li");
            li.className = "mx_dl_row";

            var ico = document.createElement("span");
            ico.className = "mx_dl_ico";
            ico.innerHTML = ICON_OK;

            var main = document.createElement("span");
            main.className = "mx_dl_main";

            var name = document.createElement("span");
            name.className = "mx_dl_name";
            name.textContent = s.name;

            var meta = document.createElement("span");
            meta.className = "mx_dl_meta";
            var detail;
            if (s.type === "essay") {
                var w = countWords(s.essay || "");
                detail = w + (w === 1 ? " word" : " words");
            } else {
                detail = Object.keys(s.answers).length + " of " + s.ids.length + " answered";
            }
            meta.textContent = detail + " · " + fmtDur(s.used || 0) + " used";

            main.appendChild(name);
            main.appendChild(meta);

            if (s.auto) {
                var tag = document.createElement("span");
                tag.className = "mx_dl_tag";
                tag.textContent = "Auto-submitted";
                main.appendChild(tag);
            }

            li.appendChild(ico);
            li.appendChild(main);
            el.doneList.appendChild(li);
        });
    }

    function finishAll() {
        state.finished = true;
        guardOn = false;
        save();
        try { localStorage.setItem(KEY_RESULT, JSON.stringify(state)); } catch (e) { }
        renderSteps();
        renderDone();
        show("done");
        toTop();
        el.doneH.focus({ preventScroll: true });
    }

    // ===== Essay input =====
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
        syncEssay(s);          // likha shuru hole topic lock
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
            renderDone();
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






/* =========================================================
   PART 3: Mock exam result + review (mock-exam-result.html)
   ========================================================= */
(function () {
    "use strict";

    var overview = document.getElementById("mrOverview");
    if (!overview) return;

    var CFG = window.MOCK_CONFIG;
    var BANK = window.MOCK_BANK;
    var KEY_RESULT = "admitly:mock:result";
    var STATE_VERSION = 2;

    // ===== Helpers =====
    function $(id) { return document.getElementById(id); }

    function h(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function pad(n) { return n < 10 ? "0" + n : String(n); }
    function fmt(n) { return String(Math.round(n * 10) / 10); }

    function fmtDur(ms) {
        var s = Math.round(ms / 1000);
        if (s < 60) return s + " sec";
        var m = Math.round(s / 60);
        if (m < 60) return m + " min";
        var hr = Math.floor(m / 60), r = m % 60;
        return hr + "h" + (r ? " " + r + "m" : "");
    }

    function countWords(t) {
        var m = t.trim().match(/\S+/g);
        return m ? m.length : 0;
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

    var ICON_OK = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
    var ICON_NO = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>';
    var ICON_BM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';

    var emptyEl = $("mrEmpty");
    var reviewEl = $("mrReview");
    var scroller = document.querySelector(".content-scroll");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ===== Result load =====
    var state = null;
    if (CFG && BANK) {
        try {
            var saved = JSON.parse(localStorage.getItem(KEY_RESULT) || "null");
            if (saved && saved.v === STATE_VERSION && saved.finished && saved.sections && saved.sections.length) state = saved;
        } catch (e) { }
    }
    if (!state) {
        emptyEl.hidden = false;
        return;
    }

    var ESSAY_MARKS = (CFG.sections.essay && CFG.sections.essay.marks) || 10;

    // DEMO: asol project-e essay score AI theke (server-e) ashbe. Eta shudhu dekhanor jonno.
    function demoEssayScore(words) {
        if (words === 0) return 0;
        var r = Math.min(words, 400) / 400;
        return Math.round((2 + 7 * r) * 2) / 2;
    }

    // ===== Hishab =====
    function evaluate(st) {
        var R = { sections: [], mcqMax: 0, mcqScore: 0, essay: null, total: 0, max: 0, used: 0 };

        st.sections.forEach(function (s) {
            var r = {
                key: s.key, name: s.name, type: s.type,
                auto: !!s.auto, used: s.used || 0, minutes: s.minutes
            };

            if (s.type === "essay") {
                var words = countWords(s.essay || "");
                r.words = words;
                r.text = s.essay || "";
                r.prompt = typeof s.prompt === "number" ? (CFG.essayPrompts[s.prompt] || "") : "";
                r.score = demoEssayScore(words);
                r.max = ESSAY_MARKS;
                R.essay = r;
            } else {
                var arr = s.type === "reading" ? BANK.reading : BANK[s.key];
                var c = 0, w = 0, u = 0, items = [];

                s.ids.forEach(function (id, i) {
                    var q = arr[id];
                    var picked = typeof s.answers[id] === "number" ? s.answers[id] : null;
                    var status = picked === null ? "skip" : (picked === q.a ? "ok" : "bad");
                    if (status === "ok") c++; else if (status === "bad") w++; else u++;
                    items.push({
                        n: i + 1, q: q.q, o: q.o, a: q.a, e: q.e || "",
                        picked: picked, status: status, bm: !!(s.bookmarks && s.bookmarks[id])
                    });
                });

                r.items = items;
                r.correct = c; r.wrong = w; r.unanswered = u;
                r.score = c;                    // 1 mark per correct, negative nai
                r.max = s.ids.length;
                R.mcqMax += r.max;
                R.mcqScore += c;
            }

            R.total += r.score;
            R.max += r.max;
            R.used += r.used;
            R.sections.push(r);
        });

        return R;
    }

    var R = evaluate(state);

    function band(pct) { return pct >= 75 ? "is-good" : (pct >= 45 ? "is-mid" : "is-low"); }

    function bandLabel(pct) {
        if (pct >= 90) return "Excellent";
        if (pct >= 75) return "Very good";
        if (pct >= 60) return "Good";
        if (pct >= 40) return "Fair";
        return "Keep practicing";
    }

    function byKey(key) {
        for (var i = 0; i < R.sections.length; i++) {
            if (R.sections[i].key === key) return R.sections[i];
        }
        return null;
    }

    // ===== Overview =====
    function sectionCard(r) {
        var pct = r.max ? (r.score / r.max) * 100 : 0;
        var card = h("article", "mr_sec " + band(pct));
        card.style.setProperty("--w", pct + "%");

        var head = h("div", "mr_sec_head");
        head.appendChild(h("h3", "mr_sec_name", r.name));
        var sc = h("div", "mr_sec_score");
        sc.appendChild(h("strong", "", fmt(r.score)));
        sc.appendChild(document.createTextNode(" / " + fmt(r.max)));
        head.appendChild(sc);
        card.appendChild(head);

        var track = h("div", "mr_track");
        track.setAttribute("aria-hidden", "true");
        track.appendChild(h("div", "mr_fill"));
        card.appendChild(track);

        var chips = h("div", "mr_chips");
        if (r.type === "essay") {
            chips.appendChild(h("span", "mr_chip", r.words + (r.words === 1 ? " word" : " words")));
        } else {
            chips.appendChild(h("span", "mr_chip is-ok", "Correct " + r.correct));
            chips.appendChild(h("span", "mr_chip is-bad", "Wrong " + r.wrong));
            chips.appendChild(h("span", "mr_chip is-skip", "Not answered " + r.unanswered));
        }
        if (r.auto) chips.appendChild(h("span", "mr_chip is-auto", "Auto-submitted"));
        card.appendChild(chips);

        card.appendChild(h("p", "mr_meta", "Time: " + fmtDur(r.used) + " of " + r.minutes + " min"));

        var a = h("a", "s_btn s_btn--dark mr_sec_btn");
        a.href = "#review-" + r.key;
        if (r.type === "essay") {
            a.textContent = "View your essay";
        } else {
            var bad = r.wrong + r.unanswered;
            a.textContent = bad > 0 ? "Review mistakes (" + bad + ")" : "Review answers";
        }
        card.appendChild(a);

        return card;
    }

    function renderOverview() {
        var pct = R.max ? (R.total / R.max) * 100 : 0;

        var hero = $("mrHero");
        hero.classList.remove("is-good", "is-mid", "is-low");
        hero.classList.add(band(pct));

        $("mrBand").textContent = bandLabel(pct);
        $("mrOut").textContent = "/ " + fmt(R.max);

        var parts = [];
        if (R.mcqMax) parts.push("you answered " + R.mcqScore + " of " + R.mcqMax + " MCQs correctly");
        if (R.essay) parts.push("your essay scored " + fmt(R.essay.score) + " out of " + ESSAY_MARKS);
        var text = parts.join(", and ") + ".";
        $("mrSummary").textContent = text.charAt(0).toUpperCase() + text.slice(1);

        // Stat card gulo
        var cardMcq = $("mrCardMcq"), cardEssay = $("mrCardEssay");
        cardMcq.hidden = !R.mcqMax;
        cardEssay.hidden = !R.essay;
        $("mrStats").classList.toggle("is-two", !R.mcqMax || !R.essay);

        $("mrMcq").textContent = fmt(R.mcqScore) + " / " + fmt(R.mcqMax);
        if (R.essay) $("mrEssayScore").textContent = fmt(R.essay.score) + " / " + ESSAY_MARKS;
        $("mrTimeUsed").textContent = fmtDur(R.used);

        // Section card
        var box = $("mrSections");
        box.innerHTML = "";
        R.sections.forEach(function (r) { box.appendChild(sectionCard(r)); });

        // Score ring (0 theke count-up)
        var ring = $("mrRing"), totalEl = $("mrTotal");
        ring.classList.toggle("is-long", fmt(R.total).length >= 5);

        function paint(t) {
            totalEl.textContent = fmt(R.total * t);
            ring.style.setProperty("--p", pct * t);
        }

        function done() {
            paint(1);
            ring.setAttribute("aria-label", "Total score " + fmt(R.total) + " out of " + fmt(R.max));
            box.classList.add("is-in");
        }

        if (reduce) {
            done();
        } else {
            paint(0);
            var t0 = null, DURATION = 1000;
            var frame = function (now) {
                if (t0 === null) t0 = now;
                var p = Math.min((now - t0) / DURATION, 1);
                paint(1 - Math.pow(1 - p, 3));
                if (p < 1) requestAnimationFrame(frame);
                else done();
            };
            requestAnimationFrame(frame);
        }
    }

    // ===== Review =====
    var current = null;
    var filter = "mistakes";

    var rList = $("mrRList");
    var rTools = $("mrTools");
    var fMist = $("mrFMist");
    var fAll = $("mrFAll");
    var rSum = $("mrRSum");
    var essayBox = $("mrEssayBox");

    function statusLabel(st) { return st === "ok" ? "Correct" : (st === "bad" ? "Wrong" : "Not answered"); }

    function questionItem(it) {
        var li = h("li", "rc_q");

        var row = h("div", "q_row");
        var title = h("h3", "q_title");
        title.appendChild(h("span", "q_num", pad(it.n) + "."));
        var qt = h("span", "q_txt");
        qt.innerHTML = it.q;
        title.appendChild(qt);
        row.appendChild(title);

        var side = h("div", "mr_side");
        side.appendChild(h("span", "mr_tag is-" + it.status, statusLabel(it.status)));
        if (it.bm) {
            var bm = h("span", "mr_bm");
            bm.innerHTML = ICON_BM;
            bm.setAttribute("title", "Bookmarked");
            side.appendChild(bm);
        }
        row.appendChild(side);
        li.appendChild(row);

        var group = h("div", "opts");
        it.o.forEach(function (text, k) {
            var cls = "opt is-locked";
            if (k === it.picked) cls += " is-selected";
            if (k === it.a) cls += " is-correct";
            else if (k === it.picked) cls += " is-wrong";

            var d = h("div", cls);
            d.innerHTML =
                '<span class="opt_radio" aria-hidden="true"></span>' +
                '<span class="opt_label"></span>' +
                '<span class="opt_icon" aria-hidden="true"></span>';

            var label = d.querySelector(".opt_label");
            label.innerHTML = text;

            var sr = [];
            if (k === it.picked) sr.push("Your answer");
            if (k === it.a) sr.push("Correct answer");
            if (sr.length) d.insertBefore(h("span", "visually-hidden", sr.join(". ") + ": "), label);

            if (k === it.a) d.querySelector(".opt_icon").innerHTML = ICON_OK;
            else if (k === it.picked) d.querySelector(".opt_icon").innerHTML = ICON_NO;

            group.appendChild(d);
        });
        li.appendChild(group);

        // Explanation (MCQ-te ache, Reading-e nai)
        if (it.e) {
            var ex = h("div", "mr_expl");
            ex.appendChild(h("strong", "", "Explanation"));
            var body = h("div");
            body.innerHTML = it.e;
            ex.appendChild(body);
            li.appendChild(ex);
        }

        return li;
    }

    function renderList() {
        var r = current;
        rList.innerHTML = "";

        var shown = 0;
        r.items.forEach(function (it) {
            if (filter === "mistakes" && it.status === "ok") return;
            shown++;
            rList.appendChild(questionItem(it));
        });

        if (!shown) {
            rList.appendChild(h("li", "mr_none", "No mistakes in this section. Great job!"));
        }

        var bad = r.wrong + r.unanswered;
        rSum.textContent = filter === "mistakes"
            ? bad + (bad === 1 ? " question to review" : " questions to review")
            : r.correct + " correct · " + r.wrong + " wrong · " + r.unanswered + " not answered";

        mathRender(rList);
    }

    function setFilter(f) {
        filter = f;
        fMist.setAttribute("aria-pressed", f === "mistakes" ? "true" : "false");
        fAll.setAttribute("aria-pressed", f === "all" ? "true" : "false");
        renderList();
    }

    function showReview(r) {
        current = r;
        var idx = R.sections.indexOf(r);
        $("mrRLabel").textContent = "Review · Section " + (idx + 1) + " of " + R.sections.length;
        $("mrRName").textContent = r.name;

        if (r.type === "essay") {
            rTools.hidden = true;
            rList.innerHTML = "";
            rList.hidden = true;

            $("mrEPrompt").textContent = r.prompt || "No topic was chosen.";
            $("mrEText").textContent = r.text || "You did not write an essay.";
            $("mrEWords").textContent = r.words + (r.words === 1 ? " word" : " words");
            $("mrEScore").textContent = "Essay score: " + fmt(r.score) + " / " + r.max;
            essayBox.hidden = false;
        } else {
            essayBox.hidden = true;
            rTools.hidden = false;
            rList.hidden = false;

            fMist.textContent = "Mistakes (" + (r.wrong + r.unanswered) + ")";
            fAll.textContent = "All questions (" + r.items.length + ")";
            setFilter((r.wrong + r.unanswered) > 0 ? "mistakes" : "all");
        }

        overview.hidden = true;
        reviewEl.hidden = false;
        if (scroller) scroller.scrollTop = 0;
        $("mrRName").focus({ preventScroll: true });
    }

    function showOverview() {
        reviewEl.hidden = true;
        overview.hidden = false;
        if (scroller) scroller.scrollTop = 0;
    }

    // ===== Hash routing: #review-english, #review-math ... (browser Back-o kaj kore) =====
    function route() {
        var m = /^#review-(\w+)$/.exec(location.hash);
        var r = m ? byKey(m[1]) : null;
        if (r) showReview(r); else showOverview();
    }

    fMist.addEventListener("click", function () { setFilter("mistakes"); });
    fAll.addEventListener("click", function () { setFilter("all"); });

    $("mrBack").addEventListener("click", function () {
        history.pushState(null, "", location.pathname + location.search);
        route();
    });

    window.addEventListener("hashchange", route);
    window.addEventListener("popstate", route);

    renderOverview();
    overview.hidden = false;
    route();
})();