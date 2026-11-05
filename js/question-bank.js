/* Question Bank (question-bank.html) ar Question Bank view (question-bank-view.html) */

/* ---------- 1. Tab: Back korle ager tab-e phire asha ---------- */
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


/* ---------- 2. View page: title ar back link (question-bank-view.html) ---------- */
(function () {
    var titleEl = document.getElementById("qbTitle");
    var backEl = document.getElementById("qbBack");
    if (!titleEl || !backEl) return;

    // URL theke title (textContent diye bosai, tai safe)
    var params = new URLSearchParams(location.search);
    var title = (params.get("title") || "").trim().slice(0, 80);
    var type = params.get("type");

    if (title) {
        titleEl.textContent = title;
        document.title = title + " | Question Bank | Admitly";
    }

    // Model Test theke ashle Model tab-e, noile prothom tab-e phirbe
    backEl.setAttribute("href", type === "model" ? "question-bank.html#model" : "question-bank.html");
})();