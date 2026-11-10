/* Question Bank: list page, segment page ar 4 ta section page */

/* ---------- 1. Tab: Back korle ager tab-e phire asha (question-bank.html) ---------- */
(function () {
    var tabPrev = document.getElementById("tabQbPrev");
    var tabModel = document.getElementById("tabQbModel");
    if (!tabPrev || !tabModel || !window.bootstrap) return;

    var base = location.pathname + location.search;

    // #model hole Model tab khola
    if (location.hash === "#model") {
        bootstrap.Tab.getOrCreateInstance(tabModel).show();
    }

    // Tab bodlale URL bodlano (history-te notun entry joge na kore)
    tabModel.addEventListener("shown.bs.tab", function () {
        history.replaceState(null, "", base + "#model");
    });
    tabPrev.addEventListener("shown.bs.tab", function () {
        history.replaceState(null, "", base);
    });
})();


/* ---------- 2. Segment page: link-e section page + title/type (question-bank-view.html) ---------- */
(function () {
    "use strict";

    var titleEl = document.getElementById("qbTitle");
    var backEl = document.getElementById("qbBack");
    var subjects = document.querySelectorAll(".qb_subject");
    if (!titleEl || !backEl) return;

    // URL theke title ar type (textContent diye bosai, tai safe)
    var params = new URLSearchParams(location.search);
    var title = (params.get("title") || "").trim().slice(0, 80);
    var type = params.get("type");

    if (title) {
        titleEl.textContent = title;
        document.title = title + " | Question Bank | Admitly";
    }

    // Model Test theke ashle Model tab-e, noile prothom tab-e phirbe
    backEl.setAttribute("href", type === "model" ? "question-bank.html#model" : "question-bank.html");

    // Section page-e title ar type-o niye jabe
    var q = new URLSearchParams();
    if (type) q.set("type", type);
    if (title) q.set("title", title);
    var qs = q.toString();

    // Subject-er naam dekhe kon page-e jabe
    var PAGES = [
        ["english", "question-bank-english.html"],
        ["quantitative", "question-bank-math.html"],
        ["math", "question-bank-math.html"],
        ["reading", "question-bank-reading.html"],
        ["essay", "question-bank-essay.html"]
    ];

    [].forEach.call(subjects, function (a) {
        var nameNode = a.querySelector(".qb_s_name") || a;
        var text = nameNode.textContent.toLowerCase();

        for (var i = 0; i < PAGES.length; i++) {
            if (text.indexOf(PAGES[i][0]) !== -1) {
                a.setAttribute("href", PAGES[i][1] + (qs ? "?" + qs : ""));
                return;
            }
        }
        // Match na hole (jemon Architectural Drawing) page jeno upore na lafay
        a.addEventListener("click", function (e) { e.preventDefault(); });
    });
})();


