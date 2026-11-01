/* =========================================================
   Essay Coach (essay-coach.html) ar Essay Write (essay-write.html)
   Duto page-e ekই file load hoy. Prottek part nijer element
   na pele sathe sathe return kore, tai kono page-e error hoy na.
   ========================================================= */


/* ---------- 1. Essay type picker (essay-coach.html) ---------- */
(function () {
    var item = document.getElementById("etItem");
    if (!item) return;

    var btn = document.getElementById("etBtn");
    var panel = document.getElementById("etPanel");
    var label = document.getElementById("etLabel");
    var err = document.getElementById("etError");
    var form = item.closest("form");
    var radios = panel.querySelectorAll('input[name="type"]');

    function collapse() {
        return bootstrap.Collapse.getOrCreateInstance(panel, { toggle: false });
    }

    radios.forEach(function (r) {
        // Select korle naam header-e boshe
        r.addEventListener("change", function () {
            label.textContent = r.value;
            item.classList.add("has-value");
            item.classList.remove("is-invalid");
            err.hidden = true;
        });

        // Mouse click-e list bondho hobe (keyboard-e arrow chaple bondho hobe na)
        r.addEventListener("click", function (e) {
            if (e.detail > 0) {
                collapse().hide();
                btn.focus();
            }
        });

        // Enter chaple bondho
        r.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                collapse().hide();
                btn.focus();
            }
        });
    });

    // Esc chaple list bondho
    panel.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            collapse().hide();
            btn.focus();
        }
    });

    // Type select na kore submit korle error
    form.addEventListener("submit", function (e) {
        if (!form.querySelector('input[name="type"]:checked')) {
            e.preventDefault();
            item.classList.add("is-invalid");
            err.hidden = false;
            collapse().show();
            btn.focus();
        }
    });
})();


/* ---------- 2. Topic list-er link-e topic ar type joge deya (essay-coach.html) ---------- */
(function () {
    document.querySelectorAll(".pc_item .pc_topics a[href]").forEach(function (a) {
        var item = a.closest(".pc_item");
        var nameEl = item && item.querySelector(".pc_name");
        if (!nameEl) return;

        var base = a.getAttribute("href").split("?")[0];
        var q = new URLSearchParams({
            topic: a.textContent.trim(),
            type: nameEl.textContent.trim()
        });
        a.setAttribute("href", base + "?" + q.toString());
    });
})();


/* ---------- 3. Essay write page (essay-write.html) ---------- */
(function () {
    // Ei page-e na thakle kichui korbe na
    var form = document.getElementById("writeForm");
    var area = document.getElementById("essayText");
    if (!form || !area) return;

    // ===== Settings =====
    var MIN_WORDS = 250;          // shudhu suggestion, er kom likheo submit kora jay
    var MAX_WORDS = 400;          // er beshi likha jabe na
    var TIMER_MINUTES = 20;       // timer add korle, shomoy shesh hole auto submit
    var AUTOSAVE_DELAY = 600;     // ms
    var FEEDBACK_URL = "essay-feedback.html";
    var CRITERIA = [
        "Topic Relevance",
        "Organization",
        "Grammar & Vocabulary",
        "Idea Development",
        "Clarity & Style"
    ];

    function $(id) { return document.getElementById(id); }
    var intro = $("wIntro"), topicEl = $("wTopic");
    var wc = $("wc"), wRange = $("wRange"), wStatus = $("wStatus");
    var timerBtn = $("timerBtn"), timerLabel = $("timerLabel"), timerNote = $("timerNote"), timerSr = $("timerSr");
    var err = $("wErr"), submitBtn = $("submitBtn");

    // ===== Topic ar type (URL theke, textContent diye, tai safe) =====
    var params = new URLSearchParams(location.search);
    var topic = (params.get("topic") || "").trim().slice(0, 150);
    var typeLower = (params.get("type") || "").trim().slice(0, 40).toLowerCase();
    var isLetter = /letter/.test(typeLower);

    topicEl.textContent = topic || "Write about a topic of your choice";

    // ===== Intro text (highlight soho) =====
    function addText(t) { intro.appendChild(document.createTextNode(t)); }
    function addHl(t) {
        var s = document.createElement("strong");
        s.className = "w_hl";
        s.textContent = t;
        intro.appendChild(s);
    }

    intro.textContent = "";
    addText("Write your ");
    var typeEl = document.createElement("strong");
    typeEl.textContent = typeLower || "own";
    intro.appendChild(typeEl);
    addText((isLetter ? "." : " essay.") +
        " Get feedback that helps you improve. Your essay will be evaluated on ");
    CRITERIA.forEach(function (c, i) {
        if (i === CRITERIA.length - 1) addText(", and ");
        else if (i > 0) addText(", ");
        addHl(c);
    });
    addText(". Word limit: ");
    addHl(MIN_WORDS + "–" + MAX_WORDS);
    addText(". Try to finish within ");
    addHl(TIMER_MINUTES + " minutes");
    addText(".");

    wRange.textContent = "(" + MIN_WORDS + "–" + MAX_WORDS + ")";

    // ===== Word helpers =====
    function countWords(text) {
        var m = text.trim().match(/\S+/g);
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

    // ===== Message (form error ba word limit) =====
    var msgKind = "";

    function showError(msg) {
        err.textContent = msg;
        err.hidden = false;
        msgKind = "form";
        area.setAttribute("aria-invalid", "true");
        area.focus();
    }

    function clearError() {
        if (msgKind === "form") {
            err.hidden = true;
            msgKind = "";
        }
        area.removeAttribute("aria-invalid");
    }

    function showLimit() {
        err.textContent = "You have reached the " + MAX_WORDS + "-word limit.";
        err.hidden = false;
        msgKind = "limit";
    }

    function clearLimit() {
        if (msgKind === "limit") {
            err.hidden = true;
            msgKind = "";
        }
    }

    function updateCount() {
        var n = countWords(area.value);
        wc.textContent = n + (n === 1 ? " word" : " words");
        wc.classList.toggle("is-ok", n >= MIN_WORDS);
        if (area.getAttribute("aria-invalid") === "true") clearError();
    }

    // ===== Autosave (ei device-er browser-e) =====
    var KEY = "admitly:essay:" + typeLower + "|" + topic.toLowerCase();
    var saveTimer = null;
    var submitted = false;

    function save() {
        saveTimer = null;
        if (submitted) return;
        try {
            if (area.value) localStorage.setItem(KEY, area.value);
            else localStorage.removeItem(KEY);
            wStatus.textContent = "Autosaved";
        } catch (e) {
            wStatus.textContent = "Autosave unavailable";
        }
    }

    try {
        var saved = localStorage.getItem(KEY);
        if (saved) {
            if (countWords(saved) > MAX_WORDS) saved = saved.slice(0, endOfWord(saved, MAX_WORDS));
            area.value = saved;
            wStatus.textContent = "Draft restored";
        }
    } catch (e) { /* storage bondho, kono shomossha nai */ }

    function afterChange() {
        updateCount();
        wStatus.textContent = "Saving…";
        clearTimeout(saveTimer);
        saveTimer = setTimeout(save, AUTOSAVE_DELAY);
    }

    window.addEventListener("pagehide", function () {
        if (saveTimer) { clearTimeout(saveTimer); save(); }
    });

    // ===== 400 word-er beshi likha jabe na =====
    var prev = null;    // key chaparo age-r obostha

    area.addEventListener("beforeinput", function () {
        prev = { v: area.value, s: area.selectionStart, e: area.selectionEnd };
    });

    // Limit paar hole ager obosthay phire jay. true dile bujhbe limit-e ghaa laglo.
    function enforceLimit() {
        if (countWords(area.value) <= MAX_WORDS) {
            prev = null;
            return false;
        }
        if (prev) {
            area.value = prev.v;
            area.setSelectionRange(prev.s, prev.e);
        }
        // Safety: ekhono beshi thakle 400-tom word porjonto kete dao
        if (countWords(area.value) > MAX_WORDS) {
            area.value = area.value.slice(0, endOfWord(area.value, MAX_WORDS));
        }
        prev = null;
        return true;
    }

    area.addEventListener("input", function (e) {
        // IME/keyboard suggestion cholar shomoy jhamela na kore, shesh hole check
        if (!e.isComposing && enforceLimit()) showLimit();
        else if (countWords(area.value) < MAX_WORDS) clearLimit();
        afterChange();
    });

    area.addEventListener("compositionend", function () {
        if (enforceLimit()) showLimit();
        afterChange();
    });

    // Paste: joto word-er jaga ache toto-i boshe, baki kete jay
    area.addEventListener("paste", function (e) {
        var data = e.clipboardData;
        if (!data) return;
        var pasted = data.getData("text");
        if (!pasted) return;

        var s = area.selectionStart, en = area.selectionEnd;
        var room = MAX_WORDS - countWords(area.value.slice(0, s)) - countWords(area.value.slice(en));

        if (countWords(pasted) <= room) return;       // fit hoy, normal paste

        e.preventDefault();
        prev = null;
        showLimit();
        if (room > 0) {
            area.setRangeText(pasted.slice(0, endOfWord(pasted, room)), s, en, "end");
            if (countWords(area.value) < MAX_WORDS) clearLimit();
            afterChange();
        }
    });

    updateCount();

    // ===== Submit =====
    function doSubmit() {
        if (submitted) return;
        submitted = true;

        clearTimeout(saveTimer);
        clearInterval(interval);
        interval = null;

        area.readOnly = true;
        timerBtn.disabled = true;
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting…";
        err.hidden = true;
        msgKind = "";

        // DEMO: backend-e ekhane topic, type ar essay server-e pathate hobe,
        // server "ok" bolle tarpor draft muche feedback page-e jete hobe.
        try { localStorage.removeItem(KEY); } catch (e) { }
        setTimeout(function () { location.href = FEEDBACK_URL; }, 900);
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (submitted) return;

        // 250-er kom hole o submit kora jay, shudhu ekdom khali hole na
        if (countWords(area.value) === 0) {
            showError("Please write your essay before submitting.");
            return;
        }
        doSubmit();
    });

    // ===== Timer (countdown, shesh hole auto submit) =====
    var interval = null;
    var endAt = 0;
    var warned5 = false;
    var warned1 = false;

    function fmt(s) {
        var m = Math.floor(s / 60), r = s % 60;
        return m + ":" + (r < 10 ? "0" : "") + r;
    }

    function timeUp() {
        clearInterval(interval);
        interval = null;
        timerBtn.classList.add("is-over");
        timerNote.classList.add("is-warn");
        timerSr.textContent = "Time is up.";

        if (countWords(area.value) === 0) {
            // Khali essay AI-ke pathano jay na
            timerNote.textContent = "Time is up, but your essay is empty. Write something and press Submit essay.";
            return;
        }
        timerNote.textContent = "Time is up. Submitting your essay…";
        doSubmit();
    }

    function tick() {
        var left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
        timerLabel.textContent = fmt(left);

        if (TIMER_MINUTES > 5 && left <= 300 && !warned5) {
            warned5 = true;
            timerSr.textContent = "5 minutes left.";
        }
        if (left <= 60 && !warned1) {
            warned1 = true;
            timerNote.textContent = "Less than 1 minute left. Your essay will be submitted automatically.";
            timerNote.classList.add("is-warn");
            timerSr.textContent = "1 minute left. Your essay will be submitted automatically.";
        }
        if (left <= 0) timeUp();
    }

    function startTimer() {
        endAt = Date.now() + TIMER_MINUTES * 60 * 1000;
        warned5 = false;
        warned1 = false;
        timerBtn.classList.add("is-running");
        timerBtn.setAttribute("aria-label", "Remove timer");
        timerNote.textContent = "Timer is on. Your essay will be submitted automatically when time is up.";
        timerNote.classList.remove("is-warn");
        timerNote.hidden = false;
        tick();
        interval = setInterval(tick, 1000);
    }

    function removeTimer() {
        clearInterval(interval);
        interval = null;
        timerBtn.classList.remove("is-running", "is-over");
        timerBtn.removeAttribute("aria-label");
        timerLabel.textContent = "Add timer";
        timerNote.hidden = true;
        timerNote.classList.remove("is-warn");
        timerSr.textContent = "";
    }

    timerBtn.addEventListener("click", function () {
        if (submitted) return;
        if (timerBtn.classList.contains("is-running")) removeTimer();
        else startTimer();
    });
})();