/* ---------- 3. Section pages (question-bank-english / math / reading / essay.html) ---------- */
(function () {
    "use strict";

    var backEl = document.getElementById("qsBack");
    if (!backEl) return;

    // ===== Settings =====
    var SHOW_EXPLANATION = true;               // false korle answer-er por explanation dekhabe na
    var KEY_BM = "admitly:qb:bookmarks";

    // ===== Helpers =====
    function $(id) { return document.getElementById(id); }

    function h(tag, cls, text) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    function pad(n) { return n < 10 ? "0" + n : String(n); }

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
    var ICON_BOOKMARK = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
    var ICON_CHEV = '<svg class="s_icon" viewBox="0 0 24 24" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>';

    // ===== URL theke title ar type (textContent diye bosai, tai safe) =====
    var params = new URLSearchParams(location.search);
    var title = (params.get("title") || "").trim().slice(0, 80);
    var type = params.get("type");

    var q = new URLSearchParams();
    if (type) q.set("type", type);
    if (title) q.set("title", title);
    var qs = q.toString();

    // Back arrow: segment page-e (title ar type soho)
    backEl.setAttribute("href", "question-bank-view.html" + (qs ? "?" + qs : ""));

    var labelEl = $("qsLabel");
    if (labelEl) labelEl.textContent = title || "Question Bank";

    var heading = document.querySelector(".qv_name");
    document.title = (heading ? heading.textContent + " | " : "") + (title ? title + " | " : "") + "Question Bank | Admitly";

    // Essay page-e question list nai, tai ekhane-i shesh
    var list = $("qsList");
    if (!list) return;

    // ===== Elements =====
    var subEl = $("qsSub");
    var ansEl = $("qsAns"), okEl = $("qsOk"), badEl = $("qsBad"), resetEl = $("qsReset");
    var srEl = $("qsSr");
    var scroller = document.querySelector(".content-scroll");

    var bank = list.getAttribute("data-bank");
    var useBookmark = list.getAttribute("data-bookmark") === "true";
    var isReading = list.getAttribute("data-kind") === "reading";

    // ===== Bookmark (ei device-er browser-e). Laravel-e History-te save hobe =====
    function loadBm() {
        try { return JSON.parse(localStorage.getItem(KEY_BM) || "{}") || {}; } catch (e) { return {}; }
    }

    function saveBm() {
        try { localStorage.setItem(KEY_BM, JSON.stringify(bookmarks)); } catch (e) { }
    }

    var bookmarks = loadBm();

    function bmId(i) { return (title || "qb") + "|" + bank + ":" + i; }

    // ===== Stats =====
    var stats = { total: 0, answered: 0, correct: 0, wrong: 0 };

    function updateStats() {
        if (ansEl) ansEl.textContent = "Answered " + stats.answered + " / " + stats.total;
        okEl.textContent = "Correct " + stats.correct;
        badEl.textContent = "Wrong " + stats.wrong;
    }

    // ===== Explanation accordion (smooth khola/bondho, CSS: .explain) =====
    function explainBlock(html, uid) {
        var sec = h("section", "explain is-collapsed");

        var btn = h("button", "explain_head");
        btn.type = "button";
        btn.setAttribute("aria-expanded", "false");
        btn.setAttribute("aria-controls", uid);
        btn.innerHTML = "<span>Explanation</span>" + ICON_CHEV;

        var wrap = h("div", "explain_wrap");
        var clip = h("div", "explain_clip");
        var body = h("div", "explain_body");
        body.id = uid;
        var scroll = h("div", "explain_scroll");
        scroll.innerHTML = html;

        body.appendChild(scroll);
        clip.appendChild(body);
        wrap.appendChild(clip);
        sec.appendChild(btn);
        sec.appendChild(wrap);

        btn.addEventListener("click", function () {
            var open = sec.classList.contains("is-collapsed");
            sec.classList.toggle("is-collapsed", !open);
            btn.setAttribute("aria-expanded", open ? "true" : "false");
        });

        return sec;
    }

    // ===== Option click: sathe sathe result, ekবার-i, bodlano jabe na =====
    function choose(group, qn, oi, li, i) {
        if (group.getAttribute("data-done")) return;
        group.setAttribute("data-done", "1");

        var ok = oi === qn.a;
        stats.answered++;
        if (ok) stats.correct++; else stats.wrong++;

        [].forEach.call(group.children, function (b, k) {
            b.classList.add("is-locked");
            b.setAttribute("aria-disabled", "true");

            if (k === oi) {
                b.classList.add("is-selected");
                b.setAttribute("aria-checked", "true");
            }
            if (k === qn.a) {
                b.classList.add("is-correct");
                b.querySelector(".opt_icon").innerHTML = ICON_OK;
            } else if (k === oi) {
                b.classList.add("is-wrong");
                b.querySelector(".opt_icon").innerHTML = ICON_NO;
            }
        });

        srEl.textContent = ok
            ? "Correct."
            : "Wrong. The correct answer is option " + "ABCDEF".charAt(qn.a) + ".";

        // Explanation (English/Math-e ache, Reading-e nai)
        if (SHOW_EXPLANATION && qn.e) {
            var ex = explainBlock(qn.e, "qsEx-" + bank + "-" + i);
            li.appendChild(ex);
            mathRender(ex);
        }

        updateStats();
    }

    function questionItem(qn, i) {
        var li = h("li", "rc_q");

        var row = h("div", "q_row");
        var t = h("h3", "q_title");
        t.appendChild(h("span", "q_num", pad(i + 1) + "."));
        var qt = h("span", "q_txt");
        qt.innerHTML = qn.q;
        t.appendChild(qt);
        row.appendChild(t);

        // Reading-e bookmark nai
        if (useBookmark) {
            var id = bmId(i);
            var bm = h("button", "q_bookmark");
            bm.type = "button";
            bm.setAttribute("aria-label", "Bookmark question " + (i + 1));
            bm.setAttribute("aria-pressed", bookmarks[id] ? "true" : "false");
            bm.innerHTML = ICON_BOOKMARK;
            bm.addEventListener("click", function () {
                var on = bm.getAttribute("aria-pressed") !== "true";
                bm.setAttribute("aria-pressed", on ? "true" : "false");
                if (on) bookmarks[id] = true; else delete bookmarks[id];
                saveBm();
            });
            row.appendChild(bm);
        }
        li.appendChild(row);

        var group = h("div", "opts");
        group.setAttribute("role", "radiogroup");
        group.setAttribute("aria-label", "Question " + (i + 1) + " options");

        qn.o.forEach(function (text, oi) {
            var b = h("button", "opt");
            b.type = "button";
            b.setAttribute("role", "radio");
            b.setAttribute("aria-checked", "false");
            b.innerHTML =
                '<span class="opt_radio" aria-hidden="true"></span>' +
                '<span class="opt_label">' + text + "</span>" +
                '<span class="opt_icon" aria-hidden="true"></span>';
            b.addEventListener("click", function () { choose(group, qn, oi, li, i); });
            group.appendChild(b);
        });
        li.appendChild(group);

        return li;
    }

    // ===== Render =====
    function render() {
        var B = window.MOCK_BANK || null;
        var arr = (B && B[bank]) || [];

        list.innerHTML = "";
        srEl.textContent = "";
        stats = { total: arr.length, answered: 0, correct: 0, wrong: 0 };
        updateStats();

        if (!arr.length) {
            if (subEl) subEl.textContent = "Questions are not available right now.";
            list.appendChild(h("li", "qv_none", "Questions are not available right now. Please try again later."));
            console.warn("Question bank: js/mock-data.js load hoyni ba '" + bank + "' data khali. Script line ar file path check korun.");
            return;
        }

        if (subEl) {
            subEl.textContent = isReading
                ? "Read the passage, then answer the " + arr.length + " questions. You will see right away if each answer is correct."
                : arr.length + " questions. Tap an answer to see right away if it is correct.";
        }

        arr.forEach(function (qn, i) { list.appendChild(questionItem(qn, i)); });
        mathRender(list);
    }

    resetEl.addEventListener("click", function () {
        render();
        if (scroller) scroller.scrollTop = 0;
    });

    if (document.readyState === "complete") {
        render();
    } else {
        window.addEventListener("load", render);
    }
})();